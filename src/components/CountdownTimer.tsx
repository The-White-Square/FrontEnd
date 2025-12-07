import React, { useEffect, useRef, useState } from 'react';

interface CountdownTimerProps {
  minutes?: number; // start minutes (default 5)
  autoStart?: boolean; // start automatically on mount (default true)
  onFinish?: () => void; // optional callback when timer reaches 0
  className?: string;
}

export default function CountdownTimer({
  minutes = 5,
  autoStart = true,
  onFinish,
  className
}: CountdownTimerProps) {
  const totalStartSeconds = Math.max(0, Math.floor(minutes)) * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(totalStartSeconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoStart) return undefined;

    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // stop timer
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onFinish?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // minutes intentionally not included - caller should remount component to change start time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, onFinish]);

  useEffect(() => {
    // ensure state reflects initial minutes prop on mount
    setSecondsLeft(totalStartSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={className} aria-live="polite" role="timer">
      {format(secondsLeft)}
    </div>
  );
}