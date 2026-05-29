type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="bg-slate-50 px-6 py-16 text-center">
      <h1 className="text-5xl font-extrabold text-blue-600">
        {title}
      </h1>

      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-700">
          {subtitle}
        </p>
      )}
    </section>
  );
}