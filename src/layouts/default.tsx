export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark text-foreground relative flex flex-col h-screen">
      <main>{children}</main>
    </div>
  );
}
