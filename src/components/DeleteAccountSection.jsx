// FILE: src/components/DeleteAccountSection.jsx
// 🗑️ Delete Account Section Component

import React, { useState } from 'react';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

const DeleteAccountSection = ({ onDeleted }) => {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;

    setDeleting(true);
    setError('');

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Not logged in');

      // 1. Delete user's journal entries
      setProgress('Deleting journals...');
      try {
        const journalsRef = collection(db, 'users', userId, 'journalEntries');
        const journalsSnap = await getDocs(journalsRef);
        for (const docSnap of journalsSnap.docs) {
          await deleteDoc(docSnap.ref);
        }
      } catch (err) {
        console.log('No journals to delete');
      }

      // 2. Delete user's mood entries
      setProgress('Deleting mood history...');
      try {
        const moodsRef = collection(db, 'users', userId, 'moodHistory');
        const moodsSnap = await getDocs(moodsRef);
        for (const docSnap of moodsSnap.docs) {
          await deleteDoc(docSnap.ref);
        }
      } catch (err) {
        console.log('No moods to delete');
      }

      // 3. Delete user's posts
      setProgress('Deleting posts...');
      try {
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
        const postsSnap = await getDocs(postsQuery);
        for (const docSnap of postsSnap.docs) {
          await deleteDoc(docSnap.ref);
        }
      } catch (err) {
        console.log('No posts to delete');
      }

      // 4. Delete user document
      setProgress('Deleting profile...');
      await deleteDoc(doc(db, 'users', userId));

      // 5. Delete Firebase Auth account
      setProgress('Finalizing...');
      await auth.currentUser.delete();

      // Done - user will be logged out automatically
      onDeleted?.();

    } catch (error) {
      console.error('Delete account error:', error);
      if (error.code === 'auth/requires-recent-login') {
        setError('For security, please sign out and sign in again before deleting your account.');
      } else {
        setError('Failed to delete account: ' + error.message);
      }
      setDeleting(false);
      setProgress('');
    }
  };

  const handleCancel = () => {
    setStep(1);
    setConfirmText('');
    setError('');
    setProgress('');
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
      <h3 className="font-bold text-red-800 text-lg mb-2 flex items-center gap-2">
        🗑️ Delete Account
      </h3>

      {step === 1 && (
        <>
          <p className="text-red-600 text-sm mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setStep(2)}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition"
          >
            I want to delete my account
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="font-medium text-red-800 mb-2">This will permanently delete:</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your profile and account</li>
              <li>• All journal entries</li>
              <li>• All mood history</li>
              <li>• All posts and comments</li>
              <li>• All other personal data</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 mb-2">Type DELETE to confirm:</p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="DELETE"
            className="w-full border border-red-300 rounded-xl px-4 py-3 mb-4 font-mono text-center text-lg tracking-widest focus:border-red-500 outline-none"
            disabled={deleting}
          />

          {error && (
            <p className="text-red-600 text-sm mb-4 bg-red-100 p-3 rounded-xl">{error}</p>
          )}

          {progress && (
            <p className="text-orange-600 text-sm mb-4 bg-orange-100 p-3 rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              {progress}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={confirmText !== 'DELETE' || deleting}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Forever'}
            </button>
            <button
              onClick={handleCancel}
              disabled={deleting}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DeleteAccountSection;
