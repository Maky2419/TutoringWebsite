import PageHeader from "../../components/PageHeader";
import Container from "../../components/Container";

export default function Page() {
  return (
    <div>
      <PageHeader title="Services" subtitle="1:1 tutoring, exam prep, and study plans." />
      <Container>
        <div className="py-10 prose max-w-none">
          <p>This is a placeholder page. Replace this with your real content/components.</p>
        </div>
      </Container>
    </div>
  );
}
