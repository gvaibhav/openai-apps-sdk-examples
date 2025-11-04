import { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { useWidgetProps } from "../use-widget-props";
import { useWidgetState } from "../use-widget-state";
import type { ListCardsPayload, BenefitSnippet } from "../credit-cards/types";

const FALLBACK_PROPS: ListCardsPayload = {
  resultType: "list_cards",
  headline: "Loading credit cards…",
  filters: { issuer: null, category: null, benefitType: null, minValue: null },
  stats: {
    totalCards: 0,
    averageNetValue: 0,
    averageNetValueDisplay: "$0",
    totalBenefitValue: 0,
    totalBenefitValueDisplay: "$0",
    bestNetValue: 0,
    bestNetValueDisplay: "$0",
  },
  cards: [],
  benefitMatches: [],
};

const BENEFIT_TYPE_LABELS: Record<string, string> = {
  statement_credit: "Statement credit",
  perk: "Perk",
  protection: "Protection",
};

function getBenefitTypeLabel(value: string): string {
  return BENEFIT_TYPE_LABELS[value] ?? value.replace(/_/g, " ");
}

function formatCount(value: number, singular: string, plural?: string) {
  if (value === 1) return `1 ${singular}`;
  return `${value} ${plural ?? `${singular}s`}`;
}

function MatchedBenefits({ benefits }: { benefits?: BenefitSnippet[] }) {
  if (!benefits?.length) return null;
  return (
    <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
      <p className="font-semibold">Matches in this card</p>
      <ul className="mt-2 space-y-1">
        {benefits.map((benefit) => (
          <li key={benefit.id} className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-2 w-2 flex-none rounded-full bg-blue-500" aria-hidden />
            <span className="flex-1">
              <span className="font-medium">{benefit.name}</span>
              <span className="ml-2 text-[0.7rem] uppercase tracking-wide text-blue-700 dark:text-blue-200">
                {getBenefitTypeLabel(benefit.type)}
              </span>
              <div className="text-[0.7rem] text-blue-900/80 dark:text-blue-100/80">
                {benefit.estimatedValueDisplay} · {benefit.description}
              </div>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type CardWithMatches = ListCardsPayload["cards"][number];

function CardSummary({
  card,
  checked,
  onToggle,
}: {
  card: CardWithMatches;
  checked: boolean;
  onToggle(card: CardWithMatches): void;
}) {
  const callTool =
    typeof window === "undefined" ? null : window.openai?.callTool?.bind(window.openai);

  async function handleViewDetails() {
    if (!callTool) return;
    await callTool("get_card_benefits", { card_id: card.id });
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">{card.issuer.name}</span>
            <span>{card.category.replace(/-/g, " · ")}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{card.name}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {card.welcomeOffer.headline}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={checked}
            onChange={() => onToggle(card)}
          />
          Compare
        </label>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70">
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Annual fee</dt>
          <dd className="text-base font-semibold text-slate-900 dark:text-white">{card.annualFeeDisplay}</dd>
        </div>
        <div className="rounded-lg bg-green-50 p-3 dark:bg-emerald-900/20">
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-emerald-200">Net after fee</dt>
          <dd className="text-base font-semibold text-green-700 dark:text-emerald-200">{card.netValueDisplay}</dd>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
          <dt className="text-xs uppercase tracking-wide text-blue-800 dark:text-blue-200">Est. annual value</dt>
          <dd className="text-base font-semibold text-blue-800 dark:text-blue-100">{card.totalBenefitValueDisplay}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
        {card.bestFor.map((item) => (
          <span key={item} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/80">
            {item}
          </span>
        ))}
      </div>

  {card.matchedBenefits && <MatchedBenefits benefits={card.matchedBenefits} />}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {formatCount(card.topBenefits.length, "highlight")} · {card.welcomeOfferValueDisplay} welcome bonus value
        </div>
        <button
          onClick={handleViewDetails}
          className="rounded-md border border-blue-500 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-blue-400 dark:text-blue-200 dark:hover:bg-blue-900/20"
        >
          View details
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const payload = useWidgetProps<ListCardsPayload>(() => FALLBACK_PROPS);
  const callTool =
    typeof window === "undefined" ? null : window.openai?.callTool?.bind(window.openai);
  const [widgetState, setWidgetState] = useWidgetState<{ selected: string[] }>(() => ({ selected: [] }));
  const selected = widgetState?.selected ?? [];

  const totalSelected = selected.length;
  const selectionLabel = useMemo(() => {
    if (!totalSelected) return "Select cards to compare";
    return `${totalSelected} selected`;
  }, [totalSelected]);

  function toggleCard(card: CardWithMatches) {
    setWidgetState((prev) => {
      const current = prev?.selected ?? [];
      const next = current.includes(card.id)
        ? current.filter((id) => id !== card.id)
        : [...current.slice(-2), card.id];
      return { selected: next };
    });
  }

  async function handleCompare() {
    if (!callTool || selected.length < 2) return;
  await callTool("compare_cards", { card_ids: selected });
  }

  return (
    <div className="min-h-full bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-300">{payload.resultType === "search_benefits" ? "Benefit search" : "Card library"}</p>
          <h1 className="mt-1 text-2xl font-semibold">{payload.headline}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            {payload.filters.issuer && <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Issuer: {payload.filters.issuer}</span>}
            {payload.filters.category && <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Category: {payload.filters.category}</span>}
            {payload.filters.benefitType && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                Benefit: {getBenefitTypeLabel(payload.filters.benefitType)}
              </span>
            )}
          </div>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cards considered</dt>
              <dd className="mt-1 text-lg font-semibold">{payload.stats.totalCards}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average net value</dt>
              <dd className="mt-1 text-lg font-semibold text-green-700 dark:text-emerald-200">{payload.stats.averageNetValueDisplay}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Combined annual value</dt>
              <dd className="mt-1 text-lg font-semibold text-blue-700 dark:text-blue-200">{payload.stats.totalBenefitValueDisplay}</dd>
            </div>
          </dl>
        </header>

        {payload.benefitMatches?.length ? (
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/40">
            <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Benefit matches</h2>
            <div className="mt-3 space-y-3 text-sm text-blue-900/90 dark:text-blue-100">
              {payload.benefitMatches.map((group) => (
                <div key={group.benefitType}>
                  <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-200">
                    {getBenefitTypeLabel(group.benefitType)}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {group.items.map((item) => (
                      <li key={`${item.cardId}-${item.benefitId}`} className="rounded-lg bg-white/80 p-3 shadow-sm dark:bg-blue-900/30">
                        <p className="font-medium">{item.cardName}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-200">
                          {item.benefitName} · {item.estimatedValueDisplay}
                        </p>
                        <p className="text-xs text-blue-900/80 dark:text-blue-100/80">{item.summary}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          {payload.cards.map((card) => (
            <CardSummary
              key={card.id}
              card={card}
              checked={selected.includes(card.id)}
              onToggle={toggleCard}
            />
          ))}
          {!payload.cards.length && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              No cards match the current filters.
            </div>
          )}
        </section>

        <footer className="sticky bottom-4 flex justify-end">
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg dark:bg-slate-900/95">
            <span className="text-xs text-slate-500 dark:text-slate-400">{selectionLabel}</span>
            <button
              onClick={handleCompare}
              disabled={selected.length < 2 || !callTool}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
            >
              Compare selected
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

createRoot(document.getElementById("benefits-list-root")!).render(<App />);
