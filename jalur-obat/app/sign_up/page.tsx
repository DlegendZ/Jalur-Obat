// app/signup/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="app-root">
      <div className="mobile-frame">
        {/* Logo kanan atas */}
        <div className="login-header">
          <div />
          <div className="login-header-logo">
            <Image
              src="/app_logo.png"
              alt="Jalur Obat Logo"
              width={40}
              height={40}
            />
          </div>
        </div>

        {/* Isi utama */}
        <div className="login-content">
          <h1 className="page-title">Create to your account</h1>

          {/* Social buttons */}
          <button className="social-button">
            <span className="social-icon">G</span>
            <span>Continue with Google</span>
          </button>

          <button className="social-button">
            <span className="social-icon"></span>
            <span>Continue with Apple</span>
          </button>

          <button className="social-button">
            <span className="social-icon">f</span>
            <span>Continue with Facebook</span>
          </button>

          {/* Divider OR */}
          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">OR</span>
            <span className="divider-line" />
          </div>

          {/* Inputs */}
          <input
            type="email"
            placeholder="Enter your Email Address"
            className="text-input"
          />
          <input
            type="password"
            placeholder="Create Password"
            className="text-input"
          />

          {/* Continue button */}
          <button className="primary-button">Continue</button>

          {/* Link ke login */}
          <Link href="/login" className="small-link">
            Already have an account?
          </Link>
        </div>

        {/* Back ke home */}
        <Link href="/" className="back-button">
          Back
        </Link>
      </div>
    </main>
  );
}
