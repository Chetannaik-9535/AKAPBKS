import { createFileRoute } from "@tanstack/react-router";

import { BearersCarousel } from "@/components/BearersCarousel";
import { OrgHeader } from "@/components/OrgHeader";
import { RegistrationForm } from "@/components/RegistrationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { ORG } from "@/lib/org";

export const Route = createFileRoute("/Registration")({
  head: () => ({
    meta: [
      { title: "AKAPBKS Member Registration & Digital ID Card" },
      {
        name: "description",
        content:
          "Register with the All Karnataka Unorganized Priests and Cooks Workers' Association and receive your bilingual digital membership ID card instantly.",
      },
      { property: "og:title", content: "AKAPBKS Member Registration & Digital ID Card" },
      {
        property: "og:description",
        content:
          "Purohit registration form and instant digital ID card for AKAPBKS members across Karnataka.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegistrationPage,
});

export function RegistrationPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <OrgHeader />

      {/* Main wrapper element sitting between header and footer sections */}
      <div
        className="flex-1 w-full"
        style={{
          backgroundImage: "url('/assets/mandala_om_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
          <section className="panel mx-auto max-w-3xl p-5 text-center">
            <h2 className="text-xl font-semibold text-maroon sm:text-2xl">
              ಸಂಘದ ಪರಿಚಯ / About the Union
            </h2>
            <div className="gold-rule mx-auto my-3 w-28" />
            <p className="text-sm leading-relaxed">
              ಅಖಿಲ ಕರ್ನಾಟಕದ ಅಸಂಘಟಿತ ಪುರೋಹಿತರು ಮತ್ತು ಬಾಣಸಿಗ ಕಾರ್ಮಿಕರ ಹಿತರಕ್ಷಣೆ, ಗೌರವ ಮತ್ತು ಕಲ್ಯಾಣಕ್ಕಾಗಿ ಈ ಸಂಘವು
              ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ. ಸದಸ್ಯರಾಗಿ ನೋಂದಾಯಿಸಿಕೊಂಡು ಡಿಜಿಟಲ್ ಗುರುತಿನ ಚೀಟಿಯನ್ನು ಪಡೆಯಿರಿ.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The union works for the dignity, welfare and recognition of unorganized priests and cooks
              across Karnataka. Register as a member below and receive your official digital identity
              card.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-center text-xl font-semibold text-maroon sm:text-2xl">
              ರಾಜ್ಯ ಕಾರ್ಯದರ್ಶಿಗಳು / State Office-Bearers
            </h2>
            <BearersCarousel />
          </section>

          <section className="mt-8">
            <RegistrationForm />
          </section>

          <p className="mt-8 text-center text-xs font-semibold text-white bg-black/40 backdrop-blur-xs py-2 px-4 rounded-full max-w-fit mx-auto shadow-sm">
            {ORG.officeKn.join(" · ")} · {ORG.email}
          </p>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
