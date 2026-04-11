import { SiteHeader } from "@/components/site-header";
import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/guards";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 min-h-0">
        <Sidebar role={role} />
        <main className="flex-1 overflow-y-auto px-8 py-7 max-w-[1200px] w-full">
          {children}
        </main>
      </div>
    </>
  );
}
