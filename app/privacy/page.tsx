import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden">
      <PageHeader
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information."
      />

      <Container>
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-8 text-white/80">

          <section>
            <h2 className="text-white text-xl font-semibold">What we collect</h2>
            <p className="mt-3">
              When you request tutoring, we collect basic information such as your name,
              email address, and subject of interest. This allows us to contact you,
              match you with a tutor, and organize your sessions.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">How we use your information</h2>
            <p className="mt-3">
              Your information is only used to provide tutoring services, communicate
              with you, send invoices, and coordinate lessons. We do not sell or share
              your data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">WhatsApp & communication</h2>
            <p className="mt-3">
              We use WhatsApp to communicate between tutors, students, and parents.
              Group chats allow transparent communication regarding schedules,
              lesson topics, and progress.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Data protection</h2>
            <p className="mt-3">
              We take reasonable steps to protect your information. Access is limited
              to tutors and staff who need it to provide services.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Your rights</h2>
            <p className="mt-3">
              You may request to view, update, or delete your information at any time
              by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-semibold">Children’s privacy</h2>
            <p className="mt-3">
              We provide tutoring to minors with parental involvement. Parents or
              guardians control communication and payment.
            </p>
          </section>

        </div>
      </Container>
    </div>
  );
}
