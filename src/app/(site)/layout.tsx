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
      <div className="flex min-h-0 flex-1 bg-background">
        <Sidebar role={role} />
        <main className="min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
