import { getSiteConfig } from "@/shared/lib/site-config";
import { ContactForm } from "@/components/ContactForm";

export async function ContactSection() {
  const siteConfig = await getSiteConfig();

  return <ContactForm phone={siteConfig?.phone} />;
}
