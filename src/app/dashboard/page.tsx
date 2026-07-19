'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { FeedLayout } from '@/components/devfeed/FeedLayout';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <FeedLayout />
    </div>
  );
}
