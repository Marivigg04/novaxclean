import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';

let lockCount = 0;

export function useScrollLock(isLocked) {
  const lenis = useLenis();
  const didLockRef = useRef(false);

  useEffect(() => {
    if (!isLocked) return undefined;

    lockCount += 1;
    didLockRef.current = true;

    const locked = [];

    const lockElement = (element) => {
      if (!element) return;

      locked.push({
        element,
        overflow: element.style.overflow,
        overscrollBehavior: element.style.overscrollBehavior,
      });
      element.style.overflow = 'hidden';
      element.style.overscrollBehavior = 'none';
    };

    lockElement(document.documentElement);
    lockElement(document.body);
    document.querySelectorAll('main').forEach(lockElement);

    lenis?.stop();

    return () => {
      if (!didLockRef.current) return;

      didLockRef.current = false;
      lockCount = Math.max(0, lockCount - 1);

      locked.forEach(({ element, overflow, overscrollBehavior }) => {
        element.style.overflow = overflow;
        element.style.overscrollBehavior = overscrollBehavior;
      });

      if (lockCount === 0) {
        lenis?.start();
      }
    };
  }, [isLocked, lenis]);
}
