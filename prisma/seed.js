/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const tutors = [
    {
      name: "Muhammad Ahsan",
      email: "ahsankalam04@gmail.com",
      subjects: "Algebra, Trigonometry, Calculus",
      bio: "Patient, structured tutoring focused on fundamentals and exam strategy.",
      education: "BSc Mathematics – University of British Columbia",
      hourlyRate: 55
    },
    {
      name: "Emaan Kalam",
      email: "ekalam569@gmail.com",
      subjects: "Biology, Chemistry, Study Skills",
      bio: "Supportive coaching + clear explanations. Great for building confidence and exam routines.",
      education: "BSc Biology – University of British Columbia",
      hourlyRate: 50
    },
    {
      name: "Ambreen Naseem",
      email: "Amber_kashif@yahoo.com",
      subjects: "English, Essay Writing, IELTS",
      bio: "Helps you plan, draft, and polish writing — from structure to sentence-level clarity.",
      education: "BA English – University of British Columbia",
      hourlyRate: 60
    }
  ];

  // Upsert tutors
  for (const t of tutors) {
    await prisma.tutor.upsert({
      where: { email: t.email },
      create: t,
      update: {
        name: t.name,
        subjects: t.subjects,
        bio: t.bio,
        education: t.education,
        hourlyRate: t.hourlyRate
      }
    });
  }

  console.log("Seeded tutors.");

  // Fetch tutors to map ids
  const allTutors = await prisma.tutor.findMany({
    select: { id: true, email: true }
  });

  const tutorIdByEmail = new Map(allTutors.map((t) => [t.email, t.id]));

  // Idempotent reviews: we insert only if none exist yet
  const existingReviewsCount = await prisma.review.count();

  if (existingReviewsCount === 0) {
    const ahsanId = tutorIdByEmail.get("ahsankalam04@gmail.com");
    const emaanId = tutorIdByEmail.get("ekalam569@gmail.com");
    const ambreenId = tutorIdByEmail.get("Amber_kashif@yahoo.com");

    const reviewsToCreate = [];

    if (ahsanId) {
      reviewsToCreate.push(
        {
          rating: 5,
          comment: "Super clear explanations and very patient!",
          student: "Jason",
          tutorId: ahsanId
        },
        {
          rating: 5,
          comment: "Helped me understand trig identities in one session.",
          student: "Zey",
          tutorId: ahsanId
        }
      );
    }

    if (emaanId) {
      reviewsToCreate.push(
        {
          rating: 5,
          comment: "Amazing for study skills and keeping me on track.",
          student: "Amina",
          tutorId: emaanId
        },
        {
          rating: 4,
          comment: "Very supportive and organized sessions.",
          student: "Yusuf",
          tutorId: emaanId
        }
      );
    }

    if (ambreenId) {
      reviewsToCreate.push(
        {
          rating: 5,
          comment: "My essays improved a lot — great feedback and structure tips.",
          student: "Hassan",
          tutorId: ambreenId
        }
      );
    }

    if (reviewsToCreate.length > 0) {
      await prisma.review.createMany({ data: reviewsToCreate });
      console.log(`Seeded ${reviewsToCreate.length} reviews.`);
    } else {
      console.log("No tutor IDs found for reviews; skipped review seeding.");
    }
  } else {
    console.log("Reviews already exist; skipped review seeding.");
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
