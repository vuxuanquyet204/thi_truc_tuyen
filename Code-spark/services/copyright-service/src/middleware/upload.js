const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'document') {
    if (!file.originalname.match(/\.(pdf|doc|docx|txt)$/i)) {
      return cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX, TXT'), false);
    }
  } else if (file.fieldname === 'file') {
    if (!file.originalname.match(/\.(pdf|doc|docx|txt|md|rtf|odt)$/i)) {
      return cb(new Error('Chỉ chấp nhận file tài liệu'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

const uploadFile = upload.single('file');
const uploadDocument = upload.single('document');

module.exports = {
  uploadFile,
  uploadDocument,
};
