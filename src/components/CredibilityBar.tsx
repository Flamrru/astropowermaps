"use client";

interface CredibilityBarProps {
  publications: readonly string[];
}

// Style each publication to match their brand identity
const publicationStyles: Record<string, string> = {
  "Cosmopolitan": "font-serif italic",
  "Well+Good": "font-sans font-semibold",
  "mindbodygreen": "font-sans font-light tracking-wide",
  "Refinery29": "font-sans font-bold",
};

export default function CredibilityBar({ publications }: CredibilityBarProps) {
  return (
    <div className="glass-card rounded-xl py-4 px-5 border border-white/10">
      <p className="text-white/50 text-[10px] text-center mb-3 uppercase tracking-[0.2em] font-medium">
        As seen in
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {publications.map((pub, index) => (
          <span
            key={index}
            className={`text-white/70 text-[12px] ${publicationStyles[pub] || "font-medium"}`}
          >
            {pub}
            {index < publications.length - 1 && (
              <span className="ml-3 text-white/30">•</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
