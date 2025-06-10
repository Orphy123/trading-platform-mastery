// src/utils/theme.js

/**
 * Theme utilities for the Trading Assistant Platform
 */

const THEME_KEY = 'trading_assistant_theme';
const SYSTEM_PREFERENCE_QUERY = '(prefers-color-scheme: dark)';

/**
 * Get the current theme preference
 * @returns {string} 'dark', 'light', or 'system'
 */
export function getThemePreference() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  return savedTheme || 'system';
}

/**
 * Set the theme preference
 * @param {string} theme - Theme to set: 'dark', 'light', or 'system'
 */
export function setThemePreference(theme) {
  if (theme === 'dark' || theme === 'light' || theme === 'system') {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }
}

/**
 * Apply the current theme to the document
 * @param {string} theme - Theme to apply
 */
export function applyTheme(theme) {
  // If system preference, check OS setting
  const isDark = theme === 'system'
    ? window.matchMedia(SYSTEM_PREFERENCE_QUERY).matches
    : theme === 'dark';
  
  // Apply or remove dark class from document
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Initialize theme system
 */
export function initializeTheme() {
  const currentTheme = getThemePreference();
  applyTheme(currentTheme);
  
  // Listen for system preference changes
  const mediaQuery = window.matchMedia(SYSTEM_PREFERENCE_QUERY);
  
  mediaQuery.addEventListener('change', (event) => {
    if (getThemePreference() === 'system') {
      applyTheme('system');
    }
  });
}

/**
 * Get the opposite of the current theme
 * @returns {string} 'dark' or 'light'
 */
export function getOppositeTheme() {
  const currentTheme = getThemePreference();
  
  // For system preference, check the current applied theme
  if (currentTheme === 'system') {
    return document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  }
  
  // Otherwise return the opposite
  return currentTheme === 'dark' ? 'light' : 'dark';
}

/**
 * Toggle between light and dark themes
 * If system preference is active, this will override it to the opposite of the current theme
 */
export function toggleTheme() {
  const currentTheme = getThemePreference();
  const isDarkActive = document.documentElement.classList.contains('dark');
  
  if (currentTheme === 'system') {
    // If using system preference, override to the opposite theme
    setThemePreference(isDarkActive ? 'light' : 'dark');
  } else {
    // Otherwise toggle between light and dark
    setThemePreference(currentTheme === 'dark' ? 'light' : 'dark');
  }
}

/**
 * Get theme-specific Tailwind classes
 * @param {Object} options - Classes for different themes
 * @param {string} options.light - Classes for light theme
 * @param {string} options.dark - Classes for dark theme
 * @param {string} options.base - Base classes for both themes
 * @returns {string} Combined class string
 */
export function themeClasses({ light = '', dark = '', base = '' }) {
  return `${base} ${light} dark:${dark}`.trim();
}