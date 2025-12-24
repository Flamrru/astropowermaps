"use client";

interface CredibilityBarProps {
  publications: readonly string[];
}

export default function CredibilityBar({ publications }: CredibilityBarProps) {
  return (
    <div className="credibility-bar rounded-2xl py-4 px-5">
      <p className="text-white/40 text-[11px] text-center mb-3 uppercase tracking-widest">
        As seen in
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {publications.map((pub, index) => (
          <span
            key={index}
            className="text-white/60 text-[13px] font-medium"
          >
            {pub}
          </span>
        ))}
      </div>
    </div>
  );
}
