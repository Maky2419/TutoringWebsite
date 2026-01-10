import PageHeader from "../../components/PageHeader";
import Container from "../../components/Container";

export default function Page() {
  return (
    <div>
      <PageHeader title="Contact" subtitle="Get in touch to ask questions or request a tutor." />
      <Container>
        <div className="py-10 prose max-w-none">
          <p>This is a placeholder page. Replace this with your real content/components.</p>
        </div>
      </Container>
    </div>
  );
}
