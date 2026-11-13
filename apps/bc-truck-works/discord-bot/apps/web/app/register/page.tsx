import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="card auth-card">
        <Link href="/" className="brand">BC <span>TRUCK WORKS</span></Link>
        <h1>Create account</h1>
        <p className="kicker">Your account will become the home for your TruckWorks servers and services.</p>
        <form className="form">
          <div className="field"><label htmlFor="username">Username</label><input id="username" placeholder="TruckWorksDriver" required /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" placeholder="you@example.com" required /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" placeholder="Create a strong password" required /></div>
          <button className="btn primary" type="submit">Create account</button>
        </form>
        <div className="auth-footer">Already registered? <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link></div>
      </section>
    </main>
  );
}
