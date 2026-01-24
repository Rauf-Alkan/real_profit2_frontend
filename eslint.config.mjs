import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 🚨 Kritik Hataları Devre Dışı Bırakıyoruz
      "@typescript-eslint/no-unused-vars": "warn", // Kullanılmayan değişkenleri hata değil uyarı yap
      "@typescript-eslint/no-explicit-any": "off", // 'any' tipine izin ver (Hızlı geliştirme için)
      "react/no-unescaped-entities": "off",       // Tırnak işaretleri (', ") hatalarını görmezden gel
      "@next/next/no-sync-scripts": "off",        // Senkron script uyarısını kapat
    },
  },
];

export default eslintConfig;
