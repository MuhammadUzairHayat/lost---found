import { CATEGORIES, POST_TYPES } from "@/lib/constants/constants";
import type { CategoryId, PostTypeId } from "@/lib/constants/constants";
import { validateImageUrls } from "@/lib/validation/images";

export const POST_TITLE_MIN = 3;
export const POST_TITLE_MAX = 120;
export const POST_DESCRIPTION_MAX = 2000;
export const POST_LOCATION_MAX = 200;
export const HAND_NOTE_MAX = 500;

export interface CreatePostInput {
  type: PostTypeId;
  category: CategoryId;
  title: string;
  description: string;
  location: string;
  images: string[];
}

export interface CreatePostValidationErrors {
  type?: string;
  category?: string;
  title?: string;
  description?: string;
  location?: string;
  images?: string;
}

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const TYPE_IDS = new Set(POST_TYPES.map((t) => t.id));

export function validateCreatePostInput(
  body: Record<string, unknown>
): { input: CreatePostInput | null; errors: CreatePostValidationErrors } {
  const errors: CreatePostValidationErrors = {};

  const type = typeof body.type === "string" ? body.type : "";
  const category = typeof body.category === "string" ? body.category : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";

  if (!TYPE_IDS.has(type as PostTypeId)) {
    errors.type = "Invalid post type.";
  }
  if (!CATEGORY_IDS.has(category as CategoryId)) {
    errors.category = "Invalid category.";
  }
  if (title.length < POST_TITLE_MIN || title.length > POST_TITLE_MAX) {
    errors.title = `Title must be between ${POST_TITLE_MIN} and ${POST_TITLE_MAX} characters.`;
  }
  if (description.length > POST_DESCRIPTION_MAX) {
    errors.description = `Description cannot exceed ${POST_DESCRIPTION_MAX} characters.`;
  }
  if (location.length > POST_LOCATION_MAX) {
    errors.location = `Location cannot exceed ${POST_LOCATION_MAX} characters.`;
  }

  const { urls: images, error: imagesError } = validateImageUrls(body.images, {
    required: true,
  });
  if (imagesError) {
    errors.images = imagesError;
  }

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  return {
    input: {
      type: type as PostTypeId,
      category: category as CategoryId,
      title,
      description,
      location,
      images: images ?? [],
    },
    errors,
  };
}

export function hasPostErrors(errors: CreatePostValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function validateHandNote(note: string): string | null {
  const trimmed = note.trim();
  if (trimmed.length > HAND_NOTE_MAX) {
    return `Note cannot exceed ${HAND_NOTE_MAX} characters.`;
  }
  return null;
}

export const COMMENT_BODY_MIN = 1;
export const COMMENT_BODY_MAX = 1000;

export function validateCommentBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length < COMMENT_BODY_MIN) {
    return "Comment cannot be empty.";
  }
  if (trimmed.length > COMMENT_BODY_MAX) {
    return `Comment cannot exceed ${COMMENT_BODY_MAX} characters.`;
  }
  return null;
}
