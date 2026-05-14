import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "String Voicing — ukulele chord finder",
  description: "Premi le note sul manico e scopri ogni accordo che le contiene.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen antialiased" style={{ backgroundColor: "#020d14", color: "#e8d9bc" }}>
        {children}
      </body>
    </html>
  );
}
