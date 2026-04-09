import Link from "next/link";
import { signOut } from "@/auth";
import { getSession } from "@/lib/guards";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/methodology" });
}

export async function SiteHeader() {
  const session = await getSession();
  const email = session?.user?.email ?? null;

  return (
    <header className="bg-[var(--text-1)] text-[#f5f4f0] px-8 pt-7 pb-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[1.4rem] font-normal tracking-[-0.02em]">
            TBDC Cohort — Investor Matching System
          </h1>
          <div className="font-mono text-[0.7rem] text-[#999] mt-[3px] tracking-[0.04em]">
            PART 1 · POC v2 · AHMED KORAYEM · PARTNERSHIPS MANAGER APPLICATION
          </div>
        </div>
        <div className="flex items-start gap-3">
          {email ? (
            <form action={signOutAction} className="flex items-center gap-2">
              <span className="font-mono text-[0.65rem] text-[#aaa]">{email}</span>
              <button
                type="submit"
                className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded-[4px] text-[#aaa] hover:text-[#f5f4f0] hover:border-[#666]"
              >
                sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded-[4px] text-[#aaa] hover:text-[#f5f4f0] hover:border-[#666]"
            >
              sign in
            </Link>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mt-3">
        <span className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded-[4px] text-[#aaa]">
          10 portfolio companies
        </span>
        <span className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded-[4px] text-[#aaa]">
          24 investors profiled
        </span>
        <span className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded-[4px] text-[#aaa]">
          7-dimension weighted scoring
        </span>
        <span className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded-[4px] text-[#aaa]">
          Hard exclusion gates
        </span>
        <span className="font-mono text-[0.65rem] px-[10px] py-[3px] border border-[#444] rounded-[4px] text-[#aaa]">
          WIDMO exception flagged
        </span>
      </div>
    </header>
  );
}
