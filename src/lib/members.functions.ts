import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const memberInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  dateOfBirth: z.string().trim().min(4).max(20),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10 digit phone number"),
  bloodGroup: z.string().trim().min(1).max(5),
  district: z.string().trim().min(1).max(80),
  taluk: z.string().trim().min(1).max(80),
  address: z.string().trim().min(3).max(500),
  emergencyContact: z.string().trim().max(20).optional().or(z.literal("")),
  designation: z.string().trim().min(1).max(80),
  aadharNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{12}$/, "Aadhar number must be 12 digits"),
  photoDataUrl: z.string().trim().max(4_500_000).optional().or(z.literal("")),
  consent: z.literal(true),
  source: z.enum(["public", "admin"]).default("public"),
  adminToken: z.string().optional(),
});

export type MemberInput = z.infer<typeof memberInputSchema>;

export type MemberRecord = {
  id: string;
  membership_id: string;
  full_name: string;
  date_of_birth: string;
  phone: string;
  blood_group: string;
  district: string;
  taluk: string;
  address: string;
  emergency_contact: string | null;
  designation: string;
  aadhar_number: string | null;
  photo_url: string | null;
  source: string;
  payment_status: string;
  payment_amount: number;
  valid_from: string;
  valid_until: string;
  created_at: string;
};

const FREE_UNTIL = "2026-10-11";
const MEMBERSHIP_FEE = 100;

async function generateNextMembershipId(): Promise<string> {
  const { loadLocalMembers } = await import("./storage.server");
  const localList = loadLocalMembers();
  let maxSeq = 0;

  for (const m of localList) {
    if (!m.membership_id) continue;
    const match = m.membership_id.match(/AKAPBKS0*(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num < 1000000 && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.from("members").select("membership_id");
    if (rows) {
      for (const r of rows) {
        if (!r.membership_id) continue;
        const match = r.membership_id.match(/AKAPBKS0*(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num < 1000000 && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    }
  } catch {
    // Ignore and use local maxSeq
  }

  const nextNum = maxSeq + 1;
  return `AKAPBKS${String(nextNum).padStart(6, "0")}`;
}

export const registerMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => memberInputSchema.parse(data))
  .handler(async ({ data }): Promise<MemberRecord> => {
    const withinFreeWindow = new Date() <= new Date(`${FREE_UNTIL}T23:59:59Z`);
    const validFrom = new Date();
    const validUntil = new Date(validFrom);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const generatedId = await generateNextMembershipId();

    const localFallback: MemberRecord = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `mem-${Date.now()}`,
      membership_id: generatedId,
      full_name: data.fullName,
      date_of_birth: data.dateOfBirth,
      phone: data.phone,
      blood_group: data.bloodGroup,
      district: data.district,
      taluk: data.taluk,
      address: data.address,
      emergency_contact: data.emergencyContact || null,
      designation: data.designation,
      aadhar_number: data.aadharNumber,
      photo_url: data.photoDataUrl || null,
      source: data.source,
      payment_status: withinFreeWindow ? "free" : "pending",
      payment_amount: withinFreeWindow ? 0 : MEMBERSHIP_FEE,
      valid_from: validFrom.toISOString().slice(0, 10),
      valid_until: validUntil.toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
    };

    const { saveLocalMember } = await import("./storage.server");
    // Always persist locally to guarantee immediate availability in dashboard and QR verification
    saveLocalMember(localFallback);

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row, error } = await supabaseAdmin
        .from("members")
        .insert({
          membership_id: localFallback.membership_id,
          full_name: data.fullName,
          date_of_birth: data.dateOfBirth,
          phone: data.phone,
          blood_group: data.bloodGroup,
          district: data.district,
          taluk: data.taluk,
          address: data.address,
          emergency_contact: data.emergencyContact || null,
          designation: data.designation,
          aadhar_number: data.aadharNumber,
          photo_url: data.photoDataUrl || null,
          consent: true,
          source: data.source,
          payment_status: withinFreeWindow ? "free" : "pending",
          payment_amount: withinFreeWindow ? 0 : MEMBERSHIP_FEE,
          valid_from: validFrom.toISOString().slice(0, 10),
          valid_until: validUntil.toISOString().slice(0, 10),
        })
        .select("*")
        .single();

      if (!error && row) {
        saveLocalMember(row as MemberRecord);
        return row as MemberRecord;
      }
    } catch (err) {
      console.warn("Supabase not reachable, saved to local database:", err);
    }

    return localFallback;
  });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) =>
    z.object({ username: z.string().min(1), password: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { verifyCredentials, issueAdminToken } = await import("./admin.server");
    if (!verifyCredentials(data.username, data.password)) {
      return { ok: false as const };
    }
    return { ok: true as const, token: issueAdminToken() };
  });

export const listMembers = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }): Promise<MemberRecord[]> => {
    const { assertAdminToken } = await import("./admin.server");
    assertAdminToken(data.token);

    const { loadLocalMembers } = await import("./storage.server");
    const localList = loadLocalMembers();

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows, error } = await supabaseAdmin
        .from("members")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && rows && rows.length > 0) {
        // Merge Supabase rows and local rows
        const map = new Map<string, MemberRecord>();
        for (const r of rows as MemberRecord[]) map.set(r.membership_id, r);
        for (const l of localList) if (!map.has(l.membership_id)) map.set(l.membership_id, l);
        return Array.from(map.values()).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      }
    } catch {
      // Fallback to local list if Supabase fails
    }

    return localList.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  });

export const deleteMember = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; id: string }) =>
    z.object({ token: z.string(), id: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdminToken } = await import("./admin.server");
    assertAdminToken(data.token);

    const { deleteLocalMember } = await import("./storage.server");
    deleteLocalMember(data.id);

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("members").delete().eq("id", data.id);
    } catch {
      // Handled locally
    }

    return { ok: true as const };
  });

/** Used by the QR code target page: verification details only. */
export const verifyMembership = createServerFn({ method: "POST" })
  .inputValidator((data: { membershipId: string }) =>
    z.object({ membershipId: z.string().trim().min(4).max(30) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { findLocalMember } = await import("./storage.server");
    const local = findLocalMember(data.membershipId);
    if (local) {
      return { found: true as const, member: local };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("members")
        .select(
          "membership_id, full_name, designation, district, taluk, blood_group, date_of_birth, phone, photo_url, valid_from, valid_until, payment_status, created_at",
        )
        .eq("membership_id", data.membershipId.toUpperCase())
        .maybeSingle();

      if (row) return { found: true as const, member: row };
    } catch {
      // Handled
    }

    return { found: false as const };
  });
