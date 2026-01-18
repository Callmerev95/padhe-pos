import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";


const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,             // Kunci utama agar navigasi antar halaman di-cache
  aggressiveFrontEndNavCaching: true,   // Memaksa cache lebih agresif
  reloadOnOnline: true,                 // Auto reload jika internet kembali nyala
  disable: false,                       // Set ke false agar kita bisa tes di mode dev
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "unsplash.com",
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rtabajdhhwynskkpyzxv.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
