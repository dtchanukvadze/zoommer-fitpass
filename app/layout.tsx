// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZOOMMER × FITPASS",
  description: "კორპორატიული FITPASS გამოწერების მართვა",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka">
      <body className="font-sans antialiased text-fitpass-dark">{children}</body>
    </html>
  );
}