import Container from "../../../components/Container";
import PageHeader from "../../../components/PageHeader";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";

export default async function TutorPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const tutor = await prisma.tutor.findUnique({ where: { id } });
  if (!tutor) notFound();

  return (
    <div>
      <PageHeader title={tutor.name} subtitle={tutor.subjects} />
      <Container>
        <div className="py-10">
          <div className="rounded-2xl border p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-600">Hourly rate</p>
              <p className="text-lg font-semibold text-gray-900">${tutor.hourlyRate}/hr</p>
            </div>
            <p className="mt-4 text-gray-700">{tutor.bio}</p>

            <div className="mt-6">
              <Link
                href="/book"
                className="inline-flex rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Request a booking
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
