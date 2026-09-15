import { Link } from "@tanstack/react-router";

import { FOOTER_EN, FOOTER_KN, ORG } from "@/lib/org";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-maroon text-maroon-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8 text-center text-xs leading-relaxed sm:text-sm">
        <p className="font-medium">{ORG.officeKn.join(" · ")}</p>
        <p className="mt-1 opacity-90">
          {ORG.email} · {ORG.phones.join(" / ")}
        </p>
        <div className="gold-rule mx-auto my-4 w-32" />
        <p>{FOOTER_EN}</p>
        <p className="mt-2">{FOOTER_KN}</p>
        <Link to="/admin" className="mt-4 inline-block text-xs underline opacity-80 hover:opacity-100">
          Super Admin Login / ಸೂಪರ್ ಆಡ್ಮಿನ್ ಲಾಗಿನ್
        </Link>
      </div>
    </footer>
  );
}
