import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Roboto } from "next/font/google";
import { DEFAULT_MODE, themeCss } from "@/theme";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  preload: false,
});

export const metadata: Metadata = {
  title: "CBM220 Dashboard",
  description: "CBM220 Dashboard Client",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-theme={DEFAULT_MODE} className={`${roboto.variable} ${notoKr.variable}`}>
      <head>
        <style>{themeCss}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
