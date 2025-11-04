export type BenefitType = "statement_credit" | "perk" | "protection" | string;

export type BenefitSnippet = {
  id: string;
  name: string;
  category: string;
  estimatedValue: number;
  estimatedValueDisplay: string;
  description: string;
  type: BenefitType;
  tags?: string[];
  frequency?: string;
  highlight?: boolean;
  terms?: string;
};

export type Benefit = {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedValue: number;
  type: BenefitType;
  frequency?: string;
  terms?: string;
  tags?: string[];
  highlight?: boolean;
};

export type CardIssuer = {
  code: string;
  name: string;
};

export type SummaryCard = {
  id: string;
  name: string;
  shortName: string;
  issuer: CardIssuer;
  category: string;
  annualFee: number;
  annualFeeDisplay: string;
  totalBenefitValue: number;
  netValue: number;
  rating: number;
  welcomeOffer: {
    headline: string;
    estimatedValue: number;
    footnote?: string;
  };
  topBenefits: Benefit[];
  highlights: string[];
  bestFor: string[];
  totalBenefitValueDisplay: string;
  netValueDisplay: string;
  welcomeOfferValueDisplay: string;
};

export type ListCardsPayload = {
  resultType: "list_cards" | "search_benefits";
  headline: string;
  filters: {
    issuer: string | null;
    category: string | null;
    benefitType: string | null;
    minValue: number | null;
  };
  stats: {
    totalCards: number;
    averageNetValue: number;
    averageNetValueDisplay: string;
    totalBenefitValue: number;
    totalBenefitValueDisplay: string;
    bestNetValue: number;
    bestNetValueDisplay: string;
  };
  cards: Array<
    SummaryCard & {
      matchedBenefits?: BenefitSnippet[];
    }
  >;
  benefitMatches?: Array<{
    benefitType: string;
    items: Array<{
      cardId: string;
      cardName: string;
      benefitId: string;
      benefitName: string;
      summary: string;
      estimatedValue: number;
      estimatedValueDisplay: string;
    }>;
  }>;
};

export type CardDetailPayload = {
  resultType: "card_detail";
  card: {
    id: string;
    name: string;
    shortName: string;
    issuer: CardIssuer;
    category: string;
    annualFee: number;
    annualFeeDisplay: string;
    totalBenefitValue: number;
    netValue: number;
    rating: number;
    headline: string;
    welcomeOffer: {
      headline: string;
      estimatedValue: number;
      footnote?: string;
    };
    rewardRates: Array<{
      id: string;
      label: string;
      rate: string;
      details?: string;
      cap?: string;
    }>;
    highlights: string[];
    bestFor: string[];
    pros: string[];
    cons: string[];
    creditScore?: string;
    applicationUrl?: string;
    imageUrl?: string;
    apr: {
      intro: string | null;
      regular: string | null;
    };
  };
  benefits: BenefitSnippet[];
  benefitGroups: Array<{
    id: string;
    title: string;
    benefits: BenefitSnippet[];
  }>;
  totalBenefitValue: number;
  netValue: number;
  bestFor: string[];
};

export type ComparisonRow = {
  key: string;
  label: string;
  description?: string;
  values: Array<{
    cardId: string;
    display: string;
    numericValue?: number;
    annotation?: string;
  }>;
};

export type ComparisonPayload = {
  resultType: "comparison";
  comparisonType: string;
  requestedCards: string[];
  cards: Array<
    SummaryCard & {
      isWinner: boolean;
      rank: number;
      quickStats: string[];
    }
  >;
  rows: ComparisonRow[];
  highlightCategories: Array<{
    title: string;
    description: string;
    winners: Array<{
      cardId: string;
      statement: string;
    }>;
  }>;
  summary: {
    headline: string;
    detail: string;
    winnerCardId: string;
    supportingPoints: string[];
  };
};
