export type IssuerCode = "amex" | "chase" | "capital_one" | "boa" | "citi";

export interface RewardRate {
  id: string;
  label: string;
  rate: string;
  details?: string;
  cap?: string;
}

export interface Benefit {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedValue: number;
  type: "statement_credit" | "perk" | "protection";
  frequency?: "annual" | "monthly" | "one_time";
  terms?: string;
  tags?: string[];
  highlight?: boolean;
}

export interface CardRecord {
  id: string;
  name: string;
  shortName: string;
  issuer: IssuerCode;
  issuerName: string;
  category: string;
  annualFee: number;
  introApr?: string | null;
  regularApr?: string | null;
  headline: string;
  welcomeOffer: string;
  welcomeOfferValue: number;
  welcomeOfferFootnote?: string;
  rewardRates: RewardRate[];
  benefits: Benefit[];
  bestFor: string[];
  creditScore: string;
  highlights: string[];
  pros: string[];
  cons: string[];
  applicationUrl: string;
  imageUrl?: string;
  rating: number;
}
