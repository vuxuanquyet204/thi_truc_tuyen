/**
 * Multisig API Service
 *
 * Multisig wallet and transaction management.
 * Uses centralized multisigClient from foundation/api.
 */

import { multisigClient } from '@/foundation/api'

export interface Identity {
	id: string
	fullName?: string
	firstName?: string
	lastName?: string
	username?: string
	email?: string
	phone?: string
}

export interface OwnerDetail {
	userId: string
	identity?: Identity
	address: string
	privateKeyMasked?: string
}

export interface OwnerCredentialResponse {
	userId: string
	address: string
	privateKey: string
	identity?: Identity
}

export interface MultisigWallet {
	id: string
	contractAddress: string
	name: string
	description?: string | null
	creatorId?: string | null
	owners: string[]
	ownerUserIds?: (number | string)[]
	ownerDetails?: OwnerDetail[]
	threshold: number
	onChainBalance?: string
	onChainError?: string
	onChainWarning?: string
	createdAt?: string
	updatedAt?: string
}

export type MultisigTransactionStatus =
	| 'submitted'
	| 'confirmed'
	| 'executed'
	| 'failed'

export interface MultisigTransaction {
	id: string
	walletId: string
	txIndexOnChain: number
	txHash?: string | null
	destination: string
	value: string
	data: string
	status: MultisigTransactionStatus
	confirmations: string[]
	createdAt?: string
	updatedAt?: string
	wallet?: MultisigWallet
}

export interface CreateWalletRequest {
	name: string
	description?: string
	ownerUserIds: (number | string)[]
	threshold: number
}

export interface LinkWalletRequest {
	name: string
	description?: string
	contractAddress: string
	ownerUserIds?: (number | string)[]
}

export interface SubmitTransactionRequest {
	destination: string
	value: number | string
	data?: string
	description?: string
}

export interface ConfirmTransactionRequest {
	privateKey?: string
}

export const createWallet = async (
	payload: CreateWalletRequest
): Promise<MultisigWallet> => {
	const { data } = await multisigClient.post<MultisigWallet>('/', payload)
	return data
}

export const linkWallet = async (
	payload: LinkWalletRequest
): Promise<MultisigWallet> => {
	const { data } = await multisigClient.post<MultisigWallet>('/link', payload)
	return data
}

export const getWalletById = async (
	walletId: string
): Promise<MultisigWallet> => {
	const { data } = await multisigClient.get<MultisigWallet>(`/${walletId}`)
	return data
}

export const getTransactionsByWallet = async (
	walletId: string
): Promise<MultisigTransaction[]> => {
	const response = await multisigClient.get<MultisigTransaction[]>(
		`/${walletId}/transactions`
	)
	return response.data
}

export const submitTransaction = async (
	walletId: string,
	payload: SubmitTransactionRequest
): Promise<MultisigTransaction> => {
	const { data } = await multisigClient.post<MultisigTransaction>(
		`/${walletId}/transactions`,
		payload
	)
	return data
}

export const getTransactionById = async (
	transactionId: string
): Promise<MultisigTransaction> => {
	const { data } = await multisigClient.get<MultisigTransaction>(
		`/transactions/${transactionId}`
	)
	return data
}

export const confirmTransaction = async (
	transactionId: string,
	payload: ConfirmTransactionRequest = {}
): Promise<MultisigTransaction> => {
	const { data } = await multisigClient.post<MultisigTransaction>(
		`/transactions/${transactionId}/confirm`,
		payload
	)
	return data
}

export const executeTransaction = async (
	transactionId: string
): Promise<MultisigTransaction> => {
	const { data } = await multisigClient.post<MultisigTransaction>(
		`/transactions/${transactionId}/execute`,
		{}
	)
	return data
}

export const getAvailableUsers = async (): Promise<any[]> => {
	const { data } = await multisigClient.get<any[]>('/users/available')
	return data
}

export const getAllWallets = async (): Promise<MultisigWallet[]> => {
	const { data } = await multisigClient.get<MultisigWallet[]>('')
	return data
}

export const getOwnerCredential = async (
	walletId: string
): Promise<OwnerCredentialResponse> => {
	const { data } = await multisigClient.get<OwnerCredentialResponse>(
		`/${walletId}/owners/me`
	)
	return data
}

const multisigApi = {
	createWallet,
	linkWallet,
	getWalletById,
	getAllWallets,
	getAvailableUsers,
	getTransactionsByWallet,
	submitTransaction,
	getTransactionById,
	confirmTransaction,
	executeTransaction,
	getOwnerCredential,
}

export default multisigApi
