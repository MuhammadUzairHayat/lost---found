/** Matches `ContactMethod` in prisma/schema.prisma */
export type ContactMethod = "EMAIL" | "PHONE" | "WHATSAPP";

const CONTACT_METHODS = new Set<string>(["EMAIL", "PHONE", "WHATSAPP"]);

export function isContactMethod(value: string): value is ContactMethod {
  return CONTACT_METHODS.has(value);
}
