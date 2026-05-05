/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserBalance } from '../types';
import { isMobile } from 'react-device-detect';
import axios from 'axios';
import i18n, { getLanguageByCountry } from '../i18n/config';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  balance: UserBalance | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        let docSnap;
        try {
          docSnap = await getDoc(docRef);
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
          return;
        }

        if (!docSnap.exists()) {
          let country = 'US';
          let detectedLang = i18n.language || 'en';
          
          try {
            const res = await axios.get('https://ipapi.co/json/');
            country = res.data.country_code;
            detectedLang = getLanguageByCountry(country);
            i18n.changeLanguage(detectedLang);
          } catch (e) {
            console.error("Failed to detect country", e);
          }

          const device = isMobile ? 'mobile' : 'desktop';
          const referralCode = Math.random().toString(36).substring(2, 9).toUpperCase();
          const referredBy = localStorage.getItem('referredBy') || undefined;
          const isAdmin = user.email === 'fernandook2016@gmail.com';

          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            fullName: user.displayName || 'User',
            country,
            device,
            language: detectedLang,
            referralCode,
            referredBy,
            createdAt: new Date(),
            isAdmin
          };

          try {
            await setDoc(docRef, newProfile);
            if (isAdmin) {
              await setDoc(doc(db, 'admins', user.uid), { email: user.email });
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`);
          }
          setProfile(newProfile);

          const balanceRef = doc(db, 'balances', user.uid);
          const initialBalance: UserBalance = {
            current: 0,
            totalEarned: 0,
            offersCompleted: 0,
            updatedAt: new Date()
          };
          try {
            await setDoc(balanceRef, initialBalance);
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, `balances/${user.uid}`);
          }
          setBalance(initialBalance);
          
          if (referredBy) {
            const refMemberPath = `referrals/${referredBy}/members/${user.uid}`;
            const refMemberDoc = doc(db, refMemberPath);
            try {
              await setDoc(refMemberDoc, { joinedAt: new Date() });
            } catch (e) {
              handleFirestoreError(e, OperationType.CREATE, refMemberPath);
            }
          }
        } else {
          const profileData = docSnap.data() as UserProfile;
          setProfile(profileData);
          if (profileData.language) {
            i18n.changeLanguage(profileData.language);
          }
          
          onSnapshot(doc(db, 'balances', user.uid), (snap) => {
            if (snap.exists()) {
              setBalance(snap.data() as UserBalance);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `balances/${user.uid}`);
          });
        }
      } else {
        setProfile(null);
        setBalance(null);
      }
      setLoading(false);
    });
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, balance, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
