"use client";

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';
import { ANALYTICS } from '@/lib/site';

export default function ClarityAnalytics() {
  useEffect(() => {
    if (!ANALYTICS.clarityProjectId) return;
    if (process.env.NODE_ENV !== 'production') return;
    Clarity.init(ANALYTICS.clarityProjectId);
  }, []);

  return null;
}
