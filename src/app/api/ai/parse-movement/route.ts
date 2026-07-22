import { NextResponse } from "next/server";
import { sanitizeProposal } from "@/lib/ai-movement";

type CatalogItem = { id: string; name: string; kind?: string; categoryId?: string };

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured", message: "La funció intel·ligent encara no està configurada." }, { status: 503 });

  const body = await request.json().catch(() => null) as null | {
    text?: string;
    today?: string;
    accounts?: CatalogItem[];
    categories?: CatalogItem[];
    subcategories?: CatalogItem[];
  };
  const text = body?.text?.trim() ?? "";
  if (text.length < 3 || text.length > 500) return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  const accounts = (body?.accounts ?? []).slice(0, 80);
  const categories = (body?.categories ?? []).slice(0, 120);
  const subcategories = (body?.subcategories ?? []).slice(0, 240);

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      type: { enum: ["expense", "income", "transfer", "saving", null] },
      amount: { type: ["number", "null"] },
      date: { type: ["string", "null"] },
      accountId: { type: ["string", "null"] },
      destinationAccountId: { type: ["string", "null"] },
      categoryId: { type: ["string", "null"] },
      subcategoryId: { type: ["string", "null"] },
      merchant: { type: ["string", "null"] },
      notes: { type: ["string", "null"] },
      confidence: { type: "number" },
      missingFields: { type: "array", items: { type: "string" } },
      explanation: { type: "string" },
    },
    required: ["type", "amount", "date", "accountId", "destinationAccountId", "categoryId", "subcategoryId", "merchant", "notes", "confidence", "missingFields", "explanation"],
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: "Interpreta una frase curta en català sobre finances personals. No inventis ids. Tria només ids dels catàlegs enviats. Si falta una dada crítica, retorna null i afegeix missingFields. Dates relatives: avui=today, ahir=today-1, abans-d'ahir=today-2." },
        { role: "user", content: JSON.stringify({ text, today: body?.today, accounts, categories, subcategories }) },
      ],
      text: { format: { type: "json_schema", name: "movement", strict: true, schema } },
    }),
  });

  if (!response.ok) return NextResponse.json({ error: "ai_error" }, { status: 502 });
  const result = await response.json() as { output_text?: string };
  const parsed = JSON.parse(result.output_text ?? "{}") as unknown;
  const proposal = sanitizeProposal(parsed, { accounts: accounts.map((item) => ({ id: item.id, name: item.name, type: "personal", initialBalance: 0, ownerIds: [], attributablePercentage: 100, color: "blue", icon: "wallet", archived: false })), categories: categories.map((item) => ({ id: item.id, name: item.name, icon: "tag", color: "blue", kind: item.kind as "expense" | "income" | "both" | undefined, archived: false })), subcategories: subcategories.map((item) => ({ id: item.id, name: item.name, categoryId: item.categoryId ?? "", archived: false })) });
  return NextResponse.json({ proposal });
}
