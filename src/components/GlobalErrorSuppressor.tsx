'use client';

import { useEffect } from 'react';

export default function GlobalErrorSuppressor() {
  useEffect(() => {
    // Suppress Next.js 15 dev overlay from crashing completely upon harmless Strict Mode media race conditions and unmounts
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // YouTube Iframe API AbortError during unmounts
      if (
        event.reason && 
        (event.reason.name === 'AbortError' || 
         (typeof event.reason.message === 'string' && event.reason.message.includes('play() request was interrupted')))
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return null;
}
