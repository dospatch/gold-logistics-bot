import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BC Gold Logistics | American Truck Simulator VTC", template: "%s | BC Gold Logistics" },
  description: "Join BC Gold Logistics, a player-run American Truck Simulator trucking company for solo drivers and organized multiplayer Convoy sessions.",
  applicationName: "BC Gold Logistics",
  openGraph: { title: "BC Gold Logistics", description: "American Truck Simulator trucking company. Real Drivers. Real Deliveries. One Team.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
