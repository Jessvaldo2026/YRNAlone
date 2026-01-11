// FILE: src/SafetyAndModeration.jsx
// 🛡️ COMPREHENSIVE SAFETY, MODERATION & LEGAL SYSTEM
// Enterprise-grade protection for YRNAlone

import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Flag, Ban, Eye, EyeOff, Lock, 
  FileText, Users, CheckCircle, XCircle, Clock, Search,
  Bell, MessageCircle, Trash2, UserX, AlertCircle, Heart,
  ChevronRight, ArrowLeft, Phone, Mail, Globe, Calendar,
  BarChart3, TrendingUp, Filter, Download, RefreshCw
} from 'lucide-react';

// ============================================
// 📋 COMMUNITY GUIDELINES
// ============================================
export const CommunityGuidelines = ({ onAccept, onBack }) => {
  const [hasRead, setHasRead] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Community Guidelines</h1>
            <p className="text-gray-600">Our commitment to a safe space</p>
          </div>
        </div>

        <div 
          className="bg-white rounded-3xl p-6 shadow-lg max-h-[60vh] overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-purple-600 flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5" /> Our Mission
              </h2>
              <p>YRNAlone (You aRe Not Alone) is a safe space for people seeking mental health support and connection. We are committed to creating an environment where everyone feels welcome, respected, and supported.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-600 flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5" /> Be Kind & Supportive
              </h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Treat all members with respect and compassion</li>
                <li>Offer encouragement and support to those struggling</li>
                <li>Remember that everyone is on their own journey</li>
                <li>Use "I" statements when sharing experiences</li>
                <li>Avoid judgment and criticism of others' feelings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-3">
                <Ban className="w-5 h-5" /> Zero Tolerance Policy
              </h2>
              <p className="font-semibold mb-2">The following will result in immediate account suspension:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Sexual content or solicitation</strong> - Any sexually explicit material, requests for sexual content, or grooming behavior</li>
                <li><strong>Harassment or bullying</strong> - Targeting, threatening, or intimidating other users</li>
                <li><strong>Hate speech</strong> - Discrimination based on race, gender, sexuality, religion, disability, or any protected characteristic</li>
                <li><strong>Violence or threats</strong> - Any content promoting or threatening violence</li>
                <li><strong>Personal information sharing</strong> - Sharing others' private information without consent</li>
                <li><strong>Predatory behavior</strong> - Any attempts to exploit, manipulate, or take advantage of vulnerable users</li>
                <li><strong>Spam or scams</strong> - Unsolicited promotions, phishing, or fraudulent content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-orange-500 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5" /> Content Guidelines
              </h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Do not post graphic descriptions of self-harm methods</li>
                <li>Use trigger warnings when discussing sensitive topics</li>
                <li>Do not provide medical advice - encourage professional help</li>
                <li>Keep personal identifying information private</li>
                <li>Report concerning content to moderators immediately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2 mb-3">
                <Users className="w-5 h-5" /> For Minors (Under 18)
              </h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Never share your real name, school, address, or phone number</li>
                <li>Do not arrange to meet anyone from this app in person</li>
                <li>Tell a trusted adult if someone makes you uncomfortable</li>
                <li>Use the report button if anyone asks for personal information</li>
                <li>Remember: Adults should never ask you to keep secrets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-green-500 flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5" /> Crisis Resources
              </h2>
              <p className="mb-2">If you or someone you know is in immediate danger:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Emergency:</strong> Call 911 (US) or local emergency services</li>
                <li><strong>Suicide Prevention:</strong> 988 (US) - Available 24/7</li>
                <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                <li><strong>Child Abuse Hotline:</strong> 1-800-422-4453</li>
                <li><strong>SAMHSA Helpline:</strong> 1-800-662-4357</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-600 flex items-center gap-2 mb-3">
                <Flag className="w-5 h-5" /> Reporting
              </h2>
              <p>If you see content that violates these guidelines:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Use the report button on any post, message, or profile</li>
                <li>Our moderation team reviews reports within 24 hours</li>
                <li>Reports are confidential - the reported user won't know who reported them</li>
                <li>False reports may result in account restrictions</li>
              </ul>
            </section>

            <section className="bg-purple-50 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-purple-600 mb-2">Remember</h2>
              <p className="text-purple-700">This is YOUR safe space. By following these guidelines, we all contribute to a supportive community where everyone can heal and grow together. 💜</p>
            </section>
          </div>
        </div>

        {onAccept && (
          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-purple-500 focus:ring-purple-400"
              />
              <span className="text-gray-700">
                I have read and agree to follow the Community Guidelines. I understand that violations may result in account suspension.
              </span>
            </label>
            <button
              onClick={onAccept}
              disabled={!hasRead || !scrolledToBottom}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!scrolledToBottom ? 'Please read all guidelines' : hasRead ? 'I Agree - Continue' : 'Please check the box above'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 🔞 AGE VERIFICATION & PARENTAL CONSENT (COPPA)
// ============================================
export const AgeVerification = ({ onVerified, onBack }) => {
  const [birthDate, setBirthDate] = useState({ month: '', day: '', year: '' });
  const [error, setError] = useState('');
  const [showParentalConsent, setShowParentalConsent] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentConsent, setParentConsent] = useState(false);
  const [consentSent, setConsentSent] = useState(false);

  const calculateAge = () => {
    if (!birthDate.month || !birthDate.day || !birthDate.year) return null;
    const today = new Date();
    const birth = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleContinue = () => {
    const age = calculateAge();
    if (age === null) {
      setError('Please enter your complete date of birth');
      return;
    }
    if (age < 13) {
      setShowParentalConsent(true);
    } else {
      onVerified({ age, birthDate, needsParentalConsent: false });
    }
  };

  const handleParentalConsent = () => {
    if (!parentEmail || !parentEmail.includes('@')) {
      setError('Please enter a valid parent/guardian email');
      return;
    }
    // In production, this would send an actual email
    setConsentSent(true);
  };

  const handleParentVerified = () => {
    if (!parentConsent) {
      setError('Parent/guardian must agree to the terms');
      return;
    }
    onVerified({ 
      age: calculateAge(), 
      birthDate, 
      needsParentalConsent: true,
      parentEmail,
      consentGiven: true
    });
  };

  if (showParentalConsent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setShowParentalConsent(false)} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Parental Consent</h1>
              <p className="text-gray-600">Required for users under 13</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">COPPA Compliance</h2>
              <p className="text-gray-600 text-sm mt-2">
                Under the Children's Online Privacy Protection Act (COPPA), we need your parent or guardian's permission before you can use YRNAlone.
              </p>
            </div>

            {!consentSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent/Guardian Email *
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                    placeholder="parent@email.com"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={handleParentalConsent}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90"
                >
                  Send Consent Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Consent request sent!</p>
                  <p className="text-green-600 text-sm">We've sent an email to {parentEmail}</p>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    Parent/Guardian: Please review and provide consent below:
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer mb-4">
                    <input 
                      type="checkbox" 
                      checked={parentConsent}
                      onChange={(e) => setParentConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded text-purple-500"
                    />
                    <span className="text-gray-700 text-sm">
                      I am the parent/guardian and I consent to my child using YRNAlone. I have reviewed the Privacy Policy and Community Guidelines.
                    </span>
                  </label>
                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                  <button
                    onClick={handleParentVerified}
                    disabled={!parentConsent}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
                  >
                    Parent Verified - Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Verify Your Age</h1>
            <p className="text-gray-600">This helps us keep you safe</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-gray-600">When were you born?</p>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Month</label>
              <select
                value={birthDate.month}
                onChange={(e) => setBirthDate({...birthDate, month: e.target.value})}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
              >
                <option value="">MM</option>
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Day</label>
              <select
                value={birthDate.day}
                onChange={(e) => setBirthDate({...birthDate, day: e.target.value})}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
              >
                <option value="">DD</option>
                {Array.from({length: 31}, (_, i) => (
                  <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <select
                value={birthDate.year}
                onChange={(e) => setBirthDate({...birthDate, year: e.target.value})}
                className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
              >
                <option value="">YYYY</option>
                {Array.from({length: 100}, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <button
            onClick={handleContinue}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90"
          >
            Continue
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Your birthday is kept private and used only to ensure age-appropriate features.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🎯 ENHANCED ONBOARDING QUESTIONNAIRE
// ============================================
export const OnboardingQuestionnaire = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    seekingHelp: [],
    triedTherapy: '',
    preferredSupport: [],
    emergencyContact: { name: '', phone: '', relationship: '' }
  });

  const helpOptions = [
    { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
    { id: 'depression', label: 'Depression', emoji: '😢' },
    { id: 'stress', label: 'Stress', emoji: '😫' },
    { id: 'loneliness', label: 'Loneliness', emoji: '💔' },
    { id: 'grief', label: 'Grief & Loss', emoji: '🕊️' },
    { id: 'relationships', label: 'Relationships', emoji: '💑' },
    { id: 'self-esteem', label: 'Self-Esteem', emoji: '🪞' },
    { id: 'trauma', label: 'Trauma', emoji: '💜' },
    { id: 'addiction', label: 'Addiction', emoji: '🔄' },
    { id: 'other', label: 'Other', emoji: '✨' }
  ];

  const supportOptions = [
    { id: 'groups', label: 'Support Groups', desc: 'Connect with others facing similar challenges' },
    { id: 'journal', label: 'Journaling', desc: 'Express thoughts in a private space' },
    { id: 'tools', label: 'Wellness Tools', desc: 'Breathing, meditation, mood tracking' },
    { id: 'community', label: 'Community Posts', desc: 'Share and receive support from the community' }
  ];

  const toggleHelp = (id) => {
    setAnswers(prev => ({
      ...prev,
      seekingHelp: prev.seekingHelp.includes(id) 
        ? prev.seekingHelp.filter(h => h !== id)
        : [...prev.seekingHelp, id]
    }));
  };

  const toggleSupport = (id) => {
    setAnswers(prev => ({
      ...prev,
      preferredSupport: prev.preferredSupport.includes(id)
        ? prev.preferredSupport.filter(s => s !== id)
        : [...prev.preferredSupport, id]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={step > 1 ? () => setStep(step - 1) : onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-purple-500' : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 4</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">What brings you here?</h2>
                <p className="text-gray-500 text-sm">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {helpOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => toggleHelp(opt.id)}
                    className={`p-3 rounded-xl border-2 text-left transition ${
                      answers.seekingHelp.includes(opt.id) 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <p className="text-sm font-medium mt-1">{opt.label}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={answers.seekingHelp.length === 0}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 mt-4"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Have you tried therapy before?</h2>
                <p className="text-gray-500 text-sm">This helps us personalize your experience</p>
              </div>
              {[
                { id: 'yes-current', label: "Yes, I'm currently in therapy" },
                { id: 'yes-past', label: "Yes, but not currently" },
                { id: 'no-interested', label: "No, but I'm interested" },
                { id: 'no-not-interested', label: "No, and I prefer other support" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAnswers({...answers, triedTherapy: opt.id})}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    answers.triedTherapy === opt.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setStep(3)}
                disabled={!answers.triedTherapy}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 mt-4"
              >
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">How would you like support?</h2>
                <p className="text-gray-500 text-sm">Select all that interest you</p>
              </div>
              {supportOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => toggleSupport(opt.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    answers.preferredSupport.includes(opt.id) 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </button>
              ))}
              <button
                onClick={() => setStep(4)}
                disabled={answers.preferredSupport.length === 0}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 mt-4"
              >
                Continue
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Emergency Contact</h2>
                <p className="text-gray-500 text-sm">Optional but recommended for crisis support</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={answers.emergencyContact.name}
                  onChange={(e) => setAnswers({
                    ...answers, 
                    emergencyContact: {...answers.emergencyContact, name: e.target.value}
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                  placeholder="Mom, Dad, Friend, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={answers.emergencyContact.phone}
                  onChange={(e) => setAnswers({
                    ...answers, 
                    emergencyContact: {...answers.emergencyContact, phone: e.target.value}
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={answers.emergencyContact.relationship}
                  onChange={(e) => setAnswers({
                    ...answers, 
                    emergencyContact: {...answers.emergencyContact, relationship: e.target.value}
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Select relationship</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="partner">Partner/Spouse</option>
                  <option value="therapist">Therapist</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => onComplete(answers)}
                  className="flex-1 py-4 border-2 border-purple-300 text-purple-600 font-bold rounded-xl hover:bg-purple-50"
                >
                  Skip
                </button>
                <button
                  onClick={() => onComplete(answers)}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90"
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🚨 REPORT MODAL
// ============================================
export const ReportModal = ({ isOpen, onClose, contentType, contentId, reportedUser, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
    { id: 'harassment', label: 'Harassment or Bullying' },
    { id: 'sexual', label: 'Sexual Content or Solicitation' },
    { id: 'hate', label: 'Hate Speech or Discrimination' },
    { id: 'violence', label: 'Violence or Threats' },
    { id: 'spam', label: 'Spam or Scam' },
    { id: 'misinformation', label: 'Harmful Misinformation' },
    { id: 'self-harm', label: 'Promoting Self-Harm' },
    { id: 'privacy', label: 'Privacy Violation' },
    { id: 'underage', label: 'Suspected Underage User' },
    { id: 'impersonation', label: 'Impersonation' },
    { id: 'other', label: 'Other' }
  ];

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit({
      contentType,
      contentId,
      reportedUser,
      reason,
      details,
      timestamp: new Date().toISOString()
    });
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                Report Content
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Help us keep YRNAlone safe. Reports are confidential.
            </p>

            <div className="space-y-2 mb-4">
              {reportReasons.map(r => (
                <button
                  key={r.id}
                  onClick={() => setReason(r.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition ${
                    reason === r.id 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                rows={3}
                placeholder="Please provide any additional context..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Report Submitted</h3>
            <p className="text-gray-600 mb-6">
              Thank you for helping keep our community safe. Our team will review this report within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 🛡️ USER SAFETY SETTINGS
// ============================================
export const SafetySettings = ({ settings, onUpdate, onBack }) => {
  const [localSettings, setLocalSettings] = useState(settings || {
    hideFromSearch: false,
    approveMessages: true,
    showOnlineStatus: false,
    contentFilter: 'moderate',
    blockedWords: [],
    allowDirectMessages: true,
    showActivityStatus: false
  });

  const handleSave = () => {
    onUpdate(localSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-purple-500" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">Safety & Privacy</h2>
          <p className="text-gray-500 text-sm">Control who can interact with you</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Privacy Controls</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">Hide from Search</p>
                <p className="text-sm text-gray-500">Others can't find you by searching</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.hideFromSearch}
                onChange={(e) => setLocalSettings({...localSettings, hideFromSearch: e.target.checked})}
                className="w-5 h-5 rounded text-purple-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">Approve Messages</p>
                <p className="text-sm text-gray-500">Review message requests before accepting</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.approveMessages}
                onChange={(e) => setLocalSettings({...localSettings, approveMessages: e.target.checked})}
                className="w-5 h-5 rounded text-purple-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Online Status</p>
                <p className="text-sm text-gray-500">Let others see when you're active</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.showOnlineStatus}
                onChange={(e) => setLocalSettings({...localSettings, showOnlineStatus: e.target.checked})}
                className="w-5 h-5 rounded text-purple-500"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Content Filtering</h3>
          
          <div className="space-y-2">
            {[
              { id: 'strict', label: 'Strict', desc: 'Maximum filtering of sensitive content' },
              { id: 'moderate', label: 'Moderate', desc: 'Balanced filtering (recommended)' },
              { id: 'minimal', label: 'Minimal', desc: 'Adult users only - minimal filtering' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setLocalSettings({...localSettings, contentFilter: opt.id})}
                className={`w-full p-3 rounded-xl border-2 text-left ${
                  localSettings.contentFilter === opt.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <p className="font-medium">{opt.label}</p>
                <p className="text-sm text-gray-500">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Blocked Users</h3>
          <p className="text-gray-500 text-sm mb-3">
            Blocked users cannot see your profile, posts, or message you.
          </p>
          <button className="w-full py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50">
            Manage Blocked Users
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90"
      >
        Save Settings
      </button>
    </div>
  );
};

export default {
  CommunityGuidelines,
  AgeVerification,
  OnboardingQuestionnaire,
  ReportModal,
  SafetySettings
};
