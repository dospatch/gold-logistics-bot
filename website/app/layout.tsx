import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BC Logistics LLC | Regional Transportation & Distribution", template: "%s | BC Logistics LLC" },
  description: "BC Logistics LLC is a regional transportation and wholesale distribution company planned around a 300+ truck company fleet, 600+ employee capacity, and 24/7 distribution center operations.",
  applicationName: "BC Logistics LLC",
  openGraph: { title: "BC Logistics LLC", description: "Regional Transportation & Distribution. Wholesale freight operations, 24/7.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
