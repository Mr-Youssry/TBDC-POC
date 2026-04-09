import { SiteHeader } from "@/components/site-header";
import { NavTabs } from "@/components/nav-tabs";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <NavTabs />
      <main className="flex-1 px-8 py-7 max-w-[1200px] w-full">{children}</main>
    </>
  );
}
