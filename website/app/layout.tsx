import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BC Gold Logistics | Driven by Excellence", template: "%s | BC Gold Logistics" },
  description: "A professional American Truck Simulator and Euro Truck Simulator 2 virtual trucking company. Driven by Excellence. United by the Road.",
  applicationName: "BC Gold Logistics",
  openGraph: { title: "BC Gold Logistics", description: "Driven by Excellence. United by the Road.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
