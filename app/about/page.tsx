import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Glow background */}
      <div className="pointer-events-none absolute -top-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <PageHeader
        title="About TutorAmber"
        subtitle="A story that began with one tutor — and grew into a global learning community."
      />

      <Container>
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 space-y-10">

          {/* Story */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">How it all began</h2>
            <div className="mt-4 space-y-4 text-white/80 leading-relaxed">
              <p>
                TutorAmber began with one person and one simple idea: students learn best when they
                feel understood. Ambreen Naseem started tutoring independently, helping students
                work through challenging subjects while building confidence and clarity.
              </p>
              <p>
                After tutoring more than 15–20 students, demand quickly grew. Word spread through
                families, referrals, and student success stories. What started as one-on-one
                tutoring evolved into something much bigger.
              </p>
              <p>
                To keep up with this growth, Ambreen brought together a small team of tutors who
                shared her values — patience, structure, and a deep commitment to student success.
                This team has now been working together for over{" "}
                <span className="text-white font-semibold">three years</span>, continuing to expand
                as more students join from around the world.
              </p>
            </div>
          </section>

          {/* Global + Values */}
          <section className="grid gap-8 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">An international tutoring team</h3>
              <p className="mt-3 text-white/80">
                Ambreen began her education in the Middle East and now teaches students across the
                globe. TutorAmber supports learners in the{" "}
                <span className="text-white font-semibold">United States</span>,{" "}
                <span className="text-white font-semibold">Germany</span>,{" "}
                <span className="text-white font-semibold">Spain</span>, and many more.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">What we believe</h3>
              <ul className="mt-4 space-y-3 text-white/80">
                <li><b className="text-white">Clarity first:</b> We simplify complex topics.</li>
                <li><b className="text-white">Confidence matters:</b> Students grow faster when supported.</li>
                <li><b className="text-white">Consistency wins:</b> Weekly progress compounds.</li>
                <li><b className="text-white">Real learning:</b> We teach how to think.</li>
              </ul>
            </div>
          </section>

          {/* Where we tutor */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Where we tutor</h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <RegionCard title="Middle East" flags={["🇦🇪","🇸🇦","🇶🇦","🇰🇼","🇧🇭","🇴🇲","🇯🇴","🇱🇧"]} />
              <RegionCard title="North America" flags={["🇺🇸","🇨🇦"]} />
              <RegionCard title="Europe" flags={["🇩🇪","🇪🇸","🇫🇷","🇬🇧","🇮🇹","🇳🇱","🇸🇪"]} />
              <RegionCard title="Worldwide" flags={["🌍","🌎","🌏"]} />
            </div>
          </section>

          {/* Success Stories */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Student success stories</h3>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <SuccessCard title="C → A in 6 weeks" text="Grade 11 student rebuilt math foundations and reached an A." />
              <SuccessCard title="IB Physics pass" text="Student passed IB Physics after failing three times." />
              <SuccessCard title="1450 SAT" text="Achieved in just two months with focused prep." />
            </div>
          </section>

          {/* How lessons work */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">How lessons work</h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              <StepCard n="1" t="Diagnostic" />
              <StepCard n="2" t="Custom plan" />
              <StepCard n="3" t="Weekly tracking" />
              <StepCard n="4" t="Homework review" />
              <StepCard n="5" t="Exam prep" />
            </div>
          </section>

          {/* Curriculums */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Curriculums we support</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {["IB","IGCSE","GCSE","SAT / ACT","AP","American","British","UAE MoE","CBSE"].map(c => (
                <div key={c} className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-white/80">
                  {c}
                </div>
              ))}
            </div>
          </section>

        </div>
      </Container>
    </div>
  );
}

function RegionCard({ title, flags }: { title: string; flags: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-6 flex justify-between">
      <span className="text-white font-semibold">{title}</span>
      <span className="text-xl">{flags.join(" ")}</span>
    </div>
  );
}

function SuccessCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-6">
      <p className="text-white font-semibold">{title}</p>
      <p className="mt-2 text-white/70">{text}</p>
    </div>
  );
}

function StepCard({ n, t }: { n: string; t: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center">
      <div className="mx-auto mb-3 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
        {n}
      </div>
      <p className="text-white font-semibold">{t}</p>
    </div>
  );
}
