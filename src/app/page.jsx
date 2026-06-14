'use client';

import { SurveyForm } from '@/components/SurveyForm';
import Image from 'next/image';

export default function SurveyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[1300px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <SurveyForm />
      </div>

    </main>
  );
}
