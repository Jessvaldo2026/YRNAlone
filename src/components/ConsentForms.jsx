// FILE: src/components/ConsentForms.jsx
// ✍️ E-Signature Consent Forms Component
// HIPAA-compliant consent capture with full audit trail

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Check, X, ChevronRight, ChevronLeft,
  Pen, Type, Shield, AlertCircle, CheckCircle,
  Lock, Heart, Phone, Users, Loader
} from 'lucide-react';
import {
  CONSENT_TEMPLATES,
  captureESignature,
  getUserConsents,
  hasSignedConsent
} from '../services/consentService';

// ============================================
// 📋 MAIN CONSENT FORMS COMPONENT
// ============================================

const ConsentForms = ({
  userId,
  organizationId = null,
  requiredConsents = ['hipaa', 'treatment'],
  onComplete,
  onSkip,
  showSkip = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedConsents, setCompletedConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alreadySigned, setAlreadySigned] = useState({});

  // Filter to only show required consent types that exist in templates
  const consentsToShow = requiredConsents.filter(type => CONSENT_TEMPLATES[type]);

  useEffect(() => {
    checkExistingConsents();
  }, [userId]);

  const checkExistingConsents = async () => {
    setLoading(true);
    const signed = {};
    for (const consentType of consentsToShow) {
      signed[consentType] = await hasSignedConsent(userId, consentType);
    }
    setAlreadySigned(signed);
    setCompletedConsents(Object.keys(signed).filter(k => signed[k]));

    // Find first unsigned consent
    const firstUnsigned = consentsToShow.findIndex(type => !signed[type]);
    if (firstUnsigned >= 0) {
      setCurrentIndex(firstUnsigned);
    }
    setLoading(false);
  };

  const handleConsentComplete = (consentType) => {
    const newCompleted = [...completedConsents, consentType];
    setCompletedConsents(newCompleted);

    // Move to next unsigned consent
    const nextIndex = consentsToShow.findIndex(
      (type, idx) => idx > currentIndex && !newCompleted.includes(type)
    );

    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
    } else if (newCompleted.length >= consentsToShow.length) {
      // All done!
      onComplete && onComplete(newCompleted);
    }
  };

  const allComplete = consentsToShow.every(type =>
    completedConsents.includes(type) || alreadySigned[type]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking consent status...</p>
        </div>
      </div>
    );
  }

  if (allComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">All Set!</h2>
          <p className="text-gray-600 mb-6">
            You've completed all required consent forms. Your information is protected and secure.
          </p>
          <button
            onClick={() => onComplete && onComplete(completedConsents)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Continue to App
          </button>
        </div>
      </div>
    );
  }

  const currentConsent = CONSENT_TEMPLATES[consentsToShow[currentIndex]];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      {/* Progress Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-gray-800">Required Consents</h1>
          <span className="text-sm text-gray-500">
            {completedConsents.length + Object.values(alreadySigned).filter(Boolean).length} of {consentsToShow.length} complete
          </span>
        </div>
        <div className="flex gap-2">
          {consentsToShow.map((type, idx) => {
            const isComplete = completedConsents.includes(type) || alreadySigned[type];
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={type}
                className={`flex-1 h-2 rounded-full transition-all ${
                  isComplete ? 'bg-green-500' :
                  isCurrent ? 'bg-purple-500' :
                  'bg-gray-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Current Consent Form */}
      {currentConsent && (
        <SingleConsentForm
          consent={currentConsent}
          userId={userId}
          organizationId={organizationId}
          onComplete={() => handleConsentComplete(consentsToShow[currentIndex])}
          onBack={currentIndex > 0 ? () => setCurrentIndex(currentIndex - 1) : null}
          isAlreadySigned={alreadySigned[consentsToShow[currentIndex]]}
        />
      )}

      {/* Skip Option */}
      {showSkip && (
        <div className="max-w-2xl mx-auto mt-4 text-center">
          <button
            onClick={onSkip}
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            Skip for now (you can complete later in Settings)
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// 📄 SINGLE CONSENT FORM
// ============================================

const SingleConsentForm = ({
  consent,
  userId,
  organizationId,
  onComplete,
  onBack,
  isAlreadySigned
}) => {
  const [checkedBoxes, setCheckedBoxes] = useState({});
  const [typedName, setTypedName] = useState('');
  const [signatureMode, setSignatureMode] = useState('typed'); // 'typed' or 'drawn'
  const [signatureImage, setSignatureImage] = useState(null);
  const [additionalFields, setAdditionalFields] = useState({});
  const [showFullContent, setShowFullContent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Check if all required checkboxes are checked
  const allRequiredChecked = consent.checkboxes
    .filter(cb => cb.required)
    .every(cb => checkedBoxes[cb.id]);

  // Check if additional required fields are filled
  const additionalFieldsValid = !consent.additionalFields ||
    consent.additionalFields
      .filter(f => f.required)
      .every(f => additionalFields[f.id]);

  // Check if signature is valid
  const signatureValid = signatureMode === 'typed'
    ? typedName.trim().length >= 2
    : signatureImage !== null;

  const canSubmit = allRequiredChecked && signatureValid && additionalFieldsValid && !submitting;

  // Canvas drawing handlers
  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      const canvas = canvasRef.current;
      setSignatureImage(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureImage(null);
  };

  // Initialize canvas
  useEffect(() => {
    if (signatureMode === 'drawn' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  }, [signatureMode]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await captureESignature(userId, consent.id, {
        typedName: typedName.trim(),
        signatureImage: signatureMode === 'drawn' ? signatureImage : null,
        agreedCheckboxes: Object.keys(checkedBoxes).filter(k => checkedBoxes[k]),
        additionalData: additionalFields
      }, organizationId);

      if (result.success) {
        onComplete();
      } else {
        setError('Failed to save consent. Please try again.');
      }
    } catch (err) {
      console.error('Consent error:', err);
      setError('An error occurred. Please try again.');
    }

    setSubmitting(false);
  };

  if (isAlreadySigned) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-50 p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800">{consent.title}</h3>
          <p className="text-green-600">You have already signed this consent form</p>
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{consent.icon}</span>
          <div>
            <h2 className="text-xl font-bold">{consent.title}</h2>
            <p className="text-purple-200 text-sm">{consent.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Consent Document */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Please Review
            </h3>
            <span className="text-xs text-gray-500">Version {consent.version}</span>
          </div>

          <div
            className={`bg-gray-50 rounded-xl p-4 border border-gray-200 ${
              showFullContent ? '' : 'max-h-64'
            } overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap`}
          >
            {consent.content}
          </div>

          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="mt-2 text-purple-600 text-sm hover:underline"
          >
            {showFullContent ? 'Show Less' : 'Read Full Document'}
          </button>
        </div>

        {/* Additional Fields (for minor consent, etc.) */}
        {consent.additionalFields && (
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Additional Information</h3>
            {consent.additionalFields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={additionalFields[field.id] || ''}
                    onChange={(e) => setAdditionalFields({
                      ...additionalFields,
                      [field.id]: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={additionalFields[field.id] || ''}
                    onChange={(e) => setAdditionalFields({
                      ...additionalFields,
                      [field.id]: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Checkboxes */}
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold text-gray-800">I Acknowledge & Agree</h3>
          {consent.checkboxes.map(checkbox => (
            <label
              key={checkbox.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                checkedBoxes[checkbox.id]
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checkedBoxes[checkbox.id] || false}
                onChange={(e) => setCheckedBoxes({
                  ...checkedBoxes,
                  [checkbox.id]: e.target.checked
                })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <span className="text-sm text-gray-700">
                {checkbox.label}
                {checkbox.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
          ))}
        </div>

        {/* E-Signature Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Pen className="w-4 h-4" />
            Electronic Signature
          </h3>

          {/* Signature Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSignatureMode('typed')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                signatureMode === 'typed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Type className="w-4 h-4" />
              Type Name
            </button>
            <button
              onClick={() => setSignatureMode('drawn')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                signatureMode === 'drawn'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Pen className="w-4 h-4" />
              Draw Signature
            </button>
          </div>

          {signatureMode === 'typed' ? (
            <div>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full legal name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              />
              {typedName && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border-b-2 border-gray-400">
                  <p className="text-xs text-gray-500 mb-1">Your signature:</p>
                  <p className="text-2xl font-signature text-gray-800" style={{ fontFamily: 'cursive' }}>
                    {typedName}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={150}
                  className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!signatureImage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400">Sign here</p>
                  </div>
                )}
              </div>
              <button
                onClick={clearSignature}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Signature
              </button>
            </div>
          )}
        </div>

        {/* Legal Notice */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Legal Notice</p>
              <p className="mt-1">
                By signing electronically, you agree that your electronic signature is the legal
                equivalent of your manual signature. This consent will be timestamped and your
                IP address recorded for verification purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              canSubmit
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Sign & Agree
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🔍 CONSENT STATUS BADGE
// ============================================

export const ConsentStatusBadge = ({ userId, consentType }) => {
  const [signed, setSigned] = useState(null);

  useEffect(() => {
    hasSignedConsent(userId, consentType).then(setSigned);
  }, [userId, consentType]);

  if (signed === null) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      signed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      {signed ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {signed ? 'Signed' : 'Pending'}
    </span>
  );
};

// ============================================
// 📋 CONSENT SUMMARY CARD
// ============================================

export const ConsentSummaryCard = ({ userId, onManage }) => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserConsents(userId).then(c => {
      setConsents(c);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  const activeConsents = consents.filter(c => c.status === 'active');

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          Consent Forms
        </h3>
        {onManage && (
          <button
            onClick={onManage}
            className="text-sm text-purple-600 hover:underline"
          >
            Manage
          </button>
        )}
      </div>

      {activeConsents.length === 0 ? (
        <p className="text-sm text-gray-500">No consent forms signed yet</p>
      ) : (
        <div className="space-y-2">
          {activeConsents.map(consent => (
            <div key={consent.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{consent.consentTitle}</span>
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Signed
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsentForms;
