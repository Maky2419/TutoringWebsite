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
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/55">{subtitle}</p>}
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

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [reviewState, setReviewState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [stripeState, setStripeState] = useState<
    "idle" | "loading" | "error"
  >("idle");

  const [saveMessage, setSaveMessage] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [stripeMessage, setStripeMessage] = useState("");

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  function addSubject() {
    const value = subjectInput.trim();

    if (!value) return;

    if (subjects.some((subject) => subject.toLowerCase() === value.toLowerCase())) {
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

  async function handleStripeOnboarding() {
    setStripeState("loading");
    setStripeMessage("");

    try {
      const response = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not start Stripe onboarding.");
      }

      window.location.href = data.url;
    } catch (error: any) {
      setStripeState("error");
      setStripeMessage(error?.message || "Something went wrong.");
    }
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
      setReviewMessage(error?.message || "Something went wrong while adding the review.");
    }
  }

  return (
    <div className="min-h-screen bg-[#07111f]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-emerald-500/10 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-200/80">
                Tutor account
              </p>
              <h1 className="mt-3 text-4xl font-bold text-white">
                Manage your public profile
              </h1>
              <p className="mt-3 max-w-2xl text-white/65">
                Update the information students see on your tutor profile and activate Stripe payouts.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tutor/dashboard"
                className="inline-flex rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to dashboard
              </Link>
              <Link
                href="/tutors"
                className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                View tutors page
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <SectionCard
            title="Stripe payouts"
            subtitle="Activate your payout account so students can pay you through the platform."
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/70">
                  Students cannot pay until your Stripe payout account is connected.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStripeOnboarding}
                disabled={stripeState === "loading"}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {stripeState === "loading"
                  ? "Opening Stripe..."
                  : "Activate Stripe payouts"}
              </button>
            </div>

            {stripeMessage && (
              <p className="mt-3 text-sm text-rose-300">{stripeMessage}</p>
            )}
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Profile details"
            subtitle="Edit your subjects, education, and bio from one place."
          >
            <form className="space-y-6" onSubmit={handleSaveProfile}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Name
                  </label>
                  <input
                    value={initialProfile.name}
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white/60 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    value={initialProfile.email}
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white/60 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
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
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
                  />

                  <button
                    type="button"
                    onClick={addSubject}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  >
                    Add subject
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {subjects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-white/55">
                      No subjects added yet.
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => removeSubject(subject)}
                        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
                      >
                        {subject} ×
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Education
                </label>
                <textarea
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  rows={4}
                  placeholder="Add your degree, certifications, and relevant academic background"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={7}
                  placeholder="Describe your teaching style, experience, and how you support students"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={saveState === "saving"}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveState === "saving" ? "Saving..." : "Save profile"}
                </button>

                {saveMessage && (
                  <p
                    className={`text-sm ${
                      saveState === "error" ? "text-rose-300" : "text-emerald-300"
                    }`}
                  >
                    {saveMessage}
                  </p>
                )}
              </div>
            </form>
          </SectionCard>

          <div className="space-y-8">
            <SectionCard
              title="Profile summary"
              subtitle="A quick snapshot of what students will notice first."
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Subjects listed</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {subjects.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Reviews</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {reviews.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/55">Average rating</p>
                  <p className="mt-2 text-3xl font-bold text-amber-300">
                    {reviews.length === 0 ? "New" : averageRating.toFixed(1)}
                  </p>
                  {reviews.length > 0 && (
                    <p className="mt-2 text-sm text-white/65">
                      {stars(averageRating)}
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Add a review"
              subtitle="Create a review entry that appears on the public tutor page."
            >
              <form className="space-y-4" onSubmit={handleAddReview}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Student name
                  </label>
                  <input
                    value={student}
                    onChange={(e) => setStudent(e.target.value)}
                    placeholder="Enter the student's first name or full name"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value} className="text-black">
                        {value} star{value === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="Write a short testimonial or review comment"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={reviewState === "saving"}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewState === "saving" ? "Adding..." : "Add review"}
                  </button>

                  {reviewMessage && (
                    <p
                      className={`text-sm ${
                        reviewState === "error"
                          ? "text-rose-300"
                          : "text-emerald-300"
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
            title="Saved reviews"
            subtitle="These testimonials will appear on each tutor's public profile page."
          >
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-sm text-white/60">
                No reviews added yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {review.student}
                        </p>
                        <p className="mt-1 text-sm text-amber-300">
                          {stars(review.rating)}
                        </p>
                      </div>
                      <p className="text-sm text-white/45">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/75">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}