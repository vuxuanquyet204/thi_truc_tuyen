const db = require('../models');
const MultisigWallet = db.MultisigWallet;
const MultisigTransaction = db.MultisigTransaction;
const blockchainService = require('./blockchain.service.js');
const walletOwnerService = require('./walletOwner.service');
const { account, web3 } = require('../config/web3'); // Lấy service account và web3
const { v5: uuidv5 } = require('uuid');

// UUID namespace để generate creatorId từ userId
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Hàm chuyển đổi userId sang UUID
const convertUserIdToUUID = (userId) => {
    return uuidv5(userId.toString(), UUID_NAMESPACE);
};

// API: Tạo ví mới
const createWallet = async (req) => {
    const { name, description, ownerUserIds, threshold } = req.body;
    const creatorId = convertUserIdToUUID(req.userId);
    const authHeader = req.headers['authorization'];

    if (!name || !ownerUserIds || !threshold) {
        throw new Error('Thiếu tham số name, ownerUserIds hoặc threshold');
    }

    const assignments = await walletOwnerService.prepareOwnerAssignments(ownerUserIds);
    const ownerAddresses = assignments.map((assignment) => assignment.address.toLowerCase());
    const serviceAddress = account.address.toLowerCase();

    if (!ownerAddresses.includes(serviceAddress)) {
        ownerAddresses.push(serviceAddress);
    }

    const uniqueOwners = Array.from(new Set(ownerAddresses));

    if (threshold > uniqueOwners.length) {
        throw new Error(`Threshold (${threshold}) lớn hơn số lượng owner (${uniqueOwners.length})`);
    }
    
    // 1. Deploy lên Blockchain
    const contractAddress = await blockchainService.deployMultisigContract(uniqueOwners, threshold);
    
    // 2. KHÔNG fund ETH khi tạo ví
    // ETH sẽ được fund tự động khi khởi tạo giao dịch
    console.log(`✅ Đã tạo contract wallet tại: ${contractAddress}`);
    console.log(`ℹ️  Contract wallet sẽ được fund ETH tự động khi khởi tạo giao dịch`);
    
    // 3. Lưu vào DB
    const newWallet = await MultisigWallet.create({
        creatorId,
        name,
        description,
        contractAddress,
        owners: uniqueOwners,
        threshold
    });

    await walletOwnerService.persistOwnerAssignments(newWallet.id, assignments);
    
    // Lấy owner details - nếu lỗi thì trả về mảng rỗng
    let ownerDetails = [];
    try {
        ownerDetails = await walletOwnerService.getOwnerDetailsForWallet(newWallet.id, authHeader);
    } catch (error) {
        console.warn(`⚠️  Không thể lấy owner details: ${error.message}`);
        // Vẫn trả về ví đã tạo, chỉ không có owner details
        ownerDetails = [];
    }
    
    // Đảm bảo trả về object đơn giản, không có circular references
    const walletData = newWallet.toJSON();
    return {
        id: walletData.id,
        creatorId: walletData.creatorId,
        name: walletData.name,
        description: walletData.description,
        contractAddress: walletData.contractAddress,
        owners: walletData.owners,
        threshold: walletData.threshold,
        createdAt: walletData.createdAt,
        updatedAt: walletData.updatedAt,
        ownerDetails: ownerDetails
    };
};

// API: Liên kết ví đã có
const linkWallet = async (req) => {
    const { name, description, contractAddress, ownerUserIds } = req.body;
    const creatorId = convertUserIdToUUID(req.userId);
    const authHeader = req.headers['authorization'];

    // 1. Kiểm tra ví trên chain
    const onChainData = await blockchainService.getOnChainWalletDetails(contractAddress);

    // 2. Lưu vào DB
    const linkedWallet = await MultisigWallet.create({
        creatorId,
        name,
        description,
        contractAddress,
        owners: onChainData.owners,
        threshold: onChainData.threshold
    });

    let ownerDetails = [];
    if (ownerUserIds && ownerUserIds.length > 0) {
        const assignments = await walletOwnerService.prepareOwnerAssignments(ownerUserIds);
        await walletOwnerService.persistOwnerAssignments(linkedWallet.id, assignments);
        ownerDetails = await walletOwnerService.getOwnerDetailsForWallet(linkedWallet.id, authHeader);
    }

    return {
        ...linkedWallet.toJSON(),
        ownerDetails
    };
};

// API: Lấy ví (kết hợp DB và On-chain)
const getWalletById = async (walletId, authHeader) => {
    const wallet = await MultisigWallet.findByPk(walletId);
    if (!wallet) {
        throw new Error('Không tìm thấy ví trong DB');
    }
    
    // Lấy thêm data on-chain (ví dụ: số dư)
    // Nếu không lấy được on-chain data, vẫn return data từ DB
    let onChainBalance = '0';
    let onChainError = null;
    
    try {
        const onChainData = await blockchainService.getOnChainWalletDetails(wallet.contractAddress);
        onChainBalance = onChainData.balance;
    } catch (error) {
        console.warn(`Không thể lấy on-chain data cho wallet ${walletId}:`, error.message);
        onChainError = error.message;
        // Vẫn return data từ DB, nhưng có cảnh báo
    }
    
    // Kết hợp 2 nguồn dữ liệu
    const ownerDetails = await walletOwnerService.getOwnerDetailsForWallet(walletId, authHeader);

    const result = {
        ...wallet.toJSON(),
        onChainBalance: onChainBalance,
        ownerDetails
    };
    
    // Nếu có lỗi, thêm thông tin lỗi vào response để user biết
    if (onChainError) {
        result.onChainError = onChainError;
        result.onChainWarning = 'Không thể lấy dữ liệu từ blockchain. Chỉ hiển thị dữ liệu từ database.';
    }
    
    return result;
};

// API: Lấy danh sách tất cả ví multisig
const getAllWallets = async (authHeader) => {
    const wallets = await MultisigWallet.findAll({
        order: [['created_at', 'DESC']],
    });

    const walletsWithDetails = [];
    for (const wallet of wallets) {
        try {
            const ownerDetails = await walletOwnerService.getOwnerDetailsForWallet(wallet.id, authHeader);
            walletsWithDetails.push({
                ...wallet.toJSON(),
                ownerUserIds: ownerDetails.map(detail => detail.userId),
                ownerDetails,
            });
        } catch (error) {
            console.warn(`Không thể lấy chi tiết owner cho ví ${wallet.id}:`, error.message);
            // Vẫn trả về ví nhưng không có owner details
            walletsWithDetails.push({
                ...wallet.toJSON(),
                ownerUserIds: [],
                ownerDetails: [],
            });
        }
    }

    return walletsWithDetails;
};

// API: Lấy danh sách người dùng chưa có ví multisig
const getAvailableUsersForWallet = async (authHeader) => {
    const userService = require('./user.service');

    // Lấy tất cả người dùng từ identity service
    const allUsersResponse = await userService.getAllIdentityUsers(authHeader);
    const allUsers = allUsersResponse.success ? allUsersResponse.data : [];

    // Lấy tất cả user IDs đã có ví
    const existingUserIds = await UserWallet.findAll({
        attributes: ['userId'],
        group: ['userId']
    }).then(results => results.map(r => r.userId));

    // Lọc ra những người dùng chưa có ví
    const availableUsers = allUsers.filter(user =>
        !existingUserIds.includes(user.id.toString())
    );

    return availableUsers;
};

// API: Tạo (Submit) một giao dịch mới
const submitNewTransaction = async (walletId, body) => {
    const { destination, value, description } = body;
    const wallet = await MultisigWallet.findByPk(walletId);
    if (!wallet) throw new Error('Không tìm thấy ví');

    // Normalize địa chỉ đích (tự động sửa checksum)
    // Nếu địa chỉ không hợp lệ, toChecksumAddress sẽ throw error
    let normalizedDestination;
    try {
        // Loại bỏ khoảng trắng và normalize
        const cleanDestination = destination.trim();
        normalizedDestination = web3.utils.toChecksumAddress(cleanDestination);
    } catch (error) {
        throw new Error(`Địa chỉ đích không hợp lệ: ${destination}. Vui lòng nhập địa chỉ Ethereum hợp lệ (42 ký tự bắt đầu bằng 0x)`);
    }

    const valueInWei = web3.utils.toWei(value.toString(), 'ether');
    
    // 1. Kiểm tra và fund ETH vào contract wallet nếu cần
    const contractBalance = await web3.eth.getBalance(wallet.contractAddress);
    const contractBalanceEth = parseFloat(web3.utils.fromWei(contractBalance.toString(), 'ether'));
    const valueEth = parseFloat(value);
    
    console.log(`📊 Contract wallet balance: ${contractBalanceEth} ETH, Cần: ${valueEth} ETH`);
    
    if (contractBalanceEth < valueEth) {
        const amountToFund = valueEth - contractBalanceEth;
        console.log(`💰 Contract wallet thiếu ${amountToFund} ETH, đang fund từ Service Account...`);
        
        try {
            await blockchainService.fundContractWallet(wallet.contractAddress, amountToFund);
            console.log(`✅ Đã fund ${amountToFund} ETH vào contract wallet`);
        } catch (error) {
            throw new Error(`Không thể fund ETH vào contract wallet: ${error.message}`);
        }
    }
    
    // 2. Submit lên chain (data luôn là '0x' vì không cần dữ liệu bổ sung)
    const { txHash, txIndexOnChain } = await blockchainService.submitTransaction(
        wallet.contractAddress,
        normalizedDestination,
        valueInWei,
        '0x'
    );

    // 3. Lưu vào DB
    const newTx = await MultisigTransaction.create({
        walletId: wallet.id,
        txIndexOnChain: txIndexOnChain,
        txHash: txHash,
        destination: normalizedDestination,
        value: valueInWei,
        data: '0x',
        description: description || '', // Lưu mô tả giao dịch
        status: 'submitted', // Đã submit
        confirmations: [] // Chưa ai confirm
    });
    return newTx;
};

// API: Xác nhận một giao dịch
// userId: ID của user đang confirm (lấy từ req.userId)
const confirmExistingTransaction = async (transactionId, userId) => {
    const tx = await MultisigTransaction.findOne({
        where: { id: transactionId },
        include: 'wallet'
    });
    if (!tx) throw new Error('Không tìm thấy giao dịch');
    if (tx.status === 'executed') throw new Error('Giao dịch đã được thực thi');

    // Lấy private key của user từ database
    const walletOwnerService = require('./walletOwner.service');
    const userPrivateKey = await walletOwnerService.getUserPrivateKey(tx.wallet.id, userId);
    
    // Xác định account sẽ dùng để confirm
    let confirmAccount;
    let confirmerAddress;
    
    if (userPrivateKey) {
        // User có private key được gán → dùng private key của user
        try {
            const privateKeyWithPrefix = userPrivateKey.startsWith('0x') ? userPrivateKey : '0x' + userPrivateKey;
            confirmAccount = web3.eth.accounts.privateKeyToAccount(privateKeyWithPrefix);
            if (!confirmAccount.privateKey) {
                confirmAccount.privateKey = privateKeyWithPrefix;
            }
            confirmerAddress = confirmAccount.address.toLowerCase();
        } catch (error) {
            throw new Error(`Private key không hợp lệ: ${error.message}`);
        }
        
        // Kiểm tra owner có trong danh sách owners không
        const wallet = tx.wallet;
        const isOwner = wallet.owners.some(owner => 
            owner.toLowerCase() === confirmerAddress
        );
        
        if (!isOwner) {
            throw new Error(`Địa chỉ ${confirmerAddress} không phải là owner của ví này`);
        }
        
        // Kiểm tra đã confirm chưa
        const hasConfirmed = tx.confirmations.some(conf => 
            conf.toLowerCase() === confirmerAddress
        );
        
        if (hasConfirmed) {
            throw new Error(`Bạn đã xác nhận giao dịch này rồi`);
        }
    } else {
        // User không có private key → dùng Service Account
        confirmAccount = account;
        confirmerAddress = account.address.toLowerCase();
        
        if (tx.confirmations.some(conf => conf.toLowerCase() === confirmerAddress)) {
            throw new Error('Bạn đã xác nhận giao dịch này');
        }
    }

    // 1. Gửi confirm lên chain với account tương ứng
    const txHash = await blockchainService.confirmTransaction(
        tx.wallet.contractAddress,
        tx.txIndexOnChain,
        confirmAccount  // Truyền account để sign
    );

    // 2. Cập nhật DB với address của owner đã confirm
    const updatedConfirmations = [...tx.confirmations, confirmerAddress];
    tx.confirmations = updatedConfirmations;
    tx.status = 'confirmed';
    tx.txHash = txHash; // Cập nhật hash của tx confirm mới nhất
    
    await tx.save();
    return tx;
};

// API: Thực thi một giao dịch (bằng Service Account)
const executeExistingTransaction = async (transactionId) => {
    const tx = await MultisigTransaction.findOne({
        where: { id: transactionId },
        include: 'wallet'
    });
    if (!tx) throw new Error('Không tìm thấy giao dịch');
    if (tx.status === 'executed') throw new Error('Giao dịch đã được thực thi');

    // Kiểm tra DB xem đủ confirm chưa
    if (tx.confirmations.length < tx.wallet.threshold) {
        throw new Error(`Chưa đủ số lượng xác nhận. Cần ${tx.wallet.threshold}, mới có ${tx.confirmations.length}`);
    }

    // Kiểm tra balance của contract wallet trước khi execute
    const contractBalance = await web3.eth.getBalance(tx.wallet.contractAddress);
    const valueInWei = BigInt(tx.value);
    
    if (contractBalance < valueInWei) {
        const balanceEth = web3.utils.fromWei(contractBalance.toString(), 'ether');
        const valueEth = web3.utils.fromWei(tx.value.toString(), 'ether');
        throw new Error(`Contract wallet không đủ ETH để thực thi giao dịch. Balance: ${balanceEth} ETH, Cần: ${valueEth} ETH. Vui lòng fund contract wallet trước.`);
    }

    // 1. Gửi execute lên chain
    const txHash = await blockchainService.executeTransaction(
        tx.wallet.contractAddress,
        tx.txIndexOnChain
    );
    
    // 2. Cập nhật DB
    tx.status = 'executed';
    tx.txHash = txHash;
    await tx.save();
    return tx;
};

// API: Lấy danh sách giao dịch của 1 ví
const getTransactionsForWallet = async (walletId) => {
    return MultisigTransaction.findAll({
        where: { walletId: walletId },
        order: [['created_at', 'DESC']]
    });
};

// API: Lấy thông tin 1 giao dịch theo ID
const getTransactionById = async (transactionId) => {
    const tx = await MultisigTransaction.findOne({
        where: { id: transactionId },
        include: 'wallet'
    });
    if (!tx) throw new Error('Không tìm thấy giao dịch');
    return tx;
};


module.exports = {
    createWallet,
    linkWallet,
    getWalletById,
    getAllWallets,
    getAvailableUsersForWallet,
    submitNewTransaction,
    confirmExistingTransaction,
    executeExistingTransaction,
    getTransactionsForWallet,
    getTransactionById
};

