"use client";
import { useState } from "react";
import { DUBAI_TIME_ZONE } from "@/lib/sessionTime";

type Student = { id: string; name: string | null; email: string | null; createdAt: string; tutors: string[]; bookings: number; lastLogin: string | null };
export default function AdminStudentsTable({ students }: { students: Student[] }) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visible = students.filter(student => `${student.name || ""} ${student.email || ""} ${student.id}`.toLowerCase().includes(query));
  const date = (value: string) => new Intl.DateTimeFormat("en-GB", { timeZone: DUBAI_TIME_ZONE, dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  return <div className="rounded-2xl border bg-white p-5 shadow-sm">
    <label className="block text-sm font-semibold text-slate-700">Search students
      <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email or user ID" className="mt-1 w-full rounded-lg border px-3 py-2" />
    </label>
    <p className="my-3 text-sm text-slate-600">Showing {visible.length} of {students.length} students. Dates use Dubai time (UTC+4).</p>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <thead className="bg-slate-100"><tr>{["Student", "Email", "Joined", "Assigned tutors", "Bookings", "Last recorded login", "Manage"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
      <tbody>{visible.map(student => <tr key={student.id} className="border-t align-top">
        <td className="p-3">{student.name || "Unnamed student"}</td><td className="p-3">{student.email || "No email"}</td>
        <td className="p-3">{date(student.createdAt)}</td><td className="p-3">{student.tutors.join(", ") || "Not assigned"}</td>
        <td className="p-3">{student.bookings}</td><td className="p-3">{student.lastLogin ? date(student.lastLogin) : "Not recorded yet"}</td>
        <td className="p-3"><a href={`#user-${student.id}`} className="font-semibold text-blue-700 underline">Manage user</a></td>
      </tr>)}</tbody>
    </table></div>
    {visible.length === 0 && <p className="p-4 text-sm text-slate-600">No students match your search.</p>}
  </div>;
}
