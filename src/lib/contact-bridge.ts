import type { ContactMethod } from "@/lib/db/enums";
import type { ContactInfo } from "@/lib/types";
import type { ContactMethodId } from "@/lib/constants/constants";

export function prismaMethodToContactId(
  method: ContactMethod
): ContactMethodId {
  switch (method) {
    case "EMAIL":
      return "email";
    case "PHONE":
      return "phone";
    case "WHATSAPP":
      return "whatsapp";
  }
}

export function contactIdToPrismaMethod(
  method: ContactMethodId
): ContactMethod {
  switch (method) {
    case "email":
      return "EMAIL";
    case "phone":
      return "PHONE";
    case "whatsapp":
      return "WHATSAPP";
  }
}

export function buildContactInfo(
  method: ContactMethod,
  value: string
): ContactInfo {
  const id = prismaMethodToContactId(method);
  const trimmed = value.trim();
  return {
    method: id,
    phone: method === "PHONE" ? trimmed : "",
    email: method === "EMAIL" ? trimmed : "",
    whatsapp: method === "WHATSAPP" ? trimmed : "",
  };
}

export function emptyContactJson(): ContactInfo {
  return { method: "email", phone: "", email: "", whatsapp: "" };
}
