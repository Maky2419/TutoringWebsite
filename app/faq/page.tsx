import PageHeader from "../../components/PageHeader";
import Container from "../../components/Container";

export default function Page() {
  return (
    <div>
      <PageHeader title="FAQ" subtitle="Common questions about sessions, policies, and scheduling." />
      <Container>
        <div className="py-10 prose max-w-none">
          <p>This is a placeholder page. Replace this with your real content/components.</p>
        </div>
      </Container>
    </div>
  );
}
