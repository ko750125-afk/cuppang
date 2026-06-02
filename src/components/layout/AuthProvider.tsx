'use client';

import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAppStore } from '@/hooks/useAppStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, syncFromFirestore } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL:    firebaseUser.photoURL,
        });
        await syncFromFirestore(firebaseUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, syncFromFirestore]);

  return <>{children}</>;
}
