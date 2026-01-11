// FILE: src/services/translationUtils.js
// 🌐 TASK 4: Auto-Translation Utilities for Groups & Messages
// Built with love by Jess & Claudia

import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './translations';

// Language names for display
export const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  ht: 'Haitian Creole'
};

// Get language name from code
export const getLanguageName = (code) => LANGUAGE_NAMES[code] || code;

// Create a post/message with original language info
export const createTranslatableContent = (text, authorLanguage = 'en') => {
  return {
    text,
    originalLanguage: authorLanguage,
    createdAt: new Date().toISOString()
  };
};

// Simple translation cache (would use API in production)
const translationCache = new Map();

// Get cache key
const getCacheKey = (text, fromLang, toLang) => `${fromLang}:${toLang}:${text.substring(0, 50)}`;

// Basic translation function (uses fallback for demo)
// In production, this would call Google Translate API or similar
export const translateText = async (text, fromLang, toLang) => {
  if (fromLang === toLang) return text;

  // Check cache first
  const cacheKey = getCacheKey(text, fromLang, toLang);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // In production, call a translation API like:
    // const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`);
    // const data = await response.json();
    // return data.responseData.translatedText;

    // For now, we'll return the original text with a note
    // This preserves the functionality while allowing real API integration later
    const result = text; // In production: translated text
    translationCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original on error
  }
};

// Check if content needs translation for user
export const needsTranslation = (content, userLanguage) => {
  if (!content?.originalLanguage || !userLanguage) return false;
  return content.originalLanguage !== userLanguage;
};

// Translation display component props generator
export const getTranslationDisplayProps = (content, userLanguage) => {
  const needs = needsTranslation(content, userLanguage);

  return {
    needsTranslation: needs,
    originalLanguage: content?.originalLanguage || 'en',
    originalLanguageName: getLanguageName(content?.originalLanguage || 'en'),
    userLanguage,
    showTranslationBanner: needs
  };
};

// Helper to add translation metadata when saving
export const addTranslationMetadata = (data, authorLanguage) => {
  return {
    ...data,
    originalLanguage: authorLanguage || 'en',
    createdAt: data.createdAt || new Date().toISOString()
  };
};

// Format translation banner text
export const getTranslationBannerText = (originalLang, t) => {
  const langName = getLanguageName(originalLang);
  const translatedFrom = t?.translatedFrom || 'Translated from';
  const seeOriginal = t?.seeOriginal || 'See original';

  return {
    translatedFrom: `${translatedFrom} ${langName}`,
    seeOriginal
  };
};

// Note: For React hook usage, import useState in your component:
// import { useState } from 'react';
//
// Example usage in component:
// const [showOriginal, setShowOriginal] = useState(false);
// const props = getTranslationDisplayProps(content, userLanguage);
// if (props.needsTranslation) { /* show banner */ }

// Export translation banner component as a function that returns JSX props
export const TranslationBanner = (originalLanguage, userLanguage, onToggle, showingOriginal, t = {}) => {
  if (originalLanguage === userLanguage) return null;

  const bannerText = getTranslationBannerText(originalLanguage, t);

  return {
    show: true,
    text: bannerText.translatedFrom,
    toggleText: showingOriginal ? bannerText.seeTranslated : bannerText.seeOriginal,
    icon: '🌐',
    onClick: onToggle
  };
};

export default {
  LANGUAGE_NAMES,
  getLanguageName,
  createTranslatableContent,
  translateText,
  needsTranslation,
  getTranslationDisplayProps,
  addTranslationMetadata,
  getTranslationBannerText,
  useTranslation,
  TranslationBanner
};
