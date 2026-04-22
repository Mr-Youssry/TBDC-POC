import Image from "next/image";
import Link from "next/link";
import { Building2, Database, LogOut, ShieldCheck, Target, Users } from "lucide-react";
import { signOut } from "@/auth";
import { getSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

const useDummyData = process.env.USE_DUMMY_DATA === "true";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/methodology" });
}

export async function SiteHeader() {
  const session = await getSession();
  const email = session?.user?.email ?? null;

  // Dynamic counts — run in parallel for speed
  const [companyCount, investorCount, matchCount, dimensionCount] =
    await Promise.all([
      prisma.company.count(),
      prisma.investor.count(),
      prisma.match.count(),
      prisma.methodologyDimension.count(),
    ]);

  const chips = [
    { label: `${companyCount} companies`, icon: Building2 },
    { label: `${investorCount} investors`, icon: Users },
    { label: `${matchCount} matches`, icon: Target },
    { label: `${dimensionCount} dimensions`, icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/78 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/tbdc-logo.png"
            alt="TBDC"
            width={38}
            height={38}
            className="rounded-lg border border-border bg-white p-1 shadow-sm"
          />
          <div className="min-w-0">
            <h1 className="truncate text-[1rem] font-semibold tracking-[-0.03em] text-text-1 md:text-[1.08rem]">
              TBDC Capital Console
            </h1>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-text-3">
              Investor matching operating system
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden flex-wrap gap-2 xl:flex">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-border bg-surface px-3 text-[0.72rem] font-medium text-text-2 shadow-[0_8px_18px_rgba(17,19,26,0.04)]"
              >
                <chip.icon className="h-3.5 w-3.5 text-primary" />
                {chip.label}
              </span>
            ))}
          </div>
          {email ? (
            <form action={signOutAction} className="flex items-center gap-2">
              <Link
                href="/admin/users"
                className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-border bg-surface px-3 text-[0.72rem] font-medium text-text-2 transition-colors hover:border-primary/20 hover:text-text-1"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Admin
              </Link>
              {useDummyData && (
                <span className="inline-flex min-h-[34px] items-center rounded-full border border-primary/16 bg-accent px-3 text-[0.72rem] font-medium text-accent-foreground">
                  Dummy mode
                </span>
              )}
              <span className="hidden text-[0.72rem] text-text-3 lg:inline">
                {email}
              </span>
              {!useDummyData && (
                <button
                  type="submit"
                  className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-border bg-surface px-3 text-[0.72rem] font-medium text-text-2 transition-colors hover:border-primary/20 hover:text-text-1"
                >
                  <LogOut className="h-3.5 w-3.5 text-primary" />
                  Sign out
                </button>
              )}
            </form>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[34px] items-center rounded-full border border-border bg-surface px-3 text-[0.72rem] font-medium text-text-2 transition-colors hover:border-primary/20 hover:text-text-1"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
