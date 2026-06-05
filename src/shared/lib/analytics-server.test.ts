import { describe, it, expect, vi, beforeEach } from "vitest";

interface CountResult {
  count: number | null;
  error: { message: string } | null;
}

const mockGte = vi.hoisted(() =>
  vi.fn(async (): Promise<CountResult> => ({ count: 0, error: null })),
);
const mockEq2 = vi.hoisted(() => vi.fn(() => ({ gte: mockGte })));
const mockEq1 = vi.hoisted(() => vi.fn(() => ({ eq: mockEq2 })));
const mockSelect = vi.hoisted(() => vi.fn(() => ({ eq: mockEq1 })));
const mockFrom = vi.hoisted(() => vi.fn(() => ({ select: mockSelect })));
const mockCreateClient = vi.hoisted(() =>
  vi.fn(async () => ({ from: mockFrom })),
);

vi.mock("@/shared/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGte.mockResolvedValue({ count: 0, error: null });
});

import {
  hashIp,
  isSearchBot,
  isRateLimited,
  extractClientIp,
} from "@/shared/lib/analytics-server";

describe("hashIp", () => {
  it("should produce same hash for same (ip, secret)", () => {
    expect(hashIp("1.2.3.4", "sec")).toBe(hashIp("1.2.3.4", "sec"));
  });

  it("should produce different hash for different secret", () => {
    expect(hashIp("1.2.3.4", "a")).not.toBe(hashIp("1.2.3.4", "b"));
  });

  it("should produce sha256 hex (64 chars)", () => {
    expect(hashIp("1.2.3.4", "sec")).toHaveLength(64);
  });
});

describe("isSearchBot", () => {
  it("should return false for null UA", () => {
    expect(isSearchBot(null)).toBe(false);
  });

  it("should return false for empty UA", () => {
    expect(isSearchBot("")).toBe(false);
  });

  it("should detect Googlebot", () => {
    expect(
      isSearchBot(
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      ),
    ).toBe(true);
  });

  it("should detect bingbot", () => {
    expect(isSearchBot("Mozilla/5.0 (compatible; bingbot/2.0; ...)")).toBe(
      true,
    );
  });

  it("should detect Yeti (Naver)", () => {
    expect(isSearchBot("Mozilla/5.0 (compatible; Yeti/1.1; ...)")).toBe(true);
  });

  it("should not detect normal Chrome", () => {
    expect(
      isSearchBot(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0",
      ),
    ).toBe(false);
  });
});

describe("isRateLimited", () => {
  it("should return false when count below limit", async () => {
    mockGte.mockResolvedValue({ count: 3, error: null });
    expect(await isRateLimited("h", "cta_click")).toBe(false);
  });

  it("should return true when count meets limit", async () => {
    mockGte.mockResolvedValue({ count: 5, error: null });
    expect(await isRateLimited("h", "cta_click")).toBe(true);
  });

  it("should return true when count exceeds limit", async () => {
    mockGte.mockResolvedValue({ count: 10, error: null });
    expect(await isRateLimited("h", "cta_click")).toBe(true);
  });

  it("should return false (allow) on Supabase error (fail-open)", async () => {
    mockGte.mockResolvedValue({ count: null, error: { message: "x" } });
    expect(await isRateLimited("h", "cta_click")).toBe(false);
  });

  it("should treat null count as 0", async () => {
    mockGte.mockResolvedValue({ count: null, error: null });
    expect(await isRateLimited("h", "cta_click")).toBe(false);
  });
});

describe("extractClientIp", () => {
  it("should return first IP from x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(extractClientIp(h)).toBe("1.2.3.4");
  });

  it("should fall back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(extractClientIp(h)).toBe("9.9.9.9");
  });

  it("should return 0.0.0.0 when no headers", () => {
    const h = new Headers();
    expect(extractClientIp(h)).toBe("0.0.0.0");
  });
});
