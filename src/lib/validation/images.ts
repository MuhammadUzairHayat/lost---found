export const MAX_POST_IMAGES = 5;

export function validateImageUrl(url: string): boolean {
  if (url.length > 2048) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateImageUrls(
  value: unknown,
  options?: { required?: boolean; max?: number }
): { urls: string[] | null; error?: string } {
  const required = options?.required ?? false;
  const max = options?.max ?? MAX_POST_IMAGES;

  if (!Array.isArray(value)) {
    return required
      ? { urls: null, error: "At least one image is required." }
      : { urls: [] };
  }

  if (required && value.length === 0) {
    return { urls: null, error: "At least one image is required." };
  }

  if (value.length > max) {
    return { urls: null, error: `Maximum ${max} images allowed.` };
  }

  const urls: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !validateImageUrl(item)) {
      return { urls: null, error: "Invalid image URL." };
    }
    urls.push(item);
  }

  return { urls };
}
