export default async function ShamerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}