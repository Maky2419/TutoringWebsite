/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.tutor.findFirst();
  if (!existing) {
    await prisma.tutor.createMany({
      data: [
        {
          name: "Kashif Kalam",
          subjects: "Algebra, Trigonometry, Calculus",
          bio: "Patient, structured tutoring focused on fundamentals and exam strategy.",
          hourlyRate: 55
        },
        {
          name: "Ambreen Naseem",
          subjects: "English, Essay Writing, IELTS",
          bio: "Clear writing systems, feedback loops, and confidence-building practice.",
          hourlyRate: 60
        },
        {
          name: "Muhammad Ahsan",
          subjects: "Physics, Chemistry",
          bio: "Concept-first approach with lots of practice and real-world intuition.",
          hourlyRate: 65
        }
      ]
    });
    console.log("Seeded tutors.");
  }

  // Optional: seed an admin user placeholder
  const adminEmail = "admin@example.com";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    await prisma.user.create({
      data: { email: adminEmail, fullName: "Admin", password: "change-me", role: "admin" }
    });
    console.log("Seeded admin user.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
