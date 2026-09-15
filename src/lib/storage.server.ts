import fs from "node:fs";
import path from "node:path";
import type { MemberRecord } from "./members.functions";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "members.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

export function loadLocalMembers(): MemberRecord[] {
  try {
    ensureFile();
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load local members:", err);
    return [];
  }
}

export function saveLocalMember(member: MemberRecord): void {
  try {
    ensureFile();
    const list = loadLocalMembers();
    const existingIndex = list.findIndex(
      (m) => m.id === member.id || m.membership_id === member.membership_id,
    );
    if (existingIndex >= 0) {
      list[existingIndex] = member;
    } else {
      list.push(member);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save local member:", err);
  }
}

export function findLocalMember(membershipId: string): MemberRecord | undefined {
  const list = loadLocalMembers();
  const normalized = membershipId.trim().toUpperCase();
  return list.find((m) => m.membership_id.toUpperCase() === normalized);
}

export function deleteLocalMember(id: string): void {
  try {
    ensureFile();
    const list = loadLocalMembers();
    const filtered = list.filter((m) => m.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to delete local member:", err);
  }
}
