import { useState } from "react";
import { getStallImage, getStallVisual } from "../features/stalls/utils/stallPresentation";

export default function RecommendedStallsRow({
  title = "Recommended for you",
  subtitle = "Suggested food stalls based on what is available now.",
  stalls = [],
  onSelectStall,
  onViewAll,
}) {
  const visibleStalls = Array.isArray(stalls) ? stalls : [];
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/90 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex flex-1 items-start gap-3 text-left"
          aria-expanded={!isCollapsed}
          aria-controls="recommended-stalls-content"
        >
          <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">
            Food suggestions
          </div>
          <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {typeof onViewAll === "function" && !isCollapsed && (
            <button
              type="button"
              onClick={onViewAll}
              className="hidden rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 sm:inline-flex"
            >
              View all stalls
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-orange-700 shadow-sm transition hover:bg-orange-100"
            aria-label={isCollapsed ? "Show recommendations" : "Hide recommendations"}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? "rotate-180" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div id="recommended-stalls-content" className="mt-4 flex gap-3 overflow-x-auto pb-1 pt-1">
          {visibleStalls.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              No stalls available right now.
            </div>
          ) : (
            visibleStalls.map((stall) => {
              const visual = getStallVisual(stall?.cuisine || stall?.type);
              return (
                <button
                  key={stall.id}
                  type="button"
                  onClick={() => onSelectStall?.(stall)}
                  className="group w-52.5 shrink-0 overflow-hidden rounded-[1.4rem] border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative h-32 overflow-hidden bg-slate-100">
                    <img
                      src={getStallImage(stall)}
                      alt={stall?.name || "Food stall"}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = getStallImage({
                          ...stall,
                          imageUrl: "",
                          photoUrl: "",
                        });
                      }}
                    />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
                      <span>{visual.emoji}</span>
                      <span>{visual.label}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-1 text-sm font-semibold text-slate-900">
                        {stall?.name || "Food stall"}
                      </h4>
                      <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                        {String(stall?.status || "PENDING")}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                      {stall?.description || "Tap to see more details."}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {typeof onViewAll === "function" && !isCollapsed && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-4 inline-flex rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 sm:hidden"
        >
          View all stalls
        </button>
      )}
    </section>
  );
}