/**
 * Safe wrappers around localStorage for the keys used by the app.
 * Includes JSON parsing with try/catch to avoid app crash on corrupted data.
 */

const STORAGE_USERS_KEY = 'thinktest_users_v1';
const STORAGE_SESS_KEY  = 'thinktest_session_v1';
const STORAGE_ANS_KEY   = 'thinktest_answers_v1';

export function loadUsers(defaults = []) {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(defaults));
      return defaults.slice();
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('loadUsers parse error', e);
    return defaults.slice();
  }
}

export function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('saveUsers error', e);
  }
}

export function loadSession() {
  try {
    const s = localStorage.getItem(STORAGE_SESS_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    console.error('loadSession parse error', e);
    return null;
  }
}

export function saveSession(obj) {
  try {
    localStorage.setItem(STORAGE_SESS_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('saveSession error', e);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_SESS_KEY);
  } catch (e) {
    console.error('clearSession error', e);
  }
}

export function loadAllAnswers() {
  try {
    const raw = localStorage.getItem(STORAGE_ANS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('loadAllAnswers parse error', e);
    return {};
  }
}

export function saveAllAnswers(obj) {
  try {
    localStorage.setItem(STORAGE_ANS_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error('saveAllAnswers error', e);
  }
}
