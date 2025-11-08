import Hero from "@/components/home/hero";
import CTA from "@/components/home/cta";

export default function Home() {
  return (
    <>
    <section className="relative h-screen flex justify-center bg-white dark:bg-gray-900 overflow-hidden">
      {/* Dotted BG */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(#ccc_1px,transparent_1px)]
          dark:bg-[radial-gradient(#444_1px,transparent_1px)]
          bg-[size:20px_20px]
          z-0
        "
      />

      {/* Content */}
      <Hero />
    </section>
    

    <CTA />

    
    </>
  );
}
// app/page.tsx