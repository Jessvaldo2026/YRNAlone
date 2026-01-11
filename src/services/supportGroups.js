import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Users, Book, Home, User, Sparkles, Send, Settings, Globe, Plus, Search, Camera, Ban, Flag, X, Mic, StopCircle } from 'lucide-react';

// ✅ CONSTANTS STAY OUTSIDE
const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '😡', label: 'Angry' }
];

const JOURNAL_MOODS = [
  { emoji: '😊', label: 'happy' },
  { emoji: '😢', label: 'sad' },
  { emoji: '😰', label: 'anxious' },
  { emoji: '😡', label: 'angry' },
  { emoji: '🥰', label: 'loved' },
  { emoji: '😴', label: 'tired' }
];

const JOURNAL_THEMES = {
  cute: { bg: 'from-pink-100 to-purple-100', accent: 'from-pink-400 to-purple-400', emoji: '🌸' },
  kawaii: { bg: 'from-blue-100 to-pink-100', accent: 'from-blue-400 to-pink-400', emoji: '🎀' },
  goth: { bg: 'from-gray-800 to-purple-900', accent: 'from-purple-500 to-pink-500', emoji: '🌙' },
  emo: { bg: 'from-gray-900 to-red-900', accent: 'from-red-500 to-purple-500', emoji: '🖤' },
  vintage: { bg: 'from-amber-100 to-orange-100', accent: 'from-amber-600 to-orange-600', emoji: '📜' },
  mystical: { bg: 'from-indigo-200 to-purple-200', accent: 'from-indigo-500 to-purple-500', emoji: '🔮' },
  witchy: { bg: 'from-purple-900 to-indigo-900', accent: 'from-purple-400 to-pink-400', emoji: '✨' },
  classic: { bg: 'from-gray-100 to-gray-200', accent: 'from-gray-700 to-gray-900', emoji: '📖' }
};

const translations = {
  en: {
    welcomeBack: "Welcome back", notAlone: "You're not alone. We're here with you.",
    unLonelyHourNow: "UN-LONELY HOUR IS NOW!", peopleOnline: "people near you are online right now",
    connectNow: "Connect Right Now", yourStreak: "Your Streak", days: "days",
    connections: "Connections", gratitudeWall: "Gratitude Wall", yourBuddy: "Your Buddy",
    shareYourHeart: "Share Your Heart", whatOnMind: "What's on your mind?",
    postToFeed: "Post to Feed", communityFeed: "Community Feed",
    writeComment: "Write a supportive comment...", postComment: "Post",
    home: "Home", buddy: "Buddy", you: "You", settings: "Settings",
    language: "Language", accessibility: "Accessibility", highContrast: "High Contrast Mode",
    textSize: "Text Size", small: "Small", medium: "Medium", large: "Large",
    privacy: "Privacy", shareAnonymously: "Always post anonymously",
    showOnlineStatus: "Show when I'm online", allowMatching: "Allow buddy matching",
    gratitudePlaceholder: "I'm grateful for...", postAnonymously: "Post Anonymously",
    postedAnonymously: "Posted anonymously", yourCommunity: "Your Community",
    findYourPeople: "Find your people. Share your journey.", createOwnGroup: "Create Your Own",
    createNewGroup: "Create New Group", groupName: "Group Name",
    groupNamePlaceholder: "e.g., Night Owls Support", chooseEmoji: "Choose Emoji",
    groupDescription: "Description", groupDescPlaceholder: "What makes this group special?",
    createGroup: "Create Group", yourGroups: "Your Groups", members: "members", member: "member",
    join: "Join", joined: "Joined", yourProfile: "Your Profile",
    memberSince: "Member since October 2025", dayStreak: "Day Streak",
    entries: "Entries", rewardsEarned: "Rewards Earned", locked: "Locked",
    yourSafeSpace: "Your Safe Space", writeFreeły: "Write freely. No judgment.",
    howDoYouFeel: "How do you feel?", dearJournal: "Dear Journal... Today I feel...",
    saveToMyHeart: "Save to My Heart", saved: "Saved!",
    yourLonelinessBuddy: "Your Loneliness Buddy", realPerson: "Real person. Real connection.",
    anonymous: "Anonymous for safety", matchMe: "Match Me Now",
    inviteFriends: "Invite Friends", searchUsers: "Search users...",
    invite: "Invite", noUsersFound: "No users found",
    interestsQuestion: "What are your interests?",
    supportQuestion: "What kind of support are you looking for?",
    findMatch: "Find My Match!", readyToConnect: "Ready to connect?",
    matchDescription: "We'll match you with someone who understands. Chat anonymously, stay safe.",
    howItWorks: "How it works:", step1: "Answer a few questions about your interests",
    step2: "We match you with someone compatible", step3: "Chat anonymously and support each other",
    typeMessage: "Type a message...", noMessages: "No messages yet. Start the conversation!",
    posts: "posts", noPosts: "No posts yet!",
    beFirst: "Share your heart above to be the first to post today!",
    reportPost: "Report Post", blockUser: "Block User",
    comments: "comments", comment: "comment", beFirstSupport: "Be the first to show support!",
    viewSavedEntries: "View Saved Entries", hideSavedEntries: "Hide Saved Entries",
    yourMoodJourney: "Your Mood Journey", edit: "Edit", edited: "Edited",
    searchGroups: "Search groups...", open: "Open", back: "Back",
    chooseVibe: "Choose Your Vibe", pickTheme: "Pick a theme that matches who you are!",
    pushNotifications: "Push Notifications", enabled: "Enabled", enable: "Enable",
    achievements: "Achievements", firstStep: "First Step", madeFirstPost: "Made your first post",
    kindSoul: "Kind Soul", support10Others: "Support 10 others",
    consistencyKing: "Consistency King", thirtyDayStreak: "30 day streak",
    checkInDaily: "Check in daily", todaysMissions: "Today's Missions",
    viewAll: "View All", gratitudeMatters: "Your gratitude reminds others they're not alone in their blessings",
    beFirstGratitude: "Be the first to share gratitude today!",
    journal: "Journal", groups: "Groups", gratitude: "Gratitude",
    helpPerfectMatch: "Help us find your perfect match!", selectAllApply: "Select all that apply",
    recording: "Recording...", stopRecording: "Stop Recording", voiceNote: "Voice Note",
    recordVoice: "Record Voice Message", or: "or"
  },
  es: {
    welcomeBack: "Bienvenido de nuevo", notAlone: "No estás solo. Estamos aquí contigo.",
    unLonelyHourNow: "¡HORA SIN SOLEDAD ES AHORA!", peopleOnline: "personas cerca de ti están en línea ahora",
    connectNow: "Conectar Ahora", yourStreak: "Tu Racha", days: "días",
    connections: "Conexiones", gratitudeWall: "Muro de Gratitud", yourBuddy: "Tu Compañero",
    shareYourHeart: "Comparte tu Corazón", whatOnMind: "¿Qué tienes en mente?",
    postToFeed: "Publicar", communityFeed: "Feed de la Comunidad",
    writeComment: "Escribe un comentario de apoyo...", postComment: "Publicar",
    home: "Inicio", buddy: "Compañero", you: "Tú", settings: "Ajustes",
    language: "Idioma", accessibility: "Accesibilidad", highContrast: "Modo de Alto Contraste",
    textSize: "Tamaño de Texto", small: "Pequeño", medium: "Mediano", large: "Grande",
    privacy: "Privacidad", shareAnonymously: "Siempre publicar anónimamente",
    showOnlineStatus: "Mostrar cuando estoy en línea", allowMatching: "Permitir emparejamiento",
    gratitudePlaceholder: "Estoy agradecido por...", postAnonymously: "Publicar Anónimamente",
    postedAnonymously: "Publicado anónimamente", yourCommunity: "Tu Comunidad",
    findYourPeople: "Encuentra a tu gente. Comparte tu viaje.", createOwnGroup: "Crea el Tuyo",
    createNewGroup: "Crear Nuevo Grupo", groupName: "Nombre del Grupo",
    groupNamePlaceholder: "ej., Apoyo Nocturno", chooseEmoji: "Elegir Emoji",
    groupDescription: "Descripción", groupDescPlaceholder: "¿Qué hace especial a este grupo?",
    createGroup: "Crear Grupo", yourGroups: "Tus Grupos", members: "miembros", member: "miembro",
    join: "Unirse", joined: "Unido", yourProfile: "Tu Perfil",
    memberSince: "Miembro desde octubre 2025", dayStreak: "Racha de Días",
    entries: "Entradas", rewardsEarned: "Recompensas Ganadas", locked: "Bloqueado",
    yourSafeSpace: "Tu Espacio Seguro", writeFreeły: "Escribe libremente. Sin juicios.",
    howDoYouFeel: "¿Cómo te sientes?", dearJournal: "Querido Diario... Hoy me siento...",
    saveToMyHeart: "Guardar en Mi Corazón", saved: "¡Guardado!",
    yourLonelinessBuddy: "Tu Compañero de Soledad", realPerson: "Persona real. Conexión real.",
    anonymous: "Anónimo por seguridad", matchMe: "Emparejarme Ahora",
    inviteFriends: "Invitar Amigos", searchUsers: "Buscar usuarios...",
    invite: "Invitar", noUsersFound: "No se encontraron usuarios",
    interestsQuestion: "¿Cuáles son tus intereses?",
    supportQuestion: "¿Qué tipo de apoyo buscas?",
    findMatch: "¡Encuentra mi Pareja!", readyToConnect: "¿Listo para conectar?",
    matchDescription: "Te emparejaremos con alguien que entienda. Chatea anónimamente, mantente seguro.",
    howItWorks: "Cómo funciona:", step1: "Responde algunas preguntas sobre tus intereses",
    step2: "Te emparejamos con alguien compatible", step3: "Chatea anónimamente y apóyense mutuamente",
    typeMessage: "Escribe un mensaje...", noMessages: "Aún no hay mensajes. ¡Comienza la conversación!",
    posts: "publicaciones", noPosts: "¡Aún no hay publicaciones!",
    beFirst: "¡Comparte tu corazón arriba para ser el primero en publicar hoy!",
    reportPost: "Reportar Publicación", blockUser: "Bloquear Usuario",
    comments: "comentarios", comment: "comentario", beFirstSupport: "¡Sé el primero en mostrar apoyo!",
    viewSavedEntries: "Ver Entradas Guardadas", hideSavedEntries: "Ocultar Entradas Guardadas",
    yourMoodJourney: "Tu Viaje de Estado de Ánimo", edit: "Editar", edited: "Editado",
    searchGroups: "Buscar grupos...", open: "Abrir", back: "Volver",
    chooseVibe: "Elige Tu Vibra", pickTheme: "¡Elige un tema que coincida con quien eres!",
    pushNotifications: "Notificaciones Push", enabled: "Habilitado", enable: "Habilitar",
    achievements: "Logros", firstStep: "Primer Paso", madeFirstPost: "Hiciste tu primera publicación",
    kindSoul: "Alma Bondadosa", support10Others: "Apoya a 10 otros",
    consistencyKing: "Rey de la Consistencia", thirtyDayStreak: "Racha de 30 días",
    checkInDaily: "Registrarse diariamente", todaysMissions: "Misiones de Hoy",
    viewAll: "Ver Todo", gratitudeMatters: "Tu gratitud recuerda a otros que no están solos en sus bendiciones",
    beFirstGratitude: "¡Sé el primero en compartir gratitud hoy!",
    journal: "Diario", groups: "Grupos", gratitude: "Gratitud",
    helpPerfectMatch: "¡Ayúdanos a encontrar tu pareja perfecta!", selectAllApply: "Selecciona todos los que apliquen",
    recording: "Grabando...", stopRecording: "Detener Grabación", voiceNote: "Nota de Voz",
    recordVoice: "Grabar Mensaje de Voz", or: "o"
  },
  fr: {
    welcomeBack: "Bon retour", notAlone: "Tu n'es pas seul. Nous sommes là avec toi.",
    unLonelyHourNow: "L'HEURE SANS SOLITUDE EST MAINTENANT!", peopleOnline: "personnes près de toi sont en ligne maintenant",
    connectNow: "Connecter Maintenant", yourStreak: "Ta Série", days: "jours",
    connections: "Connexions", gratitudeWall: "Mur de Gratitude", yourBuddy: "Ton Compagnon",
    shareYourHeart: "Partage Ton Cœur", whatOnMind: "À quoi penses-tu?",
    postToFeed: "Publier", communityFeed: "Fil de la Communauté",
    writeComment: "Écris un commentaire de soutien...", postComment: "Publier",
    home: "Accueil", buddy: "Compagnon", you: "Toi", settings: "Paramètres",
    language: "Langue", accessibility: "Accessibilité", highContrast: "Mode Contraste Élevé",
    textSize: "Taille du Texte", small: "Petit", medium: "Moyen", large: "Grand",
    privacy: "Confidentialité", shareAnonymously: "Toujours publier anonymement",
    showOnlineStatus: "Montrer quand je suis en ligne", allowMatching: "Autoriser le jumelage",
    gratitudePlaceholder: "Je suis reconnaissant pour...", postAnonymously: "Publier Anonymement",
    postedAnonymously: "Publié anonymement", yourCommunity: "Ta Communauté",
    findYourPeople: "Trouve tes gens. Partage ton parcours.", createOwnGroup: "Crée le Tien",
    createNewGroup: "Créer un Nouveau Groupe", groupName: "Nom du Groupe",
    groupNamePlaceholder: "ex., Support Nocturne", chooseEmoji: "Choisir un Emoji",
    groupDescription: "Description", groupDescPlaceholder: "Qu'est-ce qui rend ce groupe spécial?",
    createGroup: "Créer un Groupe", yourGroups: "Tes Groupes", members: "membres", member: "membre",
    join: "Rejoindre", joined: "Rejoint", yourProfile: "Ton Profil",
    memberSince: "Membre depuis octobre 2025", dayStreak: "Série de Jours",
    entries: "Entrées", rewardsEarned: "Récompenses Gagnées", locked: "Verrouillé",
    yourSafeSpace: "Ton Espace Sûr", writeFreeły: "Écris librement. Sans jugement.",
    howDoYouFeel: "Comment te sens-tu?", dearJournal: "Cher Journal... Aujourd'hui je me sens...",
    saveToMyHeart: "Sauvegarder dans Mon Cœur", saved: "Sauvegardé!",
    yourLonelinessBuddy: "Ton Compagnon de Solitude", realPerson: "Vraie personne. Vraie connexion.",
    anonymous: "Anonyme pour la sécurité", matchMe: "Jumelage Maintenant",
    inviteFriends: "Inviter des Amis", searchUsers: "Rechercher des utilisateurs...",
    invite: "Inviter", noUsersFound: "Aucun utilisateur trouvé",
    interestsQuestion: "Quels sont tes centres d'intérêt?",
    supportQuestion: "Quel type de soutien cherches-tu?",
    findMatch: "Trouve Mon Jumelage!", readyToConnect: "Prêt à te connecter?",
    matchDescription: "Nous te jumelerons avec quelqu'un qui comprend. Discute anonymement, reste en sécurité.",
    howItWorks: "Comment ça marche:", step1: "Réponds à quelques questions sur tes intérêts",
    step2: "Nous te jumelons avec quelqu'un de compatible", step3: "Discute anonymement et soutenez-vous mutuellement",
    typeMessage: "Tape un message...", noMessages: "Pas encore de messages. Commence la conversation!",
    posts: "publications", noPosts: "Pas encore de publications!",
    beFirst: "Partage ton cœur ci-dessus pour être le premier à publier aujourd'hui!",
    reportPost: "Signaler la Publication", blockUser: "Bloquer l'Utilisateur",
    comments: "commentaires", comment: "commentaire", beFirstSupport: "Sois le premier à montrer ton soutien!",
    viewSavedEntries: "Voir les Entrées Sauvegardées", hideSavedEntries: "Masquer les Entrées Sauvegardées",
    yourMoodJourney: "Ton Parcours d'Humeur", edit: "Modifier", edited: "Modifié",
    searchGroups: "Rechercher des groupes...", open: "Ouvrir", back: "Retour",
    chooseVibe: "Choisis Ton Ambiance", pickTheme: "Choisis un thème qui te correspond!",
    pushNotifications: "Notifications Push", enabled: "Activé", enable: "Activer",
    achievements: "Réalisations", firstStep: "Premier Pas", madeFirstPost: "A fait ta première publication",
    kindSoul: "Âme Bienveillante", support10Others: "Soutenir 10 autres",
    consistencyKing: "Roi de la Cohérence", thirtyDayStreak: "Série de 30 jours",
    checkInDaily: "S'enregistrer quotidiennement", todaysMissions: "Missions d'Aujourd'hui",
    viewAll: "Voir Tout", gratitudeMatters: "Ta gratitude rappelle aux autres qu'ils ne sont pas seuls dans leurs bénédictions",
    beFirstGratitude: "Sois le premier à partager ta gratitude aujourd'hui!",
    journal: "Journal", groups: "Groupes", gratitude: "Gratitude",
    helpPerfectMatch: "Aide-nous à trouver ton jumelage parfait!", selectAllApply: "Sélectionne tout ce qui s'applique",
    recording: "Enregistrement...", stopRecording: "Arrêter l'Enregistrement", voiceNote: "Note Vocale",
    recordVoice: "Enregistrer un Message Vocal", or: "ou"
  },
  de: {
    welcomeBack: "Willkommen zurück", notAlone: "Du bist nicht allein. Wir sind hier bei dir.",
    unLonelyHourNow: "NICHT-EINSAM-STUNDE IST JETZT!", peopleOnline: "Personen in deiner Nähe sind jetzt online",
    connectNow: "Jetzt Verbinden", yourStreak: "Deine Serie", days: "Tage",
    connections: "Verbindungen", gratitudeWall: "Dankbarkeitswand", yourBuddy: "Dein Freund",
    shareYourHeart: "Teile Dein Herz", whatOnMind: "Was denkst du?",
    postToFeed: "Veröffentlichen", communityFeed: "Community-Feed",
    writeComment: "Schreibe einen unterstützenden Kommentar...", postComment: "Posten",
    home: "Startseite", buddy: "Freund", you: "Du", settings: "Einstellungen",
    language: "Sprache", accessibility: "Barrierefreiheit", highContrast: "Hoher Kontrastmodus",
    textSize: "Textgröße", small: "Klein", medium: "Mittel", large: "Groß",
    privacy: "Datenschutz", shareAnonymously: "Immer anonym posten",
    showOnlineStatus: "Zeigen, wenn ich online bin", allowMatching: "Freundessuche erlauben",
    gratitudePlaceholder: "Ich bin dankbar für...", postAnonymously: "Anonym Posten",
    postedAnonymously: "Anonym gepostet", yourCommunity: "Deine Community",
    findYourPeople: "Finde deine Leute. Teile deine Reise.", createOwnGroup: "Erstelle Deine Eigene",
    createNewGroup: "Neue Gruppe Erstellen", groupName: "Gruppenname",
    groupNamePlaceholder: "z.B., Nachtschwärmer-Support", chooseEmoji: "Emoji Wählen",
    groupDescription: "Beschreibung", groupDescPlaceholder: "Was macht diese Gruppe besonders?",
    createGroup: "Gruppe Erstellen", yourGroups: "Deine Gruppen", members: "Mitglieder", member: "Mitglied",
    join: "Beitreten", joined: "Beigetreten", yourProfile: "Dein Profil",
    memberSince: "Mitglied seit Oktober 2025", dayStreak: "Tage-Serie",
    entries: "Einträge", rewardsEarned: "Verdiente Belohnungen", locked: "Gesperrt",
    yourSafeSpace: "Dein Sicherer Raum", writeFreeły: "Schreibe frei. Ohne Urteil.",
    howDoYouFeel: "Wie fühlst du dich?", dearJournal: "Liebes Tagebuch... Heute fühle ich mich...",
    saveToMyHeart: "In Meinem Herzen Speichern", saved: "Gespeichert!",
    yourLonelinessBuddy: "Dein Einsamkeitsfreund", realPerson: "Echte Person. Echte Verbindung.",
    anonymous: "Anonym für Sicherheit", matchMe: "Jetzt Matchen",
    inviteFriends: "Freunde Einladen", searchUsers: "Benutzer suchen...",
    invite: "Einladen", noUsersFound: "Keine Benutzer gefunden",
    interestsQuestion: "Was sind deine Interessen?",
    supportQuestion: "Welche Art von Unterstützung suchst du?",
    findMatch: "Finde Mein Match!", readyToConnect: "Bereit zum Verbinden?",
    matchDescription: "Wir matchen dich mit jemandem, der versteht. Chatte anonym, bleibe sicher.",
    howItWorks: "So funktioniert's:", step1: "Beantworte ein paar Fragen zu deinen Interessen",
    step2: "Wir matchen dich mit jemandem Kompatiblem", step3: "Chatte anonym und unterstützt euch gegenseitig",
    typeMessage: "Nachricht eingeben...", noMessages: "Noch keine Nachrichten. Starte das Gespräch!",
    posts: "Beiträge", noPosts: "Noch keine Beiträge!",
    beFirst: "Teile dein Herz oben, um der Erste zu sein, der heute postet!",
    reportPost: "Beitrag Melden", blockUser: "Benutzer Blockieren",
    comments: "Kommentare", comment: "Kommentar", beFirstSupport: "Sei der Erste, der Unterstützung zeigt!",
    viewSavedEntries: "Gespeicherte Einträge Anzeigen", hideSavedEntries: "Gespeicherte Einträge Ausblenden",
    yourMoodJourney: "Deine Stimmungsreise", edit: "Bearbeiten", edited: "Bearbeitet",
    searchGroups: "Gruppen suchen...", open: "Öffnen", back: "Zurück",
    chooseVibe: "Wähle Deine Stimmung", pickTheme: "Wähle ein Thema, das zu dir passt!",
    pushNotifications: "Push-Benachrichtigungen", enabled: "Aktiviert", enable: "Aktivieren",
    achievements: "Erfolge", firstStep: "Erster Schritt", madeFirstPost: "Hast deinen ersten Beitrag gemacht",
    kindSoul: "Gütige Seele", support10Others: "10 andere unterstützen",
    consistencyKing: "Konsistenzkönig", thirtyDayStreak: "30-Tage-Serie",
    checkInDaily: "Täglich einchecken", todaysMissions: "Heutige Missionen",
    viewAll: "Alle Anzeigen", gratitudeMatters: "Deine Dankbarkeit erinnert andere daran, dass sie nicht allein in ihren Segnungen sind",
    beFirstGratitude: "Sei der Erste, der heute Dankbarkeit teilt!",
    journal: "Tagebuch", groups: "Gruppen", gratitude: "Dankbarkeit",
    helpPerfectMatch: "Hilf uns, dein perfektes Match zu finden!", selectAllApply: "Wähle alle zutreffenden",
    recording: "Aufnahme...", stopRecording: "Aufnahme Stoppen", voiceNote: "Sprachnotiz",
    recordVoice: "Sprachnachricht Aufnehmen", or: "oder"
  },
  pt: {
    welcomeBack: "Bem-vindo de volta", notAlone: "Você não está sozinho. Estamos aqui com você.",
    unLonelyHourNow: "HORA SEM SOLIDÃO É AGORA!", peopleOnline: "pessoas perto de você estão online agora",
    connectNow: "Conectar Agora", yourStreak: "Sua Sequência", days: "dias",
    connections: "Conexões", gratitudeWall: "Mural de Gratidão", yourBuddy: "Seu Companheiro",
    shareYourHeart: "Compartilhe Seu Coração", whatOnMind: "O que você está pensando?",
    postToFeed: "Publicar", communityFeed: "Feed da Comunidade",
    writeComment: "Escreva um comentário de apoio...", postComment: "Publicar",
    home: "Início", buddy: "Companheiro", you: "Você", settings: "Configurações",
    language: "Idioma", accessibility: "Acessibilidade", highContrast: "Modo de Alto Contraste",
    textSize: "Tamanho do Texto", small: "Pequeno", medium: "Médio", large: "Grande",
    privacy: "Privacidade", shareAnonymously: "Sempre publicar anonimamente",
    showOnlineStatus: "Mostrar quando estou online", allowMatching: "Permitir emparelhamento",
    gratitudePlaceholder: "Sou grato por...", postAnonymously: "Publicar Anonimamente",
    postedAnonymously: "Publicado anonimamente", yourCommunity: "Sua Comunidade",
    findYourPeople: "Encontre suas pessoas. Compartilhe sua jornada.", createOwnGroup: "Crie o Seu",
    createNewGroup: "Criar Novo Grupo", groupName: "Nome do Grupo",
    groupNamePlaceholder: "ex., Apoio Noturno", chooseEmoji: "Escolher Emoji",
    groupDescription: "Descrição", groupDescPlaceholder: "O que torna este grupo especial?",
    createGroup: "Criar Grupo", yourGroups: "Seus Grupos", members: "membros", member: "membro",
    join: "Juntar-se", joined: "Juntou-se", yourProfile: "Seu Perfil",
    memberSince: "Membro desde outubro de 2025", dayStreak: "Sequência de Dias",
    entries: "Entradas", rewardsEarned: "Recompensas Ganhas", locked: "Bloqueado",
    yourSafeSpace: "Seu Espaço Seguro", writeFreeły: "Escreva livremente. Sem julgamento.",
    howDoYouFeel: "Como você se sente?", dearJournal: "Querido Diário... Hoje eu me sinto...",
    saveToMyHeart: "Salvar no Meu Coração", saved: "Salvo!",
    yourLonelinessBuddy: "Seu Companheiro de Solidão", realPerson: "Pessoa real. Conexão real.",
    anonymous: "Anônimo para segurança", matchMe: "Me Emparelhar Agora",
    inviteFriends: "Convidar Amigos", searchUsers: "Pesquisar usuários...",
    invite: "Convidar", noUsersFound: "Nenhum usuário encontrado",
    interestsQuestion: "Quais são seus interesses?",
    supportQuestion: "Que tipo de apoio você está procurando?",
    findMatch: "Encontre Meu Par!", readyToConnect: "Pronto para conectar?",
    matchDescription: "Vamos emparelhar você com alguém que entende. Converse anonimamente, fique seguro.",
    howItWorks: "Como funciona:", step1: "Responda algumas perguntas sobre seus interesses",
    step2: "Emparelhamos você com alguém compatível", step3: "Converse anonimamente e apoiem-se mutuamente",
    typeMessage: "Digite uma mensagem...", noMessages: "Ainda sem mensagens. Comece a conversa!",
    posts: "publicações", noPosts: "Ainda sem publicações!",
    beFirst: "Compartilhe seu coração acima para ser o primeiro a publicar hoje!",
    reportPost: "Reportar Publicação", blockUser: "Bloquear Usuário",
    comments: "comentários", comment: "comentário", beFirstSupport: "Seja o primeiro a mostrar apoio!",
    viewSavedEntries: "Ver Entradas Salvas", hideSavedEntries: "Ocultar Entradas Salvas",
    yourMoodJourney: "Sua Jornada de Humor", edit: "Editar", edited: "Editado",
    searchGroups: "Pesquisar grupos...", open: "Abrir", back: "Voltar",
    chooseVibe: "Escolha Sua Vibe", pickTheme: "Escolha um tema que combine com você!",
    pushNotifications: "Notificações Push", enabled: "Ativado", enable: "Ativar",
    achievements: "Conquistas", firstStep: "Primeiro Passo", madeFirstPost: "Fez sua primeira publicação",
    kindSoul: "Alma Gentil", support10Others: "Apoiar 10 outros",
    consistencyKing: "Rei da Consistência", thirtyDayStreak: "Sequência de 30 dias",
    checkInDaily: "Registrar-se diariamente", todaysMissions: "Missões de Hoje",
    viewAll: "Ver Tudo", gratitudeMatters: "Sua gratidão lembra aos outros que eles não estão sozinhos em suas bênçãos",
    beFirstGratitude: "Seja o primeiro a compartilhar gratidão hoje!",
    journal: "Diário", groups: "Grupos", gratitude: "Gratidão",
    helpPerfectMatch: "Ajude-nos a encontrar seu par perfeito!", selectAllApply: "Selecione todos que se aplicam",
    recording: "Gravando...", stopRecording: "Parar Gravação", voiceNote: "Nota de Voz",
    recordVoice: "Gravar Mensagem de Voz", or: "ou"
  },
  zh: {
    welcomeBack: "欢迎回来", notAlone: "你并不孤单。我们与你同在。",
    unLonelyHourNow: "不孤独时刻现在开始！", peopleOnline: "你附近的人现在在线",
    connectNow: "立即连接", yourStreak: "你的连胜", days: "天",
    connections: "连接", gratitudeWall: "感恩墙", yourBuddy: "你的伙伴",
    shareYourHeart: "分享你的心声", whatOnMind: "你在想什么？",
    postToFeed: "发布", communityFeed: "社区动态",
    writeComment: "写一个支持的评论...", postComment: "发布",
    home: "首页", buddy: "伙伴", you: "你", settings: "设置",
    language: "语言", accessibility: "无障碍", highContrast: "高对比度模式",
    textSize: "文字大小", small: "小", medium: "中", large: "大",
    privacy: "隐私", shareAnonymously: "始终匿名发布",
    showOnlineStatus: "显示我在线", allowMatching: "允许配对",
    gratitudePlaceholder: "我感激...", postAnonymously: "匿名发布",
    postedAnonymously: "匿名发布", yourCommunity: "你的社区",
    findYourPeople: "找到你的朋友。分享你的旅程。", createOwnGroup: "创建你自己的",
    createNewGroup: "创建新群组", groupName: "群组名称",
    groupNamePlaceholder: "例如，夜猫子支持", chooseEmoji: "选择表情符号",
    groupDescription: "描述", groupDescPlaceholder: "是什么让这个群组特别？",
    createGroup: "创建群组", yourGroups: "你的群组", members: "成员", member: "成员",
    join: "加入", joined: "已加入", yourProfile: "你的个人资料",
    memberSince: "2025年10月加入", dayStreak: "连续天数",
    entries: "条目", rewardsEarned: "获得的奖励", locked: "锁定",
    yourSafeSpace: "你的安全空间", writeFreeły: "自由书写。不评判。",
    howDoYouFeel: "你感觉如何？", dearJournal: "亲爱的日记...今天我感觉...",
    saveToMyHeart: "保存到我的心", saved: "已保存！",
    yourLonelinessBuddy: "你的孤独伙伴", realPerson: "真实的人。真实的连接。",
    anonymous: "为了安全而匿名", matchMe: "现在配对我",
    inviteFriends: "邀请朋友", searchUsers: "搜索用户...",
    invite: "邀请", noUsersFound: "未找到用户",
    interestsQuestion: "你的兴趣是什么？",
    supportQuestion: "你在寻找什么样的支持？",
    findMatch: "找到我的配对！", readyToConnect: "准备好连接了吗？",
    matchDescription: "我们会将你与理解的人配对。匿名聊天，保持安全。",
    howItWorks: "如何运作：", step1: "回答一些关于你兴趣的问题",
    step2: "我们将你与兼容的人配对", step3: "匿名聊天并互相支持",
    typeMessage: "输入消息...", noMessages: "还没有消息。开始对话！",
    posts: "帖子", noPosts: "还没有帖子！",
    beFirst: "在上面分享你的心声，成为今天第一个发帖的人！",
    reportPost: "举报帖子", blockUser: "屏蔽用户",
    comments: "评论", comment: "评论", beFirstSupport: "成为第一个表示支持的人！",
    viewSavedEntries: "查看保存的条目", hideSavedEntries: "隐藏保存的条目",
    yourMoodJourney: "你的情绪之旅", edit: "编辑", edited: "已编辑",
    searchGroups: "搜索群组...", open: "打开", back: "返回",
    chooseVibe: "选择你的氛围", pickTheme: "选择一个适合你的主题！",
    pushNotifications: "推送通知", enabled: "已启用", enable: "启用",
    achievements: "成就", firstStep: "第一步", madeFirstPost: "发布了你的第一篇帖子",
    kindSoul: "善良的灵魂", support10Others: "支持10个其他人",
    consistencyKing: "坚持之王", thirtyDayStreak: "30天连胜",
    checkInDaily: "每日签到", todaysMissions: "今天的任务",
    viewAll: "查看全部", gratitudeMatters: "你的感恩提醒他人，他们在祝福中并不孤单",
    beFirstGratitude: "成为今天第一个分享感恩的人！",
    journal: "日记", groups: "群组", gratitude: "感恩",
    helpPerfectMatch: "帮助我们找到你的完美配对！", selectAllApply: "选择所有适用的",
    recording: "正在录音...", stopRecording: "停止录音", voiceNote: "语音备注",
    recordVoice: "录制语音消息", or: "或"
  },
  ja: {
    welcomeBack: "おかえりなさい", notAlone: "あなたは一人じゃない。私たちがいます。",
    unLonelyHourNow: "孤独じゃない時間は今！", peopleOnline: "あなたの近くの人が今オンラインです",
    connectNow: "今すぐ接続", yourStreak: "あなたの連続記録", days: "日",
    connections: "つながり", gratitudeWall: "感謝の壁", yourBuddy: "あなたの仲間",
    shareYourHeart: "心を共有", whatOnMind: "何を考えていますか？",
    postToFeed: "投稿", communityFeed: "コミュニティフィード",
    writeComment: "応援コメントを書く...", postComment: "投稿",
    home: "ホーム", buddy: "仲間", you: "あなた", settings: "設定",
    language: "言語", accessibility: "アクセシビリティ", highContrast: "ハイコントラストモード",
    textSize: "テキストサイズ", small: "小", medium: "中", large: "大",
    privacy: "プライバシー", shareAnonymously: "常に匿名で投稿",
    showOnlineStatus: "オンライン時に表示", allowMatching: "マッチングを許可",
    gratitudePlaceholder: "感謝していること...", postAnonymously: "匿名で投稿",
    postedAnonymously: "匿名で投稿されました", yourCommunity: "あなたのコミュニティ",
    findYourPeople: "仲間を見つけよう。旅を共有しよう。", createOwnGroup: "自分で作成",
    createNewGroup: "新しいグループを作成", groupName: "グループ名",
    groupNamePlaceholder: "例：夜更かしサポート", chooseEmoji: "絵文字を選択",
    groupDescription: "説明", groupDescPlaceholder: "このグループの特別なところは？",
    createGroup: "グループを作成", yourGroups: "あなたのグループ", members: "メンバー", member: "メンバー",
    join: "参加", joined: "参加済み", yourProfile: "あなたのプロフィール",
    memberSince: "2025年10月からメンバー", dayStreak: "連続日数",
    entries: "エントリー", rewardsEarned: "獲得した報酬", locked: "ロック済み",
    yourSafeSpace: "あなたの安全な場所", writeFreeły: "自由に書いて。判断なし。",
    howDoYouFeel: "どう感じていますか？", dearJournal: "親愛なる日記...今日は...",
    saveToMyHeart: "心に保存", saved: "保存しました！",
    yourLonelinessBuddy: "あなたの孤独の仲間", realPerson: "本物の人。本物のつながり。",
    anonymous: "安全のため匿名", matchMe: "今すぐマッチング",
    inviteFriends: "友達を招待", searchUsers: "ユーザーを検索...",
    invite: "招待", noUsersFound: "ユーザーが見つかりません",
    interestsQuestion: "あなたの興味は何ですか？",
    supportQuestion: "どんなサポートを探していますか？",
    findMatch: "マッチを見つける！", readyToConnect: "つながる準備はできましたか？",
    matchDescription: "理解してくれる人とマッチングします。匿名でチャット、安全に。",
    howItWorks: "仕組み：", step1: "興味についていくつか質問に答える",
    step2: "互換性のある人とマッチング", step3: "匿名でチャットしてお互いをサポート",
    typeMessage: "メッセージを入力...", noMessages: "まだメッセージがありません。会話を始めましょう！",
    posts: "投稿", noPosts: "まだ投稿がありません！",
    beFirst: "上で心を共有して、今日最初に投稿する人になりましょう！",
    reportPost: "投稿を報告", blockUser: "ユーザーをブロック",
    comments: "コメント", comment: "コメント", beFirstSupport: "最初にサポートを示す人になりましょう！",
    viewSavedEntries: "保存されたエントリーを表示", hideSavedEntries: "保存されたエントリーを非表示",
    yourMoodJourney: "あなたの気分の旅", edit: "編集", edited: "編集済み",
    searchGroups: "グループを検索...", open: "開く", back: "戻る",
    chooseVibe: "雰囲気を選択", pickTheme: "あなたに合ったテーマを選んで！",
    pushNotifications: "プッシュ通知", enabled: "有効", enable: "有効にする",
    achievements: "実績", firstStep: "最初の一歩", madeFirstPost: "最初の投稿をしました",
    kindSoul: "優しい魂", support10Others: "10人をサポート",
    consistencyKing: "継続の王", thirtyDayStreak: "30日連続",
    checkInDaily: "毎日チェックイン", todaysMissions: "今日のミッション",
    viewAll: "すべて表示", gratitudeMatters: "あなたの感謝は、他の人が祝福の中で一人ではないことを思い出させます",
    beFirstGratitude: "今日最初に感謝を共有する人になりましょう！",
    journal: "日記", groups: "グループ", gratitude: "感謝",
    helpPerfectMatch: "完璧なマッチを見つけるのを手伝って！", selectAllApply: "該当するものすべてを選択",
    recording: "録音中...", stopRecording: "録音を停止", voiceNote: "ボイスノート",
    recordVoice: "ボイスメッセージを録音", or: "または"
  },
  it: {
    welcomeBack: "Bentornato", notAlone: "Non sei solo. Siamo qui con te.",
    unLonelyHourNow: "L'ORA NON SOLITARIA È ORA!", peopleOnline: "persone vicino a te sono online ora",
    connectNow: "Connetti Ora", yourStreak: "La Tua Serie", days: "giorni",
    connections: "Connessioni", gratitudeWall: "Muro della Gratitudine", yourBuddy: "Il Tuo Compagno",
    shareYourHeart: "Condividi il Tuo Cuore", whatOnMind: "Cosa stai pensando?",
    postToFeed: "Pubblica", communityFeed: "Feed della Comunità",
    writeComment: "Scrivi un commento di supporto...", postComment: "Pubblica",
    home: "Home", buddy: "Compagno", you: "Tu", settings: "Impostazioni",
    language: "Lingua", accessibility: "Accessibilità", highContrast: "Modalità Alto Contrasto",
    textSize: "Dimensione Testo", small: "Piccolo", medium: "Medio", large: "Grande",
    privacy: "Privacy", shareAnonymously: "Pubblica sempre anonimamente",
    showOnlineStatus: "Mostra quando sono online", allowMatching: "Consenti abbinamento",
    gratitudePlaceholder: "Sono grato per...", postAnonymously: "Pubblica Anonimamente",
    postedAnonymously: "Pubblicato anonimamente", yourCommunity: "La Tua Comunità",
    findYourPeople: "Trova la tua gente. Condividi il tuo viaggio.", createOwnGroup: "Crea il Tuo",
    createNewGroup: "Crea Nuovo Gruppo", groupName: "Nome del Gruppo",
    groupNamePlaceholder: "es., Supporto Nottambuli", chooseEmoji: "Scegli Emoji",
    groupDescription: "Descrizione", groupDescPlaceholder: "Cosa rende speciale questo gruppo?",
    createGroup: "Crea Gruppo", yourGroups: "I Tuoi Gruppi", members: "membri", member: "membro",
    join: "Unisciti", joined: "Unito", yourProfile: "Il Tuo Profilo",
    memberSince: "Membro da ottobre 2025", dayStreak: "Serie di Giorni",
    entries: "Voci", rewardsEarned: "Ricompense Guadagnate", locked: "Bloccato",
    yourSafeSpace: "Il Tuo Spazio Sicuro", writeFreeły: "Scrivi liberamente. Senza giudizio.",
    howDoYouFeel: "Come ti senti?", dearJournal: "Caro Diario... Oggi mi sento...",
    saveToMyHeart: "Salva nel Mio Cuore", saved: "Salvato!",
    yourLonelinessBuddy: "Il Tuo Compagno di Solitudine", realPerson: "Persona reale. Connessione reale.",
    anonymous: "Anonimo per sicurezza", matchMe: "Abbinami Ora",
    inviteFriends: "Invita Amici", searchUsers: "Cerca utenti...",
    invite: "Invita", noUsersFound: "Nessun utente trovato",
    interestsQuestion: "Quali sono i tuoi interessi?",
    supportQuestion: "Che tipo di supporto stai cercando?",
    findMatch: "Trova il Mio Abbinamento!", readyToConnect: "Pronto a connetterti?",
    matchDescription: "Ti abbineremo con qualcuno che capisce. Chatta anonimamente, resta sicuro.",
    howItWorks: "Come funziona:", step1: "Rispondi ad alcune domande sui tuoi interessi",
    step2: "Ti abbiniamo con qualcuno compatibile", step3: "Chatta anonimamente e supportatevi a vicenda",
    typeMessage: "Scrivi un messaggio...", noMessages: "Ancora nessun messaggio. Inizia la conversazione!",
    posts: "post", noPosts: "Ancora nessun post!",
    beFirst: "Condividi il tuo cuore sopra per essere il primo a pubblicare oggi!",
    reportPost: "Segnala Post", blockUser: "Blocca Utente",
    comments: "commenti", comment: "commento", beFirstSupport: "Sii il primo a mostrare supporto!",
    viewSavedEntries: "Visualizza Voci Salvate", hideSavedEntries: "Nascondi Voci Salvate",
    yourMoodJourney: "Il Tuo Viaggio dell'Umore", edit: "Modifica", edited: "Modificato",
    searchGroups: "Cerca gruppi...", open: "Apri", back: "Indietro",
    chooseVibe: "Scegli la Tua Atmosfera", pickTheme: "Scegli un tema che ti rappresenta!",
    pushNotifications: "Notifiche Push", enabled: "Abilitato", enable: "Abilita",
    achievements: "Risultati", firstStep: "Primo Passo", madeFirstPost: "Hai fatto il tuo primo post",
    kindSoul: "Anima Gentile", support10Others: "Supporta 10 altri",
    consistencyKing: "Re della Coerenza", thirtyDayStreak: "Serie di 30 giorni",
    checkInDaily: "Registrati quotidianamente", todaysMissions: "Missioni di Oggi",
    viewAll: "Visualizza Tutto", gratitudeMatters: "La tua gratitudine ricorda agli altri che non sono soli nelle loro benedizioni",
    beFirstGratitude: "Sii il primo a condividere gratitudine oggi!",
    journal: "Diario", groups: "Gruppi", gratitude: "Gratitudine",
    helpPerfectMatch: "Aiutaci a trovare il tuo abbinamento perfetto!", selectAllApply: "Seleziona tutti quelli applicabili",
    recording: "Registrazione...", stopRecording: "Interrompi Registrazione", voiceNote: "Nota Vocale",
    recordVoice: "Registra Messaggio Vocale", or: "o"
  }
};

// ✅ ALL VIEW COMPONENTS OUTSIDE - NO MORE RE-CREATION!
const HomeView = ({ t, user, selectedMood, setSelectedMood, isRecording, recordingTime, formatTime, startRecording, stopRecording, audioBlob, setAudioBlob, newPost, setNewPost, addPost, posts, showComments, setShowComments, commentText, setCommentText, addComment, reactToPost, showPostMenu, setShowPostMenu, reportContent, blockUser, allAppUsers, setCurrentView, journalEntries, groups, challenges, getTextSizeClass, setShowEmergency }) => (
  <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
    <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl p-6 text-white">
      <h2 className="text-2xl font-bold">{t.welcomeBack}, {user.name}! 💜</h2>
      <p className="opacity-90 mt-2">{t.notAlone}</p>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white text-center">
        <div className="text-3xl font-bold">{user.streak}</div>
        <div className="text-sm opacity-90">{t.days}</div>
        <div className="text-xs mt-1">{t.yourStreak}</div>
      </div>
      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-4 text-white text-center">
        <div className="text-3xl font-bold">{posts.length + journalEntries.length}</div>
        <div className="text-sm opacity-90">{t.entries}</div>
      </div>
      <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl p-4 text-white text-center">
        <div className="text-3xl font-bold">{groups.filter(g => g.joined).length}</div>
        <div className="text-sm opacity-90">{t.connections}</div>
      </div>
    </div>

    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{t.shareYourHeart}</h3>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {MOODS.map(mood => (
          <button
            key={mood.label}
            onClick={() => setSelectedMood(mood.label.toLowerCase())}
            className={`flex-shrink-0 px-4 py-2 rounded-full transition ${
              selectedMood === mood.label.toLowerCase()
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white scale-110'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span className="text-2xl">{mood.emoji}</span>
          </button>
        ))}
      </div>
      
      {isRecording && (
        <div className="mb-4 p-4 bg-red-50 rounded-2xl border-2 border-red-200 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <Mic className="w-5 h-5" />
            <span>{t.recording} {formatTime(recordingTime)}</span>
          </div>
        </div>
      )}
      
      {audioBlob ? (
        <div className="mb-4 p-4 bg-purple-50 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-semibold text-purple-900">{t.voiceNote}</span>
            </div>
            <button onClick={() => setAudioBlob(null)} className="text-red-500 text-sm">✕</button>
          </div>
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mt-2" />
        </div>
      ) : (
        <>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={t.whatOnMind}
            className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:border-purple-400 focus:outline-none resize-y min-h-[120px]"
          />
          <div className="text-center my-3 text-gray-500 text-sm">{t.or}</div>
          <button
            onClick={() => isRecording ? stopRecording() : startRecording()}
            className={`w-full py-3 rounded-full font-bold transition flex items-center justify-center gap-2 ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:scale-105'
            }`}
          >
            {isRecording ? (
              <>
                <StopCircle className="w-5 h-5" />
                {t.stopRecording} ({formatTime(recordingTime)})
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                {t.recordVoice}
              </>
            )}
          </button>
        </>
      )}
      
      <button
        onClick={() => {
          if (audioBlob) {
            addPost('🎤 Voice Message', selectedMood, true);
            setAudioBlob(null);
          } else if (newPost.trim()) {
            addPost(newPost, selectedMood);
            setNewPost('');
          }
          setSelectedMood('happy');
        }}
        disabled={!newPost.trim() && !audioBlob}
        className={`mt-4 w-full py-3 rounded-full font-bold transition ${
          (newPost.trim() || audioBlob)
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {t.postToFeed} 💜
      </button>
    </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">{t.communityFeed}</h3>
        <span className="text-sm text-purple-600 font-semibold">{posts.length} {t.posts}</span>
      </div>
      {posts.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 text-center border-2 border-dashed border-purple-300">
          <div className="text-6xl mb-4">💭</div>
          <p className="text-gray-800 font-semibold text-lg mb-2">{t.noPosts}</p>
          <p className="text-gray-600">{t.beFirst}</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-3">
              {post.authorPicture ? (
                <img src={post.authorPicture} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  {post.author[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold text-gray-800">{post.author}</div>
                <div className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl">{MOODS.find(m => m.label.toLowerCase() === post.mood)?.emoji}</div>
                <div className="relative">
                  <button onClick={() => setShowPostMenu({...showPostMenu, [post.id]: !showPostMenu[post.id]})} className="text-gray-400 hover:text-gray-600 p-1">⋮</button>
                  {showPostMenu[post.id] && (
                    <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-48 z-10">
                      <button onClick={() => { reportContent(post.id, 'post', 'inappropriate'); setShowPostMenu({...showPostMenu, [post.id]: false}); }} className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600">
                        <Flag className="w-4 h-4" />{t.reportPost}
                      </button>
                      <button onClick={() => { blockUser(post.id, post.author); setShowPostMenu({...showPostMenu, [post.id]: false}); }} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                        <Ban className="w-4 h-4" />{t.blockUser}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {post.isVoice ? (
              <div className="bg-purple-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-purple-900">{t.voiceNote}</span>
                </div>
                <div className="text-sm text-gray-600">{post.content}</div>
              </div>
            ) : (
              <p className="text-gray-700 mb-4">{post.content}</p>
            )}
            <div className="flex gap-2 mb-3">
              <button onClick={() => reactToPost(post.id, 'heart')} className="flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100 hover:bg-pink-200 transition">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm">{post.reactions.heart}</span>
              </button>
              <button onClick={() => reactToPost(post.id, 'hug')} className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 hover:bg-purple-200 transition">
                <span>🤗</span>
                <span className="text-sm">{post.reactions.hug}</span>
              </button>
              <button onClick={() => reactToPost(post.id, 'star')} className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 hover:bg-yellow-200 transition">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">{post.reactions.star}</span>
              </button>
              <button onClick={() => reactToPost(post.id, 'fire')} className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 hover:bg-orange-200 transition">
                <span className="text-orange-500">🔥</span>
                <span className="text-sm">{post.reactions.fire}</span>
              </button>
            </div>
            <div className="border-t pt-3">
              <button onClick={() => setShowComments({...showComments, [post.id]: !showComments[post.id]})} className="text-purple-500 text-sm font-semibold mb-2 flex items-center gap-1 hover:underline">
                <MessageCircle className="w-4 h-4" />
                {post.comments.length} {post.comments.length === 1 ? t.comment : t.comments}
              </button>
              {showComments[post.id] && (
                <div className="space-y-3">
                  {post.comments.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">{t.beFirstSupport}</p>
                  ) : (
                    post.comments.map(comment => (
                      <div key={comment.id} className="bg-purple-50 rounded-2xl p-3">
                        <div className="font-semibold text-sm text-purple-900">{comment.author}</div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                    ))
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                      placeholder={t.writeComment}
                      className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-full focus:border-purple-400 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (commentText[post.id]?.trim()) {
                          addComment(post.id, commentText[post.id]);
                          setCommentText({...commentText, [post.id]: ''});
                        }
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition"
                    >
                      {t.postComment}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => setCurrentView('gratitude')} className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-6 text-white hover:scale-105 transition">
        <Sparkles className="w-8 h-8 mb-2 mx-auto" />
        <div className="font-bold">{t.gratitudeWall}</div>
      </button>
      <button onClick={() => setShowEmergency(true)} className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-6 text-white hover:scale-105 transition">
        <span className="text-3xl mb-2 block">🆘</span>
        <div className="font-bold">Crisis Help</div>
      </button>
    </div>
    {challenges.length > 0 && (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{t.todaysMissions}</h3>
          <button className="text-purple-500 text-sm font-semibold">{t.viewAll}</button>
        </div>
        <div className="space-y-2">
          {challenges.slice(0, 3).map(challenge => (
            <div key={challenge.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <input type="checkbox" checked={challenge.completed} readOnly className="w-5 h-5" />
              <span className="flex-1 text-gray-700">{challenge.title}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const JournalView = ({ t, journalEntry, setJournalEntry, journalMood, setJournalMood, journalSaved, selectedJournalTheme, setSelectedJournalTheme, showSavedEntries, setShowSavedEntries, journalEntries, editingEntry, setEditingEntry, saveJournalEntry, setJournalSaved, getTextSizeClass }) => {
  const isDark = selectedJournalTheme === 'goth' || selectedJournalTheme === 'emo' || selectedJournalTheme === 'witchy';

  const saveEntry = () => {
    if (journalEntry.trim()) {
      if (editingEntry) {
        setJournalEntries(prevEntries => prevEntries.map(e => 
          e.id === editingEntry.id 
            ? { ...e, content: journalEntry, mood: journalMood, theme: selectedJournalTheme, editedAt: new Date().toISOString() }
            : e
        ));
        setEditingEntry(null);
      } else {
        saveJournalEntry({
          id: Date.now(), content: journalEntry, mood: journalMood,
          theme: selectedJournalTheme, timestamp: new Date().toISOString()
        });
      }
      setJournalSaved(true);
      setTimeout(() => {
        setJournalSaved(false);
        setJournalEntry('');
      }, 2000);
    }
  };

  const editEntry = (entryToEdit) => {
    setEditingEntry(entryToEdit);
    setJournalEntry(entryToEdit.content);
    setJournalMood(entryToEdit.mood);
    setSelectedJournalTheme(entryToEdit.theme);
    setShowSavedEntries(false);
  };

  const getMoodStats = () => {
    const moodCounts = {};
    journalEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    return moodCounts;
  };

  const setJournalEntries = (updateFn) => {
    // This will be passed from parent
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${JOURNAL_THEMES[selectedJournalTheme].bg} p-6 ${getTextSizeClass()} transition-all duration-500`}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t.yourSafeSpace}</h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t.writeFreeły}</p>
        </div>
        <button onClick={() => setShowSavedEntries(!showSavedEntries)} className={`w-full mb-4 py-3 rounded-xl font-semibold transition ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
          📚 {showSavedEntries ? t.hideSavedEntries : t.viewSavedEntries} ({journalEntries.length})
        </button>
        {showSavedEntries && (
          <div className="mb-6 space-y-4">
            <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{t.yourMoodJourney} 📊</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(getMoodStats()).map(([mood, count]) => (
                  <div key={mood} className="text-center">
                    <div className="text-2xl">{JOURNAL_MOODS.find(m => m.label === mood)?.emoji}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{count}x</div>
                  </div>
                ))}
              </div>
            </div>
            {journalEntries.map(entry => (
              <div key={entry.id} className={`rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{JOURNAL_MOODS.find(m => m.label === entry.mood)?.emoji}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <button onClick={() => editEntry(entry)} className="text-purple-500 text-sm font-semibold hover:underline">
                    ✏️ {t.edit}
                  </button>
                </div>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{entry.content}</p>
                {entry.editedAt && (
                  <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t.edited}: {new Date(entry.editedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {Object.keys(JOURNAL_THEMES).map(themeName => (
            <button
              key={themeName}
              onClick={() => setSelectedJournalTheme(themeName)}
              className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-300 ${
                selectedJournalTheme === themeName
                  ? `bg-gradient-to-r ${JOURNAL_THEMES[themeName].accent} text-white scale-110 animate-pulse`
                  : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`
              }`}
            >
              <span className="text-xl">{JOURNAL_THEMES[themeName].emoji}</span>
            </button>
          ))}
        </div>
        <div className="mb-6">
          <p className={`text-center mb-3 font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t.howDoYouFeel}</p>
          <div className="flex gap-3 justify-center">
            {JOURNAL_MOODS.map(mood => (
              <button
                key={mood.label}
                onClick={() => setJournalMood(mood.label)}
                className={`text-3xl p-3 rounded-full transition-all duration-300 ${
                  journalMood === mood.label ? 'scale-125 bg-white shadow-lg animate-bounce' : 'opacity-50'
                }`}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>
        <div className={`rounded-3xl p-6 shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {editingEntry && (
            <div className="mb-3 bg-yellow-100 text-yellow-800 p-2 rounded-xl text-sm">
              ✏️ {t.edit} {new Date(editingEntry.timestamp).toLocaleDateString()}
            </div>
          )}
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder={t.dearJournal}
            className={`w-full h-96 p-4 rounded-2xl resize-y focus:outline-none ${
              isDark 
                ? 'bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700' 
                : 'bg-purple-50 text-gray-800 placeholder-gray-400 border-2 border-purple-200'
            }`}
          />
          <button
            onClick={saveEntry}
            className={`mt-4 w-full py-4 rounded-full font-bold text-white transition-all duration-300 ${
              journalSaved 
                ? 'bg-green-500' 
                : `bg-gradient-to-r ${JOURNAL_THEMES[selectedJournalTheme].accent} hover:scale-105`
            }`}
          >
            {journalSaved ? `✓ ${t.saved}` : `💜 ${t.saveToMyHeart}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const GratitudeView = ({ t, gratitudePosts, addGratitude, getTextSizeClass }) => {
  const [gratitude, setGratitude] = useState('');
  const [posted, setPosted] = useState(false);
  
  const handlePost = () => {
    if (gratitude.trim()) {
      addGratitude(gratitude);
      setPosted(true);
      setTimeout(() => { setPosted(false); setGratitude(''); }, 2000);
    }
  };
  
  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2">{t.gratitudeWall}</h2>
        <p className="opacity-90">{t.gratitudeMatters}</p>
      </div>
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <textarea
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          placeholder={t.gratitudePlaceholder}
          className="w-full p-4 border-2 border-yellow-200 rounded-2xl focus:border-yellow-400 focus:outline-none resize-none"
          rows="4"
        />
        <button
          onClick={handlePost}
          className={`mt-4 w-full py-3 rounded-full font-bold text-white transition ${
            posted ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105'
          }`}
        >
          {posted ? `✓ ${t.postedAnonymously}` : `✨ ${t.postAnonymously}`}
        </button>
      </div>
      <div className="space-y-3">
        {gratitudePosts.length === 0 ? (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🙏</div>
            <p className="text-gray-600">{t.beFirstGratitude}</p>
          </div>
        ) : (
          gratitudePosts.map(post => (
            <div key={post.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 shadow">
              <p className="text-gray-800 italic">{post.content}</p>
              <div className="text-xs text-gray-500 mt-2">{new Date(post.timestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const GroupsView = ({ t, groups, setGroups, user, selectedGroup, setSelectedGroup, searchQuery, setSearchQuery, inviteToGroup, joinGroup, sendGroupMessage, isRecordingGroup, recordingTimeGroup, formatTime, startRecording, stopRecording, groupAudioBlob, setGroupAudioBlob, getTextSizeClass }) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('💜');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [groupMessage, setGroupMessage] = useState('');

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: Date.now(), name: `${newGroupEmoji} ${newGroupName}`, members: 1,
        description: newGroupDesc || 'A supportive community', joined: true,
        messages: [], membersList: [{ id: user.id, name: user.name }]
      };
      setGroups([...groups, newGroup]);
      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupDesc('');
    }
  };

  const filterGroups = (groupsList, query) => {
    if (!query.trim()) return groupsList;
    return groupsList.filter(group => 
      group.name.toLowerCase().includes(query.toLowerCase()) ||
      group.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  if (selectedGroup) {
    const group = groups.find(g => g.id === selectedGroup);
    return (
      <div className={`flex flex-col h-screen ${getTextSizeClass()}`}>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
          <button onClick={() => setSelectedGroup(null)} className="mb-2">← {t.back}</button>
          <h2 className="text-xl font-bold">{group.name}</h2>
          <p className="text-sm opacity-90">{group.members} {group.members === 1 ? t.member : t.members}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {group.messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t.noMessages}</p>
            </div>
          ) : (
            group.messages.map(msg => (
              <div key={msg.id} className="bg-white rounded-2xl p-3 shadow">
                <div className="font-semibold text-sm text-purple-900">{msg.author}</div>
                {msg.isVoice ? (
                  <div className="flex items-center gap-2 text-purple-600 text-sm mt-1">
                    <Mic className="w-4 h-4" />
                    <span>{t.voiceNote}</span>
                  </div>
                ) : (
                  <p className="text-gray-700">{msg.text}</p>
                )}
                <div className="text-xs text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-white border-t">
          {isRecordingGroup && (
            <div className="mb-2 p-3 bg-red-50 rounded-2xl border-2 border-red-200 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <Mic className="w-5 h-5" />
                <span>{t.recording} {formatTime(recordingTimeGroup)}</span>
              </div>
            </div>
          )}
          {groupAudioBlob ? (
            <div className="mb-2 p-3 bg-purple-50 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-900">{t.voiceNote}</span>
                </div>
                <button onClick={() => setGroupAudioBlob(null)} className="text-red-500 text-sm">✕</button>
              </div>
              <audio controls src={URL.createObjectURL(groupAudioBlob)} className="w-full" />
            </div>
          ) : null}
          <div className="flex gap-2">
            {!groupAudioBlob && (
              <>
                <button
                  onClick={() => isRecordingGroup ? stopRecording(true) : startRecording(true)}
                  className={`p-3 rounded-full transition ${
                    isRecordingGroup 
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:scale-105'
                  }`}
                  title={isRecordingGroup ? `${t.stopRecording} (${formatTime(recordingTimeGroup)})` : t.recordVoice}
                >
                  {isRecordingGroup ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                  placeholder={t.typeMessage}
                  className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-full focus:border-purple-400 focus:outline-none"
                />
              </>
            )}
            <button
              onClick={() => {
                if (groupAudioBlob) {
                  sendGroupMessage(selectedGroup, '🎤 Voice Message', true);
                  setGroupAudioBlob(null);
                } else if (groupMessage.trim()) {
                  sendGroupMessage(selectedGroup, groupMessage);
                  setGroupMessage('');
                }
              }}
              disabled={!groupMessage.trim() && !groupAudioBlob}
              className={`p-3 rounded-full transition ${
                (groupMessage.trim() || groupAudioBlob)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white text-center">
        <Users className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2">{t.yourCommunity}</h2>
        <p className="opacity-90">{t.findYourPeople}</p>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchGroups}
          className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-2xl focus:border-purple-400 focus:outline-none"
        />
      </div>
      <button onClick={() => setShowCreateGroup(!showCreateGroup)} className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white py-4 rounded-2xl font-bold hover:scale-105 transition flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />{t.createOwnGroup}
      </button>
      {showCreateGroup && (
        <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
          <h3 className="text-xl font-bold text-gray-800">{t.createNewGroup}</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.groupName}</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder={t.groupNamePlaceholder}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.chooseEmoji}</label>
            <div className="flex gap-2">
              {['💜', '💙', '💚', '💛', '🧡', '❤️', '🌸', '🌊', '🌟', '🦋'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setNewGroupEmoji(emoji)}
                  className={`text-2xl p-2 rounded-lg transition ${newGroupEmoji === emoji ? 'bg-purple-100 scale-110' : 'bg-gray-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.groupDescription}</label>
            <textarea
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder={t.groupDescPlaceholder}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
              rows="3"
            />
          </div>
          <button onClick={handleCreateGroup} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:scale-105 transition">
            {t.createGroup}
          </button>
        </div>
      )}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.yourGroups}</h3>
        <div className="space-y-3">
          {filterGroups(groups, searchQuery).map(group => (
            <div key={group.id} className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex-1">
                <div className="font-bold text-gray-800">{group.name}</div>
                <div className="text-sm text-gray-600">{group.description}</div>
                <div className="text-xs text-gray-500 mt-1">{group.members} {group.members === 1 ? t.member : t.members}</div>
              </div>
              <div className="flex gap-2">
                {group.joined && (
                  <button onClick={() => inviteToGroup(group.id)} className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-4 py-2 rounded-full font-bold hover:scale-105 transition flex items-center gap-1">
                    <Plus className="w-4 h-4" />{t.invite}
                  </button>
                )}
                {group.joined ? (
                  <button onClick={() => setSelectedGroup(group.id)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition">
                    {t.open}
                  </button>
                ) : (
                  <button onClick={() => joinGroup(group.id)} className="bg-gradient-to-r from-green-400 to-teal-400 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition">
                    {t.join}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BuddyView = ({ t, user, setUser, showMatchingQuestions, setShowMatchingQuestions, selectedInterests, setSelectedInterests, selectedSupport, setSelectedSupport, getTextSizeClass }) => {
  const handleMatch = () => {
    if (selectedInterests.length === 0 || !selectedSupport) {
      setShowMatchingQuestions(true);
    } else {
      alert('🤝 Finding your perfect buddy match based on your preferences...');
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-green-400 to-teal-400 rounded-3xl p-6 text-white text-center">
        <Users className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2">{t.yourLonelinessBuddy}</h2>
        <p className="opacity-90">{t.realPerson}</p>
        <p className="text-sm opacity-75 mt-2">{t.anonymous}</p>
      </div>
      {showMatchingQuestions && (
        <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
          <h3 className="text-xl font-bold text-gray-800">{t.helpPerfectMatch}</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.interestsQuestion} ({t.selectAllApply})</label>
            <div className="grid grid-cols-2 gap-2">
              {['Music', 'Art', 'Gaming', 'Reading', 'Nature', 'Cooking', 'Sports', 'Movies'].map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`py-2 px-4 rounded-xl transition ${selectedInterests.includes(interest) ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.supportQuestion}</label>
            <div className="space-y-2">
              {['Depression', 'Anxiety', 'Loneliness', 'Stress', 'Grief', 'Life Changes'].map(option => (
                <button
                  key={option}
                  onClick={() => setSelectedSupport(option)}
                  className={`w-full py-3 px-4 rounded-xl transition text-left ${selectedSupport === option ? 'bg-gradient-to-r from-green-400 to-teal-400 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              if (selectedInterests.length > 0 && selectedSupport) {
                setUser({...user, matchingPreferences: { interests: selectedInterests, supportNeeds: [selectedSupport] }});
                setShowMatchingQuestions(false);
                alert('✨ Perfect! Finding someone who shares your interests and understands your journey...');
              }
            }}
            disabled={selectedInterests.length === 0 || !selectedSupport}
            className={`w-full py-3 rounded-xl font-bold transition ${selectedInterests.length > 0 && selectedSupport ? 'bg-gradient-to-r from-green-400 to-teal-400 text-white hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {t.findMatch} 💚
          </button>
        </div>
      )}
      <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
        <div className="text-6xl mb-4">🤝</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.readyToConnect}</h3>
        <p className="text-gray-600 mb-6">{t.matchDescription}</p>
        <button onClick={handleMatch} className="bg-gradient-to-r from-green-400 to-teal-400 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition">
          {t.matchMe} ✨
        </button>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6">
        <h3 className="font-bold text-gray-800 mb-3">{t.howItWorks}</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-purple-500">1</div>
            <p className="text-gray-700 flex-1">{t.step1}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-purple-500">2</div>
            <p className="text-gray-700 flex-1">{t.step2}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-purple-500">3</div>
            <p className="text-gray-700 flex-1">{t.step3}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ t, user, setUser, journalEntries, posts, uploadProfilePicture, getTextSizeClass }) => {
  const fileInputRef = useRef(null);
  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white text-center">
        <div className="relative inline-block">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white" />
          ) : (
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-purple-500 text-4xl font-bold">{user.name[0]}</div>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white text-purple-500 p-2 rounded-full shadow-lg hover:scale-110 transition">
            <Camera className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadProfilePicture} className="hidden" />
        </div>
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="opacity-90 mt-1">{t.memberSince}</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow">
          <div className="text-3xl font-bold text-purple-500">{user.streak}</div>
          <div className="text-sm text-gray-600 mt-1">{t.dayStreak}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow">
          <div className="text-3xl font-bold text-pink-500">{journalEntries.length}</div>
          <div className="text-sm text-gray-600 mt-1">{t.entries}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow">
          <div className="text-3xl font-bold text-green-500">0</div>
          <div className="text-sm text-gray-600 mt-1">{t.rewardsEarned}</div>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.achievements}</h3>
        <div className="space-y-3">
          {[
            { emoji: '🌱', name: t.firstStep, desc: t.madeFirstPost, locked: posts.length === 0 },
            { emoji: '🔥', name: `${user.streak} ${t.dayStreak}`, desc: t.checkInDaily, locked: user.streak < 7 },
            { emoji: '💝', name: t.kindSoul, desc: t.support10Others, locked: true },
            { emoji: '👑', name: t.consistencyKing, desc: t.thirtyDayStreak, locked: user.streak < 30 }
          ].map((badge, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${badge.locked ? 'bg-gray-100' : 'bg-gradient-to-r from-purple-100 to-pink-100'}`}>
              <div className={`text-4xl ${badge.locked ? 'grayscale opacity-50' : ''}`}>{badge.emoji}</div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{badge.name}</div>
                <div className="text-sm text-gray-600">{badge.desc}</div>
              </div>
              {badge.locked && <div className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">{t.locked}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ t, user, setUser, userLanguage, setUserLanguage, highContrast, setHighContrast, textSize, setTextSize, notificationsEnabled, requestNotifications, getTextSizeClass }) => (
  <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
    <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl p-6 text-white text-center">
      <Settings className="w-12 h-12 mx-auto mb-3" />
      <h2 className="text-2xl font-bold">{t.settings}</h2>
    </div>
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{t.chooseVibe} ✨</h3>
      <p className="text-sm text-gray-600 mb-4">{t.pickTheme}</p>
      <div className="space-y-3">
        {[
          { key: 'cute', name: 'Cute & Bubbly', emoji: '🌸', colors: 'from-pink-400 to-purple-400' },
          { key: 'goth', name: 'Dark & Mystical', emoji: '🌙', colors: 'from-gray-800 to-purple-900' },
          { key: 'emo', name: 'Emo Vibes', emoji: '🖤', colors: 'from-gray-900 to-red-900' },
          { key: 'kawaii', name: 'Kawaii Dreams', emoji: '🎀', colors: 'from-blue-400 to-pink-400' },
          { key: 'nature', name: 'Nature Peace', emoji: '🌿', colors: 'from-green-400 to-teal-400' }
        ].map(theme => (
          <button
            key={theme.key}
            onClick={() => setUser({...user, appTheme: theme.key})}
            className={`w-full p-4 rounded-2xl font-semibold transition-all duration-500 transform ${
              user.appTheme === theme.key
                ? `bg-gradient-to-r ${theme.colors} text-white scale-105 shadow-xl animate-pulse`
                : 'bg-gray-100 text-gray-700 hover:scale-102'
            }`}
          >
            <span className="text-2xl mr-3">{theme.emoji}</span>
            {theme.name}
          </button>
        ))}
      </div>
    </div>
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Globe className="w-6 h-6" />{t.language}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { code: 'en', name: 'English', flag: '🇺🇸' },
          { code: 'es', name: 'Español', flag: '🇪🇸' },
          { code: 'fr', name: 'Français', flag: '🇫🇷' },
          { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
          { code: 'pt', name: 'Português', flag: '🇵🇹' },
          { code: 'zh', name: '中文', flag: '🇨🇳' },
          { code: 'ja', name: '日本語', flag: '🇯🇵' },
          { code: 'it', name: 'Italiano', flag: '🇮🇹' }
        ].map(lang => (
          <button
            key={lang.code}
            onClick={() => setUserLanguage(lang.code)}
            className={`p-4 rounded-2xl font-semibold transition-all duration-300 ${userLanguage === lang.code ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 animate-pulse' : 'bg-gray-100 text-gray-700'}`}
          >
            <span className="text-2xl mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
    <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
      <h3 className="text-xl font-bold text-gray-800">{t.accessibility}</h3>
      <div className="flex items-center justify-between">
        <span className="text-gray-700">{t.highContrast}</span>
        <button onClick={() => setHighContrast(!highContrast)} className={`w-14 h-8 rounded-full transition ${highContrast ? 'bg-purple-500' : 'bg-gray-300'}`}>
          <div className={`w-6 h-6 bg-white rounded-full transition transform ${highContrast ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
      <div>
        <label className="block text-gray-700 mb-2">{t.textSize}</label>
        <div className="flex gap-2">
          {['small', 'medium', 'large'].map(size => (
            <button
              key={size}
              onClick={() => setTextSize(size)}
              className={`flex-1 py-2 rounded-xl transition ${textSize === size ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t[size]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-700">🔔 {t.pushNotifications}</span>
        <button onClick={requestNotifications} className={`px-4 py-2 rounded-full font-semibold transition ${notificationsEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
          {notificationsEnabled ? `${t.enabled} ✓` : t.enable}
        </button>
      </div>
    </div>
    <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
      <h3 className="text-xl font-bold text-gray-800">{t.privacy}</h3>
      <div className="flex items-center justify-between">
        <span className="text-gray-700">{t.shareAnonymously}</span>
        <button onClick={() => setUser({...user, privacy: {...user.privacy, anonymous: !user.privacy.anonymous}})} className={`w-14 h-8 rounded-full transition ${user.privacy.anonymous ? 'bg-purple-500' : 'bg-gray-300'}`}>
          <div className={`w-6 h-6 bg-white rounded-full transition transform ${user.privacy.anonymous ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-700">{t.showOnlineStatus}</span>
        <button onClick={() => setUser({...user, privacy: {...user.privacy, showOnline: !user.privacy.showOnline}})} className={`w-14 h-8 rounded-full transition ${user.privacy.showOnline ? 'bg-purple-500' : 'bg-gray-300'}`}>
          <div className={`w-6 h-6 bg-white rounded-full transition transform ${user.privacy.showOnline ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-700">{t.allowMatching}</span>
        <button onClick={() => setUser({...user, privacy: {...user.privacy, allowMatching: !user.privacy.allowMatching}})} className={`w-14 h-8 rounded-full transition ${user.privacy.allowMatching ? 'bg-purple-500' : 'bg-gray-300'}`}>
          <div className={`w-6 h-6 bg-white rounded-full transition transform ${user.privacy.allowMatching ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  </div>
);

// ✅ MAIN COMPONENT
const YRNAloneApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [userLanguage, setUserLanguage] = useState('en');
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('medium');
  const [showEmergency, setShowEmergency] = useState(false);
  
  const [user, setUser] = useState({
    id: Date.now(), name: 'Friend', streak: 1, appTheme: 'cute', profilePicture: null,
    privacy: { anonymous: false, showOnline: true, allowMatching: true },
    matchingPreferences: { interests: [], supportNeeds: [] }
  });

  const [newPost, setNewPost] = useState('');
  const [selectedMood, setSelectedMood] = useState('happy');
  const [posts, setPosts] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showPostMenu, setShowPostMenu] = useState({});

  const [journalEntry, setJournalEntry] = useState('');
  const [journalMood, setJournalMood] = useState('happy');
  const [journalSaved, setJournalSaved] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showSavedEntries, setShowSavedEntries] = useState(false);
  const [selectedJournalTheme, setSelectedJournalTheme] = useState('cute');

  const [gratitudePosts, setGratitudePosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [inviteGroupId, setInviteGroupId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [showMatchingQuestions, setShowMatchingQuestions] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedSupport, setSelectedSupport] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [teddyPosition, setTeddyPosition] = useState({ x: 20, y: 20 });
  const [showTeddyMessage, setShowTeddyMessage] = useState(false);
  const [teddyMessage, setTeddyMessage] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingGroup, setIsRecordingGroup] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [groupAudioBlob, setGroupAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimeGroup, setRecordingTimeGroup] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const [allAppUsers, setAllAppUsers] = useState([{ id: user.id, name: user.name, status: 'online' }]);
  const [groups, setGroups] = useState([
    { id: 1, name: '💙 Depression Support', members: 0, description: 'A safe space for those dealing with depression', joined: false, messages: [], membersList: [] },
    { id: 2, name: '🌊 Anxiety Support', members: 0, description: 'Share experiences and coping strategies', joined: false, messages: [], membersList: [] },
    { id: 3, name: '🕊️ PTSD Support', members: 0, description: 'Support for those healing from trauma', joined: false, messages: [], membersList: [] },
    { id: 4, name: '🌸 Grief & Loss', members: 0, description: 'Navigate grief together', joined: false, messages: [], membersList: [] },
    { id: 5, name: '💪 Addiction Recovery', members: 0, description: 'Support for recovery journey', joined: false, messages: [], membersList: [] },
    { id: 6, name: '🌓 Bipolar Support', members: 0, description: 'Community for bipolar disorder', joined: false, messages: [], membersList: [] },
    { id: 7, name: '🌺 Eating Disorders', members: 0, description: 'Healing relationship with food', joined: false, messages: [], membersList: [] },
    { id: 8, name: '🔄 OCD Support', members: 0, description: 'Living with OCD', joined: false, messages: [], membersList: [] },
    { id: 9, name: '🤱 Postpartum Support', members: 0, description: 'Support for new mothers', joined: false, messages: [], membersList: [] },
    { id: 10, name: '🌈 LGBTQ+ Support', members: 0, description: 'Safe space for LGBTQ+ community', joined: false, messages: [], membersList: [] },
    { id: 11, name: '🆘 Crisis & Suicidal Thoughts', members: 0, description: 'Immediate support for those in crisis', joined: false, messages: [], membersList: [] }
  ]);

  const t = translations[userLanguage] || translations.en;

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const uniqueUsers = new Set();
    uniqueUsers.add(user.name);
    posts.forEach(post => { if (post.author !== 'Anonymous') uniqueUsers.add(post.author); });
    groups.forEach(group => { group.membersList.forEach(member => uniqueUsers.add(member.name)); });
    const newUsersList = Array.from(uniqueUsers).map((name, index) => ({
      id: index + 1, name: name, status: Math.random() > 0.5 ? 'online' : 'offline'
    }));
    setAllAppUsers(newUsersList);
  }, [posts, groups, user.name]);

  useEffect(() => {
    const moveTeddy = setInterval(() => {
      setTeddyPosition(prev => ({
        x: Math.max(0, Math.min(90, prev.x + (Math.random() - 0.5) * 15)),
        y: Math.max(0, Math.min(85, prev.y + (Math.random() - 0.5) * 15))
      }));
    }, 3000);
    return () => clearInterval(moveTeddy);
  }, []);

  useEffect(() => {
    const messages = ["You're doing great! 💜", "I'm here with you 🧸", "You matter so much!", "Proud of you today! ✨", "You're never alone 💙"];
    const showMessage = setInterval(() => {
      setTeddyMessage(messages[Math.floor(Math.random() * messages.length)]);
      setShowTeddyMessage(true);
      setTimeout(() => setShowTeddyMessage(false), 3000);
    }, 10000);
    return () => clearInterval(showMessage);
  }, []);

  const startRecording = async (forGroup = false) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('❌ Voice recording is not supported in your browser. Please use Chrome, Firefox, or Safari.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          alert('❌ Recording failed - no audio data captured. Please try again.');
          return;
        }
        if (forGroup) {
          setGroupAudioBlob(blob);
        } else {
          setAudioBlob(blob);
        }
        stream.getTracks().forEach(track => track.stop());
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      mediaRecorder.start(1000);
      
      if (forGroup) {
        setRecordingTimeGroup(0);
        setIsRecordingGroup(true);
      } else {
        setRecordingTime(0);
        setIsRecording(true);
      }
      
      recordingTimerRef.current = setInterval(() => {
        if (forGroup) {
          setRecordingTimeGroup(prev => prev + 1);
        } else {
          setRecordingTime(prev => prev + 1);
        }
      }, 1000);
      
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        alert('🎤 Microphone Access Needed!\n\n✅ ALLOW the microphone when your browser asks!\n\nIf you already blocked it:\n1. Click the 🔒 lock icon in your address bar\n2. Find "Microphone" and set to "Allow"\n3. Refresh the page (F5)\n4. Try recording again!');
      } else if (error.name === 'NotFoundError') {
        alert('❌ No microphone found!\n\nPlease connect a microphone and try again.');
      } else {
        alert('❌ Could not access microphone:\n' + error.message);
      }
    }
  };

  const stopRecording = (forGroup = false) => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recorder:', error);
      }
    }
    if (forGroup) {
      setIsRecordingGroup(false);
    } else {
      setIsRecording(false);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTextSizeClass = () => {
    switch(textSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const addPost = (content, mood, isVoice = false) => {
    const newPostObj = {
      id: Date.now(), content, mood, isVoice,
      author: user.privacy.anonymous ? 'Anonymous' : user.name,
      authorPicture: user.privacy.anonymous ? null : user.profilePicture,
      timestamp: new Date().toISOString(),
      reactions: { heart: 0, hug: 0, star: 0, fire: 0 },
      comments: []
    };
    setPosts(prevPosts => [newPostObj, ...prevPosts]);
  };

  const addComment = (postId, commentTextValue) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now(), text: commentTextValue,
            author: user.privacy.anonymous ? 'Anonymous' : user.name,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return post;
    }));
  };

  const reactToPost = (postId, reactionType) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, reactions: { ...post.reactions, [reactionType]: post.reactions[reactionType] + 1 } };
      }
      return post;
    }));
  };

  const addGratitude = (content) => {
    setGratitudePosts([{ id: Date.now(), content, timestamp: new Date().toISOString() }, ...gratitudePosts]);
  };

  const saveJournalEntry = (entry) => {
    setJournalEntries(prevEntries => [entry, ...prevEntries]);
  };

  const joinGroup = (groupId) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, joined: true, members: g.members + 1, membersList: [...g.membersList, { id: user.id, name: user.name }] };
      }
      return g;
    }));
  };

  const inviteToGroup = (groupId) => {
    setInviteGroupId(groupId);
    setShowInviteModal(true);
  };

  const sendInvite = (userId) => {
    const group = groups.find(g => g.id === inviteGroupId);
    const userToInvite = allAppUsers.find(u => u.id === userId);
    if (!userToInvite) return;
    const alreadyMember = group.membersList.some(m => m.id === userId);
    if (alreadyMember) {
      alert(`${userToInvite.name} is already in ${group.name}!`);
      return;
    }
    setGroups(groups.map(g => {
      if (g.id === inviteGroupId) {
        return { ...g, members: g.members + 1, membersList: [...g.membersList, { id: userId, name: userToInvite.name }] };
      }
      return g;
    }));
    alert(`✉️ ${userToInvite.name} has been invited to ${group.name}!`);
    setShowInviteModal(false);
    setInviteSearchQuery('');
  };

  const filterUsers = (query) => {
    if (!query.trim()) return allAppUsers.filter(u => u.id !== user.id);
    return allAppUsers.filter(u => u.id !== user.id && u.name.toLowerCase().includes(query.toLowerCase()));
  };

  const sendGroupMessage = (groupId, message, isVoice = false) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          messages: [...g.messages, {
            id: Date.now(), text: message, isVoice,
            author: user.privacy.anonymous ? 'Anonymous' : user.name,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return g;
    }));
  };

  const blockUser = (userId, userName) => {
    setBlockedUsers([...blockedUsers, { id: userId, name: userName, blockedAt: new Date().toISOString() }]);
    setPosts(posts.filter(post => post.author !== userName));
  };

  const reportContent = (contentId, contentType, reason) => {
    setReportedContent([...reportedContent, {
      id: Date.now(), contentId, contentType, reason, reportedAt: new Date().toISOString()
    }]);
    alert('Thank you for reporting. Our team will review this content. 💜');
  };

  const uploadProfilePicture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setUser({...user, profilePicture: reader.result}); };
      reader.readAsDataURL(file);
    }
  };

  const requestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          alert('🔔 Notifications enabled!');
        }
      });
    }
  };

  const renderView = () => {
    switch(currentView) {
      case 'home': return <HomeView t={t} user={user} selectedMood={selectedMood} setSelectedMood={setSelectedMood} isRecording={isRecording} recordingTime={recordingTime} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} audioBlob={audioBlob} setAudioBlob={setAudioBlob} newPost={newPost} setNewPost={setNewPost} addPost={addPost} posts={posts} showComments={showComments} setShowComments={setShowComments} commentText={commentText} setCommentText={setCommentText} addComment={addComment} reactToPost={reactToPost} showPostMenu={showPostMenu} setShowPostMenu={setShowPostMenu} reportContent={reportContent} blockUser={blockUser} allAppUsers={allAppUsers} setCurrentView={setCurrentView} journalEntries={journalEntries} groups={groups} challenges={challenges} getTextSizeClass={getTextSizeClass} setShowEmergency={setShowEmergency} />;
      case 'journal': return <JournalView t={t} journalEntry={journalEntry} setJournalEntry={setJournalEntry} journalMood={journalMood} setJournalMood={setJournalMood} journalSaved={journalSaved} selectedJournalTheme={selectedJournalTheme} setSelectedJournalTheme={setSelectedJournalTheme} showSavedEntries={showSavedEntries} setShowSavedEntries={setShowSavedEntries} journalEntries={journalEntries} editingEntry={editingEntry} setEditingEntry={setEditingEntry} saveJournalEntry={saveJournalEntry} setJournalSaved={setJournalSaved} getTextSizeClass={getTextSizeClass} />;
      case 'gratitude': return <GratitudeView t={t} gratitudePosts={gratitudePosts} addGratitude={addGratitude} getTextSizeClass={getTextSizeClass} />;
      case 'groups': return <GroupsView t={t} groups={groups} setGroups={setGroups} user={user} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} searchQuery={searchQuery} setSearchQuery={setSearchQuery} inviteToGroup={inviteToGroup} joinGroup={joinGroup} sendGroupMessage={sendGroupMessage} isRecordingGroup={isRecordingGroup} recordingTimeGroup={recordingTimeGroup} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} groupAudioBlob={groupAudioBlob} setGroupAudioBlob={setGroupAudioBlob} getTextSizeClass={getTextSizeClass} />;
      case 'buddy': return <BuddyView t={t} user={user} setUser={setUser} showMatchingQuestions={showMatchingQuestions} setShowMatchingQuestions={setShowMatchingQuestions} selectedInterests={selectedInterests} setSelectedInterests={setSelectedInterests} selectedSupport={selectedSupport} setSelectedSupport={setSelectedSupport} getTextSizeClass={getTextSizeClass} />;
      case 'profile': return <ProfileView t={t} user={user} setUser={setUser} journalEntries={journalEntries} posts={posts} uploadProfilePicture={uploadProfilePicture} getTextSizeClass={getTextSizeClass} />;
      case 'settings': return <SettingsView t={t} user={user} setUser={setUser} userLanguage={userLanguage} setUserLanguage={setUserLanguage} highContrast={highContrast} setHighContrast={setHighContrast} textSize={textSize} setTextSize={setTextSize} notificationsEnabled={notificationsEnabled} requestNotifications={requestNotifications} getTextSizeClass={getTextSizeClass} />;
      default: return <HomeView t={t} user={user} selectedMood={selectedMood} setSelectedMood={setSelectedMood} isRecording={isRecording} recordingTime={recordingTime} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} audioBlob={audioBlob} setAudioBlob={setAudioBlob} newPost={newPost} setNewPost={setNewPost} addPost={addPost} posts={posts} showComments={showComments} setShowComments={setShowComments} commentText={commentText} setCommentText={setCommentText} addComment={addComment} reactToPost={reactToPost} showPostMenu={showPostMenu} setShowPostMenu={setShowPostMenu} reportContent={reportContent} blockUser={blockUser} allAppUsers={allAppUsers} setCurrentView={setCurrentView} journalEntries={journalEntries} groups={groups} challenges={challenges} getTextSizeClass={getTextSizeClass} setShowEmergency={setShowEmergency} />;
    }
  };

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black' : user.appTheme === 'goth' ? 'bg-gray-900' : user.appTheme === 'emo' ? 'bg-gray-800' : user.appTheme === 'nature' ? 'bg-green-50' : user.appTheme === 'kawaii' ? 'bg-pink-50' : 'bg-gray-50'} pb-32 transition-all duration-500`}>
      {showEmergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-3">💜</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">You're Not Alone</h2>
              <p className="text-gray-600">We're here for you. Please reach out:</p>
            </div>
            <div className="space-y-3">
              <a href="tel:988" className="block w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-center hover:scale-105 transition">📞 Call 988 - Suicide & Crisis Lifeline</a>
              <a href="sms:741741" className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-center hover:scale-105 transition">💬 Text HELLO to 741741</a>
            </div>
            <button onClick={() => setShowEmergency(false)} className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-300 transition">Close</button>
          </div>
        </div>
      )}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t.inviteFriends}</h2>
              <button onClick={() => { setShowInviteModal(false); setInviteSearchQuery(''); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={inviteSearchQuery} onChange={(e) => setInviteSearchQuery(e.target.value)} placeholder={t.searchUsers} className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none" autoFocus />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filterUsers(inviteSearchQuery).length === 0 ? (
                <p className="text-center text-gray-500 py-4">{t.noUsersFound}</p>
              ) : (
                filterUsers(inviteSearchQuery).map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">{u.name[0]}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {u.status}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => sendInvite(u.id)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition">
                      {t.invite}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      <div className="fixed z-50 cursor-pointer transition-all duration-1000" style={{ left: `${teddyPosition.x}%`, top: `${teddyPosition.y}%`, transform: 'translate(-50%, -50%)' }}>
        <div className="relative">
          <div className="text-6xl animate-bounce">🧸</div>
          {showTeddyMessage && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-2xl p-3 shadow-lg whitespace-nowrap animate-fade-in">
              <div className="text-sm font-semibold text-purple-600">{teddyMessage}</div>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-4xl mx-auto">{renderView()}</div>
      <nav className={`fixed bottom-0 left-0 right-0 border-t transition-all duration-500 ${highContrast ? 'bg-gray-900 border-gray-700' : user.appTheme === 'goth' ? 'bg-gray-800 border-gray-700' : user.appTheme === 'emo' ? 'bg-gray-900 border-red-900' : user.appTheme === 'nature' ? 'bg-green-100 border-green-200' : user.appTheme === 'kawaii' ? 'bg-pink-100 border-pink-200' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto flex justify-around">
          {[
            { view: 'home', icon: Home, label: t.home },
            { view: 'journal', icon: Book, label: t.journal },
            { view: 'groups', icon: Users, label: t.groups },
            { view: 'buddy', icon: Heart, label: t.buddy },
            { view: 'profile', icon: User, label: t.you }
          ].map(item => (
            <button key={item.view} onClick={() => setCurrentView(item.view)} className={`flex-1 py-3 flex flex-col items-center transition ${currentView === item.view ? user.appTheme === 'goth' || user.appTheme === 'emo' ? 'text-purple-400' : user.appTheme === 'nature' ? 'text-green-600' : user.appTheme === 'kawaii' ? 'text-pink-500' : 'text-purple-500' : highContrast ? 'text-gray-400' : user.appTheme === 'goth' || user.appTheme === 'emo' ? 'text-gray-400' : 'text-gray-500'}`}>
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <button onClick={() => setCurrentView('settings')} className="fixed top-4 right-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white p-3 rounded-full shadow-lg hover:scale-110 transition z-40">
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};

export default YRNAloneApp;