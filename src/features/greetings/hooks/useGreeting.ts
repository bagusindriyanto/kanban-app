import { useEffect, useState } from 'react';

type TimeBucket = 'morning' | 'afternoon' | 'evening' | 'night';

const greetingMap: Record<TimeBucket, string[]> = {
  morning: [
    'Selamat pagi, {name} 🌞',
    'Pagi, {name}! Semoga harimu menyenangkan.',
  ],
  afternoon: ['Halo {name}, semoga siangmu lancar.'],
  evening: ['Selamat sore, {name}.'],
  night: ['{name}, waktunya santai sejenak 🌙'],
};

const getTimeBucket = (date = new Date()): TimeBucket => {
  const hour = date.getHours();

  if (hour < 11) return 'morning';
  if (hour < 15) return 'afternoon';
  if (hour < 18) return 'evening';
  return 'night';
};

const getNextBoundary = (date = new Date()) => {
  const next = new Date(date);

  const hour = date.getHours();

  if (hour < 11) {
    next.setHours(11, 0, 0, 0);
  } else if (hour < 15) {
    next.setHours(15, 0, 0, 0);
  } else if (hour < 18) {
    next.setHours(18, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  }

  return next;
};

const pickGreeting = (bucket: TimeBucket) => {
  const list = greetingMap[bucket];

  // satu variasi yang konsisten untuk setiap hari
  const today = new Date().toDateString();
  const seed = [...today].reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return list[seed % list.length];
};

export const useGreeting = () => {
  const [bucket, setBucket] = useState(getTimeBucket());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const updateGreeting = () => {
      const nextBucket = getTimeBucket();

      setBucket((prev) => (prev === nextBucket ? prev : nextBucket));
    };

    const scheduleNextUpdate = () => {
      clearTimeout(timer);

      const delay = getNextBoundary().getTime() - Date.now();

      timer = setTimeout(() => {
        updateGreeting();
        scheduleNextUpdate();
      }, delay);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateGreeting();
      }
    };

    window.addEventListener('focus', updateGreeting);
    document.addEventListener('visibilitychange', handleVisibility);

    scheduleNextUpdate();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', updateGreeting);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return {
    bucket,
    greeting: pickGreeting(bucket),
  };
};
