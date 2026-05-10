import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AIBinding,
  VectorizeBinding,
  VectorizeMatch,
} from "../ai/client.js";
import { extractEmbedding, searchArchive } from "../search.js";

function fakeAi(embedding: number[]): AIBinding {
  return {
    run: vi.fn().mockResolvedValue({
      shape: [1, embedding.length],
      data: [embedding],
      pooling: "mean",
    }),
  };
}

function fakeVectorize(matches: VectorizeMatch[]): VectorizeBinding {
  return {
    query: vi.fn().mockResolvedValue({ matches }),
  };
}

const SAMPLE_MATCH: VectorizeMatch = {
  id: "writing:agent-sandboxes-infra",
  score: 0.87654321,
  metadata: {
    source: "writing",
    title: "How to design agent sandboxes infra",
    snippet: "What it actually takes to run untrusted agent code safely.",
    url: "https://danielsuchan.dev/writing/agent-sandboxes-infra",
    date: "2026-05-10",
  },
};

describe("extractEmbedding", () => {
  it("returns the first vector from a Workers AI batch response", () => {
    const raw = { shape: [1, 4], data: [[0.1, 0.2, 0.3, 0.4]] };
    expect(extractEmbedding(raw)).toEqual([0.1, 0.2, 0.3, 0.4]);
  });

  it("rejects non-object inputs", () => {
    expect(() => extractEmbedding(null)).toThrow();
    expect(() => extractEmbedding("oops")).toThrow();
    expect(() => extractEmbedding(42)).toThrow();
  });

  it("rejects when data is missing or empty", () => {
    expect(() => extractEmbedding({})).toThrow();
    expect(() => extractEmbedding({ data: [] })).toThrow();
    expect(() => extractEmbedding({ data: [[]] })).toThrow();
  });

  it("rejects when the embedding contains non-numbers", () => {
    expect(() =>
      extractEmbedding({ data: [["nope", 0.5, 0.5]] })
    ).toThrow();
  });
});

describe("searchArchive", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns a graceful error when Vectorize binding is missing", async () => {
    const result = await searchArchive(
      { AI: fakeAi([0.1]) },
      "anything",
      5,
      "all"
    );
    expect(result).toEqual({
      error: expect.stringContaining("not available"),
    });
  });

  it("returns a graceful error when AI binding is missing", async () => {
    const result = await searchArchive(
      { VECTORIZE: fakeVectorize([SAMPLE_MATCH]) },
      "anything",
      5,
      "all"
    );
    expect(result).toEqual({
      error: expect.stringContaining("not available"),
    });
  });

  it("queries Vectorize without filter when source is 'all'", async () => {
    const ai = fakeAi([0.1, 0.2]);
    const vec = fakeVectorize([SAMPLE_MATCH]);
    const result = await searchArchive(
      { AI: ai, VECTORIZE: vec },
      "agent sandboxes",
      5,
      "all"
    );
    expect(vec.query).toHaveBeenCalledWith([0.1, 0.2], {
      topK: 5,
      returnMetadata: "all",
      filter: undefined,
    });
    expect(result).toMatchObject({
      hits: [
        {
          id: "writing:agent-sandboxes-infra",
          source: "writing",
          score: 0.8765,
          title: "How to design agent sandboxes infra",
          url: "https://danielsuchan.dev/writing/agent-sandboxes-infra",
          date: "2026-05-10",
        },
      ],
    });
  });

  it("filters by source when one is specified", async () => {
    const vec = fakeVectorize([SAMPLE_MATCH]);
    await searchArchive(
      { AI: fakeAi([0.1]), VECTORIZE: vec },
      "test",
      3,
      "writing"
    );
    expect(vec.query).toHaveBeenCalledWith([0.1], {
      topK: 3,
      returnMetadata: "all",
      filter: { source: { $eq: "writing" } },
    });
  });

  it("returns a graceful error when embedding fails", async () => {
    const ai: AIBinding = {
      run: vi.fn().mockResolvedValue({ data: [] }),
    };
    const vec = fakeVectorize([]);
    const result = await searchArchive(
      { AI: ai, VECTORIZE: vec },
      "anything",
      5,
      "all"
    );
    expect(result).toEqual({
      error: expect.stringContaining("Could not embed"),
    });
    expect(vec.query).not.toHaveBeenCalled();
  });

  it("returns a graceful error when Vectorize query throws", async () => {
    const ai = fakeAi([0.1]);
    const vec: VectorizeBinding = {
      query: vi.fn().mockRejectedValue(new Error("boom")),
    };
    const result = await searchArchive(
      { AI: ai, VECTORIZE: vec },
      "anything",
      5,
      "all"
    );
    expect(result).toEqual({
      error: expect.stringContaining("unexpected response shape"),
    });
  });

  it("falls back to safe defaults when metadata fields are missing", async () => {
    const result = await searchArchive(
      {
        AI: fakeAi([0.1]),
        VECTORIZE: fakeVectorize([
          { id: "abc", score: 0.5, metadata: {} },
        ]),
      },
      "test",
      5,
      "all"
    );
    expect(result).toEqual({
      hits: [
        {
          id: "abc",
          score: 0.5,
          source: "unknown",
          title: "",
          snippet: "",
          url: null,
          date: null,
        },
      ],
    });
  });
});
