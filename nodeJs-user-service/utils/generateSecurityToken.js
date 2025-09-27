import crypto from 'crypto'
import { generateHealthSecureToken } from '@/security/crypto'

const generateSecurityToken = (isHealthRelated = false) => {
    if (isHealthRelated) {
       
        return generateHealthSecureToken(64)
    }

    const token = crypto.randomBytes(32).toString('hex')
    return token
}

export default generateSecurityToken


