import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/auth";
import { getSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

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
    `${companyCount} portfolio companies`,
    `${investorCount} investors profiled`,
    `${dimensionCount}-dimension weighted scoring`,
    `${matchCount} scored matches`,
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--text-1)] text-[#f5f4f0] px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Image
            src="/tbdc-logo.png"
            alt="TBDC"
            width={36}
            height={36}
            className="rounded-md"
          />
          <div>
            <h1 className="text-[1.2rem] font-normal tracking-[-0.02em] leading-tight">
              TBDC Cohort — Investor Matching System
            </h1>
            <div className="font-mono text-[0.65rem] text-[#999] tracking-[0.04em]">
              AHMED KORAYEM · PARTNERSHIPS MANAGER APPLICATION
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 flex-wrap">
            {chips.map((chip) => (
              <span
                key={chip}
                className="font-mono text-[0.55rem] px-[6px] py-[2px] border border-[#444] rounded-[4px] text-[#999]"
              >
                {chip}
              </span>
            ))}
          </div>
          {email ? (
            <form action={signOutAction} className="flex items-center gap-2">
              <Link
                href="/admin/users"
                className="font-mono text-[0.6rem] px-[8px] py-[2px] border border-[#444] rounded-[4px] text-[#aaa] hover:text-[#f5f4f0] hover:border-[#666]"
              >
                users
              </Link>
              <span className="font-mono text-[0.6rem] text-[#aaa] hidden lg:inline">
                {email}
              </span>
              <button
                type="submit"
                className="font-mono text-[0.6rem] px-[8px] py-[2px] border border-[#444] rounded-[4px] text-[#aaa] hover:text-[#f5f4f0] hover:border-[#666]"
              >
                sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="font-mono text-[0.6rem] px-[8px] py-[2px] border border-[#444] rounded-[4px] text-[#aaa] hover:text-[#f5f4f0] hover:border-[#666]"
            >
              sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
