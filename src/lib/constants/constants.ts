export const CATEGORIES = [
  { id: "vehicles", label: "Vehicles" },
  { id: "electronics", label: "Electronics" },
  { id: "documents", label: "Documents & IDs" },
  { id: "clothing", label: "Clothing" },
  { id: "keys", label: "Keys" },
  { id: "pets", label: "Pets" },
  { id: "bags", label: "Bags & Wallets" },
  { id: "other", label: "Other" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const POST_TYPES = [
  { id: "lost", label: "Lost" },
  { id: "found", label: "Found" },
] as const;

export type PostTypeId = (typeof POST_TYPES)[number]["id"];

export const CONTACT_METHODS = [
  { id: "phone", label: "Phone" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
] as const;

export type ContactMethodId = (typeof CONTACT_METHODS)[number]["id"];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function contactMethodLabel(id: string): string {
  return CONTACT_METHODS.find((c) => c.id === id)?.label ?? id;
}
