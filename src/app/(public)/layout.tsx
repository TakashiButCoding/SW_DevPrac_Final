import Navbar from "@/components/navbar";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="">
      <div className="">
        <Navbar/>
        {children}
      </div>
    </main>
  );
}