import { DEPARTMENTS } from "@/lib/constants/departments";
import type { ContactMethod } from "@prisma/client";

export const STUDENT_ID_REGEX = /^[A-Z]{2}\d{2}-[A-Z]{4}-\d{4}$/;

const EMAIL_VALUE_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_VALUE_REGEX = /^\+\d{1,3}\d{9,12}$/;

export interface ProfileSetupInput {
  name: string;
  studentId: string;
  department: string;
  contactMethod: ContactMethod;
  contactValue: string;
  bio?: string;
  avatar?: string | null;
}

export interface ProfileValidationErrors {
  name?: string;
  studentId?: string;
  department?: string;
  contactMethod?: string;
  contactValue?: string;
  bio?: string;
  avatar?: string;
}

export function validateContactValue(
  method: ContactMethod,
  value: string
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter a valid email/phone/whatsapp";

  if (method === "EMAIL") {
    if (!EMAIL_VALUE_REGEX.test(trimmed)) {
      return "Please enter a valid university email";
    }
    return null;
  }

  if (!PHONE_VALUE_REGEX.test(trimmed)) {
    return "Please enter a valid phone number with country code (e.g. +12345678901)";
  }
  return null;
}

export function validateProfileSetup(
  input: ProfileSetupInput
): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};
  const name = input.name.trim();

  if (!name || name.length < 2 || name.length > 50) {
    errors.name = "Name must be between 2 and 50 characters";
  }

  const studentId = input.studentId.trim().toUpperCase();
  if (!STUDENT_ID_REGEX.test(studentId)) {
    errors.studentId = "Student ID must follow format: FA24-BSCS-0295";
  }

  if (!DEPARTMENTS.includes(input.department as (typeof DEPARTMENTS)[number])) {
    errors.department = "Please select your department";
  }

  if (!["EMAIL", "PHONE", "WHATSAPP"].includes(input.contactMethod)) {
    errors.contactMethod = "Please select a contact method";
  } else {
    const contactError = validateContactValue(
      input.contactMethod,
      input.contactValue
    );
    if (contactError) errors.contactValue = contactError;
  }

  if (input.bio && input.bio.length > 200) {
    errors.bio = "Bio cannot exceed 200 characters";
  }

  if (input.avatar) {
    if (input.avatar.length > 2048) {
      errors.avatar = "Invalid avatar URL";
    } else {
      try {
        const url = new URL(input.avatar);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.avatar = "Invalid avatar URL";
        }
      } catch {
        errors.avatar = "Invalid avatar URL";
      }
    }
  }

  return errors;
}

export function hasProfileErrors(errors: ProfileValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
