"use client";

import { useState, useTransition } from "react";
import { addCompany, deleteCompany, toggleAcceptsIntros } from "./actions";

export function AddCompanyButton() {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cohort: "Pivot 1",
    stage: "Seed",
    sector: "",
    askSize: "",
    homeMarket: "",
    targetMarket: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    start(async () => {
      await addCompany(form);
      setOpen(false);
      setForm({ name: "", cohort: "Pivot 1", stage: "Seed", sector: "", askSize: "", homeMarket: "", targetMarket: "" });
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-[0.75rem] font-mono border border-border-2 rounded-[4px] bg-surface hover:bg-surface-2"
      >
        + add company
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-lg shadow-xl p-5 w-[440px] max-h-[90vh] overflow-y-auto space-y-3"
      >
        <h3 className="font-serif text-lg text-text-1">Add Company</h3>

        <label className="block">
          <span className="text-xs text-text-3 font-mono">Company Name *</span>
          <input
            autoFocus
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
            placeholder="e.g. Acme Corp"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-text-3 font-mono">Cohort</span>
            <select
              value={form.cohort}
              onChange={(e) => setForm({ ...form, cohort: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
            >
              {["Pivot 1", "Horizon 3"].map((c) => (
                <option key={c} value={c}>{c}</option>
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
              {["Pre-seed", "Seed", "Series A", "Series B+", "Growth"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-text-3 font-mono">Sector</span>
            <input
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
              placeholder="e.g. FinTech / SaaS"
            />
          </label>

          <label className="block">
            <span className="text-xs text-text-3 font-mono">Ask Size</span>
            <input
              value={form.askSize}
              onChange={(e) => setForm({ ...form, askSize: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
              placeholder="e.g. $1M-$3M"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-text-3 font-mono">Home Market</span>
            <input
              value={form.homeMarket}
              onChange={(e) => setForm({ ...form, homeMarket: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
              placeholder="e.g. Canada"
            />
          </label>

          <label className="block">
            <span className="text-xs text-text-3 font-mono">Target Market</span>
            <input
              value={form.targetMarket}
              onChange={(e) => setForm({ ...form, targetMarket: e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-surface-2 text-text-1"
              placeholder="e.g. North America"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 text-[0.75rem] font-mono border border-border rounded-[4px] text-text-3 hover:text-text-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || !form.name.trim()}
            className="px-3 py-1.5 text-[0.75rem] font-mono border border-text-1 rounded-[4px] bg-text-1 text-[#f5f4f0] hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Adding..." : "Add Company"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function DeleteCompanyButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[0.62rem] font-mono text-text-3 hover:text-[var(--t3txt)]"
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
            await deleteCompany(id);
            setConfirming(false);
          })
        }
        className="text-[0.62rem] font-mono text-[var(--t3txt)] font-bold"
      >
        confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-[0.62rem] font-mono text-text-3"
      >
        cancel
      </button>
    </span>
  );
}

export function AcceptsIntrosToggle({
  id,
  initial,
  editable,
}: {
  id: string;
  initial: boolean;
  editable: boolean;
}) {
  const [accepts, setAccepts] = useState(initial);
  const [pending, start] = useTransition();

  if (!editable) {
    return accepts ? (
      <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-[#e8f8ef] text-[#1a6a40] border border-[#50b080] font-bold">
        Open
      </span>
    ) : (
      <span className="inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-warn text-warn-txt border border-warn-bdr font-bold">
        ⚠ Declined
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !accepts;
        setAccepts(next);
        start(async () => {
          const res = await toggleAcceptsIntros(id, next);
          if (!res.ok) setAccepts(!next);
        });
      }}
      className={
        accepts
          ? "inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-[#e8f8ef] text-[#1a6a40] border border-[#50b080] font-bold cursor-pointer hover:opacity-80"
          : "inline-block font-mono text-[0.62rem] px-[7px] py-[2px] rounded-[4px] bg-warn text-warn-txt border border-warn-bdr font-bold cursor-pointer hover:opacity-80"
      }
    >
      {accepts ? "Open" : "⚠ Declined"}
    </button>
  );
}
