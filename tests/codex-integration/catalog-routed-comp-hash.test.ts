import { describe, expect, test } from "bun:test";
import { buildCatalogEntries } from "../../src/codex/catalog";

/**
 * A routed row is cloned from whichever native row a rebuild picks as the template, and it
 * used to keep that row's `comp_hash` (#5796). Codex compacts a thread when consecutive turns
 * record different values, so a rebuild that picked another template compacted every active
 * routed thread.
 */
describe("catalog — routed comp_hash", () => {
  const routedHash = (compHash: string | undefined) => buildCatalogEntries(
    {
      slug: "gpt-5.5",
      display_name: "gpt-5.5",
      description: "Native GPT model",
      priority: 1,
      visibility: "list",
      base_instructions: "You are Codex, a coding agent based on GPT-5.",
      ...(compHash === undefined ? {} : { comp_hash: compHash }),
    },
    [],
    [{ provider: "local", id: "qwen3-coder" }],
  ).find(e => e.slug === "local/qwen3-coder")?.comp_hash;

  test("routed rows keep one value whichever native row is the template", () => {
    expect(routedHash("3000")).toBe("opencodex");
    expect(routedHash("2911")).toBe("opencodex");
    expect(routedHash(undefined)).toBe("opencodex");
  });
});
