"use client";

import { BlogReviews } from "@/components/BlogReviews";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Navbar />
      <Hero />
      <Services />
      <BlogReviews />
      <ContactForm />
      <Footer />
    </main>
  );
}
