import { describe, expect, it } from "vitest";
import { calculateRate, reviewCompletionRate, submissionRate } from "../src/lib/metrics";

describe("calculateRate", () => {
  it("returns a null value for a zero denominator", () => {
    expect(calculateRate(0, 0)).toEqual({ numerator: 0, denominator: 0, value: null });
  });
  it("rejects a numerator larger than its denominator", () => {
    expect(() => calculateRate(3, 2)).toThrow(RangeError);
  });
  it("rejects negative values", () => {
    expect(() => calculateRate(-1, 2)).toThrow(RangeError);
  });
});

describe("submissionRate", () => {
  it("excludes ineligible learners and counts eligible learners with at least one submission", () => {
    const rows = [
      { eligible: true, hasSubmission: true, hasCompletedReview: false },
      { eligible: true, hasSubmission: false, hasCompletedReview: false },
      { eligible: false, hasSubmission: true, hasCompletedReview: true },
    ];
    expect(submissionRate(rows)).toEqual({ numerator: 1, denominator: 2, value: 0.5 });
  });
});

describe("reviewCompletionRate", () => {
  it("uses submitted eligible work as the denominator", () => {
    const rows = [
      { eligible: true, hasSubmission: true, hasCompletedReview: true },
      { eligible: true, hasSubmission: true, hasCompletedReview: false },
      { eligible: true, hasSubmission: false, hasCompletedReview: false },
      { eligible: false, hasSubmission: true, hasCompletedReview: true },
    ];
    expect(reviewCompletionRate(rows)).toEqual({ numerator: 1, denominator: 2, value: 0.5 });
  });
  it("returns N/A semantics when no eligible work has been submitted", () => {
    expect(reviewCompletionRate([{ eligible: true, hasSubmission: false, hasCompletedReview: false }]).value).toBeNull();
  });
});
