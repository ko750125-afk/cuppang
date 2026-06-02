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
  settlementStartDay: 26,
  payDay: 15,
  freshBagIncentiveRate: 0,
  commissionRate: 3.3,
};

/** Firestore에 settings 백업하는 공통 헬퍼 */
const backupSettings = (uid: string, settings: AppSettings) => {
  setDoc(doc(db, 'cuppang_settings', uid), { settings }).catch((err) =>
    console.error('Failed to backup settings:', err)
  );
};

/** Firestore에 records 백업하는 공통 헬퍼 */
const backupRecords = (uid: string, records: Record<string, DailyRecord>) => {
  setDoc(doc(db, 'cuppang_records', uid), { records }).catch((err) =>
    console.error('Failed to backup records:', err)
  );
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
          const [settingsDoc, recordsDoc] = await Promise.all([
            getDoc(doc(db, 'cuppang_settings', uid)),
            getDoc(doc(db, 'cuppang_records', uid)),
          ]);

          const syncedSettings = settingsDoc.exists()
            ? (settingsDoc.data().settings as AppSettings)
            : get().settings;

          const syncedRecords = recordsDoc.exists()
            ? (recordsDoc.data().records as Record<string, DailyRecord>)
            : get().records;

          set({ settings: syncedSettings, records: syncedRecords });
        } catch (error) {
          console.error('Failed to sync from Firestore:', error);
        }
      },

      updateSettings: (newSettings) =>
        set((state) => {
          const updated = { ...state.settings, ...newSettings };
          if (state.user) backupSettings(state.user.uid, updated);
          return { settings: updated };
        }),

      addOrUpdateZone: (zone) =>
        set((state) => {
          const exists = state.settings.zones.find((z) => z.id === zone.id);
          const newZones = exists
            ? state.settings.zones.map((z) => (z.id === zone.id ? zone : z))
            : [...state.settings.zones, zone];
          const updatedSettings = { ...state.settings, zones: newZones };
          if (state.user) backupSettings(state.user.uid, updatedSettings);
          return { settings: updatedSettings };
        }),

      removeZone: (zoneId) =>
        set((state) => {
          const updatedSettings = {
            ...state.settings,
            zones: state.settings.zones.filter((z) => z.id !== zoneId),
          };
          if (state.user) backupSettings(state.user.uid, updatedSettings);
          return { settings: updatedSettings };
        }),

      updateDailyRecord: (date, recordUpdate) =>
        set((state) => {
          const existing = state.records[date] || { date, deliveries: {}, freshBagCount: 0 };
          const updatedRecords = {
            ...state.records,
            [date]: { ...existing, ...recordUpdate },
          };
          if (state.user) backupRecords(state.user.uid, updatedRecords);
          return { records: updatedRecords };
        }),

      getDailyRecord: (date) => {
        return get().records[date] || { date, deliveries: {}, freshBagCount: 0 };
      },

      getAllRecords: () => {
        return Object.values(get().records).sort((a, b) => b.date.localeCompare(a.date));
      },
    }),
    {
      name: 'delivery-app-storage',
    }
  )
);
