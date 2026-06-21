export function SystemArchitectureDiagram() {
  return (
    <svg viewBox="0 0 800 420" className="h-auto w-full" role="img" aria-label="System architecture">
      <defs>
        <linearGradient id="archGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9478FC" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#9478FC" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="800" height="420" fill="#F2F0EA" rx="16" />
      <rect x="40" y="40" width="220" height="340" fill="url(#archGrad)" stroke="#9478FC" strokeWidth="1.5" rx="12" />
      <text x="60" y="70" fill="#1A1A1A" fontSize="14" fontWeight="600">User device</text>
      <rect x="60" y="90" width="180" height="44" fill="#fff" stroke="#1A1A1A" strokeOpacity="0.15" rx="8" />
      <text x="75" y="117" fill="#5C5C5C" fontSize="12">Judge Console :8787</text>
      <rect x="60" y="150" width="180" height="44" fill="#fff" stroke="#1A1A1A" strokeOpacity="0.15" rx="8" />
      <text x="75" y="177" fill="#5C5C5C" fontSize="12">GuardianMeshEngine</text>
      <rect x="290" y="40" width="240" height="340" fill="url(#archGrad)" stroke="#9478FC" strokeWidth="1.5" rx="12" />
      <text x="310" y="70" fill="#1A1A1A" fontSize="14" fontWeight="600">QVAC (@qvac/sdk)</text>
      {["Whisper STT", "OCR", "Embeddings", "Qwen3 LLM", "MedPsy", "TTS"].map((label, i) => (
        <g key={label}>
          <rect x="310" y={90 + i * 48} width="200" height="36" fill="#fff" stroke="#9478FC" strokeOpacity="0.3" rx="8" />
          <text x="325" y={112 + i * 48} fill="#5C5C5C" fontSize="11">{label}</text>
        </g>
      ))}
      <rect x="560" y="40" width="200" height="160" fill="url(#archGrad)" stroke="#9478FC" strokeWidth="1.5" rx="12" />
      <text x="580" y="70" fill="#1A1A1A" fontSize="14" fontWeight="600">Evidence</text>
      <rect x="580" y="90" width="160" height="36" fill="#fff" stroke="#1A1A1A" strokeOpacity="0.15" rx="8" />
      <text x="595" y="112" fill="#5C5C5C" fontSize="11">LocalArchivist</text>
      <rect x="580" y="140" width="160" height="36" fill="#fff" stroke="#1A1A1A" strokeOpacity="0.15" rx="8" />
      <text x="595" y="162" fill="#5C5C5C" fontSize="11">SHA-256 chain</text>
      <rect x="560" y="220" width="200" height="100" fill="url(#archGrad)" stroke="#9478FC" strokeWidth="1.5" rx="12" />
      <text x="580" y="250" fill="#1A1A1A" fontSize="14" fontWeight="600">Optional</text>
      <text x="580" y="280" fill="#5C5C5C" fontSize="11">Telegram Bot API</text>
      <path d="M240 170 L290 170" stroke="#9478FC" strokeWidth="2" markerEnd="url(#arrow)" />
      <path d="M530 200 L560 200" stroke="#9478FC" strokeWidth="2" />
    </svg>
  );
}

export function PipelineDiagram() {
  const steps = ["Audio/Image", "STT/OCR", "RAG", "Risk", "Evidence", "TTS", "Telegram"];
  return (
    <svg viewBox="0 0 900 120" className="h-auto w-full" role="img" aria-label="Detection pipeline">
      <rect width="900" height="120" fill="#F2F0EA" rx="12" />
      {steps.map((step, i) => (
        <g key={step}>
          <rect x={20 + i * 125} y="40" width="105" height="44" fill="#fff" stroke="#9478FC" strokeWidth="1.5" rx="10" />
          <text x={30 + i * 125} y="67" fill="#1A1A1A" fontSize="11">{step}</text>
          {i < steps.length - 1 ? (
            <path d={`M${125 + i * 125} 62 L${145 + i * 125} 62`} stroke="#9478FC" strokeWidth="2" />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export function EvidenceFlowDiagram() {
  return (
    <svg viewBox="0 0 700 200" className="h-auto w-full" role="img" aria-label="Evidence flow">
      <rect width="700" height="200" fill="#1A1A1A" rx="12" />
      {[
        { x: 40, label: "Incident" },
        { x: 200, label: "Bundle hash" },
        { x: 360, label: "Chain link" },
        { x: 520, label: "Verify VALID" },
      ].map((node, i) => (
        <g key={node.label}>
          <rect x={node.x} y="70" width="120" height="60" fill="rgba(148,120,252,0.15)" stroke="#9478FC" rx="10" />
          <text x={node.x + 20} y="105" fill="#F2F0EA" fontSize="12">{node.label}</text>
          {i < 3 ? <path d={`M${node.x + 120} 100 L${node.x + 160} 100`} stroke="#9478FC" strokeWidth="2" /> : null}
        </g>
      ))}
    </svg>
  );
}

export function TelegramFlowDiagram() {
  return (
    <svg viewBox="0 0 600 280" className="mx-auto h-auto max-w-lg w-full" role="img" aria-label="Telegram flow">
      <rect width="600" height="280" fill="#F2F0EA" rx="12" />
      {[
        { y: 30, label: "BLOCK verdict" },
        { y: 90, label: "Alert composed" },
        { y: 150, label: "Telegram send" },
        { y: 210, label: "Acknowledge" },
      ].map((step, i) => (
        <g key={step.label}>
          <circle cx="80" cy={step.y + 20} r="16" fill="#9478FC" />
          <text x="74" y={step.y + 25} fill="#fff" fontSize="12">{i + 1}</text>
          <rect x="120" y={step.y} width="200" height="40" fill="#fff" stroke="#1A1A1A" strokeOpacity="0.12" rx="8" />
          <text x="135" y={step.y + 25} fill="#1A1A1A" fontSize="12">{step.label}</text>
          {i < 3 ? <path d="M80 46 L80 90" stroke="#9478FC" strokeWidth="1.5" strokeDasharray="4" /> : null}
        </g>
      ))}
    </svg>
  );
}
