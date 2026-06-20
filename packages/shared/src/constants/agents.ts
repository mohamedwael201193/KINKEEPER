export const AGENT_NAMES = [
  "sentinel",
  "cognoscente",
  "chronicler",
  "coordinator",
  "archivist",
] as const;

export type AgentName = (typeof AGENT_NAMES)[number];

export const CORE_AGENTS = ["sentinel", "cognoscente", "archivist"] as const;

export type CoreAgentName = (typeof CORE_AGENTS)[number];
