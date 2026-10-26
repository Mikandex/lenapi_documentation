import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LenAPI Developer Docs",
  description: "Step-by-step guides for building APIs with LenAPI, the modern Python ASGI framework.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
