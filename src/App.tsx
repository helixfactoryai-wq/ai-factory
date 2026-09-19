import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ProjectsPage } from "@/features/projects/ProjectsPage";
import { ProjectDetailPage } from "@/features/projects/ProjectDetailPage";
import { PromptBuilderPage } from "@/features/prompt-builder/PromptBuilderPage";
import { TemplatesPage } from "@/features/templates/TemplatesPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthGuard><AppShell /></AuthGuard>}>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="projects/:id/prompts" element={<PromptBuilderPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="prompt-builder" element={<Navigate to="/templates" replace />} />
              <Route path="audits" element={<PlaceholderPage title="Audits" description="Automated evaluation pipelines for accuracy, safety, and cost." phase="Phase 3" />} />
              <Route path="deploy" element={<PlaceholderPage title="Deploy" description="One-click deploy to Vercel, Railway, Cloud Run, or Docker." phase="Phase 3" />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
