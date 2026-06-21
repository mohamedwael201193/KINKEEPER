export const SCAM_TYPES = [
  {
    id: "irs",
    title: "IRS Scam",
    pattern: "Caller claims tax debt, Social Security suspension, or arrest unless you pay immediately.",
    danger: "Elders trust authority voices. Gift-card and wire demands bypass bank fraud checks.",
    detection: "Guardian Mesh matches IRS impersonation patterns, gift-card demands, and SSN suspension language against family RAG context.",
  },
  {
    id: "tech",
    title: "Tech Support Scam",
    pattern: "Fake security alerts demand remote access, software fees, or account verification.",
    danger: "Remote access grants full control of banking and personal files.",
    detection: "Local OCR and STT flag remote-access requests, urgency, and unfamiliar payment channels.",
  },
  {
    id: "grandparent",
    title: "Grandparent Scam",
    pattern: "Caller impersonates a grandchild in jail or hospital needing immediate cash.",
    danger: "Emotional pressure overrides verification — families wire money before checking.",
    detection: "Voice transcript analysis detects bail/wire urgency and cross-checks trusted contact notes in RAG.",
  },
  {
    id: "crypto",
    title: "Crypto Scam",
    pattern: "Guaranteed returns, celebrity endorsements, or recovery fees paid in cryptocurrency.",
    danger: "Crypto transfers are irreversible once sent.",
    detection: "Deterministic rules and Qwen3 classification flag crypto payment demands and recovery fraud language.",
  },
  {
    id: "invoice",
    title: "Fake Invoice",
    pattern: "Official-looking letters demand wire transfers, gift cards, or overdue utility payments.",
    danger: "Printed documents feel legitimate to elders who trust paper correspondence.",
    detection: "Latin OCR extracts payment instructions; RAG compares against known family-safe patterns.",
  },
  {
    id: "healthcare",
    title: "Healthcare Scam",
    pattern: "Medicare suspension notices, fake pharmacy bills, or COVID-related payment demands.",
    danger: "Health anxiety creates immediate compliance without caregiver review.",
    detection: "OCR + risk engine merge healthcare impersonation markers with Margaret's medication context.",
  },
] as const;

export const WORKFLOW_STEPS = [
  { step: 1, title: "Recording / Document Uploaded", desc: "Audio or image enters the local pipeline on your device." },
  { step: 2, title: "Local QVAC Analysis", desc: "Whisper STT or Latin OCR extracts content — nothing leaves the machine." },
  { step: 3, title: "Risk Classification", desc: "RAG + Qwen3 + MedPsy merge to ALLOW, WARN, or BLOCK." },
  { step: 4, title: "Evidence Generation", desc: "SHA-256 linked bundle written to LocalArchivist." },
  { step: 5, title: "Telegram Alert", desc: "Caregiver receives summary with acknowledge callback." },
  { step: 6, title: "Caregiver Response", desc: "Family intervenes with tamper-evident proof before money moves." },
] as const;
