"use client";

import { use, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  Progress,
  StatusBadge,
} from "@/components/common";
import { ArrowLeft, Calendar, CheckCircle2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { CivicCase } from "@/types";
import { useTranslations } from "@/lib/i18n";

export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CivicCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient
      .getCase(id)
      .then((response) => {
        setCaseData(response.data ?? null);
        setError(!response.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const docs = caseData?.documents || [];
  const timeline = caseData?.timeline || [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> {t("backToCases")}
        </Button>
        {loading ? (
          <LoadingState message={t("loadingCaseDetails")} />
        ) : error || !caseData ? (
          <ErrorState
            title={t("caseUnavailable")}
            message={t("casesLoadError")}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-sm">{t("caseDetails")}</p>
                <h1 className="text-foreground text-3xl font-bold">{caseData.title}</h1>
                <p className="text-muted-foreground mt-2">{caseData.description}</p>
              </div>
              <StatusBadge status={caseData.status || "active"} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("progress")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground text-3xl font-bold">{caseData.progress ?? 65}%</p>
                  <Progress value={caseData.progress ?? 65} className="mt-3" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("nextAction")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground font-medium">
                    {caseData.nextAction || "Review guidance steps"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("deadline")}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4" />
                  <p className="text-foreground">{caseData.deadline ?? t("noDeadline")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("relatedDocuments")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {docs.length === 0 ? (
                    <p className="text-muted-foreground">{t("noDocumentsAttached")}</p>
                  ) : (
                    docs.map((document) => (
                      <div
                        key={document.id}
                        className="border-border flex items-center gap-3 rounded-lg border p-3"
                      >
                        <FileText className="text-primary h-5 w-5" />
                        <span className="text-foreground">
                          {document.fileName || document.documentName}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("timeline")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {timeline.length === 0 ? (
                    <p className="text-muted-foreground">{t("noTimelineEvents")}</p>
                  ) : (
                    timeline.map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <CheckCircle2
                          className={`h-5 w-5 flex-shrink-0 ${event.status === "completed" ? "text-green-600" : "text-muted-foreground"}`}
                        />
                        <div>
                          <p className="text-foreground font-medium">{event.title}</p>
                          <p className="text-muted-foreground text-sm">{event.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
