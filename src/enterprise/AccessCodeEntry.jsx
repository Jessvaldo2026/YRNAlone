// FILE: src/enterprise/AccessCodeEntry.jsx
import React, { useState } from 'react';
import { KeyRound, ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, increment, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';

const AccessCodeEntry = ({ onSuccess, onSkip }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgPreview, setOrgPreview] = useState(null);

  const handleCodeChange = async (value) => {
    const upperCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(upperCode);
    setError('');
    setOrgPreview(null);

    // Preview organization when code is complete (8 characters)
    if (upperCode.length === 8) {
      setLoading(true);
      try {
        // Search for organization with this access code
        const orgsQuery = await getDocs(
          query(collection(db, 'organizations'), where('accessCode', '==', upperCode))
        );
        
        if (!orgsQuery.empty) {
          const orgData = orgsQuery.docs[0].data();
          setOrgPreview({
            id: orgsQuery.docs[0].id,
            ...orgData
          });
        }
      } catch (err) {
        console.error('Error checking code:', err);
      }
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!orgPreview) {
      setError('Invalid access code');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Please log in first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update user's organization
      await updateDoc(doc(db, 'users', currentUser.uid), {
        organizationId: orgPreview.id,
        joinedOrgAt: new Date().toISOString()
      });

      // Update organization member count
      await updateDoc(doc(db, 'organizations', orgPreview.id), {
        memberCount: increment(1),
        memberIds: arrayUnion(currentUser.uid)
      });

      onSuccess(orgPreview);
    } catch (err) {
      console.error('Error joining organization:', err);
      setError('Failed to join organization. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onSkip}
            className="p-2 rounded-full bg-white shadow hover:bg-gray-50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Join Organization</h1>
            <p className="text-gray-600">Enter your access code</p>
          </div>
        </div>

        {/* Code Entry Card */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-10 h-10 text-purple-500" />
            </div>
            <p className="text-gray-600">
              Enter the 8-character code provided by your organization
            </p>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="XXXXXXXX"
              maxLength={8}
              className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none uppercase"
              autoFocus
            />
            <p className="text-center text-sm text-gray-500 mt-2">
              {code.length}/8 characters
            </p>
          </div>

          {/* Organization Preview */}
          {orgPreview && (
            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  {orgPreview.logo ? (
                    <img src={orgPreview.logo} alt="" className="w-10 h-10 object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-purple-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{orgPreview.name}</h3>
                  <p className="text-sm text-gray-600">{orgPreview.type}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleJoin}
              disabled={!orgPreview || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Organization'}
            </button>
            
            <button
              onClick={onSkip}
              className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition"
            >
              Continue Without Code
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Don't have a code? Ask your therapist, school, or workplace administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeEntry;
