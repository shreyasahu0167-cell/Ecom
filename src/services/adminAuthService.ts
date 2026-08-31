import { validatePasswordPolicy } from '../utils/passwordValidation';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';

export interface AdminAccount {
  id: string;
  email: string;
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

export function getRegisteredAdmins(): AdminAccount[] {
  // Never expose or store password hashes in client storage
  if (!isDemoMode && !isSupabaseConfigured) {
    return [];
  }

  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    // Sanitize in case old versions had password hashes
    return parsed.map((item: any) => ({
      id: item.id || `admin-${Math.random().toString(36).substr(2, 6)}`,
      email: item.email || '',
      fullName: item.fullName || 'Atelier Administrator',
      roleTitle: item.roleTitle || 'Atelier Manager',
      savedInBackend: Boolean(item.savedInBackend),
      createdAt: item.createdAt || new Date().toISOString(),
      lastLoginAt: item.lastLoginAt,
    }));
  } catch {
    return [];
  }
}

function saveRegisteredAdmins(admins: AdminAccount[]): void {
  try {
    // Only persist non-sensitive admin profile metadata (no passwords)
    const sanitized = admins.map(a => ({
      id: a.id,
      email: a.email,
      fullName: a.fullName,
      roleTitle: a.roleTitle,
      savedInBackend: a.savedInBackend,
      createdAt: a.createdAt,
      lastLoginAt: a.lastLoginAt,
    }));
    const toPersist = sanitized.filter(a => a.savedInBackend);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(toPersist));
  } catch {
    // Ignore storage quota errors
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
  const normalizedEmail = params.email.trim().toLowerCase();
  const trimmedPassword = params.password.trim();
  const trimmedName = params.fullName.trim();

  if (!normalizedEmail || !trimmedPassword) {
    return { success: false, error: 'Email and password are required.' };
  }

  const validation = validatePasswordPolicy(trimmedPassword);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error || 'Password does not meet required security criteria.',
    };
  }

  if (!isSupabaseConfigured && !isDemoMode) {
    return {
      success: false,
      error: 'Admin registration is unavailable because Supabase is not configured and Demo Mode is disabled.',
    };
  }

  const existingAdmins = getRegisteredAdmins();

  if (existingAdmins.length >= MAX_ADMIN_ACCOUNTS) {
    return {
      success: false,
      error: `Maximum administrator capacity reached (${MAX_ADMIN_ACCOUNTS}/${MAX_ADMIN_ACCOUNTS} accounts registered).`,
    };
  }

  const alreadyExists = existingAdmins.some(a => a.email.toLowerCase() === normalizedEmail);
  if (alreadyExists) {
    return {
      success: false,
      error: 'An administrator account with this email address is already registered.',
    };
  }

  // Record admin account metadata without password or hash
  const newAdmin: AdminAccount = {
    id: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    fullName: trimmedName || 'Atelier Administrator',
    roleTitle: params.roleTitle?.trim() || 'Atelier Manager',
    savedInBackend: params.saveInBackend,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const updatedAdmins = [...existingAdmins, newAdmin];
  saveRegisteredAdmins(updatedAdmins);
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

  if (!isSupabaseConfigured && !isDemoMode) {
    return {
      success: false,
      error: 'Admin authentication is unavailable because Supabase is not configured and Demo Mode is disabled.',
    };
  }

  const admins = getRegisteredAdmins();
  const matchedAdmin = admins.find(a => a.email.toLowerCase() === normalizedEmail);

  if (!matchedAdmin && !isDemoMode) {
    return {
      success: false,
      error: 'Invalid administrator email or password.',
    };
  }

  const activeAdmin: AdminAccount = matchedAdmin || {
    id: `admin-${Date.now()}`,
    email: normalizedEmail,
    fullName: 'Atelier Administrator',
    roleTitle: 'Atelier Manager',
    savedInBackend: saveInBackend,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  activeAdmin.lastLoginAt = new Date().toISOString();
  activeAdmin.savedInBackend = saveInBackend;

  if (matchedAdmin) {
    saveRegisteredAdmins(admins);
  }

  setAdminSession(activeAdmin, saveInBackend);
  return { success: true, admin: activeAdmin };
}

export function setAdminSession(admin: AdminAccount, saveInBackend: boolean): void {
  const sessionData = JSON.stringify({
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    roleTitle: admin.roleTitle,
    loggedInAt: new Date().toISOString(),
  });

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
    if (persistent && isDemoMode) {
      const parsed = JSON.parse(persistent);
      sessionStorage.setItem('saanvya_admin_auth', 'true');
      sessionStorage.setItem(CURRENT_SESSION_KEY, persistent);
      return parsed;
    }
    return null;
  } catch {
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

// In-memory temporary reset codes cache for demo simulation
interface PasswordResetEntry {
  code: string;
  expiresAt: number;
}

const resetCodesMap = new Map<string, PasswordResetEntry>();

export function requestAdminPasswordReset(email: string): {
  success: boolean;
  error?: string;
  resetCode?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { success: false, error: 'Please enter a valid administrator email address.' };
  }

  if (!isDemoMode && !isSupabaseConfigured) {
    return {
      success: false,
      error: 'Password recovery unavailable when Supabase is not configured and Demo Mode is disabled.',
    };
  }

  // Generate 6-digit secure recovery code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodesMap.set(normalizedEmail, {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  return {
    success: true,
    resetCode: code,
  };
}

export function verifyAdminResetCodeAndSetPassword(
  email: string,
  code: string,
  newPassword: string
): { success: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCode = code.trim();
  const trimmedPassword = newPassword.trim();

  if (!isDemoMode && !isSupabaseConfigured) {
    return {
      success: false,
      error: 'Password reset is disabled in production without Supabase Auth.',
    };
  }

  const entry = resetCodesMap.get(normalizedEmail);
  if (!entry) {
    return {
      success: false,
      error: 'No active recovery request found for this email. Please request a new recovery code.',
    };
  }

  if (Date.now() > entry.expiresAt) {
    resetCodesMap.delete(normalizedEmail);
    return {
      success: false,
      error: 'Recovery verification code has expired. Please request a new one.',
    };
  }

  if (entry.code !== trimmedCode) {
    return {
      success: false,
      error: 'Invalid recovery verification code. Please check and try again.',
    };
  }

  const validation = validatePasswordPolicy(trimmedPassword);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error || 'Password does not meet required security criteria.',
    };
  }

  resetCodesMap.delete(normalizedEmail);
  return { success: true };
}
