import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { BearersCarousel } from "@/components/BearersCarousel";
import { OrgHeader } from "@/components/OrgHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { formatDate, calcAge } from "@/lib/idcard";
import { verifyMembership } from "@/lib/members.functions";

export const Route = createFileRoute("/member/$membershipId")({
  head: () => ({
    meta: [
      { title: "Member Verification | AKAPBKS" },
      {
        name: "description",
        content: "Verify an AKAPBKS digital membership card by scanning its QR code.",
      },
      { property: "og:title", content: "Member Verification | AKAPBKS" },
      {
        property: "og:description",
        content: "Verify an AKAPBKS digital membership card by scanning its QR code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MemberVerification,
});

type Details = {
  membership_id: string;
  full_name: string;
  designation: string;
  district: string;
  taluk: string;
  blood_group: string;
  date_of_birth: string;
  phone: string;
  photo_url: string | null;
  valid_from: string;
  valid_until: string;
  payment_status: string;
  created_at: string;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm">
      <span className="font-medium text-maroon">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function MemberVerification() {
  const { membershipId } = Route.useParams();
  const verify = useServerFn(verifyMembership);
  const [state, setState] = useState<"loading" | "found" | "missing">("loading");
  const [member, setMember] = useState<Details | null>(null);

  useEffect(() => {
    void verify({ data: { membershipId } })
      .then((result) => {
        if (result.found) {
          setMember(result.member as Details);
          setState("found");
        } else {
          setState("missing");
        }
      })
      .catch(() => setState("missing"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipId]);

  return (
    <div className="mandala-bg flex min-h-screen flex-col">
      <OrgHeader />
      <BearersCarousel />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-12">
        <div className="panel p-6">
          <h1 className="text-center text-xl font-semibold text-maroon">
            ಸದಸ್ಯತ್ವ ಪರಿಶೀಲನೆ / Member Verification
          </h1>
          <div className="gold-rule mx-auto my-4 w-24" />
          {state === "loading" ? (
            <p className="text-center text-sm text-muted-foreground">Loading…</p>
          ) : null}
          {state === "missing" ? (
            <p className="text-center text-sm">
              ಈ ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆ ಕಂಡುಬಂದಿಲ್ಲ / No member found for <strong>{membershipId}</strong>
            </p>
          ) : null}
          {state === "found" && member ? (
            <div>
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="mx-auto mb-4 h-32 w-26 rounded border-2 border-gold object-cover"
                />
              ) : null}
              <Row label="ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆ / Membership ID" value={member.membership_id} />
              <Row label="ಹೆಸರು / Name" value={member.full_name} />
              <Row label="ಹುದ್ದೆ / Designation" value={member.designation} />
              <Row label="ಜನ್ಮ ದಿನಾಂಕ / DOB" value={formatDate(member.date_of_birth)} />
              <Row label="ವಯಸ್ಸು / Age" value={calcAge(member.date_of_birth)} />
              <Row label="ರಕ್ತದ ಗುಂಪು / Blood Group" value={member.blood_group} />
              <Row label="ದೂರವಾಣಿ / Phone" value={member.phone} />
              <Row label="ಜಿಲ್ಲೆ / District" value={member.district} />
              <Row label="ತಾಲೂಕು / Taluk" value={member.taluk} />
              <Row
                label="ಸಿಂಧುತ್ವ / Validity"
                value={`${formatDate(member.valid_from)} – ${formatDate(member.valid_until)}`}
              />
              <Row label="ಪಾವತಿ / Payment" value={member.payment_status} />
            </div>
          ) : null}
          <div className="mt-6 text-center">
            <Link to="/Registration" className="text-xs underline text-muted-foreground">
              ← Back to Registration / ನೋಂದಣಿ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
