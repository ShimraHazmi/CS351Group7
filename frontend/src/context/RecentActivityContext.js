import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const RecentActivityContext = createContext();

const STORAGE_KEY = 'civic_recent_activity_v1';
const MAX_ITEMS = 50;

export function RecentActivityProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to read recent activity from storage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist recent activity', e);
    }
  }, [items]);

  const addActivity = useCallback((activity) => {
    setItems((prev) => {
      const next = [{ id: Date.now() + Math.random(), timestamp: Date.now(), ...activity }, ...prev];
      return next.slice(0, MAX_ITEMS);
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <RecentActivityContext.Provider value={{ items, addActivity, clear }}>
      {children}
    </RecentActivityContext.Provider>
  );
}

export function useRecentActivity() {
  const ctx = useContext(RecentActivityContext);
  if (!ctx) throw new Error('useRecentActivity must be used inside RecentActivityProvider');
  return ctx;
}

export default RecentActivityContext;
