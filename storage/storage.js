  // storage/storage.js
  class StorageManager {
    constructor() {
      this.crypto = new CryptoManager();
    }
  
    async saveAccount(account, masterKey) {
      const encrypted = await this.crypto.encrypt(JSON.stringify(account), masterKey);
      await chrome.storage.local.set({
        [`account_${account.id}`]: encrypted
      });
    }
  
    async getAccount(id, masterKey) {
      const result = await chrome.storage.local.get(`account_${id}`);
      const encrypted = result[`account_${id}`];
      
      if (!encrypted) return null;
      
      const decrypted = await this.crypto.decrypt(
        encrypted.data,
        masterKey,
        encrypted.iv
      );
      
      return JSON.parse(decrypted);
    }
  
    async getAllAccounts(masterKey) {
      const all = await chrome.storage.local.get(null);
      const accounts = [];
      
      for (const key in all) {
        if (key.startsWith('account_')) {
          const encrypted = all[key];
          const decrypted = await this.crypto.decrypt(
            encrypted.data,
            masterKey,
            encrypted.iv
          );
          accounts.push(JSON.parse(decrypted));
        }
      }
      
      return accounts;
    }
  }