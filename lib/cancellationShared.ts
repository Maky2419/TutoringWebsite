export const MAX_CANCELLATION_REASON = 2000;

export type CancellationInfo = {
  cancellationStatus?: string | null;
  cancellationReason?: string | null;
  cancellationRequestedAt?: string | Date | null;
  cancellationReviewedAt?: string | Date | null;
  cancellationVersion?: number;
};

