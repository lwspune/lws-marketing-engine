import { describe, expect, it, vi } from "vitest";
import { askClaudeForLeads } from "@/lib/leads/claude";

// The WhatsApp screening call: one request for a batch of redacted chats, JSON back through structured outputs.

const chats = [{ id: "c1", transcript: "Them: NDA batch fees?" }];
const reply = (body: object, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status }));

describe("askClaudeForLeads", () => {
  it("sends the chats with the key, the model, structured output and refusal fallbacks, and returns the parsed JSON", async () => {
    const fetchFn = reply({ stop_reason: "end_turn", content: [{ type: "text", text: "{\"chats\":[]}" }] });
    expect(await askClaudeForLeads("sk-test", chats, fetchFn)).toEqual({ chats: [] });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    const headers = init.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("sk-test");
    expect(headers["anthropic-beta"]).toBe("server-side-fallback-2026-07-01");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ model: "claude-opus-5-5", fallbacks: "default", output_config: { format: { type: "json_schema" } } });
    expect(body.messages[0].content).toContain("<chat id=\"c1\">\nThem: NDA batch fees?\n</chat>");
  });

  it("fails clearly on an API error, a refusal, or a cut-off answer", async () => {
    await expect(askClaudeForLeads("k", chats, reply({ error: { message: "invalid x-api-key" } }, 401))).rejects.toThrow("Claude API 401: invalid x-api-key");
    await expect(askClaudeForLeads("k", chats, reply({ stop_reason: "refusal", content: [] }))).rejects.toThrow(/declined/);
    await expect(askClaudeForLeads("k", chats, reply({ stop_reason: "max_tokens", content: [] }))).rejects.toThrow(/cut off/);
  });
});
