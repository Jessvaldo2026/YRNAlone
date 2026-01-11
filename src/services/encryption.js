// 🔒 FILE 24/33: src/utils/encryption.js
// Simple Encryption for Privacy Features

// Simple XOR encryption (client-side only, for privacy)
const SECRET_KEY = 'YRNAlone_Privacy_Key_2025';

export const encrypt = (text) => {
  if (!text) return '';
  
  try {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted); // Base64 encode
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

export const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    const decoded = atob(encryptedText); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
};

// Hash function for password-like strings (not for actual passwords!)
export const simpleHash = (text) => {
  if (!text) return '';
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};

// Generate a random encryption key
export const generateKey = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export default {
  encrypt,
  decrypt,
  simpleHash,
  generateKey
};