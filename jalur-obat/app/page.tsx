// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="app-root">
      <div className="mobile-frame">
        <div className="logo-section">
          <Image
            src="/app_logo.png"   // gunakan logo kamu di /public
            alt="Logo Jalur Obat"
            width={500}
            height={500}
            className="logo-image"
            priority
          />

          
        </div>

        {/* Start -> ke /login */}
        <Link href="/sign_up" className="start-button">
          Start
        </Link>
      </div>
    </main>
  );
}
