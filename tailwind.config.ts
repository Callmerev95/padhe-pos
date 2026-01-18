import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}", // Tambahkan ini jika ada folder features
    "./src/components/shared/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        coffee: {
          /* Warna Utama: Orange Caramel dari paletmu */
          primary: "#EE8A2F",   //
          /* Warna Gelap: Deep Espresso dari paletmu */
          dark: "#251F1F",      //
          /* Warna Background: Krem Lembut agar mata tidak lelah */
          soft: "#FDF8F5",      //
          /* Putih Bersih untuk Kartu */
          white: "#FFFFFF",     //
        }
      },
      // Tambahan agar layout dashboard kamu lebih rapi
      height: {
        "112.5": "28.125rem", // Untuk tinggi kartu yang konsisten di dashboard
      }
    },
  },
  plugins: [], // Jika kamu pakai shadcn, ini biasanya perlu
};

export default config;