import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medical Agent",
  description: "AI Medical Agent – daily recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
