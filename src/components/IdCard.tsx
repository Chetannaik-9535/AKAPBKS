import { useEffect, useRef, useState } from "react";
import { Download, FileDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CARD_BACK_NOTES, CARD_INSTRUCTIONS, CARD_SIGNATORIES, LOGO_URL, ORG } from "@/lib/org";
import {
  downloadCardImages,
  downloadCardPdf,
  downloadSingleCardImage,
} from "@/lib/idcard";
import type { MemberRecord } from "@/lib/members.functions";

type Props = { member: MemberRecord; autoDownload?: boolean };

/** Orange background with red Om mandala design */
function OrangeOmMandalaBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <img
        src="/assets/mandala_om_bg.jpg"
        alt=""
        className="h-full w-full object-cover opacity-25 select-none"
      />
    </div>
  );
}

/** Watermark with organization logo */
function OrganizationLogoWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <img
        src={LOGO_URL}
        alt=""
        className="h-28 w-28 rounded-full object-cover opacity-15 select-none"
      />
    </div>
  );
}

/** Ornate corner filigree ornament for the 4 corners */
function CornerOrnaments() {
  return (
    <>
      {/* Top Left */}
      <svg
        className="pointer-events-none absolute left-1 top-1 h-6 w-6 text-[#d4af37]"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden
      >
        <path d="M2 2 H24 C24 14 14 24 2 24 V2 Z" fill="#d4af37" fillOpacity="0.1" />
        <path d="M4 4 H18 C18 11 11 18 4 18 V4" />
        <path d="M2 2 L22 22 M6 2 L2 6" />
        <circle cx="8" cy="8" r="2" fill="#d4af37" />
        <circle cx="2" cy="2" r="1.5" fill="#d4af37" />
      </svg>
      {/* Top Right */}
      <svg
        className="pointer-events-none absolute right-1 top-1 h-6 w-6 -scale-x-100 text-[#d4af37]"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden
      >
        <path d="M2 2 H24 C24 14 14 24 2 24 V2 Z" fill="#d4af37" fillOpacity="0.1" />
        <path d="M4 4 H18 C18 11 11 18 4 18 V4" />
        <path d="M2 2 L22 22 M6 2 L2 6" />
        <circle cx="8" cy="8" r="2" fill="#d4af37" />
        <circle cx="2" cy="2" r="1.5" fill="#d4af37" />
      </svg>
      {/* Bottom Left */}
      <svg
        className="pointer-events-none absolute bottom-1 left-1 h-6 w-6 -scale-y-100 text-[#d4af37]"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden
      >
        <path d="M2 2 H24 C24 14 14 24 2 24 V2 Z" fill="#d4af37" fillOpacity="0.1" />
        <path d="M4 4 H18 C18 11 11 18 4 18 V4" />
        <path d="M2 2 L22 22 M6 2 L2 6" />
        <circle cx="8" cy="8" r="2" fill="#d4af37" />
        <circle cx="2" cy="2" r="1.5" fill="#d4af37" />
      </svg>
      {/* Bottom Right */}
      <svg
        className="pointer-events-none absolute bottom-1 right-1 h-6 w-6 -scale-x-100 -scale-y-100 text-[#d4af37]"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden
      >
        <path d="M2 2 H24 C24 14 14 24 2 24 V2 Z" fill="#d4af37" fillOpacity="0.1" />
        <path d="M4 4 H18 C18 11 11 18 4 18 V4" />
        <path d="M2 2 L22 22 M6 2 L2 6" />
        <circle cx="8" cy="8" r="2" fill="#d4af37" />
        <circle cx="2" cy="2" r="1.5" fill="#d4af37" />
      </svg>
    </>
  );
}

/** Formats issue date like 01-04-2026 */
function getIssueDate(created?: string, validFrom?: string) {
  const d = validFrom || created;
  if (!d) return "01-04-2026";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "01-04-2026";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function IdCard({ member, autoDownload = false }: Props) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    void import("qrcode").then((mod) =>
      mod
        .toDataURL(`${origin}/member/${member.membership_id}`, {
          margin: 1,
          width: 260,
          errorCorrectionLevel: "M",
          color: { dark: "#000000", light: "#ffffff" },
        })
        .then(setQr),
    );
  }, [member.membership_id]);

  async function handlePdf() {
    if (!frontRef.current || !backRef.current) return;
    setBusy(true);
    try {
      await downloadCardPdf(
        frontRef.current,
        backRef.current,
        `${member.membership_id.replace(/\//g, "-")}-id-card`,
      );
      toast.success("ID ಕಾರ್ಡ್ PDF ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ / PDF Downloaded!");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("PDF ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ / PDF download failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleImages() {
    if (!frontRef.current || !backRef.current) return;
    setBusy(true);
    try {
      await downloadCardImages(
        frontRef.current,
        backRef.current,
        `${member.membership_id.replace(/\//g, "-")}`,
      );
      toast.success("ID ಕಾರ್ಡ್ ಚಿತ್ರ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ / Image Downloaded successfully!");
    } catch (error) {
      console.error("Failed to download images:", error);
      toast.error("ಚಿತ್ರ ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ / Image download failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleFrontOnly() {
    if (!frontRef.current) return;
    setBusy(true);
    try {
      await downloadSingleCardImage(
        frontRef.current,
        `${member.membership_id.replace(/\//g, "-")}-front`,
      );
      toast.success("ಮುಂಭಾಗ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ / Front card downloaded!");
    } catch (error) {
      console.error("Failed to download front image:", error);
      toast.error("ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ / Download failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleBackOnly() {
    if (!backRef.current) return;
    setBusy(true);
    try {
      await downloadSingleCardImage(
        backRef.current,
        `${member.membership_id.replace(/\//g, "-")}-back`,
      );
      toast.success("ಹಿಂಭಾಗ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ / Back card downloaded!");
    } catch (error) {
      console.error("Failed to download back image:", error);
      toast.error("ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ / Download failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!autoDownload || done.current || !qr) return;
    done.current = true;
    const timer = setTimeout(() => void handleImages(), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, qr]);

  const issueDate = getIssueDate(member.created_at, member.valid_from);
  const location = member.taluk
    ? `${member.taluk}, ${member.district}`
    : member.district || "Bengaluru";

  return (
    <div className="flex flex-col items-center gap-5">
      {/* CARD CANVAS WRAPPER (Compact Standard Height, No Extra Empty Space) */}
      <div className="flex w-full max-w-full flex-col items-center justify-center gap-6 overflow-x-auto p-2 md:flex-row md:items-start">
        {/* =================================================================== */}
        {/* FRONT CARD (Short Compact Height, Standard Proportions)              */}
        {/* =================================================================== */}
        <div
          ref={frontRef}
          className="relative flex h-[440px] w-[320px] shrink-0 flex-col justify-between overflow-hidden rounded-[14px] p-[4px] shadow-xl"
          style={{
            background: "linear-gradient(145deg, #a82a18 0%, #7d150b 50%, #b5381f 100%)",
            boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Inner Golden Border & Cream Canvas */}
          <div
            className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[10px] border-[1.5px] border-[#cda237] p-2 bg-[#fdfbf6]"
            style={{
              boxShadow: "inset 0 0 0 1px #f5e49e",
            }}
          >
            {/* Orange background with red Om mandala design */}
            <OrangeOmMandalaBackground />
            {/* Watermark with organization logo */}
            <OrganizationLogoWatermark />
            <CornerOrnaments />

            {/* TOP HEADER SECTION */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Official AKAPBKS Emblem / Logo */}
              <div className="mb-0.5 rounded-full p-0.5 shadow-xs" style={{ background: "#d4af37" }}>
                <img
                  src={LOGO_URL}
                  alt="AKAPBKS Logo"
                  className="h-9 w-9 rounded-full bg-white object-cover shadow-inner"
                />
              </div>

              {/* Organization Titles (Kannada Primary, English Secondary) */}
              <h1
                className="px-0.5 text-[9px] font-extrabold tracking-tight leading-tight text-[#7d150b]"
                style={{ fontFamily: "'Noto Sans Kannada', sans-serif" }}
              >
                ಅಖಿಲ ಕರ್ನಾಟಕ ಅಸಂಘಟಿತ ಪುರೋಹಿತ ಮತ್ತು ಬಾಣಸಿಗ ಕಾರ್ಮಿಕರ ಸಂಘ (ರಿ)
              </h1>
              <h2
                className="px-0.5 text-[7.5px] font-bold tracking-tight leading-tight text-[#5a120b]"
                style={{ fontFamily: "sans-serif" }}
              >
                All Karnataka Unorganized Priests and Cooks Workers' Association (Regd.)
              </h2>

              {/* Approval & Registration Info */}
              <div className="mt-0.5 flex flex-col items-center">
                <span className="rounded bg-amber-100/90 px-1.5 py-0.2 text-[6.8px] font-extrabold text-[#7d150b] border border-amber-300">
                  Approved By Karnataka Govt
                </span>
                <span className="mt-0.5 text-[6.8px] font-semibold text-gray-700">
                  Registration No: ({ORG.regNo})
                </span>
              </div>

              {/* MEMBER IDENTITY CARD Ribbon */}
              <div className="relative my-0.5 flex w-full items-center justify-center">
                <div
                  className="relative flex items-center justify-center px-3.5 py-0.5 shadow-xs"
                  style={{
                    backgroundColor: "#6e0c15",
                    borderRadius: "3px",
                    border: "1px solid #d4af37",
                  }}
                >
                  <span className="absolute -left-1.5 text-[7.5px] text-[#f5d061]">✦</span>
                  <span
                    className="text-[8.5px] font-bold tracking-widest text-[#fff9e6]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    MEMBER IDENTITY CARD
                  </span>
                  <span className="absolute -right-1.5 text-[7.5px] text-[#f5d061]">✦</span>
                </div>
              </div>
            </div>

            {/* MAIN MEMBER DATA SECTION (Tight, No Extra Vertical Space) */}
            <div className="relative z-10 flex gap-2 px-0.5 items-center">
              {/* LEFT: Member Photo */}
              <div className="flex w-[80px] shrink-0 flex-col items-center">
                <div className="relative h-[98px] w-[80px] overflow-hidden rounded-[5px] border-[1.5px] border-[#cba33b] bg-amber-50 shadow-xs">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-xs text-stone-400">
                      <span>No Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Member Information Fields */}
              <div className="flex flex-1 flex-col justify-center space-y-[1.5px] text-[8.5px] min-w-0 overflow-hidden">
                {/* NAME */}
                <div className="leading-tight min-w-0">
                  <span className="block text-[7.5px] font-extrabold text-[#7d150b]">NAME:</span>
                  <span className="block text-[9.5px] font-bold text-gray-950 truncate">
                    {member.full_name}
                  </span>
                </div>

                {/* DESIGNATION */}
                <div className="leading-tight min-w-0">
                  <span className="block text-[7.5px] font-extrabold text-[#7d150b]">
                    DESIGNATION:
                  </span>
                  <span className="block text-[8.5px] font-bold text-gray-950 truncate">
                    {member.designation}
                  </span>
                </div>

                {/* BLOOD GROUP */}
                <div className="leading-tight min-w-0">
                  <span className="block text-[7.5px] font-extrabold text-[#7d150b]">
                    BLOOD GROUP:
                  </span>
                  <span className="block text-[8.5px] font-bold text-gray-950 truncate">
                    {member.blood_group}
                  </span>
                </div>

                {/* MOBILE */}
                <div className="leading-tight min-w-0">
                  <span className="block text-[7.5px] font-extrabold text-[#7d150b]">MOBILE:</span>
                  <span className="block text-[8.5px] font-bold text-gray-950 truncate">
                    {member.phone}
                  </span>
                </div>

                {/* DISTRICT */}
                <div className="leading-tight min-w-0">
                  <span className="block text-[7.5px] font-extrabold text-[#7d150b]">
                    DISTRICT:
                  </span>
                  <span className="block text-[8px] font-bold text-gray-950 truncate">
                    {member.district || "Bengaluru"}
                  </span>
                </div>

                {/* REGISTRATION NO */}
                <div className="leading-tight min-w-0">
                  <span className="block text-[7px] font-extrabold text-[#7d150b]">
                    REGISTRATION NO:
                  </span>
                  <span className="block text-[7.5px] font-bold text-gray-950 truncate">
                    {ORG.regNo}
                  </span>
                </div>

                {/* ID No */}
                <div className="leading-tight min-w-0">
                  <span className="block text-[7.5px] font-extrabold text-[#7d150b]">ID No:</span>
                  <span className="block text-[9px] font-black text-gray-950 truncate">
                    {member.membership_id}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 SIGNATURES ROW AT BOTTOM (100% Transparent, Pure Blue Ink Pen Only) */}
            <div className="relative z-10 flex w-full items-end justify-between gap-1 px-1 text-center">
              {CARD_SIGNATORIES.map((sig, idx) => (
                <div
                  key={idx}
                  className="flex w-[32%] min-w-0 flex-col items-center justify-end overflow-hidden"
                >
                  <div className="flex h-6 w-full items-center justify-center overflow-hidden">
                    <img
                      src={sig.image}
                      alt={sig.nameKn}
                      className="h-5 max-h-[20px] w-auto max-w-full object-contain pointer-events-none select-none"
                      style={{ maxHeight: "20px" }}
                    />
                  </div>
                  <p
                    className="mt-0.5 w-full truncate text-center text-[5.8px] font-bold text-gray-950 leading-tight"
                    title={sig.nameKn}
                  >
                    {sig.nameKn}
                  </p>
                  <p
                    className="w-full truncate text-center text-[5px] font-semibold text-[#7d150b] leading-tight"
                    title={sig.roleKn}
                  >
                    {sig.roleKn}
                  </p>
                  <p
                    className="w-full truncate text-center text-[4.6px] text-gray-700 leading-tight"
                    title={sig.roleEn}
                  >
                    {sig.roleEn}
                  </p>
                </div>
              ))}
            </div>

            {/* BOTTOM BANNER (Motto in Kannada) */}
            <div
              className="relative z-10 flex items-center justify-center rounded-[3px] py-0.5 shadow-xs"
              style={{
                background: "linear-gradient(to right, #cf711f 0%, #ea8329 50%, #cf711f 100%)",
                border: "1px solid #a85813",
              }}
            >
              <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold text-[#4a0b0b]">
                <span className="text-[#ffe066]">★</span>
                <span>ಧರ್ಮ</span>
                <span className="text-[#ffe066]">★</span>
                <span>ಐಕ್ಯತೆ</span>
                <span className="text-[#ffe066]">★</span>
                <span>ಸೇವೆ</span>
                <span className="text-[#ffe066]">★</span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BACK CARD (Short Compact Height, Standard Proportions)               */}
        {/* =================================================================== */}
        <div
          ref={backRef}
          className="relative flex h-[440px] w-[320px] shrink-0 flex-col justify-between overflow-hidden rounded-[14px] p-[4px] shadow-xl"
          style={{
            background: "linear-gradient(145deg, #a82a18 0%, #7d150b 50%, #b5381f 100%)",
            boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Inner Golden Border & Cream Canvas */}
          <div
            className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[10px] border-[1.5px] border-[#cda237] p-2 bg-[#fdfbf6]"
            style={{
              boxShadow: "inset 0 0 0 1px #f5e49e",
            }}
          >
            {/* Orange background with red Om mandala design */}
            <OrangeOmMandalaBackground />
            {/* Watermark with organization logo */}
            <OrganizationLogoWatermark />
            <CornerOrnaments />

            {/* TOP HEADER SECTION */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className="flex w-full items-center justify-center rounded-[3px] py-0.5 shadow-xs"
                style={{
                  backgroundColor: "#6e0c15",
                  border: "1px solid #d4af37",
                }}
              >
                <div className="flex items-center gap-1 text-[8.5px] font-black tracking-wider text-white">
                  <span className="text-[#f5d061]">✦</span>
                  <span>AUTHORIZATION & IMPORTANT NOTES</span>
                  <span className="text-[#f5d061]">✦</span>
                </div>
              </div>
            </div>

            {/* INNER ADDRESS & CONTACT CONTAINER */}
            <div className="relative z-10 my-0.5 flex w-full flex-col gap-0.5 rounded-[5px] border border-[#d4af37]/80 bg-white/90 p-1 px-1.5 shadow-xs backdrop-blur-[1px] overflow-hidden box-border">
              {/* ADDRESS BLOCK */}
              <div className="flex gap-1.5 min-w-0">
                <div className="mt-0.5 shrink-0">
                  <svg
                    className="h-3 w-3 text-[#c47913]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 text-[7px] leading-snug">
                  <p className="font-extrabold text-[#7d150b]">
                    ADDRESS <span className="font-bold text-[6px]">(REGISTERED OFFICE / ಪ್ರಧಾನ ಕಚೇರಿ):</span>
                  </p>
                  <p className="mt-0.5 font-semibold text-gray-900 leading-tight break-words">
                    {ORG.officeAddressKn}
                  </p>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="h-[1px] w-full bg-amber-200/70" />

              {/* EMERGENCY CONTACT */}
              <div className="flex items-start gap-1.5 min-w-0">
                <div className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-emerald-600 shadow-xs">
                  <svg
                    className="h-2 w-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[6.5px] font-extrabold text-[#7d150b]">
                    EMERGENCY CONTACT:
                  </span>
                  <span className="block text-[6.8px] font-extrabold text-gray-900 leading-snug break-words">
                    {ORG.phones.join(", ")}
                  </span>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="h-[1px] w-full bg-amber-200/70" />

              {/* EMAIL */}
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex h-3 w-3 shrink-0 items-center justify-center rounded-md bg-amber-500 shadow-xs">
                  <svg
                    className="h-2 w-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 text-[6.8px] leading-tight truncate">
                  <span className="font-extrabold text-[#7d150b]">Email: </span>
                  <span className="font-extrabold text-gray-900">
                    {ORG.email}
                  </span>
                </div>
              </div>
            </div>

            {/* SPECIAL NOTES & INSTRUCTIONS */}
            <div className="relative z-10 my-0.5 w-full min-w-0 overflow-hidden rounded-[5px] border border-[#d4af37]/70 bg-white/95 p-1 px-1.5 text-left shadow-xs box-border">
              <p className="text-[7.2px] font-extrabold text-[#7d150b] leading-tight">
                ವಿಶೇಷ ಸೂಚನೆ :
              </p>
              <ul className="mt-0.5 space-y-0.5 text-[5.8px] font-medium leading-tight text-gray-800">
                {CARD_BACK_NOTES.map((note, i) => (
                  <li key={i} className="flex w-full min-w-0 items-start gap-1">
                    <span className="shrink-0 font-bold text-[#7d150b]">{i + 1}.</span>
                    <span className="min-w-0 flex-1 break-words leading-tight">{note}</span>
                  </li>
                ))}
              </ul>
              <div className="my-0.5 h-[1px] w-full bg-amber-200/80" />
              <ul className="space-y-0.5 text-[5.4px] leading-tight text-gray-700">
                {CARD_INSTRUCTIONS.map((inst, i) => (
                  <li key={i} className="flex w-full min-w-0 items-start gap-1">
                    <span className="shrink-0 font-bold text-amber-700">•</span>
                    <span className="min-w-0 flex-1 break-words leading-tight">{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DYNAMIC QR CODE FOR VERIFICATION */}
            <div className="relative z-10 my-0.5 flex flex-col items-center justify-center">
              <div className="rounded-[5px] border-[1.5px] border-[#cda237] bg-white p-0.5 shadow-xs">
                {qr ? (
                  <img src={qr} alt="Member QR code" className="h-11 w-11 object-contain" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center bg-gray-100 text-[8px] text-gray-400">
                    Generating QR…
                  </div>
                )}
              </div>
              <span className="mt-0.5 text-[6.5px] font-bold text-[#7d150b]">
                Scan for Verification / ಪರಿಶೀಲನೆಗಾಗಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ
              </span>
              <span className="text-[5.5px] font-medium text-gray-600">
                Date of Issue: {issueDate}
              </span>
            </div>

            {/* BOTTOM DUAL FOOTER BANNERS */}
            <div className="relative z-10 flex flex-col gap-0.5 pt-0.5">
              {/* Maroon Banner */}
              <div
                className="flex items-center justify-center rounded-[2px] py-1 px-1 text-center shadow-xs"
                style={{
                  backgroundColor: "#580a11",
                  border: "1px solid #cda237",
                }}
              >
                <p
                  className="m-0 w-full text-center text-[8.5px] font-black text-[#fff9e6] leading-normal"
                  style={{ fontFamily: "'Noto Sans Kannada', 'Nirmala UI', system-ui, sans-serif" }}
                >
                  <span className="text-[#f5d061] text-[7.5px] select-none">✦</span>
                  {" "}
                  <span className="font-extrabold tracking-normal">ಧರ್ಮೋ ರಕ್ಷತಿ ರಕ್ಷಿತಃ</span>
                  {" "}
                  <span className="text-[#f5d061] text-[7.5px] select-none">✦</span>
                </p>
              </div>

              {/* Gold Banner */}
              <div
                className="flex items-center justify-between rounded-[2px] py-0.5 px-1.5 shadow-xs overflow-hidden text-[#4a1306]"
                style={{
                  background: "linear-gradient(to right, #e29f35 0%, #f7c963 50%, #e29f35 100%)",
                  border: "1px solid #b87b1a",
                }}
              >
                <span className="text-[5.5px] font-black truncate max-w-[62%]">
                  {ORG.shortName} • {ORG.regNo}
                </span>
                <span className="text-[5.5px] font-black shrink-0 underline">
                  {ORG.website}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap justify-center items-center gap-3 pt-1">
        {/* Single Prominent Main Button */}
        <Button
          onClick={handleImages}
          disabled={busy}
          size="lg"
          className="h-11 px-7 text-sm font-bold bg-gradient-to-r from-[#cf711f] via-[#ea8329] to-[#cf711f] hover:brightness-110 text-white shadow-md flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>ಡೌನ್‌ಲೋಡ್ ID ಕಾರ್ಡ್ / Download ID Card</span>
        </Button>

        {/* PDF Option */}
        <Button
          variant="outline"
          onClick={handlePdf}
          disabled={busy}
          className="h-11 border-[#cda237] text-[#7d150b] hover:bg-amber-50 font-semibold flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          <span>PDF ಡೌನ್‌ಲೋಡ್ / Download PDF</span>
        </Button>

        {/* Front / Back individual options */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFrontOnly}
          disabled={busy}
          className="text-xs text-muted-foreground hover:text-[#7d150b]"
        >
          ಮುಂಭಾಗ ಮಾತ್ರ / Front Only
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackOnly}
          disabled={busy}
          className="text-xs text-muted-foreground hover:text-[#7d150b]"
        >
          ಹಿಂಭಾಗ ಮಾತ್ರ / Back Only
        </Button>
      </div>
    </div>
  );
}
