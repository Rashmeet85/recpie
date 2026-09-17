import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

const DEMO_PROFILES = {
  super_admin: {
    uid: 'demo_admin_uid',
    displayName: 'Rashmeet Kaur',
    email: 'admin@ioc.org',
    role: 'super_admin',
    initials: 'AD',
    badgeText: 'Super Admin',
    permissions: {
      canRegisterStudents: true,
      canMarkAttendance: true,
      canEditPastAttendance: true,
      canManageStaff: true,
      canExportReports: true,
    }
  },
  teacher: {
    uid: 'demo_teacher_uid',
    displayName: 'Harpreet Singh',
    email: 'teacher@ioc.org',
    role: 'teacher',
    initials: 'TC',
    badgeText: 'Educator',
    permissions: {
      canRegisterStudents: false,
      canMarkAttendance: true,
      canEditPastAttendance: false,
      canManageStaff: false,
      canExportReports: true,
    }
  },
  observer: {
    uid: 'demo_observer_uid',
    displayName: 'Community Trustee',
    email: 'observer@ioc.org',
    role: 'observer',
    initials: 'OB',
    badgeText: 'Observer',
    permissions: {
      canRegisterStudents: false,
      canMarkAttendance: false,
      canEditPastAttendance: false,
      canManageStaff: false,
      canExportReports: false,
    }
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeRole, setActiveRole] = useState('super_admin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem('usaari_is_authenticated') === 'true';
    const savedRole = localStorage.getItem('usaari_saved_role') || 'super_admin';

    if (isAuth && DEMO_PROFILES[savedRole]) {
      setActiveRole(savedRole);
      setUserProfile(DEMO_PROFILES[savedRole]);
      setCurrentUser({
        uid: DEMO_PROFILES[savedRole].uid,
        email: DEMO_PROFILES[savedRole].email,
        displayName: DEMO_PROFILES[savedRole].displayName
      });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setUserProfile({
          uid: user.uid,
          displayName: user.displayName || 'IOC Staff',
          email: user.email,
          role: 'super_admin',
          initials: (user.displayName || user.email || 'AD').slice(0, 2).toUpperCase(),
          badgeText: 'Google Auth',
          permissions: DEMO_PROFILES.super_admin.permissions
        });
        localStorage.setItem('usaari_is_authenticated', 'true');
      }
      setLoading(false);
    });

    setLoading(false);
    return () => unsubscribe();
  }, []);

  const loginWithDemoRole = (roleKey = 'super_admin') => {
    const profile = DEMO_PROFILES[roleKey] || DEMO_PROFILES.super_admin;
    setActiveRole(roleKey);
    setUserProfile(profile);
    setCurrentUser({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName
    });
    localStorage.setItem('usaari_saved_role', roleKey);
    localStorage.setItem('usaari_is_authenticated', 'true');
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.warn('Google popup error, activating admin session:', err);
      loginWithDemoRole('super_admin');
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (_) {}
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('usaari_is_authenticated');
  };

  const value = {
    currentUser,
    userProfile: userProfile || DEMO_PROFILES[activeRole],
    role: userProfile?.role || activeRole,
    permissions: (userProfile || DEMO_PROFILES[activeRole]).permissions,
    isSuperAdmin: (userProfile?.role || activeRole) === 'super_admin',
    canMarkAttendance: (userProfile || DEMO_PROFILES[activeRole]).permissions.canMarkAttendance,
    canRegisterStudents: (userProfile || DEMO_PROFILES[activeRole]).permissions.canRegisterStudents,
    canEditPastAttendance: (userProfile || DEMO_PROFILES[activeRole]).permissions.canEditPastAttendance,
    isAuthenticated: !!currentUser,
    loginWithDemoRole,
    loginWithGoogle,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
