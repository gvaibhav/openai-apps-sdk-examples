import { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { useWidgetProps } from "../use-widget-props";
import type { ComparisonPayload, ComparisonRow } from "../credit-cards/types";

const FALLBACK: ComparisonPayload = {
  resultType: "comparison",
  comparisonType: "all",
  requestedCards: [],
  cards: [],
  rows: [],
  highlightCategories: [],
  summary: {
    headline: "Comparing cards…",
    detail: "",
    winnerCardId: "",
    supportingPoints: [],
  },
};

function MetricBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-[0.7rem] font-medium text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
      {label}
    </span>
  );
}

function ComparisonCard({
  card,
  onViewDetails,
}: {
  card: ComparisonPayload["cards"][number];
  onViewDetails(id: string): void;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition dark:border-slate-700/70 dark:bg-slate-900 ${
        card.isWinner
          ? "border-blue-500/40 bg-blue-50/70 dark:border-blue-400/40 dark:bg-blue-900/20"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.issuer.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">#{card.rank}</span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{card.name}</h2>
          </div>
        </div>
        {card.isWinner && (
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            Winner
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
        {card.quickStats.map((stat) => (
          <MetricBadge key={stat} label={stat} />
        ))}
      </div>
      <button
        onClick={() => onViewDetails(card.id)}
        className="mt-auto w-full rounded-lg border border-blue-500 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-blue-400 dark:text-blue-200 dark:hover:bg-blue-900/20"
      >
        View details
      </button>
    </div>
  );
}

function ComparisonTable({
  rows,
  cards,
}: {
  rows: ComparisonRow[];
  cards: ComparisonPayload["cards"];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/70 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700/70">
        <thead className="bg-slate-50 dark:bg-slate-800/70">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Metric
            </th>
            {cards.map((card) => (
              <th
                key={card.id}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
              >
                {card.shortName || card.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                <div>{row.label}</div>
                {row.description && (
                  <div className="mt-1 text-[0.7rem] font-normal normal-case text-slate-400 dark:text-slate-500">
                    {row.description}
                  </div>
                )}
              </th>
              {cards.map((card) => {
                const value = row.values.find((entry) => entry.cardId === card.id);
                return (
                  <td key={card.id} className="px-4 py-3 align-top text-sm text-slate-700 dark:text-slate-200">
                    {value ? (
                      <div>
                        <div className="font-medium">{value.display}</div>
                        {value.annotation && (
                          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {value.annotation}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const payload = useWidgetProps<ComparisonPayload>(() => FALLBACK);
  const callTool =
    typeof window === "undefined" ? null : window.openai?.callTool?.bind(window.openai);

  const cardsById = useMemo(() => new Map(payload.cards.map((card) => [card.id, card])), [
    payload.cards,
  ]);

  function handleViewDetails(cardId: string) {
    if (!callTool) return;
    callTool("get_card_benefits", { card_id: cardId });
  }

  return (
    <div className="min-h-full bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">
            {payload.comparisonType === "all" ? "Overall comparison" : `${payload.comparisonType} focus`}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {payload.summary.headline}
          </h1>
          {payload.summary.detail && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{payload.summary.detail}</p>
          )}
          {payload.summary.supportingPoints.length ? (
            <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {payload.summary.supportingPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-blue-500" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {payload.cards.length ? (
          <section className="grid gap-4 md:grid-cols-3">
            {payload.cards.map((card) => (
              <ComparisonCard key={card.id} card={card} onViewDetails={handleViewDetails} />
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            No cards to compare.
          </div>
        )}

        {payload.rows.length ? (
          <ComparisonTable rows={payload.rows} cards={payload.cards} />
        ) : null}

        {payload.highlightCategories.length ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Highlights</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {payload.highlightCategories.map((category) => (
                <div key={category.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    {category.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {category.description}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {category.winners.map((winner) => {
                      const card = cardsById.get(winner.cardId);
                      return (
                        <li key={`${category.title}-${winner.cardId}`} className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900/60">
                          <p className="font-semibold">{card?.shortName ?? winner.cardId}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{winner.statement}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

createRoot(document.getElementById("comparison-table-root")!).render(<App />);
