// src/utils/slugify.ts
export const slugify = (input: string): string =>
  input.toLowerCase().trim().replace(/\s+/g, "-");