import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HomePage } from "@/pages/HomePage";
import { AnalyzeRecordingPage } from "@/pages/AnalyzeRecordingPage";
import { AnalyzeDocumentPage } from "@/pages/AnalyzeDocumentPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { EvidencePage } from "@/pages/EvidencePage";
import { TelegramPage } from "@/pages/TelegramPage";
import { DemoPage } from "@/pages/DemoPage";
import { ProofPage } from "@/pages/ProofPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze/recording" element={<AnalyzeRecordingPage />} />
          <Route path="/analyze/document" element={<AnalyzeDocumentPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/telegram" element={<TelegramPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/proof" element={<ProofPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
