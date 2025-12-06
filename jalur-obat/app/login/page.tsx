"use client";

import Link from "next/link";
import Image from "next/image";
import "./login.css";

export default function LoginPage() {
  return (
    <main className="login-root">
      <div className="login-phone">

<<<<<<< HEAD
        {/* Top right logo */}
=======
>>>>>>> 320160c0002f8485a754025abd1eb93c8d43c676
        <div className="login-top-logo">
          <Image 
            src="/app_logo.png" 
            alt="logo" 
            width={50} 
            height={50} 
          />
        </div>

        <h1 className="login-title">Login to your account</h1>

<<<<<<< HEAD
        {/* Social Buttons */}
=======
>>>>>>> 320160c0002f8485a754025abd1eb93c8d43c676
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

<<<<<<< HEAD

        {/* Divider */}
=======
>>>>>>> 320160c0002f8485a754025abd1eb93c8d43c676
        <div className="login-divider">
          <span></span>
          OR
          <span></span>
        </div>

<<<<<<< HEAD
        {/* Form Fields */}
=======
>>>>>>> 320160c0002f8485a754025abd1eb93c8d43c676
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
  
        <Link href="/update_journey" className="login-continue">Continue</Link>

        <Link href="/sign_up" className="create-account">New to this app?</Link>

<<<<<<< HEAD
        {/* Back Button */}
=======
>>>>>>> 320160c0002f8485a754025abd1eb93c8d43c676
        <Link href="/" className="login-back">
          Back
        </Link>

      </div>
    </main>
  );
}
