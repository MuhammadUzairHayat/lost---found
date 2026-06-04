import type { ContactMethod } from "@/lib/db/enums";
import type { StoredUser } from "@/lib/db/users";
import type { ContactInfo, Hand, Post } from "@/lib/types";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  studentId: string | null;
  department: string | null;
  bio: string | null;
  avatar: string | null;
  contactMethod: ContactMethod | null;
  contactValue: string | null;
  contact: ContactInfo;
  isProfileComplete: boolean;
};

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    studentId: user.studentId,
    department: user.department,
    bio: user.bio,
    avatar: user.avatar,
    contactMethod: user.contactMethod,
    contactValue: user.contactValue,
    contact: user.contact,
    isProfileComplete: user.isProfileComplete,
  };
}

export type PublicPost = Omit<Post, "contact"> & {
  authorAvatar?: string | null;
};

export function toPublicPost(post: Post): PublicPost {
  const { contact: _contact, ...rest } = post;
  return rest;
}

export function toPublicHand(hand: Hand): Omit<Hand, "contact"> {
  const { contact: _contact, ...rest } = hand;
  return rest;
}
