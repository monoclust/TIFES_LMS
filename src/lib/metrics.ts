export type Rate = { numerator: number; denominator: number; value: number | null };

/** Returns null when a rate has no eligible denominator; callers must display N/A, not 0%. */
export function calculateRate(numerator: number, denominator: number): Rate {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || numerator < 0 || denominator < 0) {
    throw new RangeError("Rate inputs must be finite, non-negative numbers.");
  }
  if (numerator > denominator) {
    throw new RangeError("Rate numerator cannot exceed its denominator.");
  }
  return { numerator, denominator, value: denominator === 0 ? null : numerator / denominator };
}

export type AssignmentEligibility = {
  eligible: boolean;
  hasSubmission: boolean;
  hasCompletedReview: boolean;
};

/** Submission rate uses eligible assigned learners as its denominator. */
export function submissionRate(rows: AssignmentEligibility[]): Rate {
  const eligible = rows.filter((row) => row.eligible);
  const submitted = eligible.filter((row) => row.hasSubmission).length;
  return calculateRate(submitted, eligible.length);
}

/** Review completion uses submitted, eligible work as its denominator. */
export function reviewCompletionRate(rows: AssignmentEligibility[]): Rate {
  const submitted = rows.filter((row) => row.eligible && row.hasSubmission);
  const reviewed = submitted.filter((row) => row.hasCompletedReview).length;
  return calculateRate(reviewed, submitted.length);
}
