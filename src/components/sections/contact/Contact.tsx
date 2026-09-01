"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout";
import { SectionLabel, Text } from "@/components/ui";
import { ContactRequests } from "@/components/contact/ContactRequests";
import { useTranslations } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Contact() {
  const dict = useTranslations();

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="Start a project with Qodily"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_50%_0%,#0c0c12_0%,#050505_60%)]" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <SectionLabel>{dict.contact.label}</SectionLabel>
          <h2 className="mt-6 max-w-3xl text-[clamp(2.6rem,8vw,6.5rem)] font-medium uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
            {dict.contact.heading1}
            <span className="block text-accent">{dict.contact.heading2Accent}</span>
          </h2>
          <Text
            size="lg"
            muted
            className="mt-6 max-w-xl"
          >
            {dict.contact.body}
          </Text>
        </motion.div>

        <motion.div
          className="mt-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        >
          <ContactRequests />
        </motion.div>
      </Container>
    </section>
  );
}
