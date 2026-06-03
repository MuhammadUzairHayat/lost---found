export type UserDirectoryItem = {
  id: string;
  name: string;
  studentId: string | null;
  department: string | null;
  bio: string | null;
  avatar: string | null;
};

export type UserDirectoryPage = {
  users: UserDirectoryItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const USERS_DIRECTORY_DEFAULT_LIMIT = 12;
export const USERS_DIRECTORY_MAX_LIMIT = 48;
