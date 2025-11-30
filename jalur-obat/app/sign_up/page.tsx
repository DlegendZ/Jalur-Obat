"use client";

import Link from "next/link";
import Image from "next/image";
import "./signup.css";

export default function SignUpPage() {
  return (
    <main className="signup-root">
      <div className="signup-phone">

        <div className="signup-top-logo">
          <Image 
            src="/app_logo.png" 
            alt="logo" 
            width={50} 
            height={50} 
          />
        </div>

        <h1 className="signup-title">Create your account</h1>

          <button className="signup-social">
            <img src="/google.svg" className="signup-icon-img" />
              Continue with Google
          </button>

          <button className="signup-social">
            <img src="/apple.svg" className="signup-icon-img" />
              Continue with Apple
          </button>

          <button className="signup-social">
            <img src="/facebook.svg" className="signup-icon-img" />
            Continue with Facebook
          </button>

        <div className="signup-divider">
          <span></span>
          OR
          <span></span>
        </div>

        <input 
          type="email" 
          placeholder="Enter your Email Address" 
          className="signup-input"
        />

        <input 
          type="password" 
          placeholder="Enter your Password"
          className="signup-input"
        />

        <Link href="/update_journey" className="signup-continue">Continue</Link>

        <Link href="/login" className="signup-haveacc">Already have an account?</Link>

        <Link href="/" className="signup-back">
          Back
        </Link>

      </div>
    </main>
  );
}
