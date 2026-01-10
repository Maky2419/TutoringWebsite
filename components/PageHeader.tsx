export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-16 text-center">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && <p className="text-white/60 text-lg">{subtitle}</p>}
    </div>
  );
}
