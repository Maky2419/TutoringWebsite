/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
 const tutors = [
  {
    name: "Muhammad Ahsan",
    email: "ahsankalam04@gmail.com",
    category: "STEM",
    subjects: ["Mathematics", "Computer Science", "Java", "Python", "Data Science"],
    curriculum: ["IB", "AP", "University"],
  bio: "Fourth-year undergraduate student nearing graduation in Computer Science and Mathematics at the University of British Columbia. I have over eight years of teaching experience working with students from middle school through second-year university. I teach mathematics and computer science with a focus on deep conceptual understanding rather than memorization. My lessons include exam preparation, custom practice questions, and structured problem solving so students feel confident and fully prepared before exams.",
    education: "BSc Computer Science and Mathematics – University of British Columbia",
    hourlyRate: 55,
  },
  {
    name: "Emaan Kalam",
    email: "ekalam569@gmail.com",
    category: "Business & Economics",
    subjects: ["Economics", "Business Management", "Business Studies"],
    curriculum: ["IB", "GCSE", "A-Level"],
  bio: "Second-year student at the University of Toronto studying Accounting and Economics. My teaching style is interactive and engaging, using presentations, exercises, and hands-on activities to help students truly understand material. I enjoy connecting with students from diverse backgrounds and helping them grow academically with confidence.",
    education: "BCom in Accounting and Economics – University of Toronto",
    hourlyRate: 55,
  },
  {
    name: "Ambreen Naseem",
    email: "Amber_kashif@yahoo.com",
    category: "STEM",
    subjects: ["Mathematics"],
    curriculum: ["IB", "PYP", "MYP", "British", "American"],
  bio: "I am an experienced private tutor with over 15 years of teaching elementary and middle school students across IB, British, and American curricula. My tutoring approach is highly personalized and adapted to each student's learning style. I have extensive experience supporting students with learning differences such as dyslexia and use multi-sensory techniques to make mathematics meaningful and accessible.",
    education: "Masters in Education – Buffalo State University, USA",
    hourlyRate: 55,
  },
  {
    name: "Margot Espinasse",
    email: "margot.e@wanadoo.fr",
    category: "Languages",
    subjects: ["French", "French as a Foreign Language"],
    curriculum: ["IB", "CNED"],
  bio: "French educator with over 13 years of experience teaching IB French. I specialize in helping students develop fluency, confidence, and cultural understanding in French. As a native speaker, I provide authentic language instruction along with strong exam preparation for IB students.",
    education: "Diploma and Certificates in FLE",
    hourlyRate: 60,
  },
  {
    name: "Kashif Qureshi",
    email: "Kashif.Kalam@pwc.com",
    category: "Business & Economics",
    subjects: ["Accounting", "Finance", "Audit", "Risk Management", "Investments"],
    curriculum: ["University", "Professional"],
  bio: "With over 35 years of professional experience across the GCC and South Asia, Kashif brings deep expertise in accounting, finance, and risk management. His teaching approach focuses on real-world examples and case studies to help students understand financial concepts and apply them effectively in academic and professional settings.",
    education: "Chartered Accountant – Fellow member of the Institute of Chartered Accountants",
    hourlyRate: 55,
  },
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
    const margotId = tutorIdByEmail.get("margot.e@wanadoo.fr");

    const reviewsToCreate = [];

    if (margotId) {
      reviewsToCreate.push(
        {
          rating: 5,
          comment: "Margot did a great job of keeping our son engaged and interested while following the CNED (National Centre for Distance Education) program over several years while he was studying at the International School in Oman. It was important for us to have a native french speaker and Margot made extra efforts to make the weekly lessons pertinent by bringing in historical and cultural facts and stories to help integrate the material. We highly recommend her for tutoring in French.",
          student: "Therese and Gilles Desorbay",
          tutorId: margotId,
          createdAt: new Date("2026-1-18"),
        }
      );
    }

    if (ahsanId) {
      reviewsToCreate.push(
        {
          rating: 5,
          comment: "The lesson with Ahsan went very well last night. Thank you for connecting us with him. I am looking forward to starting the regular schedule of tutoring next week - that will be on Monday and Wednesdays.  I’m extremely grateful for Ahsan’s help. Zey found the session extremely beneficial. He also appreciates that you pushed him and gave encouragement as well as positive reinforcement. ",
          student: "Dr. Ardoin, parent of Zey",
          tutorId: ahsanId,
          createdAt: new Date("2026-1-18"),
        },
        {
          rating: 5,
          comment: "Ahsan has been my tutor for the past two years, and he consistently goes beyond his comfort zone to support his students. Not only does he provide his own personalized learning notes, but he also creates past practice papers that match the difficulty level of our university courses. All of this is done while he maintains top grades in Mathematics and Computer Science at UBC, a top-30 university worldwide.",
          student: "Ahab Masoud Siddiqui",
          tutorId: ahsanId,
          createdAt: new Date("2022-08-22"),
        }
        ,
        {
          rating: 4,
          comment: "I worked with Ahsan during my university Calculus 1 and Calculus 2 courses, and his help made a huge difference. We met multiple times a week for long sessions, and he was always patient and fully focused. He never rushed through topics and made sure I actually understood the concepts. His explanations were clear and easy to follow, even for harder calculus ideas. He created his own notes and lots of practice questions that matched our course level. If something didn’t make sense, he explained it in a different way until it clicked. You can tell he knows calculus extremely well. The amount of time and effort he put in every week really stood out. Overall, his support helped me feel much more confident in the course.",
          student: "Aarav Singh Chabara",
          tutorId: ahsanId,
           createdAt: new Date("2026-1-18"),
        }
      );
    }

    if (emaanId) {
      reviewsToCreate.push(
        {
          rating: 5,
          comment: "Emaan is so helpful for me and Hamza loves her so much . May Allah Protect her. ",
          student: "Halima mother of Hamza",
          tutorId: emaanId,
           createdAt: new Date("2026-1-18"),
        }
      );
    }

    if (ambreenId) {
      reviewsToCreate.push(
        {
          rating: 5,
          comment: "It is our pleasure to write this letter to recommend Ms. Amber as an excellent math teacher. Ms.Amber uses different teaching techniques that encourages our children to ask queries, clarifies any doubts which helps them to develop conceptual understanding. Since our engagement with Ms. Amber, we have noticed that our kids’ interest in math has increased which is also reflected in their grades at class. We strongly recommend Ms. Amber as a very professional, dedicated math teacher.",
          student: "Samrah Maryam, parent ABA Oman an IB world school",
          tutorId: ambreenId,
           createdAt: new Date("2026-1-18"),
        },
        {
          rating: 4.5,
          comment: "We had Mrs.Amber as my daughter’s math tutor since 3rd grade , with times ( it’s been 3 yrs) I have seen my daughter developing interest and confidence in Math Amber was a catalyst in my daughter’s life who changed the perspective for her that Math does not resonate fear and anxiety but Math is interesting,logical and fun.",
          student: "Bhakti Toprani, Parent ABA Oman an IB world school and Teacher at Petroleum Development Oman School",
          tutorId: ambreenId,
           createdAt: new Date("2026-1-18"),
        },
        {
          rating: 5,
          comment: "Amber has worked as a math tutor for our daughter, Kimberly Ocean, for several years, both during middle school and high school. Kimberly Ocean was at that time a student at ABA Muscat, Oman (IB curriculum).Amber has been an invaluable help to get our daughter through school with a good grade Kimberly Ocean had difficulty understanding the schools teaching method and was really struggling. Amber had the ability to find a way to teach her that made sense to her and at the same time boost her self confidence to succeed. We will highly recommend Amber.",
          student: "Lise and Todd Herring",
          tutorId: ambreenId,
           createdAt: new Date("2026-1-18"),
        }
        ,
        {
          rating: 4,
          comment: "Hi Amber, I got my Criterion A and C marks back from before the winter break — A: 8 and C: 7. This honestly would not have been possible without your help. Thank you so much!",
          student: "Hamza",
          tutorId: ambreenId,
           createdAt: new Date("2026-1-18"),
        },
        {
          rating: 5,
          comment: "Hi Amber, I just wanted to send you a message. Thank you very much, Alya was so happy and relaxed, she was excited because her answers were correct 😊 you gave her this feeling that she can do it. She’ll be more than happy to take more classes with you 🌹",
          student: "Alya Parent",
          tutorId: ambreenId,
           createdAt: new Date("2026-1-18"),
        },
        {
          rating: 5,
          comment: "I am happy to recommend Ms. Ambereen Kalam, who has been my son’s private mathematics tutor.\n\nShe explains math in a very clear and patient way, breaking down difficult topics into simple steps that are easy to understand. Because of her approach, my son became more confident in math, his understanding improved, and his overall attitude toward the subject changed positively.\n\nMs. Ambereen is supportive, reliable, and genuinely cares about her students’ progress. I truly appreciate the positive impact she has had on my son’s learning and would gladly recommend her to any parent looking for a good math tutor.",
          student: "Halim Toptac",
          tutorId: ambreenId,
           createdAt: new Date("2026-2-03"),
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
