"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiRequest, AuthResponse } from "../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <Link href="/" className="brand">BC <span>TRUCK WORKS</span></Link>
        <h1>Welcome back</h1>
        <p className="kicker">Sign in to manage your servers, licenses, downloads, and VTC tools.</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required /></div>
          {error && <p role="alert" style={{ color: "#ff8b8b" }}>{error}</p>}
          <button className="btn primary" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="auth-footer">Need an account? <Link href="/register" style={{ color: "var(--accent)" }}>Create one</Link></div>
      </section>
    </main>
  );
}
