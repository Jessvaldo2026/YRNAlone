// FILE: src/enterprise/QROnboarding.jsx
// 📱 QR CODE ONBOARDING - Scan to Join Organization
// No forms, no friction - just scan and go!

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Copy, Check, Download, Share2, Users, Sparkles, Shield } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// ============================================
// 📱 QR CODE GENERATOR - For Admins
// ============================================
export const QRCodeGenerator = ({ organizationId, accessCode, orgName }) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  
  // Generate QR code URL (using a free QR API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `https://yrnalone.app/join/${accessCode}`
  )}&bgcolor=ffffff&color=7C3AED`;

  // Alternative: Generate locally with fallback URL
  const joinUrl = `https://yrnalone.app/join/${accessCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${orgName}-QR-Code.png`;
    link.click();
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${orgName} on YRNAlone`,
          text: `Use code ${accessCode} to join our wellness program!`,
          url: joinUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="crystal-card p-6 text-center">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <QrCode className="w-6 h-6 text-purple-600" />
          Quick Onboarding
        </h3>
        <p className="text-gray-500 text-sm">
          Members scan to join instantly - no forms needed!
        </p>
      </div>

      {/* QR Code Display */}
      <div className="qr-container mx-auto mb-6 inline-block">
        <div className="qr-frame p-4">
          <img 
            src={qrCodeUrl} 
            alt="Join QR Code" 
            className="w-48 h-48 rounded-lg relative z-10"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
      </div>

      {/* Access Code Display */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-6">
        <p className="text-xs text-purple-600 font-medium mb-2">ACCESS CODE</p>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-3xl font-bold tracking-widest text-purple-800">
            {accessCode}
          </span>
          <button 
            onClick={copyCode}
            className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-purple-500" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={downloadQR}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button 
          onClick={shareQR}
          className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left">
        <h4 className="font-semibold text-gray-800 mb-2">📋 How to Onboard Members:</h4>
        <ol className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <span>Print this QR code or share the link</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <span>Members scan with their phone camera</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <span>They create an account and automatically join!</span>
          </li>
        </ol>
      </div>
    </div>
  );
};

// ============================================
// 📱 QR CODE SCANNER VIEW - For Members
// ============================================
export const QRJoinView = ({ code, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyCode();
  }, [code]);

  const verifyCode = async () => {
    if (!code || code.length !== 8) {
      setError('Invalid access code');
      setLoading(false);
      return;
    }

    try {
      // Search for organization with this code
      const { collection: firestoreCollection, query: firestoreQuery, where, getDocs } = await import('firebase/firestore');
      const orgsRef = firestoreCollection(db, 'organizations');
      const q = firestoreQuery(orgsRef, where('accessCode', '==', code.toUpperCase()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const org = snapshot.docs[0];
        setOrgData({ id: org.id, ...org.data() });
      } else {
        setError('Organization not found. Please check your code.');
      }
    } catch (err) {
      setError('Error verifying code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="crystal-card p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Verifying your access code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
        <div className="crystal-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={onCancel}
            className="crystal-btn w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
      <div className="crystal-card p-8 max-w-md w-full">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Code Verified!</h2>
          <p className="text-gray-500 mt-1">You're joining:</p>
        </div>

        {/* Organization Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            {orgData?.logo ? (
              <img src={orgData.logo} alt={orgData.name} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-800">{orgData?.name}</h3>
              <p className="text-gray-500">{orgData?.type || 'Organization'}</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <span>Full premium access included</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <span>Private & secure environment</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <span>Connect with care team</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => onSuccess(orgData)}
            className="crystal-btn w-full text-lg"
          >
            Join {orgData?.name}
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📱 PRINTABLE QR POSTER - For Physical Display
// ============================================
export const QRPoster = ({ accessCode, orgName, orgLogo }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    `https://yrnalone.app/join/${accessCode}`
  )}&bgcolor=ffffff&color=7C3AED`;

  const printPoster = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Join ${orgName} - YRNAlone</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 40px;
              background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
            }
            .container {
              background: white;
              border-radius: 32px;
              padding: 48px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            h1 {
              font-size: 28px;
              color: #1f2937;
              margin-bottom: 8px;
            }
            h2 {
              font-size: 20px;
              color: #7c3aed;
              margin-bottom: 24px;
            }
            .qr {
              padding: 24px;
              background: linear-gradient(135deg, #a855f7, #ec4899);
              border-radius: 24px;
              display: inline-block;
              margin-bottom: 24px;
            }
            .qr img {
              display: block;
              border-radius: 16px;
            }
            .code {
              font-family: monospace;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 4px;
              color: #7c3aed;
              background: #f3e8ff;
              padding: 16px 32px;
              border-radius: 16px;
              margin-bottom: 24px;
            }
            .instructions {
              color: #6b7280;
              font-size: 14px;
            }
            .footer {
              margin-top: 32px;
              font-size: 12px;
              color: #9ca3af;
            }
            @media print {
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Join Our Wellness Program</h1>
            <h2>${orgName}</h2>
            <div class="qr">
              <img src="${qrCodeUrl}" width="300" height="300" alt="QR Code" />
            </div>
            <div class="code">${accessCode}</div>
            <p class="instructions">
              📱 Scan the QR code with your phone camera<br/>
              or enter the code at yrnalone.app
            </p>
            <div class="footer">
              Powered by YRNAlone 💜 Mental Health Support
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <button 
      onClick={printPoster}
      className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
    >
      <span className="text-lg">🖨️</span>
      Print Poster
    </button>
  );
};

export default {
  QRCodeGenerator,
  QRJoinView,
  QRPoster
};
