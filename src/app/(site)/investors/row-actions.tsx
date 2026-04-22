"use client";

import { useTransition, useState } from "react";
import { deleteInvestor, addInvestor } from "./actions";

export function AddInvestorButton() {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "VC",
    stage: "Seed",
    sectors: "",
    chequeSize: "",
    geography: "Canada",
    leadOrFollow: "Lead",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    start(async () => {
      await addInvestor(form);
      setOpen(false);
      setForm({ name: "", type: "VC", stage: "Seed", sectors: "", chequeSize: "", geography: "Canada", leadOrFollow: "Lead" });
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[38px] items-center rounded-full border border-primary/16 bg-accent px-4 text-[0.78rem] font-medium text-accent-foreground transition-colors hover:border-primary/24 hover:bg-primary/12"
      >
        Add investor
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="w-[440px] max-h-[90vh] overflow-y-auto space-y-3 rounded-[12px] border border-border bg-surface p-5 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-text-1">Add Investor</h3>

        <label className="block">
          <span className="text-xs text-text-3 font-mono">Fund Name *</span>
          <input
            autoFocus
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
            placeholder="e.g. Sequoia Capital"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-text-3 font-mono">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
            >
              {["VC", "Angel Network", "Corporate VC", "Gov", "Venture Studio / VC", "Venture Debt"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-text-3 font-mono">Stage</span>
            <select
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
            >
              {["Pre-seed", "Seed", "Pre-seed-Seed", "Seed-Series A", "Series A", "Series A-B", "Series B+", "Growth"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-text-3 font-mono">Sectors</span>
            <input
              value={form.sectors}
              onChange={(e) => setForm({ ...form, sectors: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
              placeholder="e.g. FinTech, SaaS"
            />
          </label>

          <label className="block">
            <span className="text-xs text-text-3 font-mono">Cheque Size</span>
            <input
              value={form.chequeSize}
              onChange={(e) => setForm({ ...form, chequeSize: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
              placeholder="e.g. $500K-$2M"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-text-3 font-mono">Geography</span>
            <input
              value={form.geography}
              onChange={(e) => setForm({ ...form, geography: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
              placeholder="e.g. Canada (national)"
            />
          </label>

          <label className="block">
            <span className="text-xs text-text-3 font-mono">Lead / Follow</span>
            <select
              value={form.leadOrFollow}
              onChange={(e) => setForm({ ...form, leadOrFollow: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
            >
              {["Lead", "Follow", "Lead/Follow"].map((lf) => (
                <option key={lf} value={lf}>{lf}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-border px-3 py-1.5 text-[0.75rem] font-medium text-text-3 hover:text-text-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || !form.name.trim()}
            className="rounded-full border border-primary bg-primary px-3 py-1.5 text-[0.75rem] font-medium text-white hover:bg-[#eb2f77] disabled:opacity-50"
          >
            {pending ? "Adding..." : "Add Investor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function DeleteInvestorButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[0.66rem] font-mono text-text-3 hover:text-[var(--t3txt)]"
        title={`Delete ${name}`}
      >
        ✕
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await deleteInvestor(id);
            setConfirming(false);
          })
        }
        className="text-[0.66rem] font-mono font-bold text-[var(--t3txt)]"
      >
        confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-[0.66rem] font-mono text-text-3"
      >
        cancel
      </button>
    </span>
  );
}
