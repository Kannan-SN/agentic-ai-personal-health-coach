import mongoose from 'mongoose'
import config from '@/config'

let connectionCounter = 0

export default function connectDatabase(callback) {
    const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, 
        retryWrites: true,
        bufferCommands: false,
        bufferMaxEntries: 0,
        loggerLevel: 'info'
    }

    mongoose
        .connect(config.MONGO_URI, connectionOptions)
        .then(() => {
            console.log('\x1b[34m[WELLNESS-DB] Database Connection Successful')
            console.log('\x1b[36m[WELLNESS-DB] Health data protection enabled')
            
            mongoose.connection.on('error', (error) => {
                console.error('\x1b[31m[WELLNESS-DB] Database Error:', error)
               
            })

            mongoose.connection.on('disconnected', () => {
                console.log('\x1b[33m[WELLNESS-DB] Database Disconnected')
            })

            mongoose.connection.on('reconnected', () => {
                console.log('\x1b[32m[WELLNESS-DB] Database Reconnected')
            })

            return callback(true)
        })
        .catch((error) => {
            console.error('\x1b[31m[WELLNESS-DB] Connection Error:', error)
            connectionCounter++
            
            if (connectionCounter === 10) {
                console.error('\x1b[31m[WELLNESS-DB] Maximum connection attempts reached. Exiting...')
                process.exit(-1)
            } else {
                console.log(`\x1b[33m[WELLNESS-DB] Retrying connection in 10 seconds... (Attempt ${connectionCounter}/10)`)
                setTimeout(() => {
                    connectDatabase(callback)
                }, 10000)
            }
        })

 
    mongoose.set('sanitizeFilter', true) 
    mongoose.set('runValidators', true)
    
    process.on('SIGINT', async () => {
        try {
            await mongoose.connection.close()
            console.log('\x1b[36m[WELLNESS-DB] Database connection closed through app termination')
            process.exit(0)
        } catch (error) {
            console.error('\x1b[31m[WELLNESS-DB] Error during graceful shutdown:', error)
            process.exit(1)
        }
    })
}