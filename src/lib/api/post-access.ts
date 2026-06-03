import type { ContactInfo, Hand, Post } from "@/lib/types";

const EMPTY_CONTACT: ContactInfo = {
  method: "phone",
  phone: "",
  email: "",
  whatsapp: "",
};

export function canViewPostContacts(
  viewerId: string | null,
  post: Post,
  hands: Hand[]
): boolean {
  if (!viewerId) return false;
  if (post.authorId === viewerId) return true;
  return hands.some((h) => h.userId === viewerId);
}

export function redactPostContact(post: Post): Post {
  return { ...post, contact: { ...EMPTY_CONTACT } };
}

export function redactHandContact(hand: Hand): Hand {
  return { ...hand, contact: { ...EMPTY_CONTACT } };
}

export function applyPostVisibility(
  viewerId: string | null,
  post: Post,
  hands: Hand[]
): { post: Post; hands: Hand[]; canViewContacts: boolean } {
  const showContacts = canViewPostContacts(viewerId, post, hands);
  if (showContacts) {
    return { post, hands, canViewContacts: true };
  }
  return {
    post: redactPostContact(post),
    hands: hands.map(redactHandContact),
    canViewContacts: false,
  };
}
