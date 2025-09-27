import { S3Client,DeleteObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'
import multerS3 from 'multer-s3'
import config from '@/config'
import * as enums from '@/constants/enums'

const s3Client = new S3Client({
    region: config.AWS_S3_REGION,
    credentials: {
        accessKeyId: config.AWS_S3_ACCESS,
        secretAccessKey: config.AWS_S3_SECRET
    },
    maxAttempts: 3,
    retryMode: 'adaptive'
})

const getFileCategory = (mimetype) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (imageTypes.includes(mimetype)) return 'image'
    if (documentTypes.includes(mimetype)) return 'document'
    return 'unknown'
}


const healthFileFilter = (req, file, cb) => {
    try {
        const allowedMimes = [
            'image/jpeg', 'image/jpg', 'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]

        const fileCategory = getFileCategory(file.mimetype)
        
        if (!allowedMimes.includes(file.mimetype)) {
            const error = new Error('File type not allowed. Please upload PDF, Word documents, or images (JPEG, PNG)')
            error.code = 'INVALID_FILE_TYPE'
            return cb(error, false)
        }


        const filename = file.originalname.toLowerCase()
        const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js']
        
        if (suspiciousPatterns.some(pattern => filename.includes(pattern))) {
            const error = new Error('File name contains potentially unsafe patterns')
            error.code = 'UNSAFE_FILENAME'
            return cb(error, false)
        }

      
        file.healthCategory = fileCategory
        
        console.log(`[WELLNESS-UPLOAD] File validated: ${file.originalname} (${file.mimetype})`)
        cb(null, true)
        
    } catch (error) {
        console.error('[WELLNESS-UPLOAD] File validation error:', error)
        cb(error, false)
    }
}

const createS3Upload = (uploadPath, fileType) => {
    return multerS3({
        s3: s3Client,
        bucket: config.AWS_S3_PUBLIC,
        acl: 'private', 
        contentType: multerS3.AUTO_CONTENT_TYPE,
        
        key: function (req, file, cb) {
            try {
                const userId = req.user?._id || 'anonymous'
                const timestamp = Date.now()
                const sanitizedFilename = file.originalname
                    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
                    .substring(0, 100) 
                
                const s3Key = `${uploadPath}/${userId}/${timestamp}_${sanitizedFilename}`
                file.s3Key = s3Key
                file.userId = userId
                file.uploadTimestamp = timestamp
                
                console.log(`[WELLNESS-UPLOAD] S3 key generated: ${s3Key}`)
                cb(null, s3Key)
                
            } catch (error) {
                console.error('[WELLNESS-UPLOAD] S3 key generation error:', error)
                cb(error)
            }
        },
        
        metadata: function (req, file, cb) {
            const metadata = {
                'user-id': req.user?._id?.toString() || 'anonymous',
                'upload-service': 'wellness-user-service',
                'file-category': file.healthCategory || 'unknown',
                'upload-timestamp': Date.now().toString(),
                'original-name': file.originalname,
                'content-type': file.mimetype
            }
            cb(null, metadata)
        },
        
        serverSideEncryption: 'AES256' 
    })
}


export const awsUpload = (uploadPath, uploadType) => {
    try {
       
        let fileSizeLimit
        switch (uploadPath) {
            case config.HEALTH_DOCUMENTS:
                fileSizeLimit = config.MAX_HEALTH_DOCUMENT_SIZE
                break
            case config.PROGRESS_PHOTOS:
                fileSizeLimit = config.MAX_PROGRESS_PHOTO_SIZE
                break
            case config.MEDICAL_REPORTS:
                fileSizeLimit = config.MAX_MEDICAL_REPORT_SIZE
                break
            default:
                fileSizeLimit = 5 * 1024 * 1024 
        }

        const upload = multer({
            storage: createS3Upload(uploadPath, uploadType),
            fileFilter: healthFileFilter,
            limits: {
                fileSize: fileSizeLimit,
                files: uploadType === enums.AWS_FILE_TYPES.SINGLE ? 1 : 10,
                fieldSize: 2 * 1024 * 1024, 
                fields: 10 
            }
        })

        if (uploadType === enums.AWS_FILE_TYPES.SINGLE) {
            return upload.single('file')
        } else if (uploadType === enums.AWS_FILE_TYPES.MULTI) {
            return upload.array('files', 10)
        } else {
            return upload.fields([
                { name: 'healthDocument', maxCount: 1 },
                { name: 'progressPhoto', maxCount: 5 },
                { name: 'medicalReport', maxCount: 1 }
            ])
        }
        
    } catch (error) {
        console.error('[WELLNESS-UPLOAD] Upload middleware creation error:', error)
        
     
        return (req, res, next) => {
            return res.status(500).json({
                success: false,
                message: 'File upload service configuration error',
                error_type: 'upload_service_error'
            })
        }
    }
}

export const deleteHealthFile = async (s3Key) => {
    try {
        const deleteParams = {
            Bucket: config.AWS_S3_PUBLIC,
            Key: s3Key
        }

        await s3Client.send(new DeleteObjectCommand(deleteParams))
        console.log(`[WELLNESS-UPLOAD] File deleted successfully: ${s3Key}`)
        return { success: true }
        
    } catch (error) {
        console.error(`[WELLNESS-UPLOAD] File deletion error: ${s3Key}`, error)
        return { success: false, error: error.message }
    }
}
