export default async function ShamerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg py-32 sm:py-48 lg:py-56">
      <div className="text-center">
        {children}
      </div>
    </div>
  );
}