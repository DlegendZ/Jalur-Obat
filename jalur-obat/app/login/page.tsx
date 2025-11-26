"use client";

import Link from "next/link";
import Image from "next/image";
import "./login.css";

export default function LoginPage() {
  return (
    <main className="login-root">
      <div className="login-phone">

        {/* Top right logo */}
        <div className="login-top-logo">
          <Image 
            src="/app_logo.png" 
            alt="logo" 
            width={50} 
            height={50} 
          />
        </div>

        <h1 className="login-title">Login to your account</h1>

        {/* Social Buttons */}
          <button className="login-social">
            <img src="/google.svg" className="login-icon-img" />
              Continue with Google
          </button>

          <button className="login-social">
            <img src="/apple.svg" className="login-icon-img" />
              Continue with Apple
          </button>

          <button className="login-social">
            <img src="/facebook.svg" className="login-icon-img" />
            Continue with Facebook
          </button>


        {/* Divider */}
        <div className="login-divider">
          <span></span>
          OR
          <span></span>
        </div>

        {/* Form Fields */}
        <input 
          type="email" 
          placeholder="Enter your Email Address" 
          className="login-input"
        />

        <input 
          type="password" 
          placeholder="Enter your Password"
          className="login-input"
        />
  
        <button className="login-continue">Continue</button>

        <p className="login-forgot">Forgot Password?</p>

        {/* Back Button */}
        <Link href="/" className="login-back">
          Back
        </Link>

      </div>
    </main>
  );
}
