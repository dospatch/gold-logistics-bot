import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import SiteSidebar from "@/components/site-sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BC Gold Logistics | American Truck Simulator VTC", template: "%s | BC Gold Logistics" },
  description: "Join BC Gold Logistics, a player-run American Truck Simulator trucking company for solo drivers and organized multiplayer Convoy sessions.",
  applicationName: "BC Gold Logistics",
  icons: { icon: "/BC%20Gold%20Logistics%20Emblem.png", shortcut: "/BC%20Gold%20Logistics%20Emblem.png", apple: "/BC%20Gold%20Logistics%20Emblem.png" },
  openGraph: { title: "BC Gold Logistics", description: "American Truck Simulator trucking company. Real Drivers. Real Deliveries. One Team.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteSidebar /><div className="site-with-sidebar">{children}</div><Analytics /></body></html>;
}
