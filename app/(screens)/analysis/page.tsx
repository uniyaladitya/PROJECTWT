"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  StatusBadge,
  EmptyState,
} from "@/components/common";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Download,
  Share2,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTranslations } from "@/lib/i18n";
import { aiDisclaimer } from "@/components/common/LegalPage";

export default function AnalysisResultPage() {
  const router = useRouter();
  const currentAnalysis = useAppStore((state) => state.currentAnalysis);
  const currentDocument = useAppStore((state) => state.currentDocument);
  const t = useTranslations();
  const analysis = currentAnalysis
    ? {
        ...currentAnalysis,
        missingEvidence: currentAnalysis.missingEvidence ?? [],
        evidenceChecklist:
          currentAnalysis.requiredEvidence?.map((evidence) => ({
            name: evidence.name,
            status: evidence.status,
          })) ?? [],
      }
    : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "missing":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <EmptyState
            title={t("noAnalysis")}
            message={t("analyzeDescription")}
            action={{ label: t("uploadDocument"), onClick: () => router.push("/analyze") }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">{t("analysisResult")}</h1>
            <p className="text-muted-foreground">
              {currentDocument?.fileName ?? t("defaultDocumentName")}
            </p>
            <p className="border-primary/20 bg-primary/5 text-muted-foreground mt-4 max-w-3xl rounded-lg border p-4 text-sm leading-6">
              {aiDisclaimer}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="md">
              <Download className="h-4 w-4" />
              {t("download")}
            </Button>
            <Button variant="outline" size="md">
              <Share2 className="h-4 w-4" />
              {t("share")}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Decision Card */}
            <Card className="border-primary/20 bg-primary/5 border-2">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm">{t("decision")}</p>
                    <h2 className="text-primary mb-4 text-3xl font-bold">{analysis.decision}</h2>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs">{t("confidenceLevel")}</p>
                        <p className="text-foreground text-2xl font-bold">{analysis.confidence}%</p>
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${analysis.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-primary/20 border-t pt-6">
                    <h3 className="text-foreground mb-3 font-semibold">{t("whatThisMeans")}</h3>
                    <p className="text-foreground leading-relaxed">{analysis.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Action */}
            <Card className="border-l-4 border-l-amber-600">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-600" />
                  <div className="flex-1">
                    <h3 className="text-foreground mb-2 font-semibold">{t("nextAction")}</h3>
                    <p className="text-foreground mb-4">{analysis.recommendedAction}</p>
                    <ul className="space-y-2">
                      {analysis.missingEvidence.map((item, idx) => (
                        <li key={idx} className="text-foreground flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-600"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>{t("evidenceChecklist")}</CardTitle>
                <CardDescription>{t("requiredDocuments")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.evidenceChecklist.map((evidence, idx) => (
                    <div
                      key={idx}
                      className="border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-muted-foreground h-5 w-5" />
                        <span className="text-foreground font-medium">{evidence.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(evidence.status)}
                        <Badge
                          variant={
                            evidence.status === "verified"
                              ? "success"
                              : evidence.status === "missing"
                                ? "warning"
                                : "info"
                          }
                          size="sm"
                        >
                          {evidence.status.charAt(0).toUpperCase() + evidence.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>{t("timeline")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("timelineAssociated")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">{t("statusLabel")}</p>
                  <StatusBadge status="completed" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">{t("missingDocuments")}</p>
                  <p className="text-foreground text-2xl font-bold">
                    {analysis.missingEvidence.length}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">{t("requiredToProceed")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">{t("deadline")}</p>
                  <p className="text-foreground font-medium">15 Sep 2024</p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("recommendations")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div className="text-sm">
                    <p className="text-foreground font-medium">{t("gatherDocuments")}</p>
                    <p className="text-muted-foreground text-xs">{t("collectMissingEvidence")}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div className="text-sm">
                    <p className="text-foreground font-medium">{t("submitApplication")}</p>
                    <p className="text-muted-foreground text-xs">{t("beforeDeadline")}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div className="text-sm">
                    <p className="text-foreground font-medium">{t("trackProgress")}</p>
                    <p className="text-muted-foreground text-xs">{t("monitorStatus")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="space-y-3 pt-6">
                <Button variant="primary" size="lg" className="w-full">
                  {t("uploadDocuments")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  {t("createCase")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
