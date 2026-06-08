'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function LoginRequired() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F8F9FA] px-5 py-10 fade-in">
      <Card className="w-full max-w-sm bg-white border border-[#E5E8EB] shadow-md rounded-2xl p-6 text-center space-y-5">
        <div className="mx-auto w-12 h-12 bg-red-50 text-[#F04452] rounded-full flex items-center justify-center animate-pulse">
          <ShieldAlert className="w-6 h-6" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-[17px] font-extrabold text-[#191F28] tracking-tight">
            로그인이 필요한 서비스입니다
          </h2>
          <p className="text-xs font-semibold text-[#8B95A1] leading-relaxed">
            모바일 브라우저 특성상 로그인 없이 입력 시 소중한 배송 데이터가 유실될 위험이 매우 큽니다.
            <br />
            실적 데이터를 안전하게 평생 보존하기 위해 반드시 구글 로그인 후 사용해 주세요.
          </p>
        </div>

        <Button
          onClick={handleLogin}
          className="w-full bg-[#191F28] text-white hover:bg-[#2c3744] font-bold h-12 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
        >
          <GoogleIcon />
          구글 계정으로 로그인
        </Button>
      </Card>
    </div>
  );
}
