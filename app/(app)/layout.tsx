import { Navbar } from "@/components/navbar/navbar";

const NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Auctions", href: "/auctions" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Deposit", href: "/deposit" },
  { title: "Portfolio", href: "/portfolio" },
  { title: "Redeem", href: "/redeem" },
  { title: "Settings", href: "/settings" },
];

export default function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <Navbar elements={NAV_ITEMS} Title="FENt." />
      <main className="flex-1">{children}</main>
    </div>
  );
}