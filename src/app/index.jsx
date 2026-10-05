import LoadingScreen from '@/components/organisms/loading_screen';
import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

const MIN_LOADING_MS = 350; // brief branded splash without sluggish delay

export default function Index() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const startedAt = Date.now();

    const check = async () => {
      let destination = '/auth/login';
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) destination = '/screens/home';
      } catch (e) {
        console.log('Session check failed:', e?.message);
      }

      const wait = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt));
      timer = setTimeout(() => {
        if (!cancelled) setTarget(destination);
      }, wait);
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!target) return <LoadingScreen />;
  return <Redirect href={target} />;
}