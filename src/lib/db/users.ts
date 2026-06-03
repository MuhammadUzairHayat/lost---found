import { v4 as uuidv4 } from "uuid";
import type { ContactMethod, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildContactInfo,
  contactIdToPrismaMethod,
  emptyContactJson,
} from "@/lib/contact-bridge";
import { validateContactValue } from "@/lib/validation/profile";
import type { ContactInfo } from "@/lib/types";
import {
  hasProfileErrors,
  validateProfileSetup,
  type ProfileSetupInput,
} from "@/lib/validation/profile";
export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  studentId: string | null;
  department: string | null;
  bio: string | null;
  avatar: string | null;
  contactMethod: ContactMethod | null;
  contactValue: string | null;
  contact: ContactInfo;
  isProfileComplete: boolean;
}

function parseContactJson(value: unknown): ContactInfo {
  if (value && typeof value === "object" && "method" in value) {
    return value as ContactInfo;
  }
  return emptyContactJson();
}

function mapPrismaUser(
  user: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    studentId: string | null;
    department: string | null;
    bio: string | null;
    avatar: string | null;
    contactMethod: ContactMethod | null;
    contactValue: string | null;
    contact: unknown;
    isProfileComplete: boolean;
  } | null
): StoredUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    studentId: user.studentId,
    department: user.department,
    bio: user.bio,
    avatar: user.avatar,
    contactMethod: user.contactMethod,
    contactValue: user.contactValue,
    contact: parseContactJson(user.contact),
    isProfileComplete: user.isProfileComplete,
  };
}

function prismaUnavailableError(err: unknown): Error {
  if (err instanceof Error) {
    if (err.message.includes("P1001") || err.message.includes("Can't reach")) {
      return new Error(
        "Database is unreachable. Check DATABASE_URL in your environment."
      );
    }
    if (
      err.message.includes("Unknown column") ||
      err.message.includes("does not exist") ||
      (err as { code?: string }).code === "P2022"
    ) {
      return new Error(
        "Database schema is out of date. Run: npx prisma db push"
      );
    }
    return err;
  }
  return new Error("Database error while saving profile.");
}

export async function getUserByEmail(
  email: string
): Promise<StoredUser | null> {
  try {
    const normalized = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalized },
    });
    return mapPrismaUser(user);
  } catch (err) {
    console.error("[users] getUserByEmail:", err);
    throw prismaUnavailableError(err);
  }
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return mapPrismaUser(user);
  } catch (err) {
    console.error("[users] getUserById:", err);
    throw prismaUnavailableError(err);
  }
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  name?: string;
}): Promise<StoredUser> {
  try {
    const normalized = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: normalized,
        passwordHash: input.passwordHash,
        name: input.name?.trim() ?? "",
        contact: emptyContactJson() as unknown as Prisma.InputJsonValue,
        isProfileComplete: false,
      },
    });
    return mapPrismaUser(user)!;
  } catch (err) {
    if (err instanceof Error && err.message.includes("already exists")) {
      throw err;
    }
    throw prismaUnavailableError(err);
  }
}

export async function completeUserProfile(
  id: string,
  input: ProfileSetupInput
): Promise<{ user: StoredUser | null; errors?: Record<string, string> }> {
  try {
    return await prismaCompleteUserProfile(id, input);
  } catch (err) {
    throw prismaUnavailableError(err);
  }
}

export async function updateUserProfile(
  id: string,
  input: ProfileSetupInput
): Promise<{ user: StoredUser | null; errors?: Record<string, string> }> {
  try {
    return await prismaCompleteUserProfile(id, input);
  } catch (err) {
    throw prismaUnavailableError(err);
  }
}

async function prismaCompleteUserProfile(
  id: string,
  input: ProfileSetupInput
): Promise<{ user: StoredUser | null; errors?: Record<string, string> }> {
  const errors = validateProfileSetup(input);
  if (hasProfileErrors(errors)) {
    return { user: null, errors: errors as Record<string, string> };
  }

  const studentId = input.studentId.trim().toUpperCase();
  const existingStudent = await prisma.user.findUnique({
    where: { studentId },
  });
  if (existingStudent && existingStudent.id !== id) {
    return {
      user: null,
      errors: { studentId: "This Student ID is already registered" },
    };
  }

  const contact = buildContactInfo(input.contactMethod, input.contactValue);
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: input.name.trim(),
      studentId,
      department: input.department,
      bio: input.bio?.trim() || null,
      avatar: input.avatar || null,
      contactMethod: input.contactMethod,
      contactValue: input.contactValue.trim(),
      contact: contact as unknown as Prisma.InputJsonValue,
      isProfileComplete: true,
    },
  });

  return { user: mapPrismaUser(user) };
}

export async function updateUserProfileLegacy(
  id: string,
  name: string,
  contact: ContactInfo
): Promise<{ user: StoredUser | null; errors?: Record<string, string> }> {
  try {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
      return { user: null, errors: { name: "Name must be between 2 and 50 characters" } };
    }

    const method = contactIdToPrismaMethod(contact.method);
    const value =
      method === "EMAIL"
        ? contact.email.trim()
        : method === "PHONE"
          ? contact.phone.trim()
          : contact.whatsapp.trim();

    const contactError = validateContactValue(method, value);
    if (contactError) {
      return { user: null, errors: { contact: contactError } };
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { user: null };

    const syncedContact = buildContactInfo(method, value);
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: trimmedName,
        contactMethod: method,
        contactValue: value,
        contact: syncedContact as unknown as Prisma.InputJsonValue,
      },
    });
    return { user: mapPrismaUser(updated) };
  } catch (err) {
    throw prismaUnavailableError(err);
  }
}

export function contactFromStoredUser(user: StoredUser): ContactInfo {
  if (user.contactMethod && user.contactValue) {
    return buildContactInfo(user.contactMethod, user.contactValue);
  }
  if (user.contact.method) {
    return user.contact;
  }
  return emptyContactJson();
}
