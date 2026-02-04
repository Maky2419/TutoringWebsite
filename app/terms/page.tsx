import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";

export default function TermsPage() {
  return (
    <div className="relative overflow-hidden">
      <PageHeader
        title="Terms of Service"
        subtitle="The rules and expectations for using our tutoring services."
      />

      <Container>
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-8 text-white/80">

          <section>
            <h2 className="text-white text-xl font-semibold">Tutoring services</h2>
            <p className="mt-3">
              K-Cubed provides educational tutoring services online and in select
              in-person locations. We do not guarantee specific grades or exam results,
              but we commit to providing structured, supportive instruction.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Scheduling & changes</h2>
            <p className="mt-3">
              Lesson times are flexible and may be adjusted based on availability.
              Students and parents should coordinate directly with tutors through
              WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Payments</h2>
            <p className="mt-3">
              Payments are made via bank transfer. Monthly invoices are provided.
              Sessions must be paid according to the invoice terms.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Cancellations</h2>
            <p className="mt-3">
              We ask for reasonable notice if a session must be rescheduled.
              Repeated no-shows may result in charges.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Tutor changes</h2>
            <p className="mt-3">
              If a tutor is not a good fit, we will help assign a different tutor.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Communication</h2>
            <p className="mt-3">
              Communication is conducted through WhatsApp or email for transparency.
              Both parents and students are included when appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Limitation of liability</h2>
            <p className="mt-3">
              TutorAmber is not responsible for school grading decisions, exam results,
              or external academic outcomes.
            </p>
          </section>

        </div>
      </Container>
    </div>
  );
}
