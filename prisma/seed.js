/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const tutors = [
    {
      name: "Kashif Kalam",
      email: "ahsankalam04@gmail.com",
      subjects: "Algebra, Trigonometry, Calculus",
      bio: "Patient, structured tutoring focused on fundamentals and exam strategy.",
      hourlyRate: 55
    },
    {
      name: "Sara Ahmed",
      email: "sara@example.com",
      subjects: "Biology, Chemistry, Study Skills",
      bio: "Supportive coaching + clear explanations. Great for building confidence and exam routines.",
      hourlyRate: 50
    },
    {
      name: "Omar Hassan",
      email: "omar@example.com",
      subjects: "English, Essay Writing, IELTS",
      bio: "Helps you plan, draft, and polish writing — from structure to sentence-level clarity.",
      hourlyRate: 60
    }
  ];

  for (const t of tutors) {
    await prisma.tutor.upsert({
      where: { email: t.email },
      create: t,
      update: {
        name: t.name,
        subjects: t.subjects,
        bio: t.bio,
        hourlyRate: t.hourlyRate
      }
    });
  }

  console.log("Seeded tutors.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
