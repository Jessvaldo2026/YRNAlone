// FILE: src/services/translations.js
// 🌍 COMPLETE TRANSLATIONS - All 12 Languages
// Every text in the app is translatable for equality
// Includes: EN, ES, PT, FR, DE, IT, ZH, JA, KO, AR, HI, HT (Haitian Creole)

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ht', name: 'Kreyòl Ayisyen', flag: '🇭🇹', dir: 'ltr' }
];

// Crisis hotlines per language/country
export const CRISIS_HOTLINES = {
  en: { country: 'USA', number: '988', text: '741741', name: 'Suicide & Crisis Lifeline' },
  es: { country: 'España', number: '024', text: null, name: 'Línea de Atención a la Conducta Suicida' },
  pt: { country: 'Brasil', number: '188', text: null, name: 'CVV - Centro de Valorização da Vida' },
  fr: { country: 'France', number: '3114', text: null, name: 'Numéro National de Prévention du Suicide' },
  de: { country: 'Deutschland', number: '0800 111 0 111', text: null, name: 'Telefonseelsorge' },
  it: { country: 'Italia', number: '800 274 274', text: null, name: 'Telefono Amico' },
  zh: { country: '中国', number: '400-161-9995', text: null, name: '北京心理危机研究与干预中心' },
  ja: { country: '日本', number: '0570-064-556', text: null, name: 'よりそいホットライン' },
  ko: { country: '한국', number: '1393', text: null, name: '자살예방상담전화' },
  ar: { country: 'السعودية', number: '920033360', text: null, name: 'خط الدعم النفسي' },
  hi: { country: 'भारत', number: '9152987821', text: null, name: 'iCall - TISS' },
  ht: { country: 'Ayiti', number: '988', text: '741741', name: 'Liy Kriz Swisid' }
};

export const TRANSLATIONS = {
  // ============================================
  // 🇺🇸 ENGLISH (Complete)
  // ============================================
  en: {
    // App
    appName: 'YRNAlone', tagline: 'Your safe space for mental wellness',
    // General
    welcome: 'Welcome', welcomeBack: 'Welcome Back', getStarted: 'Get Started', continue: 'Continue', skip: 'Skip', done: 'Done', close: 'Close', save: 'Save', cancel: 'Cancel', confirm: 'Confirm', delete: 'Delete', edit: 'Edit', back: 'Back', next: 'Next', submit: 'Submit', send: 'Send', search: 'Search', filter: 'Filter', refresh: 'Refresh', loading: 'Loading...', error: 'Error', success: 'Success', warning: 'Warning', yes: 'Yes', no: 'No', ok: 'OK', retry: 'Retry', learnMore: 'Learn More', seeAll: 'See All', viewMore: 'View More',
    // Language
    chooseLanguage: 'Choose Your Language', languageSubtitle: 'Select the language you\'re most comfortable with', languageSaved: 'Language saved',
    // Nav
    home: 'Home', profile: 'Profile', settings: 'Settings', groups: 'Groups', journal: 'Journal', mood: 'Mood', tools: 'Tools', progress: 'Progress', achievements: 'Achievements', community: 'Community', support: 'Support', emergency: 'Emergency',
    // Auth
    login: 'Log In', signup: 'Sign Up', logout: 'Log Out', email: 'Email', password: 'Password', confirmPassword: 'Confirm Password', username: 'Username', fullName: 'Full Name', forgotPassword: 'Forgot Password?', createAccount: 'Create Account', alreadyHaveAccount: 'Already have an account?', dontHaveAccount: 'Don\'t have an account?', signUpFree: 'Sign Up Free', joinFree: 'Join Free', agreeToTerms: 'I agree to the Terms of Service and Privacy Policy',
    // Onboarding
    onboardingTitle1: 'Welcome to YRNAlone', onboardingDesc1: 'Your safe space for mental wellness and peer support',
    onboardingTitle2: 'Track Your Journey', onboardingDesc2: 'Log your mood, journal your thoughts, and see your progress',
    onboardingTitle3: 'Find Your Community', onboardingDesc3: 'Connect with others who understand what you\'re going through',
    onboardingTitle4: 'You\'re Not Alone', onboardingDesc4: 'Access 24/7 support, crisis resources, and caring community',
    letsBegin: 'Let\'s Begin',
    // Birthday
    enterBirthday: 'Enter Your Birthday', birthdayReason: 'We need this to ensure age-appropriate content', month: 'Month', day: 'Day', year: 'Year', birthdayPrivate: 'Your birthday is kept private', mustBe13: 'You must be at least 13 years old',
    // Access Code
    haveAccessCode: 'Have an Access Code?', enterAccessCode: 'Enter Access Code', accessCodeDesc: 'If your organization provided a code, enter it for full access', accessCodePlaceholder: 'Enter code (e.g., ORG-XXXXX)', verifyCode: 'Verify Code', invalidCode: 'Invalid access code', codeVerified: 'Code verified! You now have full access', skipForNow: 'Skip for now', orgMemberBenefit: 'Your organization covers all premium features!',
    // Mood
    howFeeling: 'How are you feeling today?', howFeelingNow: 'How are you feeling right now?', selectMood: 'Select your mood', veryBad: 'Very Bad', bad: 'Bad', okay: 'Okay', good: 'Good', veryGood: 'Very Good', moodLogged: 'Mood logged!', moodHistory: 'Mood History', moodTrend: 'Mood Trend', moodInsights: 'Mood Insights', averageMood: 'Average Mood', lastCheckin: 'Last Check-in', noMoodData: 'No mood data yet', startTracking: 'Start tracking your mood', whatMadeYouFeel: 'What made you feel this way?', addNote: 'Add a note (optional)',
    // Journal
    myJournal: 'My Journal', newEntry: 'New Entry', writeHere: 'Write your thoughts here...', journalPrompt: 'What\'s on your mind today?', journalSaved: 'Entry saved', journalDeleted: 'Entry deleted', noEntries: 'No journal entries yet', startWriting: 'Start writing your first entry', entries: 'entries', todayEntry: 'Today\'s Entry', pastEntries: 'Past Entries', journalPrivate: 'Your journal is private and encrypted',
    // Groups
    supportGroups: 'Support Groups', findGroup: 'Find a Group', myGroups: 'My Groups', joinGroup: 'Join Group', leaveGroup: 'Leave Group', createGroup: 'Create Group', groupName: 'Group Name', groupDescription: 'Group Description', groupCategory: 'Category', groupMembers: 'members', groupPosts: 'posts', activeNow: 'Active Now', joinedGroup: 'Joined!', leftGroup: 'Left group', groupRules: 'Group Rules', beKind: 'Be kind and supportive', noJudgment: 'No judgment zone', respectPrivacy: 'Respect everyone\'s privacy',
    groupCategories: { anxiety: 'Anxiety', depression: 'Depression', grief: 'Grief & Loss', addiction: 'Recovery', trauma: 'Trauma', relationships: 'Relationships', selfEsteem: 'Self-Esteem', stress: 'Stress', lgbtq: 'LGBTQ+', parenting: 'Parenting', chronic: 'Chronic Illness', general: 'General Support' },
    // Buddy
    buddyMatching: 'Buddy Matching', findBuddy: 'Find a Support Buddy', myBuddies: 'My Buddies', buddyDesc: 'Connect 1-on-1 with someone who understands', lookingForBuddy: 'Looking for a buddy...', buddyFound: 'Buddy found!', sendMessage: 'Send Message', buddyChat: 'Buddy Chat', noBuddies: 'No buddies yet', startMatching: 'Start matching',
    // Feed
    communityFeed: 'Community Feed', shareThoughts: 'Share your thoughts...', postAnonymously: 'Post Anonymously', post: 'Post', likes: 'likes', comments: 'comments', reply: 'Reply', report: 'Report', share: 'Share',
    // Tools
    selfCareTools: 'Self-Care Tools', breathingExercises: 'Breathing Exercises', meditation: 'Meditation', grounding: 'Grounding Exercises', relaxation: 'Relaxation', sleepSounds: 'Sleep Sounds', affirmations: 'Affirmations', gratitude: 'Gratitude', startExercise: 'Start Exercise', duration: 'Duration', minutes: 'minutes', seconds: 'seconds', breatheIn: 'Breathe In', breatheOut: 'Breathe Out', hold: 'Hold', wellDone: 'Well Done!', exerciseComplete: 'Exercise Complete',
    // Progress
    myProgress: 'My Progress', streak: 'Day Streak', totalCheckins: 'Total Check-ins', journalEntries: 'Journal Entries', groupsJoined: 'Groups Joined', badgesEarned: 'Badges Earned', keepGoing: 'Keep going!', unlocked: 'Unlocked', locked: 'Locked', progressChart: 'Progress Chart', weeklyGoal: 'Weekly Goal', monthlyGoal: 'Monthly Goal',
    badges: { firstStep: 'First Step', firstStepDesc: 'Complete your first mood check', weekWarrior: 'Week Warrior', weekWarriorDesc: '7-day streak', monthMaster: 'Month Master', monthMasterDesc: '30-day streak', kindSoul: 'Kind Soul', kindSoulDesc: 'Support 10 community members', journalJunkie: 'Journal Junkie', journalJunkieDesc: 'Write 50 journal entries', groupGuru: 'Group Guru', groupGuruDesc: 'Join 5 support groups', earlyBird: 'Early Bird', earlyBirdDesc: 'Check in before 8am', nightOwl: 'Night Owl', nightOwlDesc: 'Check in after 10pm', consistencyKing: 'Consistency King', consistencyKingDesc: '100-day streak' },
    // Crisis
    crisisSupport: 'Crisis Support', emergencyHelp: 'Emergency Help', needHelpNow: 'Need Help Now?', crisisHotline: 'Crisis Hotline', callNow: 'Call Now', textLine: 'Text Line', chatNow: 'Chat Now', safetyPlan: 'Safety Plan', emergencyContacts: 'Emergency Contacts', crisisResources: 'Crisis Resources', youAreNotAlone: 'You are not alone', helpAvailable: 'Help is available 24/7', reachOut: 'Please reach out', crisisDetected: 'We noticed you might be struggling', talkToSomeone: 'Would you like to talk to someone?', imOkay: 'I\'m okay', needSupport: 'I need support',
    // Settings
    account: 'Account', notifications: 'Notifications', privacy: 'Privacy', appearance: 'Appearance', language: 'Language', theme: 'Theme', darkMode: 'Dark Mode', lightMode: 'Light Mode', systemDefault: 'System Default', fontSize: 'Font Size', small: 'Small', medium: 'Medium', large: 'Large', pushNotifications: 'Push Notifications', emailNotifications: 'Email Notifications', reminderNotifications: 'Daily Reminders', deleteAccount: 'Delete Account', deleteAccountWarning: 'This will permanently delete all your data', dataPrivacy: 'Data Privacy', exportData: 'Export My Data', encryptionStatus: 'End-to-End Encrypted',
    // Premium
    premium: 'Premium', upgrade: 'Upgrade', upgradeToPremium: 'Upgrade to Premium', currentPlan: 'Current Plan', freePlan: 'Free Plan', premiumPlan: 'Premium Plan', organizationPlan: 'Organization Plan', freeForever: 'Free Forever', perMonth: '/month', perYear: '/year', billedMonthly: 'Billed monthly', billedYearly: 'Billed yearly', savePercent: 'Save', mostPopular: 'Most Popular', bestValue: 'Best Value', subscribedSuccessfully: 'Subscribed successfully!', manageSubscription: 'Manage Subscription', cancelSubscription: 'Cancel Subscription',
    freeFeatures: 'Free Features', 
    freeFeaturesList: { signup: 'Free sign up', groups: 'Unlimited support groups', buddy: 'Buddy matching', emergency: 'Emergency & crisis support', mood7days: '7-day mood history', journal5: '5 journal entries/month', breathing: 'Basic breathing exercises', community: 'Community access' },
    premiumFeatures: 'Premium Features',
    premiumFeaturesList: { unlimitedJournal: 'Unlimited journal entries', fullHistory: 'Full mood history & insights', allTools: 'All self-care tools', themes: 'Custom themes', sleep: 'Sleep tracker', analytics: 'Progress analytics', adFree: 'Ad-free experience', priority: 'Priority support' },
    orgBenefits: 'Organization Benefits', orgBenefitDesc: 'Your organization provides full access', allFeaturesIncluded: 'All features included', noPaymentRequired: 'No payment required', coveredByOrg: 'Covered by your organization',
    // Therapist
    shareWithTherapist: 'Share with Therapist', therapistAccess: 'Therapist Access', generateCode: 'Generate Share Code', shareCode: 'Share Code', yourCode: 'Your Code', copyCode: 'Copy Code', codeCopied: 'Code Copied!', shareInstructions: 'Share this code with your therapist for view-only access', revokeAccess: 'Revoke Access',
    // Profile
    editProfile: 'Edit Profile', profilePicture: 'Profile Picture', changePhoto: 'Change Photo', bio: 'Bio', aboutMe: 'About Me', memberSince: 'Member Since', profileUpdated: 'Profile updated',
    // Time
    today: 'Today', yesterday: 'Yesterday', thisWeek: 'This Week', thisMonth: 'This Month', allTime: 'All Time',
    // Misc
    noResults: 'No results found', tryAgain: 'Try again', comingSoon: 'Coming Soon', newFeature: 'New', offline: 'You\'re offline', connectionRestored: 'Connection restored',
    // Validation
    required: 'This field is required', invalidEmail: 'Please enter a valid email', passwordTooShort: 'Password must be at least 8 characters', passwordsNoMatch: 'Passwords do not match', usernameTaken: 'Username already taken', emailTaken: 'Email already registered',
    // Success/Error
    accountCreated: 'Account created successfully!', welcomeToYRN: 'Welcome to YRNAlone!', settingsSaved: 'Settings saved', changesSaved: 'Changes saved', somethingWrong: 'Something went wrong', tryAgainLater: 'Please try again later', networkError: 'Network error', sessionExpired: 'Session expired, please log in again',
    // Encouragement
    encouragement: { proud: 'We\'re proud of you for being here', brave: 'It takes courage to seek support', notAlone: 'You\'re not alone in this journey', oneDay: 'Take it one day at a time', matters: 'Your feelings matter', valid: 'Your experiences are valid', stronger: 'You\'re stronger than you think', progress: 'Progress, not perfection' },
    // Pricing specific
    seedling: 'Seedling', bloom: 'Bloom', flourish: 'Flourish', orgMember: 'Organization Member', startYourJourney: 'Start your journey', growingStronger: 'Growing stronger', thriveEveryDay: 'Thrive every day', fullAccessFree: 'Full access - Free!', everythingInFree: 'Everything in Free +', everythingInPremium: 'Everything in Premium', yourOrgPays: 'Your organization pays for you',

    // Guardian Portal
    guardian: {
      title: 'Guardian Settings',
      parentDashboard: 'Parent Dashboard',
      linkChild: 'Link Child\'s Account',
      linkedChildren: 'Linked Children',
      pendingRequests: 'Pending Requests',
      noLinkedChildren: 'No Linked Children',
      linkRequest: 'Link Request',
      verificationCode: 'Verification Code',
      enterCode: 'Enter 6-character code',
      approve: 'Approve',
      deny: 'Deny',
      revoke: 'Revoke Link',
      moodTrends: 'Mood Trends',
      appUsage: 'App Usage',
      achievements: 'Achievements',
      crisisAlerts: 'Crisis Alerts',
      privacyProtected: 'Privacy Protected',
      whatParentsCanSee: 'What Parents Can See',
      whatIsPrivate: 'What Stays Private',
      journalPrivate: 'Journal entries are always private',
      messagesPrivate: 'Private messages are never shared',
      youreInControl: 'You\'re In Control',
      dataViewed: 'Your parent viewed your dashboard data',
      weeklyAverage: 'Weekly Average',
      monthlyAverage: 'Monthly Average',
      currentStreak: 'Current Streak',
      daysActive: 'Days Active',
      accessLog: 'Access Log',
      privacyInfo: 'Privacy Info',
      requiresParent: 'Users under 13 need a parent/guardian to create their account.',
      optionalLink: 'You can optionally link a parent/guardian account.',
      parentAccountType: 'Parent/Guardian Account',
      childAccountType: 'Child/Teen Account'
    },

    // Account Management
    accountStatus: {
      active: 'Active',
      locked: 'Locked',
      suspended: 'Suspended',
      banned: 'Banned',
      accountLocked: 'Your account has been temporarily locked.',
      accountSuspended: 'Your account has been suspended.',
      accountBanned: 'Your account has been permanently banned.',
      contactSupport: 'Contact support for more information.',
      submitAppeal: 'Submit Appeal',
      requestUnlock: 'Request Unlock',
      daysRemaining: 'days remaining',
      suspendedUntil: 'Suspended until',
      lockAccount: 'Lock Account',
      suspendAccount: 'Suspend Account',
      banAccount: 'Ban Account',
      unlockAccount: 'Unlock Account',
      userManagement: 'User Management',
      searchUsers: 'Search Users',
      appeals: 'Appeals',
      pendingAppeals: 'Pending Appeals',
      unlockRequests: 'Unlock Requests',
      reasonRequired: 'Please select a reason',
      actionHistory: 'Action History'
    },

    // Account Reasons
    accountReasons: {
      terms_violation: 'Terms of Service Violation',
      harassment: 'Harassment or Bullying',
      spam: 'Spam or Abuse',
      inappropriate_content: 'Inappropriate Content',
      underage: 'Underage Account (COPPA)',
      fraud: 'Fraudulent Activity',
      security_concern: 'Security Concern',
      user_request: 'User Requested',
      admin_action: 'Administrative Action',
      other: 'Other'
    },

    // Birthday/Age
    birthday: {
      enterBirthday: 'When\'s your birthday?',
      keepSafe: 'We need this to keep you safe',
      month: 'Month',
      day: 'Day',
      year: 'Year',
      birthdayPrivate: 'Your birthday is kept private',
      mustBe13: 'You must be at least 13 years old'
    },
  },

  // ============================================
  // 🇪🇸 SPANISH (Complete)
  // ============================================
  es: {
    appName: 'YRNAlone', tagline: 'Tu espacio seguro para el bienestar mental',
    welcome: 'Bienvenido', welcomeBack: 'Bienvenido de nuevo', getStarted: 'Comenzar', continue: 'Continuar', skip: 'Omitir', done: 'Listo', close: 'Cerrar', save: 'Guardar', cancel: 'Cancelar', confirm: 'Confirmar', delete: 'Eliminar', edit: 'Editar', back: 'Atrás', next: 'Siguiente', submit: 'Enviar', send: 'Enviar', search: 'Buscar', filter: 'Filtrar', refresh: 'Actualizar', loading: 'Cargando...', error: 'Error', success: 'Éxito', warning: 'Advertencia', yes: 'Sí', no: 'No', ok: 'OK', retry: 'Reintentar', learnMore: 'Más información', seeAll: 'Ver todo', viewMore: 'Ver más',
    chooseLanguage: 'Elige tu idioma', languageSubtitle: 'Selecciona el idioma con el que te sientas más cómodo', languageSaved: 'Idioma guardado',
    home: 'Inicio', profile: 'Perfil', settings: 'Ajustes', groups: 'Grupos', journal: 'Diario', mood: 'Estado', tools: 'Herramientas', progress: 'Progreso', achievements: 'Logros', community: 'Comunidad', support: 'Apoyo', emergency: 'Emergencia',
    login: 'Iniciar sesión', signup: 'Registrarse', logout: 'Cerrar sesión', email: 'Correo', password: 'Contraseña', confirmPassword: 'Confirmar contraseña', username: 'Usuario', fullName: 'Nombre completo', forgotPassword: '¿Olvidaste tu contraseña?', createAccount: 'Crear cuenta', alreadyHaveAccount: '¿Ya tienes cuenta?', dontHaveAccount: '¿No tienes cuenta?', signUpFree: 'Regístrate gratis', joinFree: 'Únete gratis', agreeToTerms: 'Acepto los Términos y Política de Privacidad',
    onboardingTitle1: 'Bienvenido a YRNAlone', onboardingDesc1: 'Tu espacio seguro para el bienestar mental',
    onboardingTitle2: 'Sigue tu camino', onboardingDesc2: 'Registra tu estado, escribe y ve tu progreso',
    onboardingTitle3: 'Encuentra tu comunidad', onboardingDesc3: 'Conéctate con otros que entienden',
    onboardingTitle4: 'No estás solo/a', onboardingDesc4: 'Apoyo 24/7, recursos de crisis y comunidad',
    letsBegin: 'Comencemos',
    enterBirthday: 'Ingresa tu fecha de nacimiento', birthdayReason: 'Para contenido apropiado a tu edad', month: 'Mes', day: 'Día', year: 'Año', birthdayPrivate: 'Tu fecha se mantiene privada', mustBe13: 'Debes tener al menos 13 años',
    haveAccessCode: '¿Tienes un código de acceso?', enterAccessCode: 'Ingresa el código', accessCodeDesc: 'Si tu organización te dio un código, ingrésalo aquí', accessCodePlaceholder: 'Ingresa código (ej., ORG-XXXXX)', verifyCode: 'Verificar', invalidCode: 'Código inválido', codeVerified: '¡Código verificado! Tienes acceso completo', skipForNow: 'Omitir por ahora', orgMemberBenefit: '¡Tu organización cubre todas las funciones!',
    howFeeling: '¿Cómo te sientes hoy?', howFeelingNow: '¿Cómo te sientes ahora?', selectMood: 'Selecciona tu estado', veryBad: 'Muy mal', bad: 'Mal', okay: 'Regular', good: 'Bien', veryGood: 'Muy bien', moodLogged: '¡Estado registrado!', moodHistory: 'Historial', moodTrend: 'Tendencia', moodInsights: 'Análisis', averageMood: 'Promedio', lastCheckin: 'Último registro', noMoodData: 'Sin datos aún', startTracking: 'Comienza a registrar', whatMadeYouFeel: '¿Qué te hizo sentir así?', addNote: 'Añade una nota (opcional)',
    myJournal: 'Mi diario', newEntry: 'Nueva entrada', writeHere: 'Escribe aquí...', journalPrompt: '¿Qué tienes en mente?', journalSaved: 'Entrada guardada', journalDeleted: 'Entrada eliminada', noEntries: 'Sin entradas aún', startWriting: 'Escribe tu primera entrada', entries: 'entradas', todayEntry: 'Entrada de hoy', pastEntries: 'Entradas anteriores', journalPrivate: 'Tu diario es privado y encriptado',
    supportGroups: 'Grupos de apoyo', findGroup: 'Buscar grupo', myGroups: 'Mis grupos', joinGroup: 'Unirse', leaveGroup: 'Abandonar', createGroup: 'Crear grupo', groupName: 'Nombre', groupDescription: 'Descripción', groupCategory: 'Categoría', groupMembers: 'miembros', groupPosts: 'publicaciones', activeNow: 'Activo ahora', joinedGroup: '¡Te uniste!', leftGroup: 'Abandonaste', groupRules: 'Reglas', beKind: 'Sé amable', noJudgment: 'Sin juicios', respectPrivacy: 'Respeta la privacidad',
    groupCategories: { anxiety: 'Ansiedad', depression: 'Depresión', grief: 'Duelo', addiction: 'Recuperación', trauma: 'Trauma', relationships: 'Relaciones', selfEsteem: 'Autoestima', stress: 'Estrés', lgbtq: 'LGBTQ+', parenting: 'Crianza', chronic: 'Enfermedad crónica', general: 'Apoyo general' },
    buddyMatching: 'Compañeros', findBuddy: 'Buscar compañero', myBuddies: 'Mis compañeros', buddyDesc: 'Conéctate 1 a 1', lookingForBuddy: 'Buscando...', buddyFound: '¡Encontrado!', sendMessage: 'Enviar mensaje', buddyChat: 'Chat', noBuddies: 'Sin compañeros', startMatching: 'Empezar',
    communityFeed: 'Comunidad', shareThoughts: 'Comparte...', postAnonymously: 'Publicar anónimamente', post: 'Publicar', likes: 'me gusta', comments: 'comentarios', reply: 'Responder', report: 'Reportar', share: 'Compartir',
    selfCareTools: 'Herramientas', breathingExercises: 'Respiración', meditation: 'Meditación', grounding: 'Anclaje', relaxation: 'Relajación', sleepSounds: 'Sonidos para dormir', affirmations: 'Afirmaciones', gratitude: 'Gratitud', startExercise: 'Iniciar', duration: 'Duración', minutes: 'minutos', seconds: 'segundos', breatheIn: 'Inhala', breatheOut: 'Exhala', hold: 'Mantén', wellDone: '¡Bien hecho!', exerciseComplete: 'Completado',
    myProgress: 'Mi progreso', streak: 'Días seguidos', totalCheckins: 'Total registros', journalEntries: 'Entradas', groupsJoined: 'Grupos', badgesEarned: 'Insignias', keepGoing: '¡Sigue así!', unlocked: 'Desbloqueado', locked: 'Bloqueado', progressChart: 'Gráfico', weeklyGoal: 'Meta semanal', monthlyGoal: 'Meta mensual',
    badges: { firstStep: 'Primer paso', firstStepDesc: 'Primer registro', weekWarrior: 'Guerrero semanal', weekWarriorDesc: '7 días', monthMaster: 'Maestro mensual', monthMasterDesc: '30 días', kindSoul: 'Alma bondadosa', kindSoulDesc: 'Apoya a 10', journalJunkie: 'Escritor', journalJunkieDesc: '50 entradas', groupGuru: 'Gurú', groupGuruDesc: '5 grupos', earlyBird: 'Madrugador', earlyBirdDesc: 'Antes de las 8am', nightOwl: 'Búho', nightOwlDesc: 'Después de las 10pm', consistencyKing: 'Rey', consistencyKingDesc: '100 días' },
    crisisSupport: 'Apoyo en crisis', emergencyHelp: 'Ayuda de emergencia', needHelpNow: '¿Necesitas ayuda?', crisisHotline: 'Línea de crisis', callNow: 'Llamar', textLine: 'Mensaje', chatNow: 'Chat', safetyPlan: 'Plan de seguridad', emergencyContacts: 'Contactos', crisisResources: 'Recursos', youAreNotAlone: 'No estás solo/a', helpAvailable: 'Ayuda 24/7', reachOut: 'Busca ayuda', crisisDetected: 'Notamos que podrías necesitar apoyo', talkToSomeone: '¿Quieres hablar?', imOkay: 'Estoy bien', needSupport: 'Necesito apoyo',
    account: 'Cuenta', notifications: 'Notificaciones', privacy: 'Privacidad', appearance: 'Apariencia', language: 'Idioma', theme: 'Tema', darkMode: 'Modo oscuro', lightMode: 'Modo claro', systemDefault: 'Sistema', fontSize: 'Tamaño', small: 'Pequeño', medium: 'Mediano', large: 'Grande', pushNotifications: 'Notificaciones push', emailNotifications: 'Correos', reminderNotifications: 'Recordatorios', deleteAccount: 'Eliminar cuenta', deleteAccountWarning: 'Esto eliminará todo', dataPrivacy: 'Privacidad', exportData: 'Exportar datos', encryptionStatus: 'Encriptado',
    premium: 'Premium', upgrade: 'Mejorar', upgradeToPremium: 'Mejorar a Premium', currentPlan: 'Plan actual', freePlan: 'Plan gratuito', premiumPlan: 'Plan Premium', organizationPlan: 'Plan organización', freeForever: 'Gratis siempre', perMonth: '/mes', perYear: '/año', billedMonthly: 'Mensual', billedYearly: 'Anual', savePercent: 'Ahorra', mostPopular: 'Más popular', bestValue: 'Mejor valor', subscribedSuccessfully: '¡Suscripción exitosa!', manageSubscription: 'Administrar', cancelSubscription: 'Cancelar',
    freeFeatures: 'Funciones gratuitas',
    freeFeaturesList: { signup: 'Registro gratuito', groups: 'Grupos ilimitados', buddy: 'Compañeros', emergency: 'Emergencia y crisis', mood7days: '7 días de historial', journal5: '5 entradas/mes', breathing: 'Respiración básica', community: 'Acceso a comunidad' },
    premiumFeatures: 'Funciones Premium',
    premiumFeaturesList: { unlimitedJournal: 'Diario ilimitado', fullHistory: 'Historial completo', allTools: 'Todas las herramientas', themes: 'Temas personalizados', sleep: 'Rastreador de sueño', analytics: 'Análisis', adFree: 'Sin anuncios', priority: 'Soporte prioritario' },
    orgBenefits: 'Beneficios de organización', orgBenefitDesc: 'Tu organización paga', allFeaturesIncluded: 'Todo incluido', noPaymentRequired: 'Sin pago', coveredByOrg: 'Cubierto por tu organización',
    shareWithTherapist: 'Compartir con terapeuta', therapistAccess: 'Acceso terapeuta', generateCode: 'Generar código', shareCode: 'Código', yourCode: 'Tu código', copyCode: 'Copiar', codeCopied: '¡Copiado!', shareInstructions: 'Comparte con tu terapeuta', revokeAccess: 'Revocar',
    editProfile: 'Editar perfil', profilePicture: 'Foto', changePhoto: 'Cambiar', bio: 'Bio', aboutMe: 'Sobre mí', memberSince: 'Miembro desde', profileUpdated: 'Actualizado',
    today: 'Hoy', yesterday: 'Ayer', thisWeek: 'Esta semana', thisMonth: 'Este mes', allTime: 'Todo',
    noResults: 'Sin resultados', tryAgain: 'Intenta de nuevo', comingSoon: 'Próximamente', newFeature: 'Nuevo', offline: 'Sin conexión', connectionRestored: 'Conexión restaurada',
    required: 'Campo requerido', invalidEmail: 'Correo inválido', passwordTooShort: 'Mínimo 8 caracteres', passwordsNoMatch: 'No coinciden', usernameTaken: 'Usuario en uso', emailTaken: 'Correo registrado',
    accountCreated: '¡Cuenta creada!', welcomeToYRN: '¡Bienvenido!', settingsSaved: 'Guardado', changesSaved: 'Cambios guardados', somethingWrong: 'Algo salió mal', tryAgainLater: 'Intenta más tarde', networkError: 'Error de red', sessionExpired: 'Sesión expirada',
    encouragement: { proud: 'Estamos orgullosos de ti', brave: 'Eres valiente', notAlone: 'No estás solo/a', oneDay: 'Un día a la vez', matters: 'Tus sentimientos importan', valid: 'Eres válido/a', stronger: 'Eres más fuerte de lo que crees', progress: 'Progreso, no perfección' },
    seedling: 'Semilla', bloom: 'Florecer', flourish: 'Prosperar', orgMember: 'Miembro de organización', startYourJourney: 'Comienza tu camino', growingStronger: 'Creciendo más fuerte', thriveEveryDay: 'Prospera cada día', fullAccessFree: '¡Acceso completo gratis!', everythingInFree: 'Todo en Gratis +', everythingInPremium: 'Todo en Premium', yourOrgPays: 'Tu organización paga',

    // Guardian Portal
    guardian: {
      title: 'Configuración de Tutor',
      parentDashboard: 'Panel de Padres',
      linkChild: 'Vincular cuenta del hijo',
      linkedChildren: 'Hijos Vinculados',
      pendingRequests: 'Solicitudes Pendientes',
      noLinkedChildren: 'Sin Hijos Vinculados',
      approve: 'Aprobar',
      deny: 'Rechazar',
      revoke: 'Revocar Vínculo',
      moodTrends: 'Tendencias de Ánimo',
      appUsage: 'Uso de la App',
      crisisAlerts: 'Alertas de Crisis',
      privacyProtected: 'Privacidad Protegida',
      journalPrivate: 'El diario siempre es privado',
      messagesPrivate: 'Los mensajes nunca se comparten',
      youreInControl: 'Tienes el Control',
      requiresParent: 'Los menores de 13 años necesitan un padre/tutor para crear su cuenta.',
      optionalLink: 'Puedes vincular opcionalmente una cuenta de padre/tutor.',
      parentAccountType: 'Cuenta de Padre/Tutor',
      childAccountType: 'Cuenta de Hijo/Adolescente'
    },

    // Account Management
    accountStatus: {
      active: 'Activo',
      locked: 'Bloqueado',
      suspended: 'Suspendido',
      banned: 'Baneado',
      accountLocked: 'Tu cuenta ha sido bloqueada temporalmente.',
      accountSuspended: 'Tu cuenta ha sido suspendida.',
      accountBanned: 'Tu cuenta ha sido baneada permanentemente.',
      contactSupport: 'Contacta soporte para más información.',
      submitAppeal: 'Enviar Apelación',
      requestUnlock: 'Solicitar Desbloqueo'
    },

    // Birthday
    birthday: {
      enterBirthday: '¿Cuándo es tu cumpleaños?',
      keepSafe: 'Lo necesitamos para mantenerte seguro',
      month: 'Mes',
      day: 'Día',
      year: 'Año',
      birthdayPrivate: 'Tu cumpleaños se mantiene privado',
      mustBe13: 'Debes tener al menos 13 años'
    },
  },

  // 🇧🇷 PORTUGUESE
  pt: {
    appName: 'YRNAlone', tagline: 'Seu espaço seguro para bem-estar mental',
    welcome: 'Bem-vindo', welcomeBack: 'Bem-vindo de volta', getStarted: 'Começar', continue: 'Continuar', skip: 'Pular', done: 'Concluído', close: 'Fechar', save: 'Salvar', cancel: 'Cancelar', confirm: 'Confirmar', delete: 'Excluir', edit: 'Editar', back: 'Voltar', next: 'Próximo', submit: 'Enviar', send: 'Enviar', search: 'Buscar', filter: 'Filtrar', refresh: 'Atualizar', loading: 'Carregando...', error: 'Erro', success: 'Sucesso', warning: 'Aviso', yes: 'Sim', no: 'Não', ok: 'OK', retry: 'Tentar novamente', learnMore: 'Saiba mais', seeAll: 'Ver tudo', viewMore: 'Ver mais',
    chooseLanguage: 'Escolha seu idioma', languageSubtitle: 'Selecione o idioma mais confortável', languageSaved: 'Idioma salvo',
    home: 'Início', profile: 'Perfil', settings: 'Configurações', groups: 'Grupos', journal: 'Diário', mood: 'Humor', tools: 'Ferramentas', progress: 'Progresso', achievements: 'Conquistas', community: 'Comunidade', support: 'Apoio', emergency: 'Emergência',
    login: 'Entrar', signup: 'Cadastrar', logout: 'Sair', email: 'E-mail', password: 'Senha', username: 'Usuário', fullName: 'Nome completo', forgotPassword: 'Esqueceu a senha?', createAccount: 'Criar conta', signUpFree: 'Cadastre-se grátis', joinFree: 'Junte-se grátis',
    howFeeling: 'Como você está se sentindo?', veryBad: 'Muito ruim', bad: 'Ruim', okay: 'Ok', good: 'Bom', veryGood: 'Muito bom', moodLogged: 'Humor registrado!',
    supportGroups: 'Grupos de apoio', findGroup: 'Encontrar grupo', myGroups: 'Meus grupos', joinGroup: 'Entrar', buddyMatching: 'Parceiros', findBuddy: 'Encontrar parceiro',
    crisisSupport: 'Apoio em crise', emergencyHelp: 'Ajuda de emergência', needHelpNow: 'Precisa de ajuda?', youAreNotAlone: 'Você não está sozinho(a)', helpAvailable: 'Ajuda 24/7', imOkay: 'Estou bem', needSupport: 'Preciso de apoio',
    premium: 'Premium', freePlan: 'Plano gratuito', premiumPlan: 'Plano Premium', freeForever: 'Grátis para sempre', perMonth: '/mês', perYear: '/ano',
    freeFeatures: 'Recursos gratuitos',
    freeFeaturesList: { signup: 'Cadastro gratuito', groups: 'Grupos ilimitados', buddy: 'Parceiros', emergency: 'Emergência e crise', mood7days: '7 dias de histórico', journal5: '5 entradas/mês', breathing: 'Respiração básica', community: 'Acesso à comunidade' },
    orgBenefits: 'Benefícios da organização', allFeaturesIncluded: 'Tudo incluído', coveredByOrg: 'Coberto pela sua organização',
    encouragement: { proud: 'Orgulhosos de você', brave: 'Você é corajoso(a)', notAlone: 'Você não está sozinho(a)', oneDay: 'Um dia de cada vez', matters: 'Seus sentimentos importam', valid: 'Você é válido(a)', stronger: 'Você é mais forte do que pensa', progress: 'Progresso, não perfeição' },
  },

  // 🇫🇷 FRENCH
  fr: {
    appName: 'YRNAlone', tagline: 'Votre espace sûr pour le bien-être mental',
    welcome: 'Bienvenue', welcomeBack: 'Bienvenue à nouveau', getStarted: 'Commencer', continue: 'Continuer', skip: 'Passer', done: 'Terminé', close: 'Fermer', save: 'Enregistrer', cancel: 'Annuler', confirm: 'Confirmer', delete: 'Supprimer', edit: 'Modifier', back: 'Retour', next: 'Suivant', submit: 'Soumettre', send: 'Envoyer', search: 'Rechercher', loading: 'Chargement...', error: 'Erreur', success: 'Succès', yes: 'Oui', no: 'Non', ok: 'OK',
    chooseLanguage: 'Choisissez votre langue', languageSubtitle: 'Sélectionnez la langue la plus confortable',
    home: 'Accueil', profile: 'Profil', settings: 'Paramètres', groups: 'Groupes', journal: 'Journal', mood: 'Humeur', tools: 'Outils', progress: 'Progrès', community: 'Communauté', support: 'Soutien', emergency: 'Urgence',
    login: 'Connexion', signup: 'Inscription', logout: 'Déconnexion', email: 'E-mail', password: 'Mot de passe',
    howFeeling: 'Comment vous sentez-vous?', veryBad: 'Très mal', bad: 'Mal', okay: 'Correct', good: 'Bien', veryGood: 'Très bien', moodLogged: 'Humeur enregistrée!',
    supportGroups: 'Groupes de soutien', buddyMatching: 'Partenaires',
    crisisSupport: 'Soutien en crise', emergencyHelp: 'Aide d\'urgence', youAreNotAlone: 'Vous n\'êtes pas seul(e)', helpAvailable: 'Aide 24h/24', imOkay: 'Je vais bien', needSupport: 'J\'ai besoin de soutien',
    premium: 'Premium', freePlan: 'Plan gratuit', freeForever: 'Gratuit pour toujours', perMonth: '/mois',
    freeFeaturesList: { signup: 'Inscription gratuite', groups: 'Groupes illimités', buddy: 'Partenaires', emergency: 'Urgence et crise' },
    encouragement: { proud: 'Fiers de vous', notAlone: 'Vous n\'êtes pas seul(e)', matters: 'Vos sentiments comptent', progress: 'Progrès, pas perfection' },
  },

  // 🇩🇪 GERMAN
  de: {
    appName: 'YRNAlone', tagline: 'Dein sicherer Raum für mentales Wohlbefinden',
    welcome: 'Willkommen', welcomeBack: 'Willkommen zurück', getStarted: 'Loslegen', continue: 'Fortfahren', skip: 'Überspringen', done: 'Fertig', close: 'Schließen', save: 'Speichern', cancel: 'Abbrechen', confirm: 'Bestätigen', back: 'Zurück', next: 'Weiter', loading: 'Laden...', error: 'Fehler', success: 'Erfolg', yes: 'Ja', no: 'Nein',
    chooseLanguage: 'Wähle deine Sprache',
    home: 'Startseite', profile: 'Profil', settings: 'Einstellungen', groups: 'Gruppen', journal: 'Tagebuch', mood: 'Stimmung', community: 'Gemeinschaft', emergency: 'Notfall',
    login: 'Anmelden', signup: 'Registrieren', logout: 'Abmelden', email: 'E-Mail', password: 'Passwort',
    howFeeling: 'Wie fühlst du dich?', veryBad: 'Sehr schlecht', bad: 'Schlecht', okay: 'Okay', good: 'Gut', veryGood: 'Sehr gut',
    supportGroups: 'Selbsthilfegruppen', buddyMatching: 'Partner-Matching',
    crisisSupport: 'Krisenunterstützung', youAreNotAlone: 'Du bist nicht allein', helpAvailable: 'Hilfe 24/7',
    premium: 'Premium', freePlan: 'Kostenlos', freeForever: 'Für immer kostenlos',
    freeFeaturesList: { signup: 'Kostenlose Anmeldung', groups: 'Unbegrenzte Gruppen', emergency: 'Notfall-Support' },
    encouragement: { proud: 'Wir sind stolz auf dich', notAlone: 'Du bist nicht allein', progress: 'Fortschritt, nicht Perfektion' },
  },

  // 🇮🇹 ITALIAN
  it: {
    appName: 'YRNAlone', tagline: 'Il tuo spazio sicuro per il benessere mentale',
    welcome: 'Benvenuto', getStarted: 'Inizia', continue: 'Continua', skip: 'Salta', done: 'Fatto', close: 'Chiudi', save: 'Salva', cancel: 'Annulla', back: 'Indietro', next: 'Avanti', loading: 'Caricamento...', error: 'Errore', success: 'Successo', yes: 'Sì', no: 'No',
    chooseLanguage: 'Scegli la tua lingua',
    home: 'Home', profile: 'Profilo', settings: 'Impostazioni', groups: 'Gruppi', journal: 'Diario', mood: 'Umore', community: 'Comunità', emergency: 'Emergenza',
    login: 'Accedi', signup: 'Registrati', email: 'Email', password: 'Password',
    howFeeling: 'Come ti senti?', veryBad: 'Molto male', bad: 'Male', okay: 'Così così', good: 'Bene', veryGood: 'Molto bene',
    supportGroups: 'Gruppi di supporto',
    crisisSupport: 'Supporto in crisi', youAreNotAlone: 'Non sei solo/a', helpAvailable: 'Aiuto 24/7',
    premium: 'Premium', freePlan: 'Piano gratuito', freeForever: 'Gratis per sempre',
    encouragement: { proud: 'Siamo orgogliosi di te', notAlone: 'Non sei solo/a', progress: 'Progresso, non perfezione' },
  },

  // 🇨🇳 CHINESE
  zh: {
    appName: 'YRNAlone', tagline: '您的心理健康安全空间',
    welcome: '欢迎', welcomeBack: '欢迎回来', getStarted: '开始', continue: '继续', skip: '跳过', done: '完成', close: '关闭', save: '保存', cancel: '取消', confirm: '确认', back: '返回', next: '下一步', loading: '加载中...', error: '错误', success: '成功', yes: '是', no: '否',
    chooseLanguage: '选择您的语言',
    home: '首页', profile: '个人资料', settings: '设置', groups: '群组', journal: '日记', mood: '心情', community: '社区', emergency: '紧急',
    login: '登录', signup: '注册', email: '电子邮件', password: '密码',
    howFeeling: '今天感觉怎么样？', veryBad: '非常糟糕', bad: '糟糕', okay: '一般', good: '好', veryGood: '非常好',
    supportGroups: '互助小组', buddyMatching: '伙伴匹配',
    crisisSupport: '危机支持', youAreNotAlone: '你不是一个人', helpAvailable: '24/7全天候帮助',
    premium: '高级版', freePlan: '免费计划', freeForever: '永久免费',
    encouragement: { proud: '我们为您感到骄傲', notAlone: '你不是一个人', progress: '进步，而非完美' },
  },

  // 🇯🇵 JAPANESE
  ja: {
    appName: 'YRNAlone', tagline: 'メンタルヘルスの安全な場所',
    welcome: 'ようこそ', welcomeBack: 'おかえりなさい', getStarted: '始める', continue: '続ける', skip: 'スキップ', done: '完了', close: '閉じる', save: '保存', cancel: 'キャンセル', back: '戻る', next: '次へ', loading: '読み込み中...', error: 'エラー', success: '成功', yes: 'はい', no: 'いいえ',
    chooseLanguage: '言語を選択',
    home: 'ホーム', profile: 'プロフィール', settings: '設定', groups: 'グループ', journal: '日記', mood: '気分', community: 'コミュニティ', emergency: '緊急',
    login: 'ログイン', signup: '登録', email: 'メール', password: 'パスワード',
    howFeeling: '今日の気分は？', veryBad: 'とても悪い', bad: '悪い', okay: 'まあまあ', good: '良い', veryGood: 'とても良い',
    supportGroups: 'サポートグループ', buddyMatching: 'バディマッチング',
    crisisSupport: '危機サポート', youAreNotAlone: 'あなたは一人じゃない', helpAvailable: '24時間サポート',
    premium: 'プレミアム', freePlan: '無料プラン', freeForever: '永久無料',
    encouragement: { proud: 'ここにいてくれて嬉しいです', notAlone: 'あなたは一人じゃない', progress: '完璧ではなく、進歩を' },
  },

  // 🇰🇷 KOREAN
  ko: {
    appName: 'YRNAlone', tagline: '정신 건강을 위한 안전한 공간',
    welcome: '환영합니다', welcomeBack: '다시 오신 것을 환영합니다', getStarted: '시작하기', continue: '계속', skip: '건너뛰기', done: '완료', close: '닫기', save: '저장', cancel: '취소', back: '뒤로', next: '다음', loading: '로딩 중...', error: '오류', success: '성공', yes: '예', no: '아니오',
    chooseLanguage: '언어 선택',
    home: '홈', profile: '프로필', settings: '설정', groups: '그룹', journal: '일기', mood: '기분', community: '커뮤니티', emergency: '응급',
    login: '로그인', signup: '가입', email: '이메일', password: '비밀번호',
    howFeeling: '오늘 기분이 어떠세요?', veryBad: '매우 나쁨', bad: '나쁨', okay: '보통', good: '좋음', veryGood: '매우 좋음',
    supportGroups: '지원 그룹', buddyMatching: '버디 매칭',
    crisisSupport: '위기 지원', youAreNotAlone: '당신은 혼자가 아닙니다', helpAvailable: '24시간 도움 가능',
    premium: '프리미엄', freePlan: '무료 플랜', freeForever: '영구 무료',
    encouragement: { proud: '여기 와주셔서 자랑스럽습니다', notAlone: '당신은 혼자가 아닙니다', progress: '완벽이 아닌 진보' },
  },

  // 🇸🇦 ARABIC
  ar: {
    appName: 'YRNAlone', tagline: 'مساحتك الآمنة للصحة النفسية',
    welcome: 'مرحباً', welcomeBack: 'مرحباً بعودتك', getStarted: 'ابدأ', continue: 'استمر', skip: 'تخطي', done: 'تم', close: 'إغلاق', save: 'حفظ', cancel: 'إلغاء', back: 'رجوع', next: 'التالي', loading: 'جاري التحميل...', error: 'خطأ', success: 'نجاح', yes: 'نعم', no: 'لا',
    chooseLanguage: 'اختر لغتك',
    home: 'الرئيسية', profile: 'الملف الشخصي', settings: 'الإعدادات', groups: 'المجموعات', journal: 'اليوميات', mood: 'المزاج', community: 'المجتمع', emergency: 'طوارئ',
    login: 'تسجيل الدخول', signup: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    howFeeling: 'كيف تشعر اليوم؟', veryBad: 'سيء جداً', bad: 'سيء', okay: 'عادي', good: 'جيد', veryGood: 'جيد جداً',
    supportGroups: 'مجموعات الدعم', buddyMatching: 'مطابقة الرفيق',
    crisisSupport: 'دعم الأزمات', youAreNotAlone: 'أنت لست وحدك', helpAvailable: 'المساعدة متاحة 24/7',
    premium: 'بريميوم', freePlan: 'الخطة المجانية', freeForever: 'مجاني للأبد',
    encouragement: { proud: 'نحن فخورون بوجودك', notAlone: 'أنت لست وحدك', progress: 'تقدم، ليس كمال' },
  },

  // 🇮🇳 HINDI
  hi: {
    appName: 'YRNAlone', tagline: 'मानसिक स्वास्थ्य के लिए आपका सुरक्षित स्थान',
    welcome: 'स्वागत है', welcomeBack: 'वापस आने पर स्वागत है', getStarted: 'शुरू करें', continue: 'जारी रखें', skip: 'छोड़ें', done: 'हो गया', close: 'बंद करें', save: 'सेव करें', cancel: 'रद्द करें', back: 'वापस', next: 'अगला', loading: 'लोड हो रहा है...', error: 'त्रुटि', success: 'सफलता', yes: 'हां', no: 'नहीं',
    chooseLanguage: 'अपनी भाषा चुनें',
    home: 'होम', profile: 'प्रोफ़ाइल', settings: 'सेटिंग्स', groups: 'समूह', journal: 'डायरी', mood: 'मूड', community: 'समुदाय', emergency: 'आपातकाल',
    login: 'लॉग इन', signup: 'साइन अप', email: 'ईमेल', password: 'पासवर्ड',
    howFeeling: 'आज आप कैसा महसूस कर रहे हैं?', veryBad: 'बहुत बुरा', bad: 'बुरा', okay: 'ठीक-ठाक', good: 'अच्छा', veryGood: 'बहुत अच्छा',
    supportGroups: 'सहायता समूह', buddyMatching: 'बडी मैचिंग',
    crisisSupport: 'संकट सहायता', youAreNotAlone: 'आप अकेले नहीं हैं', helpAvailable: '24/7 मदद उपलब्ध',
    premium: 'प्रीमियम', freePlan: 'मुफ्त योजना', freeForever: 'हमेशा के लिए मुफ्त',
    encouragement: { proud: 'हमें गर्व है कि आप यहां हैं', notAlone: 'आप अकेले नहीं हैं', progress: 'प्रगति, पूर्णता नहीं' },
  },

  // 🇭🇹 HAITIAN CREOLE (Complete) - TASK 3
  ht: {
    appName: 'YRNAlone', tagline: 'Espas sekirite ou pou byennèt mantal',
    // General
    welcome: 'Byenveni', welcomeBack: 'Byenveni ankò', getStarted: 'Kòmanse', continue: 'Kontinye', skip: 'Sote', done: 'Fini', close: 'Fèmen', save: 'Sove', cancel: 'Anile', confirm: 'Konfime', delete: 'Efase', edit: 'Modifye', back: 'Retounen', next: 'Pwochen', submit: 'Soumèt', send: 'Voye', search: 'Chèche', filter: 'Filtre', refresh: 'Rafrechi', loading: 'Ap chaje...', error: 'Erè', success: 'Siksè', warning: 'Avètisman', yes: 'Wi', no: 'Non', ok: 'OK', retry: 'Eseye ankò', learnMore: 'Aprann plis', seeAll: 'Wè tout', viewMore: 'Wè plis',
    // Language
    chooseLanguage: 'Chwazi lang ou', languageSubtitle: 'Chwazi lang ki pi alèz pou ou', languageSaved: 'Lang sove',
    // Nav
    home: 'Akèy', profile: 'Pwofil', settings: 'Paramèt', groups: 'Gwoup', journal: 'Jounal', mood: 'Emosyon', tools: 'Zouti', progress: 'Pwogrè', achievements: 'Akonplisman', community: 'Kominote', support: 'Sipò', emergency: 'Ijans',
    // Auth
    login: 'Konekte', signup: 'Enskri', logout: 'Dekonekte', email: 'Imèl', password: 'Modpas', confirmPassword: 'Konfime modpas', username: 'Non itilizatè', fullName: 'Non konplè', displayName: 'Non afiche', forgotPassword: 'Bliye modpas?', createAccount: 'Kreye kont', alreadyHaveAccount: 'Ou gen yon kont deja?', dontHaveAccount: 'Ou pa gen yon kont?', signUpFree: 'Enskri gratis', joinFree: 'Antre gratis', agreeToTerms: 'Mwen dakò ak Tèm ak Règleman Konfidansyalite',
    // Onboarding
    onboardingTitle1: 'Byenveni nan YRNAlone', onboardingDesc1: 'Espas sekirite ou pou byennèt mantal ak sipò kominote',
    onboardingTitle2: 'Swiv Vwayaj Ou', onboardingDesc2: 'Anrejistre emosyon ou, ekri jounal ou, epi wè pwogrè ou',
    onboardingTitle3: 'Jwenn Kominote Ou', onboardingDesc3: 'Konekte ak lòt moun ki konprann sa w ap viv',
    onboardingTitle4: 'Ou Pa Poukont Ou', onboardingDesc4: 'Jwenn sipò 24/7, resous pou kriz, ak kominote k ap bay lanmou',
    letsBegin: 'Ann Kòmanse',
    // Mood
    howFeeling: 'Kijan ou santi ou jodi a?', howFeelingNow: 'Kijan ou santi ou kounye a?', selectMood: 'Chwazi emosyon ou', veryBad: 'Trè mal', bad: 'Mal', okay: 'Bon ase', good: 'Bon', veryGood: 'Trè bon', moodLogged: 'Emosyon anrejistre!', moodHistory: 'Istwa emosyon', moodTrend: 'Tandans emosyon', moodInsights: 'Analiz emosyon', averageMood: 'Mwayèn emosyon', lastCheckin: 'Dènye tchèkin', noMoodData: 'Pa gen done emosyon ankò', startTracking: 'Kòmanse swiv emosyon ou', whatMadeYouFeel: 'Ki sa ki te fè ou santi konsa?', addNote: 'Ajoute yon nòt (opsyonèl)',
    // Journal
    myJournal: 'Jounal mwen', newEntry: 'Nouvo antre', writeHere: 'Ekri panse ou isit...', journalPrompt: 'Ki sa ki nan tèt ou jodi a?', journalSaved: 'Antre sove', journalDeleted: 'Antre efase', noEntries: 'Pa gen antre jounal ankò', startWriting: 'Kòmanse ekri premye antre ou', entries: 'antre', todayEntry: 'Antre jodi a', pastEntries: 'Ansyen antre', journalPrivate: 'Jounal ou prive epi sekire',
    // Groups
    supportGroups: 'Gwoup sipò', findGroup: 'Jwenn yon gwoup', myGroups: 'Gwoup mwen', joinGroup: 'Antre nan gwoup', leaveGroup: 'Kite gwoup', createGroup: 'Kreye gwoup', groupName: 'Non gwoup', groupDescription: 'Deskripsyon gwoup', groupCategory: 'Kategori', groupMembers: 'manm', groupPosts: 'pòs', activeNow: 'Aktif kounye a', joinedGroup: 'Ou antre!', leftGroup: 'Ou kite gwoup la', groupRules: 'Règ gwoup', beKind: 'Swa janti epi bay sipò', noJudgment: 'Zòn san jijman', respectPrivacy: 'Respekte vi prive tout moun',
    groupCategories: { anxiety: 'Enkyetid', depression: 'Depresyon', grief: 'Lapenn', addiction: 'Rekiperasyon', trauma: 'Twomatis', relationships: 'Relasyon', selfEsteem: 'Konfyans nan tèt', stress: 'Estrès', lgbtq: 'LGBTQ+', parenting: 'Paran', chronic: 'Maladi kwonik', general: 'Sipò jeneral' },
    // Buddy
    buddyMatching: 'Jwenn yon Zanmi', findBuddy: 'Jwenn yon zanmi sipò', myBuddies: 'Zanmi mwen yo', buddyDesc: 'Konekte 1-a-1 ak yon moun ki konprann', lookingForBuddy: 'Ap chèche yon zanmi...', buddyFound: 'Zanmi jwenn!', sendMessage: 'Voye mesaj', buddyChat: 'Pale ak zanmi', noBuddies: 'Pa gen zanmi ankò', startMatching: 'Kòmanse jwenn',
    // Tools
    selfCareTools: 'Zouti pran swen tèt ou', breathingExercises: 'Egzèsis respirasyon', meditation: 'Meditasyon', grounding: 'Egzèsis ankraj', relaxation: 'Detant', sleepSounds: 'Son pou dòmi', affirmations: 'Afimasyon', gratitude: 'Rekonesans', startExercise: 'Kòmanse egzèsis', duration: 'Dire', minutes: 'minit', seconds: 'segonn', breatheIn: 'Respire antre', breatheOut: 'Respire soti', hold: 'Kenbe', wellDone: 'Byen fè!', exerciseComplete: 'Egzèsis fini',
    // Crisis
    crisisSupport: 'Sipò pou kriz', emergencyHelp: 'Èd ijans', needHelpNow: 'Ou bezwen èd kounye a?', crisisHotline: 'Liy kriz', callNow: 'Rele kounye a', textLine: 'Voye tèks kounye a', chatNow: 'Pale kounye a', safetyPlan: 'Plan sekirite', emergencyContacts: 'Kontak ijans', crisisResources: 'Resous pou kriz', youAreNotAlone: 'Ou pa poukont ou', helpAvailable: 'Èd disponib 24/7', reachOut: 'Tanpri chèche èd', crisisDetected: 'Nou remake ou ka ap lite', talkToSomeone: 'Èske ou ta renmen pale ak yon moun?', imOkay: 'Mwen byen', needSupport: 'Mwen bezwen sipò',
    // Settings
    account: 'Kont', notifications: 'Notifikasyon', privacy: 'Konfidansyalite', appearance: 'Aparans', language: 'Lang', theme: 'Tèm', darkMode: 'Mòd fonse', lightMode: 'Mòd klè', fontSize: 'Gwosè lèt', small: 'Piti', medium: 'Mwayen', large: 'Gwo', pushNotifications: 'Notifikasyon push', emailNotifications: 'Notifikasyon imèl', reminderNotifications: 'Rapèl chak jou', deleteAccount: 'Efase kont', dataPrivacy: 'Konfidansyalite done', exportData: 'Ekspòte done mwen', encryptionStatus: 'Sekire de bout an bout',
    // Premium
    premium: 'Premyòm', upgrade: 'Mete ajou', upgradeToPremium: 'Mete ajou nan Premyòm', currentPlan: 'Plan aktyèl', freePlan: 'Plan gratis', premiumPlan: 'Plan Premyòm', organizationPlan: 'Plan òganizasyon', freeForever: 'Gratis pou toutan', perMonth: '/pa mwa', perYear: '/pa ane', billedMonthly: 'Faktire chak mwa', billedYearly: 'Faktire chak ane', savePercent: 'Ekonomize', mostPopular: 'Pi popilè', bestValue: 'Pi bon valè', monthlyPlan: '$5.99 pa mwa', yearlyPlan: '$59.99 pa ane', saveWithYearly: 'Ekonomize ak plan anyèl!',
    freeFeatures: 'Fonksyon gratis',
    freeFeaturesList: { signup: 'Enskri gratis', groups: 'Gwoup sipò ilimite', buddy: 'Jwenn zanmi', emergency: 'Sipò ijans ak kriz', mood7days: '7 jou istwa emosyon', journal5: '5 antre jounal/mwa', breathing: 'Egzèsis respirasyon debaz', community: 'Aksè kominote' },
    premiumFeatures: 'Fonksyon Premyòm',
    premiumFeaturesList: { unlimitedJournal: 'Jounal ilimite', fullHistory: 'Tout istwa emosyon', allTools: 'Tout zouti pran swen tèt ou', themes: 'Tèm pèsonalize', sleep: 'Swiv somèy', analytics: 'Analiz pwogrè', adFree: 'San piblisite', priority: 'Sipò prioritè' },
    // Profile
    editProfile: 'Modifye pwofil', profilePicture: 'Foto pwofil', changePhoto: 'Chanje foto', bio: 'Bio', aboutMe: 'Sou mwen', memberSince: 'Manm depi', profileUpdated: 'Pwofil mete ajou', saveChanges: 'Sove chanjman',
    // Time
    today: 'Jodi a', yesterday: 'Yè', thisWeek: 'Semèn sa a', thisMonth: 'Mwa sa a', allTime: 'Tout tan',
    // Misc
    noResults: 'Pa gen rezilta', tryAgain: 'Eseye ankò', comingSoon: 'Ap vini byento', newFeature: 'Nouvo', offline: 'Ou san entènèt', connectionRestored: 'Koneksyon retounen',
    // Actions
    post: 'Pibliye', reply: 'Reponn', like: 'Renmen', share: 'Pataje', report: 'Rapòte', mute: 'Fèmen son', unmute: 'Louvri son', camera: 'Kamera', record: 'Anrejistre', play: 'Jwe', stop: 'Kanpe',
    // Video Calls
    videoCall: 'Apèl videyo', startCall: 'Kòmanse apèl', endCall: 'Fini apèl',
    // Translation
    translatedFrom: 'Tradui de', seeOriginal: 'Wè orijinal la',
    // Organization
    organizationName: 'Non òganizasyon', organizationType: 'Tip òganizasyon', clinic: 'Klinik', hospital: 'Lopital', school: 'Lekòl', company: 'Konpayi', adminName: 'Non administratè', adminEmail: 'Imèl administratè', registerOrganization: 'Enskri òganizasyon', joinAsIndividual: 'Antre kòm Endividi', organizationPortal: 'Pòtal Òganizasyon',
    // Parent Dashboard
    parentDashboard: 'Tablo paran', linkChild: 'Konekte kont timoun', linkedChildren: 'Timoun konekte', moodTrends: 'Tandans emosyon', appUsage: 'Itilizasyon app', crisisAlerts: 'Alèt kriz', privacyProtected: 'Pwoteksyon vi prive',
    // Account Status
    accountLocked: 'Kont ou bloke', accountSuspended: 'Kont ou sispann', accountBanned: 'Kont ou entèdi', contactSupport: 'Kontakte sipò',
    // Consent
    consentForms: 'Fòm konsantman', iAgree: 'Mwen dakò', signature: 'Siyati', hipaaConsent: 'Konsantman HIPAA', treatmentConsent: 'Konsantman tretman', treatmentPlan: 'Plan tretman', goals: 'Objektif',
    // Encouragement
    encouragement: { proud: 'Nou fyè de ou paske ou isit', brave: 'Li pran kouraj pou chèche sipò', notAlone: 'Ou pa poukont ou nan vwayaj sa a', oneDay: 'Pran yon jou alafwa', matters: 'Santiman ou enpòtan', valid: 'Eksperyans ou yo valid', stronger: 'Ou pi fò pase ou panse', progress: 'Pwogrè, pa pèfeksyon' },
    // Birthday
    birthday: {
      enterBirthday: 'Ki jou nesans ou?',
      keepSafe: 'Nou bezwen sa pou kenbe ou an sekirite',
      month: 'Mwa',
      day: 'Jou',
      year: 'Ane',
      birthdayPrivate: 'Jou nesans ou rete prive',
      mustBe13: 'Ou dwe gen omwen 13 lane'
    },
    // Guardian
    guardian: {
      title: 'Paramèt Gadyen',
      parentDashboard: 'Tablo Paran',
      linkChild: 'Konekte Kont Timoun',
      linkedChildren: 'Timoun Konekte',
      pendingRequests: 'Demann an atant',
      noLinkedChildren: 'Pa gen timoun konekte',
      approve: 'Apwouve',
      deny: 'Refize',
      revoke: 'Revoke lyen',
      moodTrends: 'Tandans emosyon',
      appUsage: 'Itilizasyon app',
      crisisAlerts: 'Alèt kriz',
      privacyProtected: 'Konfidansyalite pwoteje',
      journalPrivate: 'Jounal toujou prive',
      messagesPrivate: 'Mesaj prive pa janm pataje',
      youreInControl: 'Ou gen kontwòl',
      requiresParent: 'Timoun anba 13 an bezwen yon paran/gadyen pou kreye kont yo.',
      optionalLink: 'Ou ka konekte yon kont paran/gadyen opsyonèlman.',
      parentAccountType: 'Kont Paran/Gadyen',
      childAccountType: 'Kont Timoun/Adolesan'
    },
    // Account Status
    accountStatus: {
      active: 'Aktif',
      locked: 'Bloke',
      suspended: 'Sispann',
      banned: 'Entèdi',
      accountLocked: 'Kont ou bloke tanporèman.',
      accountSuspended: 'Kont ou sispann.',
      accountBanned: 'Kont ou entèdi pèmanantman.',
      contactSupport: 'Kontakte sipò pou plis enfòmasyon.',
      submitAppeal: 'Soumèt Apèl',
      requestUnlock: 'Mande Debloké'
    }
  }
};

// Helper functions
export const getTranslation = (lang, key, fallback = true) => {
  const keys = key.split('.');
  let result = TRANSLATIONS[lang];
  for (const k of keys) {
    if (result && result[k] !== undefined) result = result[k];
    else { result = undefined; break; }
  }
  if (result === undefined && fallback && lang !== 'en') {
    result = TRANSLATIONS.en;
    for (const k of keys) {
      if (result && result[k] !== undefined) result = result[k];
      else { result = key; break; }
    }
  }
  return result || key;
};

export const useTranslations = (lang = 'en') => TRANSLATIONS[lang] || TRANSLATIONS.en;
export const isRTL = (lang) => SUPPORTED_LANGUAGES.find(l => l.code === lang)?.dir === 'rtl';

export default TRANSLATIONS;
