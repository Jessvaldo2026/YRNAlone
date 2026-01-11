// FILE: src/INTEGRATION_GUIDE.jsx
// 📖 INTEGRATION GUIDE - How to connect the new Guardian & Account Management features
// This file shows exactly what to add to App.jsx and where

// ============================================
// 📦 STEP 1: IMPORTS TO ADD (at top of App.jsx, around line 13)
// ============================================

// Add these imports with the other imports:
/*
import ParentDashboard from './components/ParentDashboard';
import GuardianLinkManager from './components/GuardianLinkManager';
import AdminUserManagement from './enterprise/AdminUserManagement';
import SignupWithAge from './auth/SignupWithAge';
import LoginWithStatus from './auth/LoginWithStatus';
*/


// ============================================
// 📝 STEP 2: ADD NEW VIEWS TO THE SWITCH STATEMENT
// ============================================

// In YRNAloneApp component, find the renderCurrentView() function
// Add these cases around line 11798 (before the default case):

/*
      // 👨‍👩‍👧 GUARDIAN PORTAL
      case 'parentDashboard':
        return <ParentDashboard onBack={() => setCurrentView('settings')} />;

      case 'guardianSettings':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <GuardianLinkManager onClose={() => setCurrentView('settings')} />
          </div>
        );

      // 🔒 ADMIN USER MANAGEMENT
      case 'userManagement':
        return <AdminUserManagement onBack={() => setCurrentView('adminDashboard')} />;
*/


// ============================================
// 🔘 STEP 3: ADD BUTTONS TO SETTINGS VIEW
// ============================================

// Find the SettingsView component and add these buttons:

// FOR PARENTS (show only if user.accountType === 'parent'):
/*
{user.accountType === 'parent' && (
  <button
    onClick={() => setCurrentView('parentDashboard')}
    className="w-full p-4 bg-purple-50 rounded-2xl flex items-center gap-4 hover:bg-purple-100 transition"
  >
    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
      👨‍👩‍👧
    </div>
    <div className="text-left">
      <p className="font-bold text-gray-800">Parent Dashboard</p>
      <p className="text-sm text-gray-500">View your children's wellness</p>
    </div>
  </button>
)}
*/

// FOR CHILDREN/TEENS (show if user is under 18):
/*
{user.birthday && calculateAge(user.birthday) < 18 && (
  <button
    onClick={() => setCurrentView('guardianSettings')}
    className="w-full p-4 bg-blue-50 rounded-2xl flex items-center gap-4 hover:bg-blue-100 transition"
  >
    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
      🔗
    </div>
    <div className="text-left">
      <p className="font-bold text-gray-800">Guardian Settings</p>
      <p className="text-sm text-gray-500">Manage parent/guardian links</p>
    </div>
  </button>
)}
*/

// FOR ADMINS (show if user.isOrgAdmin === true):
/*
{user.isOrgAdmin && (
  <button
    onClick={() => setCurrentView('userManagement')}
    className="w-full p-4 bg-gray-100 rounded-2xl flex items-center gap-4 hover:bg-gray-200 transition"
  >
    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-2xl">
      🔒
    </div>
    <div className="text-left">
      <p className="font-bold text-gray-800">User Management</p>
      <p className="text-sm text-gray-500">Lock, suspend, and manage accounts</p>
    </div>
  </button>
)}
*/


// ============================================
// 🔐 STEP 4: USE ENHANCED AUTH COMPONENTS (Optional)
// ============================================

// To use the new signup with age verification, replace the AuthScreen
// or add a toggle in AuthScreen to use the new components:

// Option A: Replace completely
// In AppWithAuth, change:
// return <AuthScreen ... />
// to:
// return <LoginWithStatus onSwitch={() => setShowSignup(true)} onSuccess={onSuccess} />

// Option B: Add as alternative in existing AuthScreen
// Add a state: const [useEnhancedSignup, setUseEnhancedSignup] = useState(false);
// Then show SignupWithAge when useEnhancedSignup is true


// ============================================
// 🗄️ STEP 5: DEPLOY FIRESTORE RULES
// ============================================

// Run this command to deploy the updated firestore.rules:
// firebase deploy --only firestore:rules


// ============================================
// 🧪 STEP 6: TEST THE FEATURES
// ============================================

/*
TESTING GUARDIAN PORTAL:
1. Create a parent account (select "Parent/Guardian" during signup)
2. Create a child account (select "Child/Teen", enter birthday showing age 13-17)
3. Parent: Go to Parent Dashboard > Link Child > Enter child's email
4. Child: Go to Guardian Settings > See pending request > Enter verification code > Approve
5. Parent: View child's mood trends, app usage, achievements

TESTING ACCOUNT MANAGEMENT:
1. Login as an admin (user.isOrgAdmin = true in Firestore)
2. Go to Settings > User Management
3. Search for a user by email
4. Try Lock, Suspend (with date), or Ban
5. Try to login as that user - should see blocked message
6. Admin: Unlock the account
7. User can login again
*/


// ============================================
// 📁 FILES CREATED
// ============================================

/*
NEW SERVICES:
- src/services/guardianService.js       (Guardian portal logic)
- src/services/accountManagementService.js (Account lock/suspend logic)

NEW COMPONENTS:
- src/auth/SignupWithAge.jsx            (Enhanced signup with age verification)
- src/auth/LoginWithStatus.jsx          (Login with account status checking)
- src/components/ParentDashboard.jsx    (Parent's view of child wellness)
- src/components/GuardianLinkManager.jsx (Child's control of guardian links)
- src/enterprise/AdminUserManagement.jsx (Admin account management)

UPDATED FILES:
- src/services/index.js                 (Added exports)
- src/services/translations.js          (Added translations)
- firestore.rules                       (Added security rules)
*/


// ============================================
// 🗃️ FIREBASE COLLECTIONS CREATED
// ============================================

/*
guardianLinks/{linkId}
  - parentId: string
  - childId: string
  - childEmail: string
  - childName: string
  - status: 'pending' | 'active' | 'revoked' | 'expired'
  - verificationCode: string
  - permissions: string[]
  - createdAt: ISO string
  - approvedAt: ISO string (optional)
  - expiresAt: ISO string

parentNotifications/{notifId}
  - parentId: string
  - type: 'guardian_request' | 'link_approved' | 'link_denied' | 'crisis_alert' | ...
  - title: string
  - message: string
  - read: boolean
  - createdAt: ISO string

parentAccessLog/{logId}
  - parentId: string
  - childId: string
  - linkId: string
  - dataViewed: string[]
  - timestamp: ISO string

users/{uid} (new fields)
  - accountStatus: 'active' | 'locked' | 'suspended' | 'banned'
  - statusReason: string
  - statusDetails: string
  - statusChangedAt: ISO string
  - statusChangedBy: string (adminId)
  - suspendedUntil: ISO string
  - birthday: string (YYYY-MM-DD)
  - accountType: 'child' | 'parent' | 'adult'

accountActionLog/{logId}
  - action: 'lock' | 'suspend' | 'ban' | 'unlock'
  - userId: string
  - adminId: string
  - reason: string
  - details: string
  - previousStatus: string
  - newStatus: string
  - timestamp: ISO string

accountAppeals/{appealId}
  - userId: string
  - email: string
  - message: string
  - status: 'pending' | 'approved' | 'denied'
  - submittedAt: ISO string
  - processedAt: ISO string (optional)
  - processedBy: string (optional)

accountUnlockRequests/{requestId}
  - userId: string
  - email: string
  - reason: string
  - status: 'pending' | 'approved' | 'denied'
  - submittedAt: ISO string
*/

export default {};
