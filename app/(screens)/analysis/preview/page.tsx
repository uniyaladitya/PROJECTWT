"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useTranslations } from "@/lib/i18n";

export default function AnalysisPreviewPage() {
  const t = useTranslations();
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-foreground text-3xl font-bold">{t("analysisResult")}</h1>
        <p className="text-muted-foreground mt-4">{t("analyzingRedirect")}</p>
      </div>
    </DashboardLayout>
  );
}
