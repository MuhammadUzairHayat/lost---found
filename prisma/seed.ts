import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface SeedUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  studentId?: string;
  department?: string;
  bio?: string | null;
  avatar?: string | null;
  contactMethod?: "EMAIL" | "PHONE" | "WHATSAPP";
  contactValue?: string;
  contact: object;
  isProfileComplete?: boolean;
}

interface SeedPost {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  location: string;
  images?: string[];
  authorId: string;
  authorName: string;
  contact: object;
  status: string;
  createdAt: string;
}

interface SeedHand {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  note: string;
  contact: object;
  createdAt: string;
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function main() {
  const dataDir = path.join(process.cwd(), "data");

  const usersFile = await readJson<{ users: SeedUser[] }>(
    path.join(dataDir, "users.seed.json")
  );
  const dbFile = await readJson<{ posts: SeedPost[]; hands: SeedHand[] }>(
    path.join(dataDir, "db.seed.json")
  );

  const authorIds = new Set(dbFile.posts.map((p) => p.authorId));
  const handUserIds = new Set(dbFile.hands.map((h) => h.userId));
  const referencedUserIds = new Set([...authorIds, ...handUserIds]);

  for (const user of usersFile.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.trim().toLowerCase(),
        passwordHash: user.passwordHash,
        name: user.name,
        studentId: user.studentId ?? null,
        department: user.department ?? null,
        bio: user.bio ?? null,
        avatar: user.avatar ?? null,
        contactMethod: user.contactMethod ?? null,
        contactValue: user.contactValue ?? null,
        contact: user.contact,
        isProfileComplete: user.isProfileComplete ?? false,
      },
      update: {
        email: user.email.trim().toLowerCase(),
        passwordHash: user.passwordHash,
        name: user.name,
        studentId: user.studentId ?? null,
        department: user.department ?? null,
        bio: user.bio ?? null,
        avatar: user.avatar ?? null,
        contactMethod: user.contactMethod ?? null,
        contactValue: user.contactValue ?? null,
        contact: user.contact,
        isProfileComplete: user.isProfileComplete ?? false,
      },
    });
  }

  for (const userId of referencedUserIds) {
    const exists = usersFile.users.some((u) => u.id === userId);
    if (exists) continue;

    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: `${userId}@placeholder.local`,
        passwordHash: "",
        name: userId,
        contact: {
          method: "email",
          phone: "",
          email: "",
          whatsapp: "",
        },
        isProfileComplete: false,
      },
      update: {},
    });
  }

  for (const post of dbFile.posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      create: {
        id: post.id,
        type: post.type,
        category: post.category,
        title: post.title,
        description: post.description,
        location: post.location,
        images: post.images ?? [],
        authorId: post.authorId,
        authorName: post.authorName,
        contact: post.contact,
        status: post.status,
        createdAt: new Date(post.createdAt),
      },
      update: {
        type: post.type,
        category: post.category,
        title: post.title,
        description: post.description,
        location: post.location,
        images: post.images ?? [],
        authorName: post.authorName,
        contact: post.contact,
        status: post.status,
        createdAt: new Date(post.createdAt),
      },
    });
  }

  for (const hand of dbFile.hands) {
    await prisma.hand.upsert({
      where: { id: hand.id },
      create: {
        id: hand.id,
        postId: hand.postId,
        userId: hand.userId,
        userName: hand.userName,
        note: hand.note,
        contact: hand.contact,
        createdAt: new Date(hand.createdAt),
      },
      update: {
        postId: hand.postId,
        userId: hand.userId,
        userName: hand.userName,
        note: hand.note,
        contact: hand.contact,
        createdAt: new Date(hand.createdAt),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
