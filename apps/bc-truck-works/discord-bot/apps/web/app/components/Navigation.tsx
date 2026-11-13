import Link from "next/link";

export function Navigation() {
  return (
    <header className="topbar">
      <div className="container nav">
        <Link href="/" className="brand">BC <span>TRUCK WORKS</span></Link>
        <nav className="navlinks">
          <Link href="/#platform">Platform</Link>
          <Link href="/servers">Servers</Link>
          <Link href="/vtc">VTC</Link>
          <Link href="/dashboard/downloads">Downloads</Link>
          <Link href="/support">Support</Link>
        </nav>
        <div className="actions">
          <Link href="/login" className="btn ghost">Sign in</Link>
          <Link href="/register" className="btn primary">Create account</Link>
        </div>
      </div>
    </header>
  );
}
