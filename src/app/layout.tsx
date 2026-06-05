import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Duck from "@/components/Duck";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adventures in Tucson!",
  description: "A little guide, just for you.",
  icons: {
    icon: "/favicon-removebg-preview.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-black">
        <Nav />
        {children}
        <Duck />
      </body>
    </html>
  );
}
