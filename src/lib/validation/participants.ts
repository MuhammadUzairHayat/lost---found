import type { ContactInfo, Hand, Participant, Post } from "@/lib/types";

export function buildParticipants(post: Post, hands: Hand[]): Participant[] {
  const owner: Participant = {
    id: `owner-${post.id}`,
    userId: post.authorId,
    name: post.authorName,
    role: "owner",
    note:
      post.type === "lost"
        ? "Posted as lost item"
        : "Posted as found item",
    contact: post.contact,
    createdAt: post.createdAt,
  };

  const raised: Participant[] = hands.map((h) => ({
    id: h.id,
    userId: h.userId,
    name: h.userName,
    role: "raised" as const,
    note: h.note || "Raised hand — I may have found or seen this.",
    contact: h.contact,
    createdAt: h.createdAt,
  }));

  return [owner, ...raised];
}

export function primaryContactValue(contact: ContactInfo): string {
  if (contact.method === "phone" && contact.phone) return contact.phone;
  if (contact.method === "email" && contact.email) return contact.email;
  if (contact.method === "whatsapp" && contact.whatsapp) return contact.whatsapp;
  return contact.phone || contact.email || contact.whatsapp || "";
}

export function contactHref(contact: ContactInfo): string | null {
  if (contact.method === "phone" && contact.phone) {
    return `tel:${contact.phone.replace(/\s/g, "")}`;
  }
  if (contact.method === "email" && contact.email) {
    return `mailto:${contact.email}`;
  }
  if (contact.method === "whatsapp" && contact.whatsapp) {
    const digits = contact.whatsapp.replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }
  return null;
}

export type ContactChannel = {
  id: ContactInfo["method"];
  label: string;
  value: string;
  href: string;
  external: boolean;
};

export function getContactChannels(contact: ContactInfo): ContactChannel[] {
  const channels: ContactChannel[] = [];

  const phone = contact.phone?.trim();
  if (phone) {
    channels.push({
      id: "phone",
      label: "Call",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
      external: false,
    });
  }

  const email = contact.email?.trim();
  if (email) {
    channels.push({
      id: "email",
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      external: false,
    });
  }

  const whatsapp = contact.whatsapp?.trim();
  if (whatsapp) {
    channels.push({
      id: "whatsapp",
      label: "WhatsApp",
      value: whatsapp,
      href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
      external: true,
    });
  }

  return channels;
}
