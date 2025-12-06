import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="jo-root">
<<<<<<< HEAD
      {/* Outer dark background */}
      <div className="jo-wrapper">
        {/* Small title on the top-left */}

        {/* Phone frame */}
        <div className="jo-phone">
          {/* Logo area */}
          <div className="jo-logo-wrapper">
            <Image
              src="/app_logo.png" // <-- change file name if needed
=======
      <div className="jo-wrapper">

        <div className="jo-phone">
          <div className="jo-logo-wrapper">
            <Image
              src="/app_logo.png"
>>>>>>> 320160c0002f8485a754025abd1eb93c8d43c676
              alt="Jalur Obat Logo"
              width={300}
              height={300}
              className="jo-logo-image"
              priority
            />
          </div>

<<<<<<< HEAD
          {/* Start button */}
=======
>>>>>>> 320160c0002f8485a754025abd1eb93c8d43c676
           <Link href="/sign_up" className="jo-start-button">Start</Link>
        </div>
      </div>
    </main>
  );
}
