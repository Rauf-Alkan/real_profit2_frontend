'use client';

import { useEffect } from 'react';
import { Page, Layout, EmptyState } from '@shopify/polaris';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hatayı loglama servisine (New Relic vb.) gönderebilirsin
    console.error(error);
  }, [error]);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <div style={{ marginTop: '100px' }}>
            <EmptyState
              heading="Bir şeyler ters gitti"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              action={{
                content: 'Tekrar Dene',
                onAction: () => reset(),
              }}
            >
              <p>Beklenmedik bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.</p>
              <p style={{ color: '#888', marginTop: '10px', fontSize: '12px' }}>
                Hata Kodu: {error.digest || 'Bilinmiyor'}
              </p>
            </EmptyState>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
