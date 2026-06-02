'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Route as RouteIcon, Trash2, Plus, ChevronDown, LogOut, Cloud, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { AppHeader } from '@/components/layout/AppHeader';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Settings() {
  const { settings, updateSettings, addOrUpdateZone, removeZone, user } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePrice, setNewZonePrice] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-4 text-center mt-10">로딩중...</div>;

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const handleAddZone = () => {
    if (!newZoneName || !newZonePrice) return;
    addOrUpdateZone({
      id: Date.now().toString(),
      name: newZoneName,
      price: parseInt(newZonePrice, 10),
      freshBagPrice: 0
    });
    setNewZoneName('');
    setNewZonePrice('');
    setIsAdding(false);
  };

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] fade-in pb-10">
      <AppHeader />

      <div className="p-5 space-y-5">
        {/* 타이틀 */}
        <h1 className="text-[26px] font-extrabold text-[#191F28] tracking-tight px-1">Settings</h1>

        {/* 구글 로그인 동기화 세션 카드 */}
        <Card className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-[#E5E8EB]/60 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#1850d4]" />
              <h2 className="text-[15px] font-extrabold text-[#191F28]">클라우드 데이터 동기화</h2>
            </div>
            {user && (
              <span className="bg-[#E6F9F2] text-[#00D082] font-bold px-2 py-0.5 rounded-full text-[10px] tracking-normal flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Sync Active
              </span>
            )}
          </div>

          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="profile" className="w-10 h-10 rounded-full border border-[#E5E8EB] shadow-xs animate-fade-in" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#f3f4f5] flex items-center justify-center text-sm font-bold text-[#4E5968]">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-[14px] text-[#191F28]">{user.displayName || '사용자'}</div>
                  <div className="text-[11px] font-semibold text-[#4E5968] mt-0.5">{user.email}</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="text-[#F04452] hover:text-red-600 hover:bg-red-50 rounded-lg h-9 text-xs font-bold px-3 border border-[#E5E8EB]"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs font-semibold text-[#4E5968] leading-relaxed">
                구글 계정으로 로그인하면 정산 실적 및 설정 데이터를 안전하게 클라우드(Firestore)와 동기화하여 평생 보존합니다.
              </p>
              <Button 
                onClick={handleLogin}
                className="w-full bg-white border border-[#E5E8EB] text-[#191F28] hover:bg-[#F8F9FA] font-bold h-11 rounded-lg text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <GoogleIcon />
                구글 계정으로 로그인
              </Button>
            </div>
          )}
        </Card>

        {/* 정산 기준 설정 */}
        <Card className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-[#E5E8EB]/60 pb-3">
            <CalendarIcon className="w-5 h-5 text-[#1850d4]" />
            <h2 className="text-[15px] font-extrabold text-[#191F28]">정산 기준 설정</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4E5968] mb-1.5">정산 시작일</label>
              <div className="relative">
                <select 
                  className="w-full border border-[#E5E8EB] bg-white rounded-lg h-10 px-3 text-sm font-semibold text-[#191F28] appearance-none cursor-pointer pr-10 focus:outline-none focus:border-[#1850d4]"
                  value={settings.settlementStartDay || 25} 
                  onChange={(e) => updateSettings({ settlementStartDay: parseInt(e.target.value, 10) })}
                >
                  {dayOptions.map(day => (
                    <option key={day} value={day}>매월 {day}일</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#4E5968] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E5968] mb-1.5">지급일</label>
              <div className="relative">
                <select 
                  className="w-full border border-[#E5E8EB] bg-white rounded-lg h-10 px-3 text-sm font-semibold text-[#191F28] appearance-none cursor-pointer pr-10 focus:outline-none focus:border-[#1850d4]"
                  value={settings.payDay || 15} 
                  onChange={(e) => updateSettings({ payDay: parseInt(e.target.value, 10) })}
                >
                  {dayOptions.map(day => (
                    <option key={day} value={day}>매월 {day}일</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#4E5968] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E5968] mb-1.5">프백 인센</label>
              <div className="relative">
                <Input
                  type="number"
                  step="1"
                  className="w-full border border-[#E5E8EB] rounded-lg h-10 px-3 pr-10 text-sm font-bold text-[#191F28] bg-white focus:border-[#1850d4]"
                  value={settings.freshBagIncentive ?? 0}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val === '' ? 0 : parseInt(val, 10);
                    if (!isNaN(num)) updateSettings({ freshBagIncentive: num });
                  }}
                />
                <span className="text-sm font-bold text-[#4E5968] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">원</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E5968] mb-1.5">수수료율</label>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.1"
                  className="w-full border border-[#E5E8EB] rounded-lg h-10 px-3 pr-10 text-sm font-bold text-[#191F28] bg-white focus:border-[#1850d4]"
                  value={settings.commissionRate} 
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val === '' ? 0 : parseFloat(val);
                    if (!isNaN(num)) {
                      updateSettings({ commissionRate: num });
                    }
                  }}
                />
                <span className="text-sm font-bold text-[#4E5968] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 라우트별 단가 */}
        <Card className="bg-white border border-[#E5E8EB] shadow-xs rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-[#E5E8EB]/60 pb-3">
            <div className="flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-[#1850d4]" />
              <h2 className="text-[15px] font-extrabold text-[#191F28]">라우트별 단가</h2>
            </div>
            <span className="bg-[#f3f4f5] text-[#4E5968] font-bold px-2 py-0.5 rounded-full text-[10px] tracking-normal">
              {settings.zones.length} Active
            </span>
          </div>

          <div className="space-y-2.5">
            {settings.zones.map(zone => (
              <div key={zone.id} className="flex items-center justify-between py-2 border-b border-[#E5E8EB]/50 last:border-0">
                <div>
                  <div className="font-extrabold text-[14px] text-[#191F28]">{zone.name}</div>
                  <div className="text-[11px] font-bold text-[#4E5968] mt-0.5">{zone.price.toLocaleString()}원</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeZone(zone.id)} 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {isAdding ? (
              <div className="bg-[#f8f9fa] p-3 rounded-lg border border-[#E5E8EB] space-y-3 mt-4 animate-fade-in">
                <div className="flex gap-2">
                  <Input 
                    placeholder="라우트 (예: 408BC)" 
                    value={newZoneName} 
                    onChange={e => setNewZoneName(e.target.value)} 
                    className="flex-1 h-9 text-xs rounded-md bg-white border-[#E5E8EB]"
                  />
                  <Input 
                    type="number"
                    placeholder="단가 (원)" 
                    value={newZonePrice} 
                    onChange={e => setNewZonePrice(e.target.value)} 
                    className="w-24 text-right h-9 text-xs rounded-md bg-white border-[#E5E8EB]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAdding(false)} className="flex-1 h-8 text-xs rounded-md">
                    취소
                  </Button>
                  <Button onClick={handleAddZone} className="flex-1 h-8 text-xs rounded-md bg-[#1850d4] text-white hover:bg-[#003bae]">
                    추가 완료
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsAdding(true)} 
                className="w-full border border-dashed border-[#E5E8EB] hover:border-[#1850d4]/40 hover:bg-[#1850d4]/5 text-[#1850d4] rounded-lg h-10 mt-3 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Route
              </Button>
            )}
          </div>
        </Card>

        {/* Save Configuration 버튼 */}
        <Button 
          className="w-full bg-[#1850d4] hover:bg-[#003bae] text-white font-extrabold h-12 rounded-xl text-sm transition-all shadow-xs mt-2"
          onClick={() => {
            alert("설정이 저장되었습니다.");
          }}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
