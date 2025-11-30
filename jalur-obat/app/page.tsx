import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="jo-root">
      <div className="jo-wrapper">

        <div className="jo-phone">
          <div className="jo-logo-wrapper">
            <Image
              src="/app_logo.png"
              alt="Jalur Obat Logo"
              width={300}
              height={300}
              className="jo-logo-image"
              priority
            />
          </div>

           <Link href="/sign_up" className="jo-start-button">Start</Link>
        </div>
      </div>
    </main>
  );
}
