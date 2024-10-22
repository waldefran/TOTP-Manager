 // utils/crypto.js
 class CryptoManager {
    constructor() {
      this.algorithm = 'AES-GCM';
      this.keyLength = 256;
    }
  
    async generateKey(password, salt) {
      const encoder = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      return window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode(salt),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: this.algorithm, length: this.keyLength },
        false,
        ['encrypt', 'decrypt']
      );
    }
  
    async encrypt(data, key) {
      const encoder = new TextEncoder();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        encoder.encode(data)
      );
  
      return {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encryptedData))
      };
    }
  
    async decrypt(encryptedData, key, iv) {
      const decoder = new TextDecoder();
      
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: new Uint8Array(iv)
        },
        key,
        new Uint8Array(encryptedData)
      );
  
      return decoder.decode(decryptedData);
    }
  }