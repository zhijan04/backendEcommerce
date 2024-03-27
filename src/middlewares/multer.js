const multer = require('multer');
const path = require('path');

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'documents/profiles/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    }
});
const profileUpload = multer({ storage: profileStorage });

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'documents/products/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    }
});
const productUpload = multer({ storage: productStorage });

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'documents/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    }
});

const documentUpload = multer({ storage: documentStorage });

module.exports = {
    profileUpload,
    productUpload,
    documentUpload
};