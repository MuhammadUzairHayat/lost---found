export const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Artificial Intelligence",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Accounting & Finance",
  "Economics",
  "Law",
  "Medicine",
  "Pharmacy",
  "Psychology",
  "Media Studies",
  "Design & Architecture",
  "Other",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
