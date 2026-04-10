export const KLOAK_FAQ_ITEMS = [
  {
    question: "Is the payment link itself private?",
    answer:
      "The link can be shared publicly. What stays private by default is who paid, the wallet-held receipt, and the hidden payment facts that are only revealed later through selective disclosure.",
  },
  {
    question: "What does selective disclosure actually let me prove?",
    answer:
      "You can prove that a payment happened, reveal an exact amount, prove that it met a threshold, or prove that it happened within a time window. The proof owner chooses what to share.",
  },
  {
    question: "Who can generate a proof for a payment?",
    answer:
      "The person who holds the wallet receipt can generate the proof. That can be the payer side or the receiver side, depending on the receipt the wallet owns.",
  },
  {
    question: "Does Kloak store everything about the payment?",
    answer:
      "No. Kloak stores the minimum needed to run payment links, analytics, proof history, and product operations. Hidden proof facts are minimized, and sensitive stored payloads are encrypted at rest.",
  },
  {
    question: "How does proof verification work today?",
    answer:
      "Kloak checks the proof package first, then checks the public Aleo chain references, and then uses Kloak record status as an extra layer for things like revocation and history when available.",
  },
  {
    question: "What is the Telegram bot for?",
    answer:
      "The bot is for sharing existing payment links, getting paid alerts, and tracking link activity in Telegram. It is not the place where payment links are created.",
  },
  {
    question: "Can the same payment be used for more than one proof later?",
    answer:
      "Yes. Proofs are treated as reusable documents. A single payment can support multiple different valid proof statements over time, such as a basic proof first and a threshold or amount proof later.",
  },
  {
    question: "What happens if I try to generate the exact same proof twice?",
    answer:
      "Kloak blocks exact duplicate active proofs for the same statement. If that proof is revoked later, the same statement can be generated again.",
  },
  {
    question: "Can a verifier rely only on Kloak?",
    answer:
      "Today Kloak still plays a role, especially for record status and revocation, but the verifier flow now also checks the package itself and public Aleo references so trust is less concentrated in Kloak alone.",
  },
  {
    question: "What is the difference between a verify link and a proof package JSON?",
    answer:
      "A verify link is the easiest handoff for most reviewers. A proof package JSON is better when someone wants the actual portable proof payload or needs to inspect the shared statement more directly.",
  },
  {
    question: "Why do webhooks and automation matter if payments are private?",
    answer:
      "Private settlement does not remove the need for business workflows. Webhooks and automation let operators react to successful payments without exposing payer identity by default.",
  },
  {
    question: "Does Kloak ever promise that everything is hidden on-chain and off-chain?",
    answer:
      "No. Kloak should be described as private settlement with selective disclosure, not as total invisibility. Public request pages and some request metadata can still be visible by design.",
  },
] as const
