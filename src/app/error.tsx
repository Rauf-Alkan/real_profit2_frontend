'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: '#f6f6f7',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#fff',
          borderRadius: '12px',
          padding: '24px 24px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #e3e3e3',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
          Bir şeyler ters gitti
        </h1>

        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          Beklenmedik bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.
        </p>

        <p
          style={{
            color: '#999',
            fontSize: '12px',
            marginBottom: '20px',
            wordBreak: 'break-word',
          }}
        >
          Hata Kodu: {error.digest || 'Bilinmiyor'}
        </p>

        <button
          onClick={() => reset()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#008060',
            color: '#fff',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Tekrar dene
        </button>
      </div>
    </div>
  );
}