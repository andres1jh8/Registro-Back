import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = 'uploads'
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb( null, uploadDir)
        },
        filename: function (req, res, cb) {
            const ext = path.extname(file.originalname)
            cb(null, file.fieldname + '-' + Date.now() + ext )
        }
    }
)

export const upload = multer (
    {
        storage,
        limits: {
            fileSize: 5 * 1024 *1024
        },
        fileFilter: function (req, file, cb) {
            const filetypes = /jpeg|jpg|png/
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
            const mimetype = filetypes.test(file.mimetype)

            if (mimetype && extname) return cb(null, true)
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'))
        }
    }
)