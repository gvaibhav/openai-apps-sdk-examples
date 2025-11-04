import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type CallToolResult,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ReadResourceRequest,
  type ListToolsRequest,
  type Resource,
  type ResourceTemplate,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import {
  cardNetValue,
  cardTotalBenefitValue,
  filterCards,
  getCardById,
  listBenefitMatches,
  toDetail,
  toSummary,
  topBenefits,
} from "./data/cards.js";
import type { Benefit, CardRecord } from "./data/types.js";

type WidgetDefinition = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  responseText: string;
};

type ListCardsArgs = z.infer<typeof listCardsSchema>;
type GetCardBenefitsArgs = z.infer<typeof getCardBenefitsSchema>;
type CompareCardsArgs = z.infer<typeof compareCardsSchema>;
type SearchBenefitsArgs = z.infer<typeof searchBenefitsSchema>;

type SummaryCard = ReturnType<typeof toSummary> & {
  totalBenefitValueDisplay: string;
  netValueDisplay: string;
  welcomeOfferValueDisplay: string;
};

type BenefitSnippet = {
  id: string;
  name: string;
  category: string;
  estimatedValue: number;
  estimatedValueDisplay: string;
  description: string;
  type: string;
  tags?: string[];
  frequency?: string;
  highlight?: boolean;
};

type ComparisonRow = {
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

type ComparisonPayload = {
  resultType: "comparison";
  comparisonType: string;
  requestedCards: string[];
  cards: Array<
    SummaryCard & {
      isWinner: boolean;
      rank: number;
      netValueDisplay: string;
      totalBenefitValueDisplay: string;
      welcomeOfferValueDisplay: string;
      quickStats: string[];
    }
  >;
  rows: ComparisonRow[];
  highlightCategories: Array<{
    title: string;
    description: string;
    winners: Array<{ cardId: string; statement: string }>;
  }>;
  summary: {
    headline: string;
    detail: string;
    winnerCardId: string;
    supportingPoints: string[];
  };
};

type ListCardsPayload = {
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
      totalBenefitValueDisplay: string;
      netValueDisplay: string;
      welcomeOfferValueDisplay: string;
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

type CardDetailPayload = {
  resultType: "card_detail";
  card: ReturnType<typeof toDetail>["card"];
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const ASSETS_DIR = path.resolve(ROOT_DIR, "assets");

function readWidgetHtml(name: string): string {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(
      `Widget assets not found. Expected directory ${ASSETS_DIR}. Run "pnpm run build" before starting the server.`
    );
  }

  const directPath = path.join(ASSETS_DIR, `${name}.html`);
  let htmlContents: string | undefined;

  if (fs.existsSync(directPath)) {
    htmlContents = fs.readFileSync(directPath, "utf8");
  } else {
    const candidates = fs
      .readdirSync(ASSETS_DIR)
      .filter((file) => file.startsWith(`${name}-`) && file.endsWith(".html"))
      .sort();
    const fallback = candidates.at(-1);
    if (fallback) {
      htmlContents = fs.readFileSync(path.join(ASSETS_DIR, fallback), "utf8");
    }
  }

  if (!htmlContents) {
    throw new Error(
      `Widget HTML for "${name}" not found in ${ASSETS_DIR}. Run "pnpm run build" to generate the assets.`
    );
  }

  return htmlContents;
}

const widgetCatalog = (() => {
  const definitions: WidgetDefinition[] = [
    {
      id: "benefits-list",
      title: "Credit card list",
      templateUri: "ui://widget/benefits-list.html",
      invoking: "Gathering matching cards",
      invoked: "Showing matching cards",
      html: readWidgetHtml("benefits-list"),
      responseText: "Generated a list of matching credit cards.",
    },
    {
      id: "card-detail",
      title: "Card detail",
      templateUri: "ui://widget/card-detail.html",
      invoking: "Looking up card benefits",
      invoked: "Card details ready",
      html: readWidgetHtml("card-detail"),
      responseText: "Outlined the card's benefits.",
    },
    {
      id: "comparison-table",
      title: "Comparison table",
      templateUri: "ui://widget/comparison-table.html",
      invoking: "Comparing requested cards",
      invoked: "Comparison ready",
      html: readWidgetHtml("comparison-table"),
      responseText: "Compared the selected cards.",
    },
  ];

  const byId = new Map(definitions.map((widget) => [widget.id, widget]));
  const byUri = new Map(definitions.map((widget) => [widget.templateUri, widget]));

  return {
    list: definitions,
    byId,
    byUri,
    get(id: string) {
      const widget = byId.get(id);
      if (!widget) throw new Error(`Unknown widget id: ${id}`);
      return widget;
    },
  } as const;
})();

function widgetMeta(widget: WidgetDefinition, overrides?: Record<string, unknown>) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking":
      (overrides?.["openai/toolInvocation/invoking"] as string | undefined) ?? widget.invoking,
    "openai/toolInvocation/invoked":
      (overrides?.["openai/toolInvocation/invoked"] as string | undefined) ?? widget.invoked,
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
    "openai.com/widget": {
      uri: widget.templateUri,
      mimeType: "text/html+skybridge",
      text: widget.html,
    },
    ...overrides,
  } as const;
}

const annotations = {
  destructiveHint: false,
  openWorldHint: false,
  readOnlyHint: true,
} as const;

const listCardsSchema = z
  .object({
    issuer: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
  })
  .strict();

const getCardBenefitsSchema = z
  .object({
    card_id: z.string().trim().min(1),
  })
  .strict();

const compareCardsSchema = z
  .object({
    card_ids: z.array(z.string().trim().min(1)).min(2, "Provide at least two card_ids"),
    comparison_type: z.enum(["all", "benefits", "fees", "rewards"]).optional(),
  })
  .strict();

const searchBenefitsSchema = z
  .object({
    benefit_type: z.string().trim().min(1),
    min_value: z.number().nonnegative().optional(),
  })
  .strict();

const tools: Tool[] = [
  {
    name: "list_cards",
    title: "List cards",
    description: "List available credit cards filtered by issuer or category.",
    inputSchema: {
      type: "object",
      properties: {
        issuer: {
          type: "string",
          description: "Issuer name or code (e.g. amex, chase, capital_one).",
        },
        category: {
          type: "string",
          description: "Segment such as premium-travel, core-travel, dining-travel.",
        },
      },
      additionalProperties: false,
    },
    _meta: widgetMeta(widgetCatalog.get("benefits-list")),
    annotations,
  },
  {
    name: "get_card_benefits",
    title: "Card benefits",
    description: "Show a detailed breakdown of a specific card's benefits and credits.",
    inputSchema: {
      type: "object",
      properties: {
        card_id: {
          type: "string",
          description: "Card identifier such as amex_platinum or chase_sapphire_reserve.",
        },
      },
      required: ["card_id"],
      additionalProperties: false,
    },
    _meta: widgetMeta(widgetCatalog.get("card-detail")),
    annotations,
  },
  {
    name: "compare_cards",
    title: "Compare cards",
    description: "Compare multiple credit cards side by side.",
    inputSchema: {
      type: "object",
      properties: {
        card_ids: {
          type: "array",
          minItems: 2,
          items: {
            type: "string",
            description: "Card identifier to include in the comparison",
          },
        },
        comparison_type: {
          type: "string",
          enum: ["all", "benefits", "fees", "rewards"],
          description: "Focus area for the comparison summary",
        },
      },
      required: ["card_ids"],
      additionalProperties: false,
    },
    _meta: widgetMeta(widgetCatalog.get("comparison-table")),
    annotations,
  },
  {
    name: "search_benefits",
    title: "Search benefits",
    description: "Find cards that include a specific benefit type or keyword.",
    inputSchema: {
      type: "object",
      properties: {
        benefit_type: {
          type: "string",
          description: "Benefit keyword (e.g. lounge, travel credit, tsa precheck).",
        },
        min_value: {
          type: "number",
          description: "Minimum estimated annual value in USD.",
        },
      },
      required: ["benefit_type"],
      additionalProperties: false,
    },
    _meta: widgetMeta(widgetCatalog.get("benefits-list")),
    annotations,
  },
];

const resources: Resource[] = widgetCatalog.list.map((widget) => ({
  uri: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget),
}));

const resourceTemplates: ResourceTemplate[] = widgetCatalog.list.map((widget) => ({
  uriTemplate: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget),
}));

function formatCurrency(value: number, opts?: { sign?: "always" | "auto" }): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: opts?.sign ?? "auto",
    maximumFractionDigits: Math.abs(value) < 1 ? 2 : 0,
  });
  return formatter.format(value);
}

function parseArgs<T>(schema: z.ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw ?? {});
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    throw new Error(problems);
  }
  return result.data;
}

function listCardsPayload(args: ListCardsArgs, resultType: "list_cards" | "search_benefits"): ListCardsPayload {
  const baseSummaries = filterCards({ issuer: args.issuer ?? null, category: args.category ?? null }).map(
    toSummary
  );
  const cardsWithFormatting: SummaryCard[] = baseSummaries.map((summary) => ({
    ...summary,
    totalBenefitValueDisplay: formatCurrency(summary.totalBenefitValue),
    netValueDisplay: formatCurrency(summary.netValue, { sign: "always" }),
    welcomeOfferValueDisplay: formatCurrency(summary.welcomeOffer.estimatedValue),
  }));

  const totalNet = baseSummaries.reduce((sum, card) => sum + card.netValue, 0);
  const totalValue = baseSummaries.reduce((sum, card) => sum + card.totalBenefitValue, 0);
  const bestNet = baseSummaries.reduce(
    (max, card) => (card.netValue > max ? card.netValue : max),
    Number.NEGATIVE_INFINITY
  );

  const headlineParts = [
    baseSummaries.length
      ? `Found ${baseSummaries.length} card${baseSummaries.length === 1 ? "" : "s"}`
      : "No cards found",
  ];
  if (args.issuer) headlineParts.push(`from ${args.issuer}`);
  if (args.category) headlineParts.push(`in ${args.category}`);

  return {
    resultType,
    headline: headlineParts.join(" "),
    filters: {
      issuer: args.issuer ?? null,
      category: args.category ?? null,
      benefitType: null,
      minValue: null,
    },
    stats: {
      totalCards: baseSummaries.length,
      averageNetValue: baseSummaries.length ? totalNet / baseSummaries.length : 0,
      averageNetValueDisplay: formatCurrency(
        baseSummaries.length ? totalNet / baseSummaries.length : 0,
        {
        sign: "always",
        }
      ),
      totalBenefitValue: totalValue,
      totalBenefitValueDisplay: formatCurrency(totalValue),
      bestNetValue: bestNet === Number.NEGATIVE_INFINITY ? 0 : bestNet,
      bestNetValueDisplay: formatCurrency(
        bestNet === Number.NEGATIVE_INFINITY ? 0 : bestNet,
        { sign: "always" }
      ),
    },
    cards: cardsWithFormatting,
  };
}

function toBenefitSnippet(benefit: Benefit): BenefitSnippet {
  return {
    id: benefit.id,
    name: benefit.name,
    category: benefit.category,
    estimatedValue: benefit.estimatedValue,
    estimatedValueDisplay: formatCurrency(benefit.estimatedValue),
    description: benefit.description,
    type: benefit.type,
    tags: benefit.tags,
    frequency: benefit.frequency,
    highlight: benefit.highlight,
  };
}

function handleListCards(rawArgs: unknown): CallToolResult {
  const args = parseArgs(listCardsSchema, rawArgs);
  const payload = listCardsPayload(args, "list_cards");

  if (!payload.cards.length) {
    return makeCallResult(
      widgetCatalog.get("benefits-list"),
      payload,
      "No cards matched the filters. Try relaxing issuer or category.",
      {
        "openai/toolInvocation/invoking": "Reviewing card library",
        "openai/toolInvocation/invoked": "No matches found",
      }
    );
  }

  return makeCallResult(widgetCatalog.get("benefits-list"), payload, payload.headline);
}

function handleGetCardBenefits(rawArgs: unknown): CallToolResult {
  const args = parseArgs(getCardBenefitsSchema, rawArgs);
  const card = getCardById(args.card_id);
  if (!card) {
    return errorResult(`Unknown card_id: ${args.card_id}`);
  }

  const detail = toDetail(card);
  const payload: CardDetailPayload = {
    resultType: "card_detail",
    card: detail.card,
    benefits: detail.benefits.map(toBenefitSnippet),
    benefitGroups: detail.benefitGroups.map((group) => ({
      id: group.id,
      title: group.title,
      benefits: group.benefits.map(toBenefitSnippet),
    })),
    totalBenefitValue: detail.totalBenefitValue,
    netValue: detail.netValue,
    bestFor: detail.bestFor,
  };

  return makeCallResult(
    widgetCatalog.get("card-detail"),
    payload,
    `Outlined benefits for ${card.name}.`
  );
}

function handleCompareCards(rawArgs: unknown): CallToolResult {
  const args = parseArgs(compareCardsSchema, rawArgs);
  const requested = Array.from(new Set(args.card_ids));
  const cards = requested
    .map((cardId) => {
      const record = getCardById(cardId);
      if (!record) {
        throw new Error(`Unknown card_id: ${cardId}`);
      }
      return record;
    })
    .filter(Boolean) as CardRecord[];

  if (cards.length < 2) {
    return errorResult("Provide at least two valid card_ids to compare.");
  }

  const summaries: Array<SummaryCard & { quickStats: string[] }> = cards.map((card) => {
    const base = toSummary(card);
    const formatted: SummaryCard = {
      ...base,
      totalBenefitValueDisplay: formatCurrency(base.totalBenefitValue),
      netValueDisplay: formatCurrency(base.netValue, { sign: "always" }),
      welcomeOfferValueDisplay: formatCurrency(base.welcomeOffer.estimatedValue),
    };
    return {
      ...formatted,
      quickStats: [
        `${formatted.totalBenefitValueDisplay} est. annual value`,
        `${formatted.netValueDisplay} net after fee`,
      ],
    };
  });

  const [winner] = [...summaries].sort((a, b) => b.netValue - a.netValue);

  const payload: ComparisonPayload = {
    resultType: "comparison",
    comparisonType: args.comparison_type ?? "all",
    requestedCards: requested,
    cards: summaries.map((summary, index) => ({
      ...summary,
      rank: index + 1,
      isWinner: summary.id === winner.id,
    })),
    rows: buildComparisonRows(cards),
    highlightCategories: buildHighlightCategories(cards),
    summary: {
      headline: `${winner.shortName} leads with ${formatCurrency(winner.netValue, {
        sign: "always",
      })} net estimated value`,
      detail: `Compared ${cards.length} card${cards.length === 1 ? "" : "s"} focusing on ${
        args.comparison_type ?? "overall value"
      }.`,
      winnerCardId: winner.id,
      supportingPoints: [
        `${winner.shortName} combines ${formatCurrency(
          winner.totalBenefitValue
        )} estimated annual value with an effective net of ${formatCurrency(winner.netValue, {
          sign: "always",
        })}.`,
        `${winner.shortName} welcome offer estimated at ${formatCurrency(
          winner.welcomeOffer.estimatedValue
        )}.`,
      ],
    },
  };

  return makeCallResult(
    widgetCatalog.get("comparison-table"),
    payload,
    `Compared ${cards.length} card${cards.length === 1 ? "" : "s"}.`
  );
}

function handleSearchBenefits(rawArgs: unknown): CallToolResult {
  const args = parseArgs(searchBenefitsSchema, rawArgs);
  const matches = listBenefitMatches(args.benefit_type, args.min_value ?? 0);
  if (!matches.length) {
    const payload: ListCardsPayload = {
      ...listCardsPayload({ issuer: undefined, category: undefined }, "search_benefits"),
      headline: `No benefits matched "${args.benefit_type}"`,
      filters: {
        issuer: null,
        category: null,
        benefitType: args.benefit_type,
        minValue: args.min_value ?? null,
      },
      cards: [],
      benefitMatches: [],
    };
    return makeCallResult(
      widgetCatalog.get("benefits-list"),
      payload,
      `No cards included a benefit matching "${args.benefit_type}".`,
      {
        "openai/toolInvocation/invoking": "Scanning benefits",
        "openai/toolInvocation/invoked": "No matching benefits",
      }
    );
  }

  const grouped = new Map<string, { card: CardRecord; benefits: Benefit[] }>();
  for (const match of matches) {
    if (!grouped.has(match.card.id)) {
      grouped.set(match.card.id, { card: match.card, benefits: [] });
    }
    grouped.get(match.card.id)!.benefits.push(match.benefit);
  }

  const argsForList: ListCardsArgs = {};
  const payload = listCardsPayload(argsForList, "search_benefits");
  payload.filters = {
    issuer: null,
    category: null,
    benefitType: args.benefit_type,
    minValue: args.min_value ?? null,
  };
  payload.cards = Array.from(grouped.values()).map(({ card, benefits }) => {
    const summary = toSummary(card);
    return {
      ...summary,
      totalBenefitValueDisplay: formatCurrency(summary.totalBenefitValue),
      netValueDisplay: formatCurrency(summary.netValue, { sign: "always" }),
      welcomeOfferValueDisplay: formatCurrency(summary.welcomeOffer.estimatedValue),
      matchedBenefits: benefits.map(toBenefitSnippet),
    };
  });

  payload.benefitMatches = [
    {
      benefitType: args.benefit_type,
      items: matches.map((match) => ({
        cardId: match.card.id,
        cardName: match.card.name,
        benefitId: match.benefit.id,
        benefitName: match.benefit.name,
        summary: match.benefit.description,
        estimatedValue: match.benefit.estimatedValue,
        estimatedValueDisplay: formatCurrency(match.benefit.estimatedValue),
      })),
    },
  ];

  payload.headline = `Found ${payload.cards.length} card${
    payload.cards.length === 1 ? "" : "s"
  } with a ${args.benefit_type} benefit`;

  return makeCallResult(
    widgetCatalog.get("benefits-list"),
    payload,
    payload.headline
  );
}

function buildComparisonRows(cards: CardRecord[]): ComparisonRow[] {
  return [
    {
      key: "annual_fee",
      label: "Annual fee",
      values: cards.map((card) => ({
        cardId: card.id,
        display: formatCurrency(card.annualFee),
        numericValue: card.annualFee,
      })),
    },
    {
      key: "total_value",
      label: "Estimated annual value",
      description: "Sum of recurring credits and major perks.",
      values: cards.map((card) => ({
        cardId: card.id,
        display: formatCurrency(cardTotalBenefitValue(card)),
        numericValue: cardTotalBenefitValue(card),
      })),
    },
    {
      key: "net_value",
      label: "Net after fee",
      values: cards.map((card) => ({
        cardId: card.id,
        display: formatCurrency(cardNetValue(card), { sign: "always" }),
        numericValue: cardNetValue(card),
      })),
    },
    {
      key: "top_benefits",
      label: "Top recurring benefits",
      values: cards.map((card) => ({
        cardId: card.id,
        display: topBenefits(card, 2)
          .map((benefit) => `${benefit.name} (${formatCurrency(benefit.estimatedValue)})`)
          .join("\n"),
      })),
    },
  ];
}

function buildHighlightCategories(cards: CardRecord[]) {
  return [
    {
      title: "Best lounge access",
      description: "Evaluates lounge footprint and guest policy.",
      winners: cards
        .filter((card) => card.benefits.some((benefit) => benefit.category.includes("travel")))
        .map((card) => ({
          cardId: card.id,
          statement: `${card.shortName}: ${topBenefits(card, 1)
            .map((benefit) => benefit.name)
            .join(", ")}`,
        })),
    },
    {
      title: "Statement credit depth",
      description: "Highlights cards with the largest guaranteed credits.",
      winners: cards.map((card) => ({
        cardId: card.id,
        statement: `${card.shortName}: ${formatCurrency(cardTotalBenefitValue(card))} in recurring value`,
      })),
    },
  ];
}

function makeCallResult(
  widget: WidgetDefinition,
  structuredContent: unknown,
  text: string,
  metaOverrides?: Record<string, unknown>
): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
    structuredContent,
    _meta: widgetMeta(widget, metaOverrides),
  };
}

function errorResult(message: string): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: message,
      },
    ],
    isError: true,
  };
}

function createCreditCardsServer(): Server {
  const server = new Server(
    {
      name: "credit-cards",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListResourcesRequestSchema, async (_request: ListResourcesRequest) => ({
    resources,
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest) => {
    const widget = widgetCatalog.byUri.get(request.params.uri);
    if (!widget) {
      throw new Error(`Unknown resource: ${request.params.uri}`);
    }
    return {
      contents: [
        {
          uri: widget.templateUri,
          mimeType: "text/html+skybridge",
          text: widget.html,
          _meta: widgetMeta(widget),
        },
      ],
    };
  });

  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (_request: ListResourceTemplatesRequest) => ({
      resourceTemplates,
    })
  );

  server.setRequestHandler(ListToolsRequestSchema, async (_request: ListToolsRequest) => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    try {
      switch (request.params.name) {
        case "list_cards":
          return handleListCards(request.params.arguments);
        case "get_card_benefits":
          return handleGetCardBenefits(request.params.arguments);
        case "compare_cards":
          return handleCompareCards(request.params.arguments);
        case "search_benefits":
          return handleSearchBenefits(request.params.arguments);
        default:
          return errorResult(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error while processing the tool.";
      return errorResult(message);
    }
  });

  return server;
}

type SessionRecord = {
  server: Server;
  transport: SSEServerTransport;
};

const sessions = new Map<string, SessionRecord>();

const ssePath = "/mcp";
const postPath = "/mcp/messages";

async function handleSseRequest(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const server = createCreditCardsServer();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    sessions.delete(sessionId);
    await server.close();
  };

  transport.onerror = (error: unknown) => {
    console.error("SSE transport error", error);
  };

  try {
    await server.connect(transport);
  } catch (error) {
    sessions.delete(sessionId);
    console.error("Failed to start SSE session", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to establish SSE connection");
    }
  }
}

async function handlePostMessage(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    res.writeHead(400).end("Missing sessionId query parameter");
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    res.writeHead(404).end("Unknown session");
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error("Failed to process message", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to process message");
    }
  }
}

const portEnv = Number(process.env.PORT ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (
    req.method === "OPTIONS" &&
    (url.pathname === ssePath || url.pathname === postPath)
  ) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === ssePath) {
    await handleSseRequest(res);
    return;
  }

  if (req.method === "POST" && url.pathname === postPath) {
    await handlePostMessage(req, res, url);
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" }).end(
      JSON.stringify({ status: "ok", tools: tools.length, widgets: widgetCatalog.list.length })
    );
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.on("clientError", (err: Error, socket) => {
  console.error("HTTP client error", err);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

httpServer.listen(port, () => {
  console.log(`Credit card MCP server listening on http://localhost:${port}`);
  console.log(`  SSE stream: GET http://localhost:${port}${ssePath}`);
  console.log(`  Message post endpoint: POST http://localhost:${port}${postPath}?sessionId=...`);
});
