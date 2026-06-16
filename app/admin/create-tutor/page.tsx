"use client";

import { useState } from "react";

const categories = [
  "Languages",
  "STEM",
  "Business & Economics",
  "Humanities & Social Studies",
];

export default function CreateTutorPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    category: "STEM",
    subjects: "",
    curriculum: "",
    bio: "",
    education: "",
    hourlyRate: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/create-tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        subjects: form.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        curriculum: form.curriculum
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage("Tutor created successfully.");
      setForm({
        name: "",
        email: "",
        password: "",
        category: "STEM",
        subjects: "",
        curriculum: "",
        bio: "",
        education: "",
        hourlyRate: "",
      });
    } else {
      setMessage(data.error || "Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="mb-8 text-4xl font-bold">Create Tutor</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl bg-white p-8 shadow"
      >
        <input
          className="w-full rounded-lg border p-3"
          placeholder="Tutor name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Tutor email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Temporary password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <select
          className="w-full rounded-lg border p-3"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Subjects, separated by commas e.g. Math, Physics, Chemistry"
          value={form.subjects}
          onChange={(e) => setForm({ ...form, subjects: e.target.value })}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Curriculum, separated by commas e.g. IB, MYP, IGCSE"
          value={form.curriculum}
          onChange={(e) => setForm({ ...form, curriculum: e.target.value })}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Hourly rate"
          type="number"
          value={form.hourlyRate}
          onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
          required
        />

        <textarea
          className="w-full rounded-lg border p-3"
          placeholder="Tutor bio"
          rows={5}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          required
        />

        <textarea
          className="w-full rounded-lg border p-3"
          placeholder="Education / qualifications"
          rows={4}
          value={form.education}
          onChange={(e) => setForm({ ...form, education: e.target.value })}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Tutor"}
        </button>

        {message && <p className="text-center font-medium">{message}</p>}
      </form>
    </main>
  );
}