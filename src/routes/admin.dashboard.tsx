import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileDown, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { BearersCarousel } from "@/components/BearersCarousel";
import { IdCard } from "@/components/IdCard";
import { OrgHeader } from "@/components/OrgHeader";
import { RegistrationForm } from "@/components/RegistrationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/idcard";
import { deleteMember, listMembers, type MemberRecord } from "@/lib/members.functions";
import { LOGO_URL, ORG } from "@/lib/org";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | AKAPBKS Registrations" },
      {
        name: "description",
        content: "Manage AKAPBKS member registrations, download ID cards and export member data.",
      },
      { property: "og:title", content: "Admin Dashboard | AKAPBKS Registrations" },
      {
        property: "og:description",
        content: "Manage AKAPBKS member registrations, download ID cards and export member data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const FIELDS: { key: keyof MemberRecord; label: string }[] = [
  { key: "membership_id", label: "Membership ID / ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆ" },
  { key: "full_name", label: "Full Name / ಹೆಸರು" },
  { key: "designation", label: "Designation / ಹುದ್ದೆ" },
  { key: "phone", label: "Phone / ಮೊಬೈಲ್" },
  { key: "blood_group", label: "Blood Group / ರಕ್ತದ ಗುಂಪು" },
  { key: "date_of_birth", label: "Date of Birth / ಜನ್ಮ ದಿನಾಂಕ" },
  { key: "district", label: "District / ಜಿಲ್ಲೆ" },
  { key: "taluk", label: "Taluk / ತಾಲೂಕು" },
  { key: "address", label: "Address / ವಿಳಾಸ" },
  { key: "emergency_contact", label: "Emergency Contact / ತುರ್ತು ಸಂಪರ್ಕ" },
  { key: "aadhar_number", label: "Aadhar Number / ಆಧಾರ್ ಸಂಖ್ಯೆ" },
  { key: "source", label: "Registered By / ನೋಂದಣಿ ವಿಧಾನ" },
  { key: "payment_status", label: "Payment Status / ಪಾವತಿ ಸ್ಥಿತಿ" },
  { key: "payment_amount", label: "Payment Amount / ಮೊತ್ತ" },
  { key: "created_at", label: "Registered On / ನೋಂದಾಯಿಸಿದ ದಿನಾಂಕ" },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const load = useServerFn(listMembers);
  const remove = useServerFn(deleteMember);
  const [token, setToken] = useState("");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MemberRecord | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [exporting, setExporting] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const allTableRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(
    async (activeToken: string) => {
      try {
        setMembers(await load({ data: { token: activeToken } }));
      } catch {
        sessionStorage.removeItem("akapbks-admin-token");
        void navigate({ to: "/admin" });
      }
    },
    [load, navigate],
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("akapbks-admin-token");
    if (!stored) {
      void navigate({ to: "/admin" });
      return;
    }
    setToken(stored);
    void refresh(stored);
  }, [navigate, refresh]);

  const filtered = useMemo(() => {
    const sorted = [...members].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const term = query.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter((m) =>
      [m.membership_id, m.full_name, m.phone, m.designation, m.district]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [members, query]);

  /** Download All Members in Clean PDF Table Format (Not MS Excel) */
  async function downloadAllMembersPdf() {
    if (!allTableRef.current || !members.length) return;
    setExporting(true);
    try {
      const { toCanvas } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const canvas = await toCanvas(allTableRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        skipFonts: true,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 10, position, imgWidth, imgHeight);
      heightLeft -= 277;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= 277;
      }

      pdf.save(`akapbks-members-directory-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("ಎಲ್ಲಾ ಸದಸ್ಯರ ಪಟ್ಟಿ PDF ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ / Members list PDF downloaded!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("PDF ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ / PDF download failed");
    } finally {
      setExporting(false);
    }
  }

  /** Download Individual Member Details in Clean Table Format PDF */
  async function downloadDetailPdf() {
    if (!detailRef.current || !selected) return;
    try {
      const { toCanvas } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const canvas = await toCanvas(detailRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        skipFonts: true,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const width = 190;
      const height = (canvas.height / canvas.width) * width;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 10, 12, width, height);
      pdf.save(`${selected.membership_id}-details.pdf`);
      toast.success("ಸದಸ್ಯರ ವಿವರಗಳ PDF ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ / Member details PDF downloaded!");
    } catch (err) {
      console.error("Detail PDF error:", err);
      toast.error("PDF ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ / Detail PDF download failed");
    }
  }

  async function handleDelete(member: MemberRecord) {
    if (!window.confirm(`Delete ${member.full_name} (${member.membership_id})?`)) return;
    try {
      await remove({ data: { token, id: member.id } });
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      setSelected(null);
      toast.success("ಸದಸ್ಯರನ್ನು ಅಳಿಸಲಾಗಿದೆ / Member deleted");
    } catch {
      toast.error("ಅಳಿಸಲು ಆಗಲಿಲ್ಲ / Could not delete member");
    }
  }

  function signOut() {
    sessionStorage.removeItem("akapbks-admin-token");
    void navigate({ to: "/admin" });
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <OrgHeader />

      {/* Main wrapper element between header and footer */}
      <div
        className="flex-1 w-full flex flex-col"
        style={{
          backgroundImage: "url('/assets/mandala_om_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="border-b border-border bg-secondary/85 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/Registration" className="text-sm font-medium underline">
              Registration / ನೋಂದಣಿ
            </Link>
            <span className="text-sm font-semibold text-maroon">
              ಆಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ / Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowRegister(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Selected People Registration</span>
            </Button>
            <Button variant="outline" onClick={signOut}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <BearersCarousel />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-12">
        <div className="panel p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input
              placeholder="Search by Name / ID / Phone / District"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-xs"
            />
            <span className="text-sm font-bold text-maroon">
              ಒಟ್ಟು ಸದಸ್ಯರು / Total: {filtered.length}
            </span>
            {/* Download All Members in Normal PDF Table Format */}
            <Button
              onClick={downloadAllMembersPdf}
              disabled={!members.length || exporting}
              className="flex items-center gap-2 bg-[#6b0d14] text-white hover:bg-[#85121c] font-semibold"
            >
              <FileDown className="h-4 w-4" />
              <span>Download All (PDF Table) / ಎಲ್ಲಾ ಸದಸ್ಯರ ಪಟ್ಟಿ (PDF)</span>
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center font-bold">Sl. No. / ಕ್ರ.ಸಂ.</TableHead>
                  <TableHead className="font-bold">ID No / ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆ</TableHead>
                  <TableHead className="font-bold">Name / ಹೆಸರು</TableHead>
                  <TableHead className="font-bold">Designation / ಹುದ್ದೆ</TableHead>
                  <TableHead className="font-bold">Phone / ಮೊಬೈಲ್</TableHead>
                  <TableHead className="font-bold">District / ಜಿಲ್ಲೆ</TableHead>
                  <TableHead className="font-bold">Registered / ದಿನಾಂಕ</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member, idx) => (
                  <TableRow
                    key={member.id}
                    className="cursor-pointer hover:bg-amber-50/60"
                    onClick={() => setSelected(member)}
                  >
                    <TableCell className="text-center font-extrabold text-maroon">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-bold text-gray-950">
                      {member.membership_id}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {member.full_name}
                    </TableCell>
                    <TableCell className="font-bold text-[#7d150b]">
                      {member.designation}
                    </TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.district}</TableCell>
                    <TableCell>{formatDate(member.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-700 hover:bg-red-50 border-red-200"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(member);
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      ಯಾವುದೇ ನೋಂದಣಿ ಇಲ್ಲ / No registrations found
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Hidden Printable Container for "Download All (PDF Table Format)" */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none select-none" aria-hidden>
        <div
          ref={allTableRef}
          className="w-[820px] bg-white p-8 font-sans text-gray-900"
          style={{ color: "#111827" }}
        >
          {/* Header */}
          <div className="mb-4 flex items-center gap-4 border-b-2 border-[#b8860b] pb-4">
            <img
              src={LOGO_URL}
              alt=""
              className="h-20 w-20 rounded-full object-cover border-2 border-[#b8860b]"
            />
            <div className="flex-1 text-center">
              <h1 className="text-base font-extrabold text-[#7d150b] leading-snug">
                {ORG.nameKn}
              </h1>
              <h2 className="text-xs font-bold text-gray-800 leading-tight">
                {ORG.nameEn}
              </h2>
              <p className="mt-1 text-[11px] font-semibold text-gray-700">
                Registration No: ({ORG.regNo}) | {ORG.approval}
              </p>
              <p className="text-[10px] text-gray-600">
                {ORG.officeAddressKn}
              </p>
            </div>
          </div>

          {/* Title & Stats */}
          <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#7d150b]">
                ಸದಸ್ಯರ ಪಟ್ಟಿ / Registered Members Directory
              </h3>
              <p className="text-xs text-gray-700">
                Total Members / ಒಟ್ಟು ಸದಸ್ಯರು: <strong>{members.length}</strong>
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Date: {new Date().toLocaleDateString("en-GB")}
            </p>
          </div>

          {/* Clean Easy-to-Understand Table */}
          <table className="w-full border-collapse text-left text-[11px] border border-gray-300">
            <thead>
              <tr className="bg-amber-100/90 text-[#7d150b] border-b border-gray-300">
                <th className="p-2 border border-gray-300 text-center w-12">Sl. No.</th>
                <th className="p-2 border border-gray-300">ID No</th>
                <th className="p-2 border border-gray-300">Full Name / ಹೆಸರು</th>
                <th className="p-2 border border-gray-300">Designation / ಹುದ್ದೆ</th>
                <th className="p-2 border border-gray-300">Phone</th>
                <th className="p-2 border border-gray-300">District / ಜಿಲ್ಲೆ</th>
                <th className="p-2 border border-gray-300">Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => (
                <tr key={m.id} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/30"}>
                  <td className="p-2 border border-gray-300 text-center font-extrabold text-[#7d150b]">
                    {idx + 1}
                  </td>
                  <td className="p-2 border border-gray-300 font-bold">{m.membership_id}</td>
                  <td className="p-2 border border-gray-300 font-semibold">{m.full_name}</td>
                  <td className="p-2 border border-gray-300 font-bold text-[#7d150b]">
                    {m.designation}
                  </td>
                  <td className="p-2 border border-gray-300">{m.phone}</td>
                  <td className="p-2 border border-gray-300">{m.district}</td>
                  <td className="p-2 border border-gray-300">{formatDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Member Details Modal */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ಸದಸ್ಯರ ವಿವರಗಳು / Member Details</DialogTitle>
            <DialogDescription>{selected?.membership_id}</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-6">
              {/* Clean Individual Details Table Formate */}
              <div ref={detailRef} className="bg-card p-4 rounded-lg border border-border">
                <div className="mb-3 flex items-center gap-3 border-b border-border pb-3">
                  <img src={LOGO_URL} alt="" className="size-14 rounded-full border-2 border-gold object-cover" />
                  <div>
                    <p className="text-sm font-extrabold text-maroon">{ORG.nameKn}</p>
                    <p className="text-xs font-semibold text-gray-800">{ORG.nameEn}</p>
                    <p className="text-[11px] text-muted-foreground">Registration No: ({ORG.regNo})</p>
                  </div>
                  {selected.photo_url ? (
                    <img
                      src={selected.photo_url}
                      alt=""
                      className="ml-auto h-20 w-16 rounded border border-gold object-cover"
                    />
                  ) : null}
                </div>

                <table className="w-full border-collapse text-xs">
                  <tbody>
                    {FIELDS.map((field) => (
                      <tr key={field.key} className="border border-border">
                        <th className="w-2/5 border border-border bg-secondary/80 p-2 text-left font-bold text-maroon">
                          {field.label}
                        </th>
                        <td className="border border-border p-2 font-medium">
                          {String(selected[field.key] ?? "-")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={downloadDetailPdf}
                  className="flex items-center gap-2 bg-[#6b0d14] text-white hover:bg-[#85121c]"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Download Details (PDF Table) / ವಿವರಗಳ PDF</span>
                </Button>
                <Button variant="outline" onClick={() => void handleDelete(selected)}>
                  Delete member
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="mb-3 text-center text-sm font-bold text-maroon">
                  ಡಿಜಿಟಲ್ ID ಕಾರ್ಡ್ ಪೂರ್ವವೀಕ್ಷಣೆ / Digital ID Card Preview
                </h4>
                <IdCard member={selected} />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Selected People Registration Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selected People Registration / ವಿಶೇಷ ವ್ಯಕ್ತಿಗಳ ನೋಂದಣಿ</DialogTitle>
            <DialogDescription>
              ಇಲ್ಲಿ ಹುದ್ದೆಯನ್ನು (Designation) ನೇರವಾಗಿ ಬರೆಯಬಹುದು / Designation is editable for leaders & dignitaries
            </DialogDescription>
          </DialogHeader>
          <RegistrationForm
            mode="admin"
            adminToken={token}
            onRegistered={() => {
              void refresh(token);
              setShowRegister(false);
            }}
          />
        </DialogContent>
      </Dialog>

      </div>

      <SiteFooter />
    </div>
  );
}
