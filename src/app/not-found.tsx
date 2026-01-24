'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-md w-full">
        {/* Görsel yerine Emoji veya basit bir ikon */}
        <div className="text-6xl mb-4">🔍</div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        
        <p className="text-gray-600 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Polaris Button yerine HTML Link */}
        <Link 
          href="/" 
          className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-md font-medium hover:bg-emerald-700 transition-colors"
        >
          Dashboard'a Dön
        </Link>
      </div>
    </div>
  );
}