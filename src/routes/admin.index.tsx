import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { BearersCarousel } from "@/components/BearersCarousel";
import { OrgHeader } from "@/components/OrgHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/members.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Super Admin Login | AKAPBKS Portal" },
      {
        name: "description",
        content: "Secure super admin login for AKAPBKS member registration management.",
      },
      { property: "og:title", content: "Super Admin Login | AKAPBKS Portal" },
      {
        property: "og:description",
        content: "Secure super admin login for AKAPBKS member registration management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const login = useServerFn(adminLogin);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await login({ data: { username, password } });
      if (!result.ok) {
        toast.error("ತಪ್ಪಾದ ವಿವರಗಳು / Invalid admin name or password");
        return;
      }
      sessionStorage.setItem("akapbks-admin-token", result.token);
      void navigate({ to: "/admin/dashboard" });
    } catch {
      toast.error("ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ / Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mandala-bg flex min-h-screen flex-col">
      <OrgHeader />
      <BearersCarousel />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-12">
        <form onSubmit={handleSubmit} className="panel p-6">
          <h1 className="text-center text-xl font-semibold text-maroon">Super Admin Login</h1>
          <p className="text-center text-sm text-muted-foreground">ಸೂಪರ್ ಆಡ್ಮಿನ್ ಲಾಗಿನ್</p>
          <div className="gold-rule mx-auto my-4 w-24" />
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="admin-name">Admin Name / ಆಡ್ಮಿನ್ ಹೆಸರು</Label>
              <Input
                id="admin-name"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="admin-password">Admin Password / ಆಡ್ಮಿನ್ ಪಾಸ್‌ವರ್ಡ್</Label>
              <Input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy}>
              Login / ಲಾಗಿನ್
            </Button>
            <Link to="/Registration" className="text-center text-xs text-muted-foreground underline">
              ← Back to Registration / ನೋಂದಣಿ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ
            </Link>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
