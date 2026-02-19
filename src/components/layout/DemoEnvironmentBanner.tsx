'use client';

import React, { useState } from 'react';

const DEMO_HOSTNAME = 'localhost';
const DISMISS_KEY = 'miniatures_demo_banner_dismissed';

export default function DemoEnvironmentBanner() {
  const isDemoHost =
    typeof window !== 'undefined' &&
    window.location.hostname.toLowerCase() === DEMO_HOSTNAME;
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(DISMISS_KEY) === '1';
  });

  const handleClose = () => {
    setIsDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, '1');
  };

  if (!isDemoHost || isDismissed) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-gray-100 text-gray-600">
      <div className="mx-auto flex h-9 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="relative flex-1 overflow-hidden text-xs sm:text-sm">
          <div className="demo-banner-marquee whitespace-nowrap">
            Demo environment: this app may be slow on first load because it runs on a
            free Render instance that can cold-start.
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-xs text-gray-500 transition-colors hover:text-gray-700"
          aria-label="Dismiss demo environment notice"
        >
          Close
        </button>
      </div>
    </div>
  );
}
