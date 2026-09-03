export const ACTIVITY_LABELS = {
  LOGIN: "Logged in", LOGOUT: "Signed out", SIGNUP: "Signed up",
  SESSION_CREATED: "Session created", SESSION_UPDATED: "Session updated",
  SESSION_CANCELLED: "Session cancelled", SESSION_DELETED: "Session deleted",
  SESSION_CANCELLATION_REQUESTED: "Cancellation requested",
  SESSION_CANCELLATION_ACCEPTED: "Cancellation accepted",
  SESSION_CANCELLATION_DECLINED: "Cancellation declined",
  PAYMENT_CONFIRMED: "Payment confirmed", PAYMENT_UPDATED: "Payment updated", PAYMENT_DELETED: "Payment deleted",
  INVOICE_GENERATED: "Invoice generated", PASSWORD_UPDATED: "Password updated",
  REVIEW_CREATED: "Review created", REVIEW_UPDATED: "Review updated", REVIEW_DELETED: "Review deleted",
  PROFILE_UPDATED: "Profile updated", USER_UPDATED: "User updated", USER_DELETED: "User deleted",
  TUTOR_CREATED: "Tutor account created", TUTOR_UPDATED: "Tutor updated", TUTOR_DELETED: "Tutor deleted",
  BOOKING_CREATED: "Booking requested", BOOKING_ACCEPTED: "Booking accepted", BOOKING_DECLINED: "Booking declined",
  BOOKING_UPDATED: "Booking updated", BOOKING_DELETED: "Booking deleted",
  ASSIGNMENT_CREATED: "Student assigned to tutor", ASSIGNMENT_UPDATED: "Assignment updated", ASSIGNMENT_DELETED: "Assignment removed",
  OAUTH_ACCOUNT_DELETED: "Linked sign-in account removed", VERIFICATION_TOKEN_DELETED: "Verification token removed",
  APPLICATION_SUBMITTED: "Tutor application submitted",
} as const;
export type ActivityAction = keyof typeof ACTIVITY_LABELS;
