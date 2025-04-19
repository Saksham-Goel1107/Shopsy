import axios from 'axios';
import crypto from 'crypto';

/**
 
 * @param {string} password 
 * @returns {Promise<{safe: boolean, count: number}>} 
 */
export const checkPasswordBreaches = async (password) => {
  try {
    const sha1Password = crypto.createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    
    const prefix = sha1Password.substring(0, 5);
    const suffix = sha1Password.substring(5);
    
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'Shopsy'
      }
    });
    
    const hashes = response.data.split('\n');
    for (const hash of hashes) {
      const [hashSuffix, count] = hash.split(':');
      if (hashSuffix.trim() === suffix) {
        return {
          safe: false,
          count: parseInt(count.trim())
        };
      }
    }
    
    return { safe: true, count: 0 };
  } catch (error) {
    console.error('Error checking password against HIBP:', error);
    return { safe: true, count: 0, error: true };
  }
};