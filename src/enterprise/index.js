// FILE: src/enterprise/index.js
// 🏢 Enterprise Module exports - INDUSTRIAL GRADE

// Context & Hooks
export { EnterpriseProvider, useEnterprise } from './EnterpriseContext';

// UI Components
export { OrganizationBanner, PoweredByBadge, BrandedButton } from './Branding';
export { default as OrganizationSignup } from './OrganizationSignup';
export { default as AccessCodeEntry } from './AccessCodeEntry';
export { default as AdminDashboard } from './AdminDashboard';
export { default as TherapistDashboard } from './TherapistDashboard';
export { default as SessionNotes } from './SessionNotes';
export { default as BillingManager } from './BillingManager';
export { default as InviteUsers } from './InviteUsers';

// 🆕 INDUSTRIAL-GRADE ADDITIONS
export { default as ROIDashboard } from './ROIDashboard';
export { QRCodeGenerator, QRJoinView, QRPoster } from './QROnboarding';
export { default as ConsentManager } from './ConsentManager';
export { default as TreatmentPlans } from './TreatmentPlans';

// NOTE: Services are in src/services/ folder, import them directly:
// import { getOrgDashboardData } from '../services/analyticsService';
// import { getOrgTherapists } from '../services/therapistService';
// import { generateWeeklyReport } from '../services/reportService';
// import { createSurvey, getSurveyResponses } from '../services/surveyService';
// import { checkForSuspiciousContent } from '../services/securityService';
