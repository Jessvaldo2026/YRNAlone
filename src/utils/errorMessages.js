// FILE: src/utils/errorMessages.js
// 📝 Friendly error messages for Firebase and other errors

export const getFirebaseErrorMessage = (errorCode) => {
  const messages = {
    // Auth errors
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Connection error. Please check your internet.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes.',
    'auth/popup-closed-by-user': 'Sign in was cancelled.',
    'auth/requires-recent-login': 'For security, please sign out and sign in again.',
    'auth/user-disabled': 'This account has been disabled. Contact support for help.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',

    // Firestore errors
    'permission-denied': "You don't have permission to do this.",
    'not-found': 'The requested data was not found.',
    'already-exists': 'This item already exists.',
    'failed-precondition': 'Operation failed. Please try again.',
    'resource-exhausted': 'Too many requests. Please wait a moment.',
    'cancelled': 'Operation was cancelled.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'unauthenticated': 'Please sign in to continue.',

    // Storage errors
    'storage/unauthorized': "You don't have permission to access this file.",
    'storage/canceled': 'Upload was cancelled.',
    'storage/unknown': 'An unknown error occurred. Please try again.',
    'storage/object-not-found': 'File not found.',
    'storage/quota-exceeded': 'Storage quota exceeded.',
  };

  return messages[errorCode] || 'Something went wrong. Please try again.';
};

// Get user-friendly message from error object
export const getFriendlyErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred.';

  // Check for Firebase error code
  if (error.code) {
    return getFirebaseErrorMessage(error.code);
  }

  // Check for common error messages
  if (error.message) {
    const msg = error.message.toLowerCase();

    if (msg.includes('network')) {
      return 'Connection error. Please check your internet.';
    }
    if (msg.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (msg.includes('permission') || msg.includes('unauthorized')) {
      return "You don't have permission to do this.";
    }
    if (msg.includes('not found')) {
      return 'The requested item was not found.';
    }
  }

  return error.message || 'Something went wrong. Please try again.';
};

// Toast notification helper
let toastContainer = null;

export const showToast = (message, type = 'info', duration = 3000) => {
  // Create container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] space-y-2';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'error' ? 'bg-red-500' :
                  type === 'success' ? 'bg-green-500' :
                  type === 'warning' ? 'bg-orange-500' :
                  'bg-gray-800';

  const icon = type === 'error' ? '❌' :
               type === 'success' ? '✅' :
               type === 'warning' ? '⚠️' :
               'ℹ️';

  toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 transform translate-y-0 opacity-100`;
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  toastContainer.appendChild(toast);

  // Animate out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// Convenience methods
export const showSuccess = (message) => showToast(message, 'success');
export const showError = (message) => showToast(message, 'error');
export const showWarning = (message) => showToast(message, 'warning');
export const showInfo = (message) => showToast(message, 'info');

export default {
  getFirebaseErrorMessage,
  getFriendlyErrorMessage,
  showToast,
  showSuccess,
  showError,
  showWarning,
  showInfo
};
