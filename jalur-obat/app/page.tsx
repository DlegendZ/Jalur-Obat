import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="jo-root">
      {/* Outer dark background */}
      <div className="jo-wrapper">
        {/* Small title on the top-left */}

        {/* Phone frame */}
        <div className="jo-phone">
          {/* Logo area */}
          <div className="jo-logo-wrapper">
            <Image
              src="/app_logo.png" // <-- change file name if needed
              alt="Jalur Obat Logo"
              width={300}
              height={300}
              className="jo-logo-image"
              priority
            />
          </div>

          {/* Start button */}
           <Link href="/sign_up" className="jo-start-button">Start</Link>
        </div>
      </div>
    </main>
  );
}
