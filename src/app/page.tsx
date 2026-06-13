import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/home");

  return (
    <main className="landing-root">
      {/* Nav */}
      <nav className="landing-nav">
        <span className="landing-logo">daily nodes</span>
        <div className="landing-nav-links">
          <Link href="/sign-in" className="nav-link">sign in</Link>
          <Link href="/sign-up" className="nav-cta">get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-eyebrow">life logging, simplified</div>
        <h1 className="hero-title">
          log what matters.<br />
          share with your circle.
        </h1>
        <p className="hero-sub">
          Daily Nodes helps you track workouts, meals, moods, and more —
          privately or with a small group you trust. Get a warm AI digest of
          your day, every evening.
        </p>
        <div className="hero-actions">
          <Link href="/sign-up" className="btn-primary">start logging →</Link>
          <Link href="/sign-in" className="btn-ghost">already have an account</Link>
        </div>
      </section>

      {/* Feature strip */}
      <section className="feature-strip">
        <div className="feature-item">
          <span className="feature-icon">◆</span>
          <span className="feature-label">nodes</span>
          <p className="feature-desc">log anything — text, image, or both</p>
        </div>
        <div className="feature-divider" />
        <div className="feature-item">
          <span className="feature-icon">◈</span>
          <span className="feature-label">groups</span>
          <p className="feature-desc">share moments with up to 5 people</p>
        </div>
        <div className="feature-divider" />
        <div className="feature-item">
          <span className="feature-icon">◇</span>
          <span className="feature-label">digest</span>
          <p className="feature-desc">AI recap of your day, every evening</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>daily nodes · {new Date().getFullYear()}</span>
      </footer>

      <style>{`
        .landing-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          max-width: 780px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Nav */
        .landing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 0;
        }
        .landing-logo {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #0a0a0a;
        }
        .landing-nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-link {
          font-size: 0.8rem;
          color: #737373;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #0a0a0a; }
        .nav-cta {
          font-size: 0.8rem;
          color: #0a0a0a;
          text-decoration: none;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #0a0a0a;
          padding-bottom: 1px;
          transition: opacity 0.15s;
        }
        .nav-cta:hover { opacity: 0.6; }

        /* Hero */
        .landing-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 0 60px;
        }
        .hero-eyebrow {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #737373;
          margin-bottom: 20px;
        }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 300;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #0a0a0a;
          margin-bottom: 28px;
        }
        .hero-sub {
          font-size: 0.92rem;
          color: #525252;
          max-width: 480px;
          line-height: 1.8;
          margin-bottom: 40px;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-block;
          padding: 10px 22px;
          background: #0a0a0a;
          color: #fff;
          text-decoration: none;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          border: 1px solid #0a0a0a;
          transition: background 0.15s, color 0.15s;
        }
        .btn-primary:hover {
          background: #fff;
          color: #0a0a0a;
        }
        .btn-ghost {
          font-size: 0.8rem;
          color: #737373;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.15s;
        }
        .btn-ghost:hover { color: #0a0a0a; }

        /* Feature strip */
        .feature-strip {
          display: flex;
          align-items: flex-start;
          gap: 0;
          border-top: 1px solid #e5e5e5;
          padding: 36px 0;
          margin-bottom: 0;
        }
        .feature-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .feature-divider {
          width: 1px;
          background: #e5e5e5;
          align-self: stretch;
          margin: 0 28px;
        }
        .feature-icon {
          font-size: 1rem;
          color: #0a0a0a;
          margin-bottom: 2px;
        }
        .feature-label {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #0a0a0a;
        }
        .feature-desc {
          font-size: 0.78rem;
          color: #737373;
          line-height: 1.6;
        }

        /* Footer */
        .landing-footer {
          border-top: 1px solid #e5e5e5;
          padding: 20px 0;
          font-size: 0.72rem;
          color: #a3a3a3;
          letter-spacing: 0.04em;
        }

        @media (max-width: 520px) {
          .feature-strip { flex-direction: column; gap: 24px; }
          .feature-divider { display: none; }
          .landing-nav-links { gap: 14px; }
        }
      `}</style>
    </main>
  );
}
