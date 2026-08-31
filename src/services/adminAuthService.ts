export interface AdminAccount {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  roleTitle: string;
  savedInBackend: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export const MAX_ADMIN_ACCOUNTS = 4;

const ADMIN_STORAGE_KEY = 'saanvya_registered_admins_v1';
const CURRENT_SESSION_KEY = 'saanvya_current_admin_session_v1';
const PERSISTENT_SESSION_KEY = 'saanvya_persistent_admin_session_v1';

// Simple hashing function for stored credentials
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `admin_hash_${Math.abs(hash)}_${password.length}`;
}

export function getRegisteredAdmins(): AdminAccount[] {
  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading admin accounts:', err);
    return [];
  }
}

function saveRegisteredAdmins(admins: AdminAccount[]): void {
  try {
    // Only persist admins that opted in to be saved in backend
    const toPersist = admins.filter(a => a.savedInBackend);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(toPersist));
  } catch (err) {
    console.error('Error saving admin accounts:', err);
  }
}

export function getAdminCount(): number {
  return getRegisteredAdmins().length;
}

export function isMaxAdminsReached(): boolean {
  return getRegisteredAdmins().length >= MAX_ADMIN_ACCOUNTS;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  admin?: AdminAccount;
}

export function registerAdmin(params: {
  email: string;
  password: string;
  fullName: string;
  roleTitle?: string;
  saveInBackend: boolean;
}): AuthResult {
  const normalizedEmail倍 = params.email.trim().toLowerCase();
  const trimmedPassword = params.password.trim();
  const trimmedName = params.fullName.trim();

  if (!normalizedEmail倍 || !trimmedPassword) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (trimmedPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters in length.' };
  }

  const existingAdmins = getRegisteredAdmins();

  if (existingAdmins.length >= MAX_ADMIN_ACCOUNTS) {
    return {
      success: false,
      error: `Maximum administrator capacity reached (${MAX_ADMIN_ACCOUNTS}/${MAX_ADMIN_ACCOUNTS} accounts registered).`,
    };
  }

  const alreadyExists = existingAdmins.some(a => a.email.toLowerCase() === normalizedEmail倍);
  if (alreadyExists) {
    return {
      success: false,
      error: 'An administrator account with this email address is already registered.',
    };
  }

  const newAdmin: AdminAccount = {
    id: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail倍,
    passwordHash: hashPassword(trimmedPassword),
    fullName: trimmedName || 'Atelier Administrator',
    roleTitle: params.roleTitle?.trim() || 'Atelier Manager',
    savedInBackend: params.saveInBackend,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const updatedAdmins = [...existingAdmins, newAdmin];
  saveRegisteredAdmins(updatedAdmins);

  // Set session
  setAdminSession(newAdmin, params.saveInBackend);

  return { success: true, admin: newAdmin };
}

export function loginAdmin(
  email: string,
  password: string,
  saveInBackend: boolean
): AuthResult {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { success: false, error: 'Please enter both your email and password.' };
  }

  const admins = getRegisteredAdmins();
  const expectedHash = hashPassword(trimmedPassword);

  const matchedAdmin = admins.find(
    a => a.email.toLowerCase() === normalizedEmail && a.passwordHash === expectedHash
  );

  if (!matchedAdmin) {
    return {
      success: false,
      error: 'Invalid administrator email or password. Please verify your credentials.',
    };
  }

  // Update last login
  matchedAdmin.lastLoginAt = new Date().toISOString();
  matchedAdmin.savedInBackend = saveInBackend;
  saveRegisteredAdmins(admins);

  // Set session
  setAdminSession(matchedAdmin, saveInBackend);

  return { success: true, admin: matchedAdmin };
}

export function setAdminSession(admin: AdminAccount, saveInBackend: boolean): void {
  const sessionData = JSON.stringify({
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    roleTitle: admin.roleTitle,
    loggedInAt: new Date().toISOString(),
  });

  // Always set active session
  sessionStorage.setItem('saanvya_admin_auth', 'true');
  sessionStorage.setItem(CURRENT_SESSION_KEY, sessionData);

  if (saveInBackend) {
    localStorage.setItem(PERSISTENT_SESSION_KEY, sessionData);
  } else {
    localStorage.removeItem(PERSISTENT_SESSION_KEY);
  }
}

export function getCurrentAdminSession(): {
  id: string;
  email: string;
  fullName: string;
  roleTitle: string;
} | null {
  try {
    const isAuth = sessionStorage.getItem('saanvya_admin_auth') === 'true';
    const active = sessionStorage.getItem(CURRENT_SESSION_KEY);
    const persistent = localStorage.getItem(PERSISTENT_SESSION_KEY);

    if (isAuth && active) {
      return JSON.parse(active);
    }
    if (persistent) {
      const parsed = JSON.parse(persistent);
      sessionStorage.setItem('saanvya_admin_auth', 'true');
      sessionStorage.setItem(CURRENT_SESSION_KEY, persistent);
      return parsed;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export function isCurrentAdminAuthenticated(): boolean {
  return getCurrentAdminSession() !== null;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem('saanvya_admin_auth');
  sessionStorage.removeItem(CURRENT_SESSION_KEY);
  localStorage.removeItem(PERSISTENT_SESSION_KEY);
}

export function deleteAdminAccount(adminId: string): boolean {
  const admins = getRegisteredAdmins();
  const filtered = admins.filter(a => a.id !== adminId);
  if (filtered.length !== admins.length) {
    saveRegisteredAdmins(filtered);
    return true;
  }
  return false;
}
