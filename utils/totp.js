 // utils/totp.js
 class TOTPManager {
    constructor() {
      this.defaultPeriod = 30;
      this.defaultDigits = 6;
    }
  
    async generateTOTP(secret, period = this.defaultPeriod, digits = this.defaultDigits) {
      // Decodifica a seed base32
      const decoded = this.base32ToBuffer(secret);
      
      // Obtém o contador baseado no tempo atual
      const counter = Math.floor(Date.now() / 1000 / period);
      
      // Gera o HMAC
      const key = await crypto.subtle.importKey(
        'raw',
        decoded,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      );
      
      const counterBuffer = new ArrayBuffer(8);
      const view = new DataView(counterBuffer);
      view.setBigInt64(0, BigInt(counter), false);
      
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        counterBuffer
      );
      
      // Calcula o código TOTP
      const array = new Uint8Array(signature);
      const offset = array[array.length - 1] & 0xf;
      const binary = ((array[offset] & 0x7f) << 24) |
                    ((array[offset + 1] & 0xff) << 16) |
                    ((array[offset + 2] & 0xff) << 8) |
                    (array[offset + 3] & 0xff);
                    
      const otp = binary % Math.pow(10, digits);
      return otp.toString().padStart(digits, '0');
    }
  
    base32ToBuffer(base32) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let bits = '';
      
      base32.toUpperCase().split('').forEach(char => {
        const index = alphabet.indexOf(char);
        if (index !== -1) {
          bits += index.toString(2).padStart(5, '0');
        }
      });
      
      const array = new Uint8Array(Math.floor(bits.length / 8));
      for (let i = 0; i < array.length; i++) {
        array[i] = parseInt(bits.substr(i * 8, 8), 2);
      }
      
      return array.buffer;
    }
  
    getRemainingSeconds(period = this.defaultPeriod) {
      return period - (Math.floor(Date.now() / 1000) % period);
    }
  }