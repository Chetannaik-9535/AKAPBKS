import { useEffect, useState } from "react";

import { OFFICE_BEARERS } from "@/lib/org";
import { cn } from "@/lib/utils";

const MODES = ["coverflow", "fade-zoom", "slide"] as const;

/** Auto-advancing carousel of state office-bearers with names & designations. */
export function BearersCarousel() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % OFFICE_BEARERS.length;
        if (next === 0) setMode((m) => (m + 1) % MODES.length);
        return next;
      });
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const style = MODES[mode];
  const activeBearer = OFFICE_BEARERS[index] ?? OFFICE_BEARERS[0]!;

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden px-2 py-4">
      <div
        className="relative flex h-72 items-center justify-center sm:h-92"
        style={{ perspective: "1200px" }}
      >
        {OFFICE_BEARERS.map((bearer, i) => {
          const offset = i - index;
          const wrapped =
            Math.abs(offset) > OFFICE_BEARERS.length / 2
              ? offset - Math.sign(offset) * OFFICE_BEARERS.length
              : offset;
          const active = wrapped === 0;
          const abs = Math.abs(wrapped);

          let transform = "";
          let opacity = 0;
          if (style === "coverflow") {
            transform = `translateX(${wrapped * 46}%) translateZ(${active ? 0 : -170}px) rotateY(${wrapped * -34}deg) scale(${active ? 1 : 0.82})`;
            opacity = abs > 2 ? 0 : 1 - abs * 0.28;
          } else if (style === "fade-zoom") {
            transform = `scale(${active ? 1 : 0.7})`;
            opacity = active ? 1 : 0;
          } else {
            transform = `translateX(${wrapped * 100}%)`;
            opacity = abs > 1 ? 0 : active ? 1 : 0.35;
          }

          return (
            <figure
              key={bearer.photo}
              className={cn(
                "absolute flex flex-col overflow-hidden rounded-2xl border-[3px] border-gold bg-card shadow-[var(--shadow-temple)] transition-all duration-700 ease-out h-64 w-44 sm:h-84 sm:w-56",
                active ? "z-20 ring-2 ring-primary/40 shadow-2xl" : "z-10",
              )}
              style={{ transform, opacity }}
            >
              <div className="relative flex-1 w-full overflow-hidden bg-stone-100">
                <img
                  src={bearer.photo}
                  alt={bearer.nameKn}
                  className="size-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <figcaption className="bg-gradient-to-b from-[#6b0d14] to-[#4a0b0b] px-2 py-1.5 text-center text-white border-t-2 border-[#d4af37]">
                <p className="text-xs sm:text-sm font-extrabold text-amber-200 leading-tight">
                  {bearer.nameKn}
                </p>
                <p className="text-[10px] sm:text-[11px] font-semibold text-white leading-tight mt-0.5">
                  {bearer.roleKn}
                </p>
                <p className="text-[8.5px] sm:text-[9.5px] text-amber-300/85 leading-tight">
                  {bearer.roleEn}
                </p>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="mt-3 flex justify-center gap-2">
        {OFFICE_BEARERS.map((bearer, i) => (
          <button
            key={bearer.photo}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${bearer.nameKn}`}
            className={cn(
              "size-2.5 rounded-full transition-all duration-300 cursor-pointer",
              i === index ? "w-6 bg-primary" : "bg-border hover:bg-muted-foreground",
            )}
          />
        ))}
      </div>

      {/* Prominent Active Person Name & Designation Below Carousel */}
      <div className="mt-2 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold bg-secondary/80 px-4 py-1 shadow-sm">
          <span className="text-xs sm:text-sm font-bold text-maroon">
            {activeBearer.nameKn}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-[11px] sm:text-xs font-medium text-foreground">
            {activeBearer.roleKn} / {activeBearer.roleEn}
          </span>
        </div>
      </div>
    </div>
  );
}
