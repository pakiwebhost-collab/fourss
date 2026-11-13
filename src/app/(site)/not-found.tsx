import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-28 text-white sm:py-36">
      <Image src="/images/site/Icon.webp" alt="" width={430} height={520} className="absolute -right-16 top-1/2 -z-10 w-[420px] -translate-y-1/2 opacity-[.06]" />
      <div className="container-site max-w-2xl">
        <p className="eyebrow">Error 404</p>
        <h1 className="h-display mt-4 text-5xl sm:text-7xl">Page not found</h1>
        <p className="mt-5 text-lg text-white/70">The page you are looking for may have moved. Try one of these instead.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-gold">Go to Homepage</Link>
          <Link href="/our-services/" className="btn btn-ghost">Our Services</Link>
          <Link href="/contact-us/" className="btn btn-ghost">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
