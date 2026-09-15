import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IdCard } from "@/components/IdCard";
import { BLOOD_GROUPS, KARNATAKA_DISTRICTS } from "@/lib/org";
import { fileToDataUrl } from "@/lib/idcard";
import { registerMember, type MemberRecord } from "@/lib/members.functions";

type Props = { mode?: "public" | "admin"; adminToken?: string; onRegistered?: () => void };

const empty = {
  fullName: "",
  dateOfBirth: "",
  phone: "",
  bloodGroup: "",
  district: "",
  taluk: "",
  emergencyContact: "",
  address: "",
  designation: "Member",
  aadharNumber: "",
};

function BiLabel({ kn, en, htmlFor }: { kn: string; en: string; htmlFor: string }) {
  return (
    <Label htmlFor={htmlFor} className="flex flex-col items-start gap-0">
      <span className="text-sm font-semibold text-maroon">{kn}</span>
      <span className="text-xs font-normal text-muted-foreground">{en}</span>
    </Label>
  );
}

export function RegistrationForm({ mode = "public", adminToken, onRegistered }: Props) {
  const submit = useServerFn(registerMember);
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [member, setMember] = useState<MemberRecord | null>(null);

  const isAdmin = mode === "admin";

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ಫೋಟೋ 2MB ಒಳಗಿರಬೇಕು / Photo must be under 2MB");
      return;
    }
    try {
      setPhoto(await fileToDataUrl(file));
    } catch {
      toast.error("ಫೋಟೋ ಓದಲು ಆಗಲಿಲ್ಲ / Could not read the photo");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      toast.error("ದಯವಿಟ್ಟು ಒಪ್ಪಿಗೆ ನೀಡಿ / Please accept the declaration");
      return;
    }
    setBusy(true);
    try {
      const record = await submit({
        data: {
          ...form,
          consent: true as const,
          photoDataUrl: photo,
          source: isAdmin ? ("admin" as const) : ("public" as const),
          adminToken,
        },
      });
      setMember(record);
      setForm(empty);
      setPhoto("");
      setConsent(false);
      onRegistered?.();
      toast.success(`ನೋಂದಣಿ ಯಶಸ್ವಿ / Registered · ${record.membership_id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ / Registration failed",
      );
    } finally {
      setBusy(false);
    }
  }

  if (member) {
    return (
      <div className="panel mx-auto w-full max-w-6xl p-4 sm:p-6">
        <h2 className="text-center text-xl font-semibold text-maroon">
          ಡಿಜಿಟಲ್ ಗುರುತಿನ ಚೀಟಿ / Digital ID Card
        </h2>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆ / Membership ID: <strong>{member.membership_id}</strong>
        </p>
        <IdCard member={member} autoDownload />
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => setMember(null)}>
            ಹೊಸ ನೋಂದಣಿ / New registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="panel mx-auto w-full max-w-3xl p-4 sm:p-6">
      <h2 className="text-center text-2xl font-semibold text-maroon">ಪುರೋಹಿತರ ನೋಂದಣಿ ನಮೂನೆ</h2>
      <p className="text-center text-base font-medium">Purohit Registration Form</p>
      <div className="gold-rule mx-auto my-4 w-40" />
      <p className="text-center text-sm text-muted-foreground">
        ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸರಿಯಾಗಿ ಭರ್ತಿ ಮಾಡಿ. ಈ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಗುರುತಿನ ಚೀಟಿಯನ್ನು
        ರಚಿಸಲಾಗುತ್ತದೆ.
      </p>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Please fill all details correctly. Your digital ID card will be created based on this
        information.
      </p>

      <h3 className="mt-6 text-lg font-semibold text-maroon">ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ / Personal Information</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <BiLabel htmlFor="fullName" kn="ಪೂರ್ಣ ಹೆಸರು" en="Full Name" />
          <Input
            id="fullName"
            required
            maxLength={120}
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <BiLabel htmlFor="dob" kn="ಜನ್ಮ ದಿನಾಂಕ" en="Date of Birth" />
          <Input
            id="dob"
            type="date"
            required
            value={form.dateOfBirth}
            onChange={(e) => set("dateOfBirth", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <BiLabel htmlFor="phone" kn="ದೂರವಾಣಿ ಸಂಖ್ಯೆ" en="Phone Number" />
          <Input
            id="phone"
            required
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="grid gap-1.5">
          <BiLabel htmlFor="blood" kn="ರಕ್ತದ ಗುಂಪು" en="Blood Group" />
          <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
            <SelectTrigger id="blood">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <BiLabel htmlFor="district" kn="ಜಿಲ್ಲೆ" en="District" />
          <Select value={form.district} onValueChange={(v) => set("district", v)}>
            <SelectTrigger id="district">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {KARNATAKA_DISTRICTS.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <BiLabel htmlFor="taluk" kn="ತಾಲೂಕು" en="Taluk" />
          <Input id="taluk" required value={form.taluk} onChange={(e) => set("taluk", e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <BiLabel htmlFor="emergency" kn="ತುರ್ತು ಸಂಪರ್ಕ" en="Emergency Contact (Optional)" />
          <Input
            id="emergency"
            inputMode="numeric"
            maxLength={10}
            value={form.emergencyContact}
            onChange={(e) => set("emergencyContact", e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="grid gap-1.5">
          <BiLabel htmlFor="designation" kn="ಹುದ್ದೆ" en="Designation" />
          {isAdmin ? (
            <Input
              id="designation"
              required
              value={form.designation}
              onChange={(e) => set("designation", e.target.value)}
            />
          ) : (
            <Input id="designation" value="Member" readOnly className="bg-muted" />
          )}
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <BiLabel htmlFor="address" kn="ವಿಳಾಸ" en="Address" />
          <Textarea
            id="address"
            required
            maxLength={500}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold text-maroon">
        ಗುರುತಿನ ವಿವರಗಳು / Identification Details
      </h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <BiLabel htmlFor="aadhar" kn="ಆಧಾರ್ ಸಂಖ್ಯೆ" en="Aadhar Number" />
          <Input
            id="aadhar"
            required
            inputMode="numeric"
            maxLength={12}
            value={form.aadharNumber}
            onChange={(e) => set("aadharNumber", e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="grid gap-1.5">
          <BiLabel htmlFor="photo" kn="ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" en="Upload Photo (Max 2MB)" />
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => void handlePhoto(e.target.files?.[0])}
          />
          {photo ? (
            <img
              src={photo}
              alt="Selected photo preview"
              className="mt-1 h-24 w-20 rounded border border-gold object-cover"
            />
          ) : null}
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-secondary/60 p-3">
        <Checkbox
          checked={consent}
          onCheckedChange={(value) => setConsent(value === true)}
          className="mt-0.5"
        />
        <span className="text-xs leading-relaxed">
          <span className="block font-semibold text-maroon">
            ನಾನು ಈ ಸಂಸ್ಥೆಯಲ್ಲಿ ಸಾಮಾನ್ಯ ಸದಸ್ಯನಾಗಿ ಸ್ವಯಂಪ್ರೇರಣೆಯಿಂದ ಸೇವೆ ಸಲ್ಲಿಸಲು ಮುಂದೆ ಬರುತ್ತಿದ್ದೇನೆ.
          </span>
          I hereby volunteer to serve this organization voluntarily as a general member.
        </span>
      </label>

      <Button type="submit" className="mt-6 w-full" size="lg" disabled={busy}>
        {busy ? "..." : "ನೋಂದಣಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ / Complete Registration"}
      </Button>
    </form>
  );
}
