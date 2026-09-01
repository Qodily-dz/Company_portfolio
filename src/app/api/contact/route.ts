import { NextResponse } from "next/server";
import {
  BUDGET_OPTIONS,
  BUILD_OPTIONS,
  NEED_OPTIONS,
  OBJECTIVE_MAX_LENGTH,
  OBJECTIVE_MIN_LENGTH,
  TIMELINE_OPTIONS,
} from "@/lib/contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_NAME = 120;
const MAX_COMPANY = 120;
const MAX_COUNTRY = 80;
const MAX_PHONE = 40;
const MAX_MESSAGE = 2000;

type Payload = Record<string, unknown>;

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function isStr(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot: a hidden field real users never fill. Bots that do are dropped.
  const website = body.website;
  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: false, error: "spam" }, { status: 400 });
  }

  const faults: string[] = [];
  if (!isOneOf(body.build, BUILD_OPTIONS)) faults.push("build");
  if (
    !isStr(body.objective, OBJECTIVE_MAX_LENGTH) ||
    body.objective.trim().length < OBJECTIVE_MIN_LENGTH
  ) {
    faults.push("objective");
  }
  if (
    !Array.isArray(body.needs) ||
    body.needs.length === 0 ||
    !body.needs.every((n) => isOneOf(n, NEED_OPTIONS))
  ) {
    faults.push("needs");
  }
  if (!isOneOf(body.budget, BUDGET_OPTIONS)) faults.push("budget");
  if (!isOneOf(body.timeline, TIMELINE_OPTIONS)) faults.push("timeline");

  const contact = body.contact as Record<string, unknown> | undefined;
  if (!contact || !isStr(contact.name, MAX_NAME) || !contact.name.trim()) {
    faults.push("name");
  }
  if (
    !contact ||
    !isStr(contact.email, 254) ||
    !EMAIL_RE.test(contact.email.trim())
  ) {
    faults.push("email");
  }
  if (contact) {
    if (contact.company !== undefined && !isStr(contact.company, MAX_COMPANY))
      faults.push("company");
    if (contact.phone !== undefined && !isStr(contact.phone, MAX_PHONE))
      faults.push("phone");
    if (contact.country !== undefined && !isStr(contact.country, MAX_COUNTRY))
      faults.push("country");
    if (contact.message !== undefined && !isStr(contact.message, MAX_MESSAGE))
      faults.push("message");
  }

  if (faults.length > 0) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: faults },
      { status: 422 }
    );
  }

  // The request is valid. Delivery (email/CRM) is intentionally pluggable:
  // no credentials live in this repository, so this endpoint validates the
  // request end-to-end and returns success — wire delivery via env vars.
  return NextResponse.json({ ok: true });
}