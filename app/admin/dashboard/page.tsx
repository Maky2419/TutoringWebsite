import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date?: Date | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleString();
}

function money(value: any) {
  if (value === null || value === undefined) return "$0.00";
  return `$${Number(value).toFixed(2)}`;
}

function jsonList(value: any) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function csvToJsonArray(value: FormDataEntryValue | null) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  if ((session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}

async function deleteTutorAndEverything(tutorId: number) {
  const tutor = await prisma.tutor.findUnique({
    where: { id: tutorId },
    include: {
      assignedStudents: true,
    },
  });

  if (!tutor) return;

  const assignmentIds = tutor.assignedStudents.map((a) => a.id);

  await prisma.tutorPaymentConfirmation.deleteMany({
    where: { tutorId },
  });

  await prisma.booking.deleteMany({
    where: { tutorId },
  });

  await prisma.review.deleteMany({
    where: { tutorId },
  });

  if (assignmentIds.length > 0) {
    await prisma.teachingSession.deleteMany({
      where: {
        assignmentId: {
          in: assignmentIds,
        },
      },
    });

    await prisma.studentTutorAssignment.deleteMany({
      where: {
        id: {
          in: assignmentIds,
        },
      },
    });
  }

  await prisma.tutor.delete({
    where: { id: tutorId },
  });

  if (tutor.userId) {
    await prisma.user.delete({
      where: { id: tutor.userId },
    });
  }
}

async function updateUserAction(formData: FormData) {
  "use server";

  const session = await requireAdmin();

  const id = String(formData.get("id"));
  const role = String(formData.get("role"));

  if (id === (session.user as any).id && role !== "ADMIN") {
    throw new Error("You cannot remove admin role from yourself.");
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      role: role as any,
    },
  });

  revalidatePath("/admin/dashboard");
}

async function deleteUserAction(formData: FormData) {
  "use server";

  const session = await requireAdmin();

  const id = String(formData.get("id"));

  if (id === (session.user as any).id) {
    throw new Error("You cannot delete your own admin account.");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      tutor: true,
    },
  });

  if (!user) return;

  if (user.tutor) {
    await deleteTutorAndEverything(user.tutor.id);
  } else {
    await prisma.tutorPaymentConfirmation.deleteMany({
      where: { studentId: id },
    });

    await prisma.booking.deleteMany({
      where: { studentUserId: id },
    });

    const assignments = await prisma.studentTutorAssignment.findMany({
      where: { studentId: id },
    });

    const assignmentIds = assignments.map((a) => a.id);

    if (assignmentIds.length > 0) {
      await prisma.teachingSession.deleteMany({
        where: {
          assignmentId: {
            in: assignmentIds,
          },
        },
      });

      await prisma.studentTutorAssignment.deleteMany({
        where: {
          id: {
            in: assignmentIds,
          },
        },
      });
    }

    await prisma.user.delete({
      where: { id },
    });
  }

  revalidatePath("/admin/dashboard");
}

async function updateTutorAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = Number(formData.get("id"));

  const tutor = await prisma.tutor.update({
    where: { id },
    data: {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      category: String(formData.get("category") || ""),
      subjects: csvToJsonArray(formData.get("subjects")),
      curriculum: csvToJsonArray(formData.get("curriculum")),
      hourlyRate: Number(formData.get("hourlyRate") || 0),
      bio: String(formData.get("bio") || ""),
      education: String(formData.get("education") || ""),
    },
  });

  if (tutor.userId) {
    await prisma.user.update({
      where: { id: tutor.userId },
      data: {
        name: tutor.name,
        email: tutor.email,
      },
    });
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/tutors");
}

async function deleteTutorAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await deleteTutorAndEverything(Number(formData.get("id")));

  revalidatePath("/admin/dashboard");
  revalidatePath("/tutors");
}

async function updateBookingAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.booking.update({
    where: { id: Number(formData.get("id")) },
    data: {
      studentName: String(formData.get("studentName") || ""),
      studentEmail: String(formData.get("studentEmail") || ""),
      subject: String(formData.get("subject") || ""),
      preferredTimes: String(formData.get("preferredTimes") || ""),
      message: String(formData.get("message") || ""),
      status: String(formData.get("status") || "pending"),
      tutorId: Number(formData.get("tutorId")),
    },
  });

  revalidatePath("/admin/dashboard");
}

async function deleteBookingAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.booking.delete({
    where: { id: Number(formData.get("id")) },
  });

  revalidatePath("/admin/dashboard");
}

async function updateAssignmentAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.studentTutorAssignment.update({
    where: { id: Number(formData.get("id")) },
    data: {
      tutorId: Number(formData.get("tutorId")),
      studentId: String(formData.get("studentId")),
      accumulatedTotal: String(formData.get("accumulatedTotal") || "0"),
    },
  });

  revalidatePath("/admin/dashboard");
}

async function deleteAssignmentAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = Number(formData.get("id"));

  await prisma.teachingSession.deleteMany({
    where: { assignmentId: id },
  });

  await prisma.studentTutorAssignment.delete({
    where: { id },
  });

  revalidatePath("/admin/dashboard");
}

async function updateTeachingSessionAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.teachingSession.update({
    where: { id: Number(formData.get("id")) },
    data: {
      lessonDate: new Date(String(formData.get("lessonDate"))),
      startTime: String(formData.get("startTime") || ""),
      endTime: String(formData.get("endTime") || ""),
      notes: String(formData.get("notes") || ""),
      durationHours: String(formData.get("durationHours") || "0"),
      amount: String(formData.get("amount") || "0"),
      status: String(formData.get("status") || "scheduled"),
    },
  });

  revalidatePath("/admin/dashboard");
}

async function deleteTeachingSessionAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.teachingSession.delete({
    where: { id: Number(formData.get("id")) },
  });

  revalidatePath("/admin/dashboard");
}

async function updatePaymentAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.tutorPaymentConfirmation.update({
    where: { id: Number(formData.get("id")) },
    data: {
      amountPaid: String(formData.get("amountPaid") || "0"),
      confirmed: String(formData.get("confirmed")) === "true",
      note: String(formData.get("note") || ""),
    },
  });

  revalidatePath("/admin/dashboard");
}

async function deletePaymentAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.tutorPaymentConfirmation.delete({
    where: { id: Number(formData.get("id")) },
  });

  revalidatePath("/admin/dashboard");
}

async function updateReviewAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.review.update({
    where: { id: Number(formData.get("id")) },
    data: {
      rating: Number(formData.get("rating")),
      student: String(formData.get("student") || ""),
      comment: String(formData.get("comment") || ""),
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/tutors");
}

async function deleteReviewAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.review.delete({
    where: { id: Number(formData.get("id")) },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/tutors");
}

async function deleteAccountAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.account.delete({
    where: {
      provider_providerAccountId: {
        provider: String(formData.get("provider")),
        providerAccountId: String(formData.get("providerAccountId")),
      },
    },
  });

  revalidatePath("/admin/dashboard");
}

async function deleteSessionAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.session.delete({
    where: {
      sessionToken: String(formData.get("sessionToken")),
    },
  });

  revalidatePath("/admin/dashboard");
}

async function deleteVerificationTokenAction(formData: FormData) {
  "use server";

  await requireAdmin();

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: String(formData.get("identifier")),
        token: String(formData.get("token")),
      },
    },
  });

  revalidatePath("/admin/dashboard");
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    users,
    tutors,
    bookings,
    assignments,
    teachingSessions,
    payments,
    reviews,
    accounts,
    loginSessions,
    verificationTokens,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tutor: true,
        studentBookings: true,
        assignedTutors: true,
        paymentConfirmations: true,
        accounts: true,
        sessions: true,
      },
    }),

    prisma.tutor.findMany({
      orderBy: { id: "desc" },
      include: {
        user: true,
        bookings: true,
        reviews: true,
        assignedStudents: {
          include: {
            student: true,
          },
        },
        paymentConfirmations: true,
      },
    }),

    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tutor: true,
        studentUser: true,
      },
    }),

    prisma.studentTutorAssignment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        tutor: true,
        sessions: true,
      },
    }),

    prisma.teachingSession.findMany({
      orderBy: { lessonDate: "desc" },
      include: {
        assignment: {
          include: {
            student: true,
            tutor: true,
          },
        },
        confirmations: true,
      },
    }),

    prisma.tutorPaymentConfirmation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tutor: true,
        student: true,
        teachingSession: true,
      },
    }),

    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tutor: true,
      },
    }),

    prisma.account.findMany({
      include: {
        user: true,
      },
    }),

    prisma.session.findMany({
      orderBy: {
        expires: "desc",
      },
      include: {
        user: true,
      },
    }),

    prisma.verificationToken.findMany({
      orderBy: {
        expires: "desc",
      },
    }),
  ]);

  const students = users.filter((user) => user.role === "STUDENT");
  const tutorUsers = users.filter((user) => user.role === "TUTOR");
  const adminUsers = users.filter((user) => user.role === "ADMIN");

  const totalSessionRevenue = teachingSessions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalPaymentsConfirmed = payments.reduce(
    (sum, item) => sum + Number(item.amountPaid || 0),
    0
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Full control over users, tutors, bookings, sessions, payments, reviews, and auth data.
          </p>
        </div>

        <Link
          href="/admin/create-tutor"
          className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow hover:bg-blue-700"
        >
          Create New Tutor
        </Link>
      </div>

      <section className="mb-12 grid gap-5 md:grid-cols-4">
        <Stat title="Total Users" value={users.length} />
        <Stat title="Students" value={students.length} />
        <Stat title="Tutor Users" value={tutorUsers.length} />
        <Stat title="Admins" value={adminUsers.length} />
        <Stat title="Tutor Profiles" value={tutors.length} />
        <Stat title="Bookings" value={bookings.length} />
        <Stat title="Assignments" value={assignments.length} />
        <Stat title="Teaching Sessions" value={teachingSessions.length} />
        <Stat title="Payments" value={payments.length} />
        <Stat title="Reviews" value={reviews.length} />
        <Stat title="OAuth Accounts" value={accounts.length} />
        <Stat title="Login Sessions" value={loginSessions.length} />
        <Stat title="Verification Tokens" value={verificationTokens.length} />
        <Stat title="Session Revenue" value={money(totalSessionRevenue)} />
        <Stat title="Payments Confirmed" value={money(totalPaymentsConfirmed)} />
      </section>

      <Section title="All Users — View / Edit / Delete">
        <div className="grid gap-5">
          {users.map((user) => (
            <Card key={user.id}>
              <form action={updateUserAction} className="grid gap-4">
                <input type="hidden" name="id" value={user.id} />

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Name" name="name" defaultValue={user.name || ""} />
                  <Field label="Email" name="email" defaultValue={user.email || ""} />
                  <RoleSelect defaultValue={user.role} />
                </div>

                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-5">
                  <Info label="User ID" value={user.id} />
                  <Info label="Created" value={formatDate(user.createdAt)} />
                  <Info label="Updated" value={formatDate(user.updatedAt)} />
                  <Info label="Bookings" value={user.studentBookings.length} />
                  <Info label="Assignments" value={user.assignedTutors.length} />
                  <Info label="Payments" value={user.paymentConfirmations.length} />
                  <Info label="OAuth Accounts" value={user.accounts.length} />
                  <Info label="Login Sessions" value={user.sessions.length} />
                  <Info label="Tutor Profile" value={user.tutor ? "Yes" : "No"} />
                </div>

                <button className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  Save User Changes
                </button>
              </form>

              <form action={deleteUserAction} className="mt-3">
                <input type="hidden" name="id" value={user.id} />
                <DeleteButton label="Delete User" />
              </form>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="All Tutors — View / Edit / Delete">
        <div className="grid gap-5">
          {tutors.map((tutor) => (
            <Card key={tutor.id}>
              <form action={updateTutorAction} className="grid gap-4">
                <input type="hidden" name="id" value={tutor.id} />

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name" name="name" defaultValue={tutor.name} />
                  <Field label="Email" name="email" defaultValue={tutor.email} />
                  <CategorySelect defaultValue={tutor.category} />
                  <Field
                    label="Hourly Rate"
                    name="hourlyRate"
                    type="number"
                    defaultValue={String(tutor.hourlyRate)}
                  />
                  <Field
                    label="Subjects"
                    name="subjects"
                    defaultValue={jsonList(tutor.subjects)}
                  />
                  <Field
                    label="Curriculum"
                    name="curriculum"
                    defaultValue={jsonList(tutor.curriculum)}
                  />
                </div>

                <TextArea label="Bio" name="bio" defaultValue={tutor.bio} />
                <TextArea label="Education" name="education" defaultValue={tutor.education || ""} />

                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-5">
                  <Info label="Tutor ID" value={tutor.id} />
                  <Info label="Linked User ID" value={tutor.userId || "N/A"} />
                  <Info label="Bookings" value={tutor.bookings.length} />
                  <Info label="Students" value={tutor.assignedStudents.length} />
                  <Info label="Reviews" value={tutor.reviews.length} />
                  <Info label="Payments" value={tutor.paymentConfirmations.length} />
                </div>

                <button className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  Save Tutor Changes
                </button>
              </form>

              <form action={deleteTutorAction} className="mt-3">
                <input type="hidden" name="id" value={tutor.id} />
                <DeleteButton label="Delete Tutor" />
              </form>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Bookings — View / Edit / Delete">
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <form action={updateBookingAction} className="grid gap-4">
                <input type="hidden" name="id" value={booking.id} />

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Student Name" name="studentName" defaultValue={booking.studentName} />
                  <Field label="Student Email" name="studentEmail" defaultValue={booking.studentEmail} />
                  <Field label="Subject" name="subject" defaultValue={booking.subject} />
                  <TutorSelect tutors={tutors} defaultValue={booking.tutorId} />
                  <Field label="Status" name="status" defaultValue={booking.status} />
                </div>

                <TextArea label="Preferred Times" name="preferredTimes" defaultValue={booking.preferredTimes} />
                <TextArea label="Message" name="message" defaultValue={booking.message || ""} />

                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-4">
                  <Info label="Booking ID" value={booking.id} />
                  <Info label="Created" value={formatDate(booking.createdAt)} />
                  <Info label="Updated" value={formatDate(booking.updatedAt)} />
                  <Info label="Student User" value={booking.studentUser?.email || "N/A"} />
                </div>

                <button className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  Save Booking Changes
                </button>
              </form>

              <form action={deleteBookingAction} className="mt-3">
                <input type="hidden" name="id" value={booking.id} />
                <DeleteButton label="Delete Booking" />
              </form>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Student-Tutor Assignments — View / Edit / Delete">
        <div className="grid gap-5">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <form action={updateAssignmentAction} className="grid gap-4">
                <input type="hidden" name="id" value={assignment.id} />

                <div className="grid gap-4 md:grid-cols-3">
                  <StudentSelect students={students} defaultValue={assignment.studentId} />
                  <TutorSelect tutors={tutors} defaultValue={assignment.tutorId} />
                  <Field
                    label="Accumulated Total"
                    name="accumulatedTotal"
                    type="number"
                    defaultValue={String(assignment.accumulatedTotal)}
                  />
                </div>

                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-4">
                  <Info label="Assignment ID" value={assignment.id} />
                  <Info label="Created" value={formatDate(assignment.createdAt)} />
                  <Info label="Student" value={assignment.student.email || "N/A"} />
                  <Info label="Tutor" value={assignment.tutor.name} />
                  <Info label="Sessions" value={assignment.sessions.length} />
                </div>

                <button className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  Save Assignment Changes
                </button>
              </form>

              <form action={deleteAssignmentAction} className="mt-3">
                <input type="hidden" name="id" value={assignment.id} />
                <DeleteButton label="Delete Assignment" />
              </form>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Teaching Sessions — View / Edit / Delete">
        <div className="grid gap-5">
          {teachingSessions.map((lesson) => (
            <Card key={lesson.id}>
              <form action={updateTeachingSessionAction} className="grid gap-4">
                <input type="hidden" name="id" value={lesson.id} />

                <div className="grid gap-4 md:grid-cols-4">
                  <Field
                    label="Lesson Date"
                    name="lessonDate"
                    type="datetime-local"
                    defaultValue={new Date(lesson.lessonDate).toISOString().slice(0, 16)}
                  />
                  <Field label="Start Time" name="startTime" defaultValue={lesson.startTime} />
                  <Field label="End Time" name="endTime" defaultValue={lesson.endTime} />
                  <Field
                    label="Duration Hours"
                    name="durationHours"
                    type="number"
                    defaultValue={String(lesson.durationHours)}
                  />
                  <Field
                    label="Amount"
                    name="amount"
                    type="number"
                    defaultValue={String(lesson.amount)}
                  />
                  <Field label="Status" name="status" defaultValue={lesson.status} />
                </div>

                <TextArea label="Notes" name="notes" defaultValue={lesson.notes || ""} />

                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-4">
                  <Info label="Session ID" value={lesson.id} />
                  <Info label="Student" value={lesson.assignment.student.email || "N/A"} />
                  <Info label="Tutor" value={lesson.assignment.tutor.name} />
                  <Info label="Payment Confirmations" value={lesson.confirmations.length} />
                  <Info label="Created" value={formatDate(lesson.createdAt)} />
                  <Info label="Updated" value={formatDate(lesson.updatedAt)} />
                </div>

                <button className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  Save Session Changes
                </button>
              </form>

              <form action={deleteTeachingSessionAction} className="mt-3">
                <input type="hidden" name="id" value={lesson.id} />
                <DeleteButton label="Delete Teaching Session" />
              </form>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Payment Confirmations — View / Edit / Delete">
        <div className="grid gap-5">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <form action={updatePaymentAction} className="grid gap-4">
                <input type="hidden" name="id" value={payment.id} />

                <div className="grid gap-4 md:grid-cols-3">
                  <Field
                    label="Amount Paid"
                    name="amountPaid"
                    type="number"
                    defaultValue={String(payment.amountPaid)}
                  />
                  <BooleanSelect name="confirmed" label="Confirmed" defaultValue={payment.confirmed} />
                </div>

                <TextArea label="Note" name="note" defaultValue={payment.note || ""} />

                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-4">
                  <Info label="Payment ID" value={payment.id} />
                  <Info label="Tutor" value={payment.tutor.name} />
                  <Info label="Student" value={payment.student.email || "N/A"} />
                  <Info label="Teaching Session ID" value={payment.teachingSessionId || "N/A"} />
                  <Info label="Created" value={formatDate(payment.createdAt)} />
                  <Info label="Updated" value={formatDate(payment.updatedAt)} />
                </div>

                <button className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  Save Payment Changes
                </button>
              </form>

              <form action={deletePaymentAction} className="mt-3">
                <input type="hidden" name="id" value={payment.id} />
                <DeleteButton label="Delete Payment" />
              </form>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Reviews — View / Edit / Delete">
        <div className="grid gap-5">
          {reviews.map((review) => (
            <Card key={review.id}>
              <form action={updateReviewAction} className="grid gap-4">
                <input type="hidden" name="id" value={review.id} />

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Tutor" name="tutorName" defaultValue={review.tutor.name} disabled />
                  <Field label="Student Name" name="student" defaultValue={review.student} />
                  <Field label="Rating" name="rating" type="number" defaultValue={String(review.rating)} />
                </div>

                <TextArea label="Comment" name="comment" defaultValue={review.comment} />

                <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-4">
                  <Info label="Review ID" value={review.id} />
                  <Info label="Created" value={formatDate(review.createdAt)} />
                </div>

                <button className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  Save Review Changes
                </button>
              </form>

              <form action={deleteReviewAction} className="mt-3">
                <input type="hidden" name="id" value={review.id} />
                <DeleteButton label="Delete Review" />
              </form>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="OAuth Accounts — View / Delete">
        <Table headers={["User", "Provider", "Provider Account ID", "Type", "Delete"]}>
          {accounts.map((account) => (
            <tr key={`${account.provider}-${account.providerAccountId}`} className="border-t align-top">
              <Td>{account.user.email || "N/A"}</Td>
              <Td>{account.provider}</Td>
              <Td>{account.providerAccountId}</Td>
              <Td>{account.type}</Td>
              <Td>
                <form action={deleteAccountAction}>
                  <input type="hidden" name="provider" value={account.provider} />
                  <input type="hidden" name="providerAccountId" value={account.providerAccountId} />
                  <DeleteButton label="Delete Account" />
                </form>
              </Td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Login Sessions — View / Delete">
        <Table headers={["User", "Session Token", "Expires", "Delete"]}>
          {loginSessions.map((session) => (
            <tr key={session.sessionToken} className="border-t align-top">
              <Td>{session.user.email || "N/A"}</Td>
              <Td>{session.sessionToken}</Td>
              <Td>{formatDate(session.expires)}</Td>
              <Td>
                <form action={deleteSessionAction}>
                  <input type="hidden" name="sessionToken" value={session.sessionToken} />
                  <DeleteButton label="Delete Session" />
                </form>
              </Td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Verification Tokens — View / Delete">
        <Table headers={["Identifier", "Token", "Expires", "Delete"]}>
          {verificationTokens.map((token) => (
            <tr key={`${token.identifier}-${token.token}`} className="border-t align-top">
              <Td>{token.identifier}</Td>
              <Td>{token.token}</Td>
              <Td>{formatDate(token.expires)}</Td>
              <Td>
                <form action={deleteVerificationTokenAction}>
                  <input type="hidden" name="identifier" value={token.identifier} />
                  <input type="hidden" name="token" value={token.token} />
                  <DeleteButton label="Delete Token" />
                </form>
              </Td>
            </tr>
          ))}
        </Table>
      </Section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-white p-6 shadow-sm">{children}</div>;
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="max-w-sm whitespace-normal break-words px-4 py-3 text-slate-700">
      {children}
    </td>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-slate-800">{String(value)}</p>
    </div>
  );
}

function DeleteButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
    >
      {label}
    </button>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  disabled = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        step={type === "number" ? "0.01" : undefined}
        className="rounded-lg border px-3 py-2 disabled:bg-slate-100"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="rounded-lg border px-3 py-2"
      />
    </label>
  );
}

function RoleSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-slate-700">Role</span>
      <select name="role" defaultValue={defaultValue} className="rounded-lg border px-3 py-2">
        <option value="ADMIN">ADMIN</option>
        <option value="STUDENT">STUDENT</option>
        <option value="TUTOR">TUTOR</option>
      </select>
    </label>
  );
}

function CategorySelect({ defaultValue }: { defaultValue: string }) {
  const categories = [
    "Languages",
    "STEM",
    "Business & Economics",
    "Humanities & Social Studies",
  ];

  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-slate-700">Category</span>
      <select name="category" defaultValue={defaultValue} className="rounded-lg border px-3 py-2">
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>
  );
}

function TutorSelect({ tutors, defaultValue }: { tutors: any[]; defaultValue: number }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-slate-700">Tutor</span>
      <select name="tutorId" defaultValue={defaultValue} className="rounded-lg border px-3 py-2">
        {tutors.map((tutor) => (
          <option key={tutor.id} value={tutor.id}>
            {tutor.name} — {tutor.email}
          </option>
        ))}
      </select>
    </label>
  );
}

function StudentSelect({ students, defaultValue }: { students: any[]; defaultValue: string }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-slate-700">Student</span>
      <select name="studentId" defaultValue={defaultValue} className="rounded-lg border px-3 py-2">
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name || "No Name"} — {student.email}
          </option>
        ))}
      </select>
    </label>
  );
}

function BooleanSelect({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select name={name} defaultValue={String(defaultValue)} className="rounded-lg border px-3 py-2">
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    </label>
  );
}