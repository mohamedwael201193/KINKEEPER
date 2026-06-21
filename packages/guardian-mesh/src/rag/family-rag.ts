import type { QvacService } from "@kinkeeper/qvac";
import { GUARDIAN_RAG_SEED_DOCUMENTS } from "./seed-documents.js";

export class FamilyRagService {
  private seeded = false;

  constructor(
    private readonly qvac: QvacService,
    private readonly workspace: string,
  ) {}

  async ensureSeeded(): Promise<number> {
    if (this.seeded) {
      return GUARDIAN_RAG_SEED_DOCUMENTS.length;
    }
    const result = await this.qvac.runRagIngest({
      workspace: this.workspace,
      documents: GUARDIAN_RAG_SEED_DOCUMENTS,
    });
    this.seeded = true;
    return result.processed;
  }

  async searchContext(query: string, topK = 5) {
    await this.ensureSeeded();
    const result = await this.qvac.runRagSearch({
      workspace: this.workspace,
      query,
      topK,
    });
    return result.hits;
  }
}
