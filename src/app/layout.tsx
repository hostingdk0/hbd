import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, Playfair_Display } from "next/font/google";
import { loveStory } from "@/config/loveStory";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: `For ${loveStory.wifeName} ❤️`,
  description: `A little something from ${loveStory.husbandName}`,
  appleWebApp: {
    capable: true,
    title: `For ${loveStory.wifeName}`,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2a1520",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dm.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-hidden">{children}</body>
    </html>
  );
}
