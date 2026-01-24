import '../globals.css'; // CSS dosyanın yolu. Eğer hata verirse '../../globals.css' dene.
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    // Sayfa bazlı başlıklar için şablon (Örn: "Analytics - RealProfit")
    template: '%s | RealProfit',
    // Ana sayfa veya şablonun kullanılmadığı yerlerdeki varsayılan başlık
    default: 'RealProfit - Advanced Profit Analytics',
  },
  description: 'Track net profit, manage COGS, and analyze ad spend in real-time for your Shopify stores.',
  // Shopify App Bridge v4 için gerekli meta etiketleri
  other: {
    'shopify-api-key': process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '',
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}