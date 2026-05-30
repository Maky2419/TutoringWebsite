"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Review = {
  id: number;
  student: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Props = {
  initialProfile: {
    name: string;
    email: string;
    subjects: string[];
    education: string;
    bio: string;
  };
  initialReviews: Review[];
};

function stars(rating: number) {
  const safe = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function TutorAccountClient({
  initialProfile,
  initialReviews,
}: Props) {
  const [subjects, setSubjects] = useState<string[]>(initialProfile.subjects);
  const [subjectInput, setSubjectInput] = useState("");
  const [education, setEducation] = useState(initialProfile.education);
  const [bio, setBio] = useState(initialProfile.bio);

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [student, setStudent] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [reviewState, setReviewState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [passwordState, setPasswordState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [saveMessage, setSaveMessage] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    );
  }, [reviews]);

  function addSubject() {
    const value = subjectInput.trim();

    if (!value) return;

    if (
      subjects.some(
        (subject) => subject.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSubjectInput("");
      return;
    }

    setSubjects((current) => [...current, value]);
    setSubjectInput("");
  }

  function removeSubject(subjectToRemove: string) {
    setSubjects((current) =>
      current.filter((subject) => subject !== subjectToRemove)
    );
  }

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveState("saving");
    setSaveMessage("");

    try {
      const response = await fetch("/api/tutor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjects,
          education,
          bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setSaveState("saved");
      setSaveMessage("Profile updated successfully.");
    } catch (error: any) {
      setSaveState("error");
      setSaveMessage(error?.message || "Something went wrong while saving.");
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordState("saving");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordState("error");
      setPasswordMessage("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/tutor/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordState("saved");
      setPasswordMessage("Password updated successfully.");
    } catch (error: any) {
      setPasswordState("error");
      setPasswordMessage(
        error?.message || "Something went wrong while updating password."
      );
    }
  }

  async function handleAddReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReviewState("saving");
    setReviewMessage("");

    try {
      const response = await fetch("/api/tutor/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student,
          rating: Number(rating),
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add review");
      }

      setReviews((current) => [
        {
          id: data.review.id,
          student: data.review.student,
          rating: data.review.rating,
          comment: data.review.comment,
          createdAt: data.review.createdAt,
        },
        ...current,
      ]);

      setStudent("");
      setRating("5");
      setComment("");
      setReviewState("saved");
      setReviewMessage("Review added successfully.");
    } catch (error: any) {
      setReviewState("error");
      setReviewMessage(
        error?.message || "Something went wrong while adding the review."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-100 p-8 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Tutor Account
              </p>

              <h1 className="mt-3 text-4xl font-extrabold text-slate-950">
                Manage your public profile
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                Update the information students see on your tutor profile and
                add social proof with reviews.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tutor/dashboard"
                className="inline-flex rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Back to Dashboard
              </Link>

              <Link
                href="/tutors"
                className="inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                View Tutors Page
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <SectionCard
              title="Profile Details"
              subtitle="Edit your subjects, education, and bio from one place."
            >
              <form className="space-y-6" onSubmit={handleSaveProfile}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Name
                    </label>
                    <input
                      value={initialProfile.name}
                      disabled
                      className="w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <input
                      value={initialProfile.email}
                      disabled
                      className="w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 py-3 text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subjects
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubject();
                        }
                      }}
                      placeholder="Add a subject like Calculus or Chemistry"
                      className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={addSubject}
                      className="rounded-2xl bg-green-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-600"
                    >
                      Add Subject
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {subjects.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-600">
                        No subjects added yet.
                      </div>
                    ) : (
                      subjects.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => removeSubject(subject)}
                          className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          {subject} ×
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Education
                  </label>

                  <textarea
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    rows={4}
                    placeholder="Add your degree, certifications, and relevant academic background"
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Bio
                  </label>

                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={7}
                    placeholder="Describe your teaching style, experience, and how you support students"
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={saveState === "saving"}
                    className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saveState === "saving" ? "Saving..." : "Save Profile"}
                  </button>

                  {saveMessage && (
                    <p
                      className={`text-sm font-semibold ${
                        saveState === "error"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {saveMessage}
                    </p>
                  )}
                </div>
              </form>
            </SectionCard>

            <SectionCard
              title="Change Password"
              subtitle="Update the password used to sign in to your tutor account."
            >
              <form className="space-y-5" onSubmit={handleChangePassword}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter your current password"
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Enter a new password"
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Re-enter your new password"
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={passwordState === "saving"}
                    className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {passwordState === "saving"
                      ? "Updating..."
                      : "Update Password"}
                  </button>

                  {passwordMessage && (
                    <p
                      className={`text-sm font-semibold ${
                        passwordState === "error"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {passwordMessage}
                    </p>
                  )}
                </div>
              </form>
            </SectionCard>
          </div>

          <div className="space-y-8">
            <SectionCard
              title="Profile Summary"
              subtitle="A quick snapshot of what students will notice first."
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Subjects listed</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950">
                    {subjects.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Reviews</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950">
                    {reviews.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-yellow-50 p-4">
                  <p className="text-sm text-slate-600">Average rating</p>
                  <p className="mt-2 text-3xl font-extrabold text-yellow-600">
                    {reviews.length === 0 ? "New" : averageRating.toFixed(1)}
                  </p>

                  {reviews.length > 0 && (
                    <p className="mt-2 text-sm text-yellow-600">
                      {stars(averageRating)}
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Add a Review"
              subtitle="Create a review entry that appears on the public tutor page."
            >
              <form className="space-y-4" onSubmit={handleAddReview}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Student name
                  </label>

                  <input
                    value={student}
                    onChange={(e) => setStudent(e.target.value)}
                    placeholder="Enter the student's first name or full name"
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Rating
                  </label>

                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} star{value === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Comment
                  </label>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="Write a short testimonial or review comment"
                    className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={reviewState === "saving"}
                    className="rounded-2xl bg-green-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewState === "saving" ? "Adding..." : "Add Review"}
                  </button>

                  {reviewMessage && (
                    <p
                      className={`text-sm font-semibold ${
                        reviewState === "error"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {reviewMessage}
                    </p>
                  )}
                </div>
              </form>
            </SectionCard>
          </div>
        </div>

        <div className="mt-8">
          <SectionCard
            title="Saved Reviews"
            subtitle="These testimonials will appear on each tutor's public profile page."
          >
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6 text-sm text-slate-600">
                No reviews added yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-blue-100 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-slate-950">
                          {review.student}
                        </p>
                        <p className="mt-1 text-sm text-yellow-600">
                          {stars(review.rating)}
                        </p>
                      </div>

                      <p className="text-sm text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}