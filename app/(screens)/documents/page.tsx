"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  LoadingState,
  Input,
} from "@/components/common";
import { FileText, Download, Trash2, Search } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { Document } from "@/types";
import { useTranslations } from "@/lib/i18n";

type DocumentPreview = Pick<Document, "id" | "fileName" | "fileUrl" | "uploadedAt" | "status"> & {
  type?: string;
};

export default function DocumentsPage() {
  const router = useRouter();
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<DocumentPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient
      .getDocuments()
      .then((response) => {
        if (response.data) setDocuments(response.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const visibleDocuments = documents.filter((document) =>
    (
      document.fileName ||
      (document as DocumentPreview & { documentName?: string }).documentName ||
      ""
    )
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">{t("documents")}</h1>
          <p className="text-muted-foreground">{t("documentsDescription")}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
          <Input
            type="text"
            placeholder={t("searchDocuments")}
            aria-label={t("searchDocuments")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10"
          />
        </div>

        {/* Documents List */}
        {loading ? (
          <LoadingState message={t("loadingDocuments")} />
        ) : error ? (
          <ErrorState
            title={t("documentsUnavailable")}
            message={t("documentsLoadError")}
            onRetry={() => window.location.reload()}
          />
        ) : visibleDocuments.length > 0 ? (
          <div className="space-y-4">
            {visibleDocuments.map((doc) => (
              <Card key={doc.id} hoverable>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="text-primary h-8 w-8 flex-shrink-0" />
                      <div>
                        <h3 className="text-foreground font-semibold">{doc.fileName}</h3>
                        <p className="text-muted-foreground text-xs">
                          {doc.type ?? t("document")} • {t("uploaded")} {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          doc.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.fileUrl, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await apiClient.deleteDocument(doc.id);
                          setDocuments((current) => current.filter((item) => item.id !== doc.id));
                        }}
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("noDocuments")}
            message={t("startUploading")}
            action={{
              label: t("uploadDocument"),
              onClick: () => router.push("/analyze"),
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
