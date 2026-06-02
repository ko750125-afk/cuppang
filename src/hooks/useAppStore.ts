import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, DailyRecord, Zone } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AppState {
  settings: AppSettings;
  records: Record<string, DailyRecord>; // Key: YYYY-MM-DD
  user: UserInfo | null;
  
  // Actions
  setUser: (user: UserInfo | null) => void;
  syncFromFirestore: (uid: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addOrUpdateZone: (zone: Zone) => void;
  removeZone: (zoneId: string) => void;
  
  updateDailyRecord: (date: string, record: Partial<DailyRecord>) => void;
  getDailyRecord: (date: string) => DailyRecord;
  getAllRecords: () => DailyRecord[];
}

const defaultSettings: AppSettings = {
  zones: [
    { id: '1', name: '기본구역', price: 800, freshBagPrice: 200 }
  ],
  workDaysPerWeek: 6,
  restDaysOfWeek: [0], // 0 = Sunday
  settlementStartDay: 25,
  payDay: 15, // 15일로 변경
  commissionRate: 3.3, // 프리랜서 기본 3.3%
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      records: {},
      user: null,

      setUser: (user) => set({ user }),

      syncFromFirestore: async (uid) => {
        try {
          // 1. settings 가져오기
          const settingsDoc = await getDoc(doc(db, 'cuppang_settings', uid));
          let syncedSettings = get().settings;
          if (settingsDoc.exists()) {
            syncedSettings = settingsDoc.data().settings as AppSettings;
          }

          // 2. records 가져오기
          const recordsDoc = await getDoc(doc(db, 'cuppang_records', uid));
          let syncedRecords = get().records;
          if (recordsDoc.exists()) {
            syncedRecords = recordsDoc.data().records as Record<string, DailyRecord>;
          }

          set({ settings: syncedSettings, records: syncedRecords });
        } catch (error) {
          console.error('Failed to sync from Firestore:', error);
        }
      },

      updateSettings: (newSettings) => 
        set((state) => {
          const updated = { ...state.settings, ...newSettings };
          if (state.user) {
            setDoc(doc(db, 'cuppang_settings', state.user.uid), { settings: updated }).catch(err => 
              console.error('Failed to backup settings:', err)
            );
          }
          return { settings: updated };
        }),

      addOrUpdateZone: (zone) =>
        set((state) => {
          const exists = state.settings.zones.find(z => z.id === zone.id);
          const newZones = exists 
            ? state.settings.zones.map(z => z.id === zone.id ? zone : z)
            : [...state.settings.zones, zone];
          const updatedSettings = { ...state.settings, zones: newZones };
          if (state.user) {
            setDoc(doc(db, 'cuppang_settings', state.user.uid), { settings: updatedSettings }).catch(err => 
              console.error('Failed to backup settings:', err)
            );
          }
          return { settings: updatedSettings };
        }),

      removeZone: (zoneId) =>
        set((state) => {
          const updatedSettings = {
            ...state.settings,
            zones: state.settings.zones.filter(z => z.id !== zoneId)
          };
          if (state.user) {
            setDoc(doc(db, 'cuppang_settings', state.user.uid), { settings: updatedSettings }).catch(err => 
              console.error('Failed to backup settings:', err)
            );
          }
          return { settings: updatedSettings };
        }),

      updateDailyRecord: (date, recordUpdate) =>
        set((state) => {
          const existing = state.records[date] || { date, deliveries: {}, freshBagCount: 0 };
          const updatedRecords = {
            ...state.records,
            [date]: { ...existing, ...recordUpdate }
          };
          if (state.user) {
            setDoc(doc(db, 'cuppang_records', state.user.uid), { records: updatedRecords }).catch(err => 
              console.error('Failed to backup records:', err)
            );
          }
          return { records: updatedRecords };
        }),

      getDailyRecord: (date) => {
        return get().records[date] || { date, deliveries: {}, freshBagCount: 0 };
      },
      
      getAllRecords: () => {
        return Object.values(get().records).sort((a, b) => b.date.localeCompare(a.date)); // 최신순 정렬
      }
    }),
    {
      name: 'delivery-app-storage',
    }
  )
);
