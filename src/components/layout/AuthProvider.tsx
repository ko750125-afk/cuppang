'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAppStore } from '@/hooks/useAppStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, syncFromFirestore } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userInfo = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setUser(userInfo);
        // 로그인 시 Firestore에서 데이터 동기화
        await syncFromFirestore(firebaseUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, syncFromFirestore]);

  // Firebase Auth가 세션을 확인하는 초기 상태에는 깜빡임을 최소화하기 위해
  // 로딩 상태를 보여주거나 혹은 children을 바로 렌더링해도 무방합니다.
  // 여기서는 로딩을 표시하지 않고 자연스럽게 children을 표시하여 UX를 부드럽게 유지합니다.
  return <>{children}</>;
}
