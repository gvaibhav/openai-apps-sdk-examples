import { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { useWidgetProps } from "../use-widget-props";
import type { CardDetailPayload, BenefitSnippet } from "../credit-cards/types";

const FALLBACK: CardDetailPayload = {
  resultType: "card_detail",
  card: {
    id: "placeholder",
    name: "Loading card…",
    shortName: "",
    issuer: { code: "", name: "" },
    category: "",
    annualFee: 0,
    annualFeeDisplay: "$0",
    totalBenefitValue: 0,
    netValue: 0,
    rating: 0,
    headline: "",
    welcomeOffer: { headline: "", estimatedValue: 0 },
    rewardRates: [],
    highlights: [],
    bestFor: [],
    pros: [],
    cons: [],
    creditScore: "",
    applicationUrl: undefined,
    imageUrl: undefined,
    apr: { intro: null, regular: null },
  },
  benefits: [],
  benefitGroups: [],
  totalBenefitValue: 0,
  netValue: 0,
  bestFor: [],
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number, options?: { sign?: "always" | "auto" }) {
  const formatted = currencyFormatter.format(Math.abs(Math.round(value)));
  if (options?.sign === "always") {
    return `${value >= 0 ? "+" : "-"}${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

function BenefitItem({ benefit }: { benefit: BenefitSnippet }) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{benefit.name}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {benefit.category} · {benefit.type.replace(/_/g, " ")}
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
          {benefit.estimatedValueDisplay}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{benefit.description}</p>
      {benefit.frequency && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{benefit.frequency} benefit</p>
      )}
      {benefit.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] text-slate-500 dark:text-slate-400">
          {benefit.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800/60">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export default function App() {
  const payload = useWidgetProps<CardDetailPayload>(() => FALLBACK);
  const card = payload.card;

  const openExternal =
    typeof window === "undefined" ? null : window.openai?.openExternal?.bind(window.openai);

  const netValueDisplay = useMemo(
    () => formatCurrency(card.netValue, { sign: "always" }),
    [card.netValue]
  );
  const totalValueDisplay = useMemo(
    () => formatCurrency(card.totalBenefitValue),
    [card.totalBenefitValue]
  );

  return (
    <div className="min-h-full bg-slate-100 p-4 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-300">{card.issuer.name}</p>
              <h1 className="mt-2 text-2xl font-semibold">{card.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">{card.headline}</p>
            </div>
            {card.applicationUrl && (
              <button
                onClick={() => openExternal?.({ href: card.applicationUrl! })}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
              >
                Apply now
              </button>
            )}
          </div>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-300">Annual fee</dt>
              <dd className="mt-2 text-lg font-semibold text-white">{card.annualFeeDisplay}</dd>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-300">Estimated annual value</dt>
              <dd className="mt-2 text-lg font-semibold text-white">{totalValueDisplay}</dd>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-300">Net after fee</dt>
              <dd className="mt-2 text-lg font-semibold text-emerald-200">{netValueDisplay}</dd>
            </div>
          </dl>
          {card.welcomeOffer.headline && (
            <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm text-slate-100">
              <p className="text-xs uppercase tracking-wide text-slate-300">Welcome offer</p>
              <p className="mt-1 font-semibold">{card.welcomeOffer.headline}</p>
              {card.welcomeOffer.footnote && (
                <p className="mt-1 text-xs text-slate-300">{card.welcomeOffer.footnote}</p>
              )}
            </div>
          )}
        </header>

        {card.bestFor.length ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Best for</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
              {card.bestFor.map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/80">
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {card.rewardRates.length ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Earning rates</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {card.rewardRates.map((rate) => (
                <li key={rate.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70">
                  <span className="font-medium text-slate-900 dark:text-white">{rate.label}</span>
                  {rate.cap && <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{rate.cap}</span>}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Benefits breakdown</h2>
          {payload.benefitGroups.length ? (
            <div className="mt-4 space-y-6">
              {payload.benefitGroups.map((group) => (
                <div key={group.id}>
                  <h3 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {group.title}
                  </h3>
                  <ul className="mt-2 grid gap-3 md:grid-cols-2">
                    {group.benefits.map((benefit) => (
                      <BenefitItem key={benefit.id} benefit={benefit} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {payload.benefits.map((benefit) => (
                <BenefitItem key={benefit.id} benefit={benefit} />
              ))}
            </ul>
          )}
        </section>

        {(card.pros.length || card.cons.length) && (
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">Pros</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {card.pros.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-emerald-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-200">Cons</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {card.cons.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-rose-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {(card.creditScore || card.apr.intro || card.apr.regular) && (
          <section className="rounded-2xl bg-white p-6 shadow-sm text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Key terms</h2>
            <dl className="mt-3 space-y-2">
              {card.creditScore && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Recommended credit</dt>
                  <dd>{card.creditScore}</dd>
                </div>
              )}
              {card.apr.intro && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Intro APR</dt>
                  <dd>{card.apr.intro}</dd>
                </div>
              )}
              {card.apr.regular && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Regular APR</dt>
                  <dd>{card.apr.regular}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("card-detail-root")!).render(<App />);
