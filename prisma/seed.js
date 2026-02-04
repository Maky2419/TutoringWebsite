/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const tutors = [
    {
      name: "Muhammad Ahsan",
      email: "ahsankalam04@gmail.com",
      subjects: "AP Maths, IB DP Mathematic AA&AI, Computer Scicence, Java, Python,",
      bio: "Fourth-year undergraduate student nearing graduation in Computer Science and Mathematics, having completed mathematics at the fourth-year university level. I have over eight years of teaching experience, working with students from middle school and high school through to second-year university, as well as in professional and academic settings. I teach both mathematics and computer science and have experience teaching independently and under the guidance of experienced teachers and university professors. My teaching style is student-focused, supportive, and approachable, with an emphasis on helping students truly understand concepts rather than rely on memorization. I provide exam preparation support, including custom practice questions and exam-style papers, and ensure that students have a strong grasp of each topic before moving forward, addressing any concerns or gaps in understanding well before exams so they feel confident and prepared.",
      education: "BSc Computer Science and Mathematics – University of British Columbia",
      hourlyRate: 55
    },
    {
      name: "Emaan Kalam",
      email: "ekalam569@gmail.com",
      subjects: "MYP Science, IB Economics SL&HL, IB Business Management SL&HL, GSCE Economics, GSCE Business Studies, A Levels Economics, A Levels Business",
      bio: "I am a second-year student currently enrolled in the University of Toronto who genuinely loves learning and sharing that curiosity with others. My teaching style is interactive, using dynamic presentations, exercises, hands on activities and games to make learning engaging, accessible and fun. With strong leadership and mentoring skills as well as a multicultural perspective, I enjoy connecting with students from diverse backgrounds and helping them grow with confidence.",
      education: "American British Academy, Muscat, Oman (2009 – 2022); Jumeirah English Speaking School, Dubai, UAE (2022 – 2024); The University of Toronto (2024 – Current)",
      hourlyRate: 50
    },
    {
      name: "Ambreen Naseem",
      email: "Amber_kashif@yahoo.com",
      subjects: "English, Essay Writing, IELTS",
      bio: "Helps you plan, draft, and polish writing — from structure to sentence-level clarity.",
      education: "BA English – University of British Columbia",
      hourlyRate: 60
    },
    {
  name: "Kashif Kalam",
  email: "Kashif.Kalam@pwc.com",
  subjects: "Accounting, Finance, Audit, Risk Management, Investments",
  bio: "With over 35 years of experience across the GCC and South Asia, Kashif brings deep expertise in accounting, assurance, financial services, and risk management. He has worked extensively in Oman, the UAE, Saudi Arabia, Bahrain, and Pakistan, building strong relationships at Board, C-suite, and government levels. Currently leading Other Assurance Services for Oman and Bahrain, he specializes in audit, capital markets, accounting advisory, digital transformation, internal audit, and enterprise risk management. His background includes leading large assurance practices, managing high-value client portfolios, and mentoring large professional teams. Passionate about entrepreneurship and investing, Kashif closely follows global markets, fixed income, FX, commodities, and real estate trends, with a practical, real-world approach to finance and regulation.",
  education: "Chartered Accountant – Institute of Chartered Accountants of Pakistan",
  hourlyRate: 50
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
          comment: "Amazing for study skills and keeping me on track.",
          student: "Amina",
          tutorId: emaanId,
           createdAt: new Date("2026-1-18"),
        },
        {
          rating: 4,
          comment: "Very supportive and organized sessions.",
          student: "Yusuf",
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
