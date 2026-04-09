import { SiteHeader } from "@/components/site-header";
import { NavTabs } from "@/components/nav-tabs";
import { getSession } from "@/lib/guards";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return (
    <>
      <SiteHeader />
      <NavTabs role={role} />
      <main className="flex-1 px-8 py-7 max-w-[1200px] w-full">{children}</main>
    </>
  );
}
