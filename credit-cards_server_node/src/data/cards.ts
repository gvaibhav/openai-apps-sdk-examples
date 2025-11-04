import type { Benefit, CardRecord, IssuerCode, RewardRate } from "./types.js";

const issuerDisplayNames: Record<IssuerCode, string> = {
  amex: "American Express",
  chase: "Chase",
  capital_one: "Capital One",
  boa: "Bank of America",
  citi: "Citi",
};

const cards: CardRecord[] = [
  {
    id: "amex_platinum",
    name: "The Platinum Card® from American Express",
    shortName: "Amex Platinum",
    issuer: "amex",
    issuerName: issuerDisplayNames.amex,
    category: "premium-travel",
    annualFee: 695,
    headline: "Flagship luxury travel card with the broadest lounge network and layered statement credits.",
    introApr: null,
    regularApr: "Pay Over Time APR: 19.74% – 29.74% variable",
    welcomeOffer:
      "Earn 80,000 Membership Rewards® points after you spend $6,000 on purchases within the first 6 months.",
    welcomeOfferValue: 1600,
    welcomeOfferFootnote:
      "Point valuation assumes 2.0¢ average redemption toward transferable airline partners.",
    rewardRates: [
      rate("flights", "5X points on flights booked directly with airlines or Amex Travel", "on up to $500k per calendar year"),
      rate("hotels", "5X points on prepaid Fine Hotels + Resorts® and The Hotel Collection bookings via Amex Travel"),
      rate("other", "1X points on other eligible purchases"),
    ],
    benefits: [
      credit(
        "airline_fee_credit",
        "$200 Airline Fee Credit",
        "travel",
        200,
        "Statement credit for incidental fees with your selected qualifying airline. Enrollment required."
      ),
      credit(
        "hotel_credit",
        "$200 Prepaid Hotel Credit",
        "travel",
        200,
        "Annual credit toward prepaid Fine Hotels + Resorts® or The Hotel Collection stays through Amex Travel."
      ),
      credit(
        "uber_cash",
        "$200 Uber Cash",
        "transport",
        200,
        "Automatic $15 in Uber Cash each month plus a $35 bonus in December. Enrollment required."
      ),
      credit(
        "clear_plus",
        "$189 CLEAR® Plus Credit",
        "travel",
        189,
        "Receive up to $189 in statement credits per year for your CLEAR Plus membership. Enrollment required."
      ),
      credit(
        "saks_credit",
        "$100 Saks Fifth Avenue Credit",
        "shopping",
        100,
        "Split into $50 credits for January–June and July–December. Enrollment required."
      ),
      credit(
        "equinox_credit",
        "$300 Equinox Credit",
        "wellness",
        300,
        "Monthly statement credits for eligible Equinox memberships. Enrollment required."
      ),
      perk(
        "global_lounge",
        "Global Lounge Collection access",
        "travel",
        550,
        "Centurion®, Delta Sky Club® (when flying Delta), Escape Lounges, Plaza Premium, Priority Pass™ (enrollment required)."
      ),
      perk(
        "fhrr_benefits",
        "Fine Hotels + Resorts® extras",
        "travel",
        200,
        "Average $550 value per stay via daily breakfast for two, guaranteed 4pm checkout, and a unique amenity."
      ),
      perk(
        "premium_internet",
        "Global Entry/TSA PreCheck® credit",
        "travel",
        100,
        "Receive up to $100 in statement credits every 4 years for Global Entry or every 4.5 years for TSA PreCheck®."
      ),
      protection(
        "trip_protection",
        "Trip cancellation & interruption insurance",
        "peace_of_mind",
        150,
        "Coverage up to $10,000 per trip when paid with the card; see terms for eligibility."
      ),
    ],
    bestFor: [
      "Frequent international travelers",
      "Travelers seeking comprehensive lounge access",
      "Cardmembers who can unlock multiple statement credits",
    ],
    creditScore: "Excellent (720+ recommended)",
    highlights: [
      "Centurion, Delta Sky Club, Priority Pass, Escape, and Plaza Premium lounge access",
      "Layered annual credits that can exceed the annual fee if fully utilized",
      "5X earn on flights and prepaid luxury hotels via Amex Travel",
    ],
    pros: [
      "Most expansive airport lounge network on a consumer card",
      "High-value annual credits across travel, rideshare, wellness, and shopping",
      "Premium travel protections and elite status shortcuts with Hilton and Marriott",
    ],
    cons: [
      "$695 annual fee demands disciplined credit use to break even",
      "No bonus categories for everyday spend outside travel",
      "Some credits require enrollment and may be difficult to maximize",
    ],
    applicationUrl:
      "https://www.americanexpress.com/us/credit-cards/card/platinum/",
    imageUrl: undefined,
    rating: 4.8,
  },
  {
    id: "amex_gold",
    name: "American Express® Gold Card",
    shortName: "Amex Gold",
    issuer: "amex",
    issuerName: issuerDisplayNames.amex,
    category: "dining-travel",
    annualFee: 250,
    headline: "Dining-forward rewards with practical statement credits for food delivery and rideshare.",
    introApr: null,
    regularApr: "Pay Over Time APR: 19.74% – 29.74% variable",
    welcomeOffer:
      "Earn 60,000 Membership Rewards® points after you spend $6,000 on eligible purchases within the first 6 months.",
    welcomeOfferValue: 1080,
    welcomeOfferFootnote: "Assumes 1.8¢ value when transferring to airline partners.",
    rewardRates: [
      rate("restaurants", "4X points at restaurants worldwide, including takeout and delivery"),
      rate("us_supermarkets", "4X points at U.S. supermarkets", "on up to $25,000 in purchases per calendar year"),
      rate("airfare", "3X points on flights booked directly with airlines or via Amex Travel"),
      rate("other", "1X points on other eligible purchases"),
    ],
    benefits: [
      credit(
        "dining_credit",
        "$120 Dining Credit",
        "dining",
        120,
        "Split into $10 monthly credits at participating partners like Grubhub, Goldbelly, Wine.com, Milk Bar, and Shake Shack. Enrollment required."
      ),
      credit(
        "uber_cash",
        "$120 Uber Cash",
        "transport",
        120,
        "$10 per month in Uber Cash for rides or Uber Eats orders in the U.S. Enrollment required."
      ),
      perk(
        "travel_insurance",
        "Solid travel protections for a mid-tier card",
        "peace_of_mind",
        80,
        "Trip delay insurance (6+ hours) and baggage insurance plan when trip is paid with the card."
      ),
      perk(
        "no_foreign_fees",
        "No foreign transaction fees",
        "travel",
        70,
        "Save 2.7% on international purchases compared with cards that charge FX fees."
      ),
      perk(
        "hotel_status",
        "$100 The Hotel Collection credit (2+ night stay)",
        "travel",
        100,
        "Receive a $100 experience credit plus room upgrade when available on eligible prepaid bookings."
      ),
    ],
    bestFor: [
      "Foodies and frequent delivery users",
      "Travelers who value flexible Membership Rewards points",
      "Everyday spenders who want elevated dining & grocery multipliers",
    ],
    creditScore: "Good to Excellent (690+)",
    highlights: [
      "4X points globally at restaurants",
      "Monthly Uber Cash and dining credits offset the fee",
      "Strong earn on U.S. supermarket spend",
    ],
    pros: [
      "Effective $10 dining and Uber credits each month",
      "High earning potential on everyday categories",
      "Transfer partners provide outsized redemption value",
    ],
    cons: [
      "Requires enrollment to activate credits",
      "Limited travel benefits versus premium cards",
      "$250 annual fee still needs justification if credits go unused",
    ],
    applicationUrl: "https://www.americanexpress.com/us/credit-cards/card/gold-card/",
    imageUrl: undefined,
    rating: 4.4,
  },
  {
    id: "chase_sapphire_reserve",
    name: "Chase Sapphire Reserve®",
    shortName: "Sapphire Reserve",
    issuer: "chase",
    issuerName: issuerDisplayNames.chase,
    category: "premium-travel",
    annualFee: 550,
    headline: "Premium Chase Ultimate Rewards® hub with automatic travel credits and flexible transfer partners.",
    introApr: null,
    regularApr: "21.49% – 28.49% variable",
    welcomeOffer:
      "Earn 75,000 bonus points after spending $4,000 on purchases in the first 3 months from account opening.",
    welcomeOfferValue: 1125,
    welcomeOfferFootnote:
      "Assumes 1.5¢ value when redeemed through Chase Travel℠; more via transfer partners.",
    rewardRates: [
      rate("travel_credit", "10X total points on hotels and car rentals through Chase Travel℠"),
      rate("airfare_portal", "5X total points on flights booked through Chase Travel℠"),
      rate("dining", "3X points on other travel worldwide and on dining at restaurants"),
      rate("other", "1X point per dollar on other purchases"),
    ],
    benefits: [
      credit(
        "travel_credit",
        "$300 Travel Credit",
        "travel",
        300,
        "Automatically applied to travel purchases made on your card each account anniversary year."
      ),
      perk(
        "priority_pass",
        "Priority Pass™ Select lounge membership (with credits)",
        "travel",
        450,
        "Unlimited lounge visits for you and two guests; includes credits at Priority Pass restaurants. Enrollment required."
      ),
      perk(
        "lyft_pink",
        "Complimentary Lyft Pink All Access (1 year)",
        "transport",
        199,
        "Receive 15% off Lyft rides, priority pickups, bike/scooter unlocks, and free Grubhub+ for 12 months."
      ),
      perk(
        "doordash",
        "DoorDash DashPass membership",
        "dining",
        120,
        "Free membership plus quarterly $5 DoorDash credits through 12/31/2024."
      ),
      perk(
        "instacart",
        "Instacart+ membership + $15 credits",
        "lifestyle",
        180,
        "One year of Instacart+ and $15 per quarter credits through July 2024."
      ),
      protection(
        "trip_delay",
        "Best-in-class travel and purchase protections",
        "peace_of_mind",
        200,
        "Trip delay, cancellation, primary rental coverage, and high purchase protections."
      ),
    ],
    bestFor: [
      "Chase Ultimate Rewards power users",
      "Travelers who want automatic travel credits",
      "Cardmembers valuing comprehensive protections",
    ],
    creditScore: "Excellent (720+ recommended)",
    highlights: [
      "$300 automatic travel credit keeps the effective fee in check",
      "1.5X redemption via Chase Travel℠ portal",
      "Priority Pass with restaurant credit access",
    ],
    pros: [
      "Stack of lifestyle partnerships (Lyft, DoorDash, Instacart)",
      "Primary rental car coverage and premium protections",
      "Transfer partners for outsized travel redemptions",
    ],
    cons: [
      "High $550 annual fee",
      "Best portal earn rates require booking via Chase Travel℠",
      "Lifestyle credits currently time-limited",
    ],
    applicationUrl: "https://www.chase.com/personal/credit-cards/sapphire/reserve",
    imageUrl: undefined,
    rating: 4.6,
  },
  {
    id: "chase_sapphire_preferred",
    name: "Chase Sapphire Preferred® Card",
    shortName: "Sapphire Preferred",
    issuer: "chase",
    issuerName: issuerDisplayNames.chase,
    category: "core-travel",
    annualFee: 95,
    headline: "Balanced travel starter card with strong transfer partners and lightweight statement credits.",
    introApr: null,
    regularApr: "21.49% – 28.49% variable",
    welcomeOffer:
      "Earn 75,000 bonus points after spending $4,000 on purchases in the first 3 months from account opening.",
    welcomeOfferValue: 937,
    welcomeOfferFootnote: "Assumes 1.25¢ value through Chase Travel℠ portal.",
    rewardRates: [
      rate("travel_portal", "5X points on travel purchased through Chase Travel℠"),
      rate("dining", "3X points on dining, including eligible delivery"),
      rate("select_travel", "2X points on other travel purchases"),
      rate("online_grocery", "3X points on online grocery purchases (excluding Target, Walmart, wholesale clubs)"),
      rate("streaming", "3X points on select streaming services"),
      rate("other", "1X point per dollar elsewhere"),
    ],
    benefits: [
      credit(
        "hotel_credit",
        "$50 Hotel Credit",
        "travel",
        50,
        "Annual statement credit for hotel stays purchased through Chase Travel℠."
      ),
      perk(
        "anniversary_boost",
        "10% anniversary point boost",
        "rewards",
        100,
        "Each account anniversary you earn bonus points equal to 10% of the prior year's spending."
      ),
      perk(
        "dashpass",
        "DoorDash DashPass (12 months)",
        "dining",
        60,
        "Unlimited $0 delivery fees and reduced service fees on qualifying orders. Activate by 12/31/2024."
      ),
      perk(
        "no_fx",
        "No foreign transaction fees",
        "travel",
        70,
        "Smart choice for international travel with no FX fees."
      ),
      protection(
        "primary_rental",
        "Primary rental car coverage",
        "peace_of_mind",
        120,
        "Covers most car rentals for theft and collision damage worldwide."
      ),
    ],
    bestFor: [
      "Travel beginners building a transferable points stash",
      "Chase ecosystem loyalists",
      "Cardmembers wanting strong value without a huge annual fee",
    ],
    creditScore: "Good to Excellent (690+)",
    highlights: [
      "1.25X value through Chase Travel℠",
      "Transfer points to 14 airline and hotel partners",
      "Travel protections usually found on premium cards",
    ],
    pros: [
      "Low $95 fee with premium-style perks",
      "Diverse bonus categories including online groceries and streaming",
      "Pairs well with no-annual-fee Chase Freedom cards",
    ],
    cons: [
      "Small $50 hotel credit usable only via Chase Travel℠",
      "No lounge access",
      "Best value still requires learning transfer partners",
    ],
    applicationUrl: "https://www.chase.com/personal/credit-cards/sapphire/preferred",
    imageUrl: undefined,
    rating: 4.5,
  },
  {
    id: "capital_one_venture_x",
    name: "Capital One Venture X Rewards Credit Card",
    shortName: "Venture X",
    issuer: "capital_one",
    issuerName: issuerDisplayNames.capital_one,
    category: "premium-travel",
    annualFee: 395,
    headline: "Flat-rate premium travel card with uncapped 2X miles and easy-to-use annual credits.",
    introApr: null,
    regularApr: "19.99% – 29.99% variable",
    welcomeOffer:
      "Earn 75,000 bonus miles after spending $4,000 on purchases within the first 3 months of account opening.",
    welcomeOfferValue: 1125,
    welcomeOfferFootnote: "Assumes 1.5¢ value per Venture mile toward travel partners.",
    rewardRates: [
      rate("travel_portal", "10X miles on hotels and rental cars booked via Capital One Travel"),
      rate("airfare_portal", "5X miles on flights booked via Capital One Travel"),
      rate("other", "2X miles on every other purchase"),
    ],
    benefits: [
      credit(
        "travel_credit",
        "$300 Capital One Travel Credit",
        "travel",
        300,
        "Automatically receive up to $300 in statement credits annually for bookings through Capital One Travel."
      ),
      perk(
        "anniversary_miles",
        "10,000 anniversary bonus miles",
        "rewards",
        100,
        "Miles worth at least $100 toward travel every account anniversary."
      ),
      perk(
        "lounge_collection",
        "Capital One + Priority Pass lounge access",
        "travel",
        400,
        "Access Capital One Lounges plus full Priority Pass network for you and 2 guests."
      ),
      perk(
        "authorized_users",
        "Add up to 4 authorized users for free",
        "travel",
        160,
        "Authorized users get access to the same lounge network, a $640 value compared with competitors."
      ),
      perk(
        "tsaprecheck",
        "Global Entry or TSA PreCheck® credit",
        "travel",
        100,
        "Receive a credit for the application fee every 4 years."
      ),
      protection(
        "cell_phone_protection",
        "Cell phone and purchase protection",
        "peace_of_mind",
        120,
        "Cell phone protection up to $800 per claim and robust purchase coverage."
      ),
    ],
    bestFor: [
      "Travelers wanting premium perks with a lower fee",
      "Families leveraging free authorized users",
      "Cardmembers preferring flat 2X earn everywhere",
    ],
    creditScore: "Good to Excellent (700+)",
    highlights: [
      "2X miles on every purchase with no cap",
      "Travel credit + anniversary miles offset the fee",
      "Capital One + Priority Pass lounges",
    ],
    pros: [
      "Free authorized users retain lounge access",
      "Simple earn structure",
      "Helpful for families who want lounge access without extra cost",
    ],
    cons: [
      "Capital One Travel portal still maturing",
      "Fewer transfer partners than Amex or Chase",
      "No significant dining or grocery multipliers",
    ],
    applicationUrl: "https://www.capitalone.com/credit-cards/venture-x/",
    imageUrl: undefined,
    rating: 4.7,
  },
];

const cardsById = new Map(cards.map((card) => [card.id, card]));

function rate(id: string, label: string, cap?: string): RewardRate {
  return { id, label, rate: label.split(" ")[0], details: label, cap };
}

function credit(
  id: string,
  name: string,
  category: string,
  estimatedValue: number,
  description: string
): Benefit {
  return {
    id,
    name,
    category,
    description,
    estimatedValue,
    type: "statement_credit",
    frequency: "annual",
    terms: description.includes("Enrollment required") ? "Enrollment required" : undefined,
    tags: ["statement_credit", category],
    highlight: true,
  };
}

function perk(
  id: string,
  name: string,
  category: string,
  estimatedValue: number,
  description: string
): Benefit {
  return {
    id,
    name,
    category,
    description,
    estimatedValue,
    type: "perk",
    frequency: "annual",
    tags: [category, "perk"],
  };
}

function protection(
  id: string,
  name: string,
  category: string,
  estimatedValue: number,
  description: string
): Benefit {
  return {
    id,
    name,
    category,
    description,
    estimatedValue,
    type: "protection",
    frequency: "annual",
    tags: [category, "protection"],
  };
}

export function getCards(): CardRecord[] {
  return cards;
}

export function getCardById(cardId: string): CardRecord | undefined {
  return cardsById.get(cardId);
}

export function normalizeIssuerCode(raw?: string | null): IssuerCode | undefined {
  if (!raw) return undefined;
  const value = raw.toLowerCase();
  if (value.startsWith("american")) return "amex";
  if (value.includes("amex")) return "amex";
  if (value.includes("chase")) return "chase";
  if (value.includes("capital")) return "capital_one";
  if (value.includes("capitalone")) return "capital_one";
  if (value.includes("bank of america") || value.includes("bofa") || value === "boa") return "boa";
  if (value.includes("citi")) return "citi";
  if ((["amex", "chase", "capital_one", "boa", "citi"] as string[]).includes(value)) {
    return value as IssuerCode;
  }
  return undefined;
}

export function filterCards(options: {
  issuer?: string | null;
  category?: string | null;
}): CardRecord[] {
  const issuer = normalizeIssuerCode(options.issuer ?? undefined);
  const category = options.category?.toLowerCase();
  return cards.filter((card) => {
    if (issuer && card.issuer !== issuer) return false;
    if (category && card.category.toLowerCase() !== category) return false;
    return true;
  });
}

export function cardTotalBenefitValue(card: CardRecord): number {
  return card.benefits.reduce((sum, benefit) => sum + Math.max(benefit.estimatedValue, 0), 0);
}

export function cardNetValue(card: CardRecord): number {
  return cardTotalBenefitValue(card) - card.annualFee;
}

export function topBenefits(card: CardRecord, limit = 3): Benefit[] {
  return [...card.benefits]
    .sort((a, b) => Math.max(b.estimatedValue, 0) - Math.max(a.estimatedValue, 0))
    .slice(0, limit);
}

export function listBenefitMatches(term: string, minValue = 0) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return [] as { card: CardRecord; benefit: Benefit }[];
  const results: { card: CardRecord; benefit: Benefit }[] = [];
  for (const card of cards) {
    for (const benefit of card.benefits) {
      if (benefit.estimatedValue < minValue) continue;
      const haystack = [
        benefit.name,
        benefit.description,
        benefit.category,
        ...(benefit.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(normalized)) {
        results.push({ card, benefit });
      }
    }
  }
  return results;
}

export function issuerDisplay(code: IssuerCode): string {
  return issuerDisplayNames[code] ?? code;
}

export function annualFeeDisplay(card: CardRecord): string {
  return card.annualFee ? `$${card.annualFee.toLocaleString()}` : "$0";
}

export function toSummary(card: CardRecord) {
  return {
    id: card.id,
    name: card.name,
    shortName: card.shortName,
    issuer: {
      code: card.issuer,
      name: card.issuerName,
    },
    category: card.category,
    annualFee: card.annualFee,
    annualFeeDisplay: annualFeeDisplay(card),
    totalBenefitValue: cardTotalBenefitValue(card),
    netValue: cardNetValue(card),
    rating: card.rating,
    welcomeOffer: {
      headline: card.welcomeOffer,
      estimatedValue: card.welcomeOfferValue,
      footnote: card.welcomeOfferFootnote,
    },
    topBenefits: topBenefits(card, 3),
    highlights: card.highlights,
    bestFor: card.bestFor,
  };
}

export function toDetail(card: CardRecord) {
  const totalValue = cardTotalBenefitValue(card);
  const benefitGroups = groupBenefits(card.benefits);
  return {
    card: {
      id: card.id,
      name: card.name,
      shortName: card.shortName,
      issuer: {
        code: card.issuer,
        name: card.issuerName,
      },
      category: card.category,
      annualFee: card.annualFee,
      annualFeeDisplay: annualFeeDisplay(card),
      totalBenefitValue: totalValue,
      netValue: totalValue - card.annualFee,
      rating: card.rating,
      headline: card.headline,
      welcomeOffer: {
        headline: card.welcomeOffer,
        estimatedValue: card.welcomeOfferValue,
        footnote: card.welcomeOfferFootnote,
      },
      rewardRates: card.rewardRates,
      highlights: card.highlights,
      bestFor: card.bestFor,
      pros: card.pros,
      cons: card.cons,
      creditScore: card.creditScore,
      applicationUrl: card.applicationUrl,
      imageUrl: card.imageUrl,
      apr: {
        intro: card.introApr,
        regular: card.regularApr,
      },
    },
    benefits: [...card.benefits].sort(
      (a, b) => Math.max(b.estimatedValue, 0) - Math.max(a.estimatedValue, 0)
    ),
    benefitGroups,
    totalBenefitValue: totalValue,
    netValue: totalValue - card.annualFee,
    bestFor: card.bestFor,
  };
}

function groupBenefits(benefits: Benefit[]) {
  const groups = new Map<string, Benefit[]>();
  for (const benefit of benefits) {
    const key = benefit.type;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(benefit);
  }
  return Array.from(groups.entries()).map(([key, list]) => ({
    id: key,
    title: titleForBenefitType(key),
    benefits: list.sort(
      (a, b) => Math.max(b.estimatedValue, 0) - Math.max(a.estimatedValue, 0)
    ),
  }));
}

function titleForBenefitType(value: string) {
  switch (value) {
    case "statement_credit":
      return "Statement credits";
    case "perk":
      return "Perks";
    case "protection":
      return "Protection benefits";
    default:
      return value;
  }
}
