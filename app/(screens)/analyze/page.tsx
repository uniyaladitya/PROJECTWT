"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
  Progress,
} from "@/components/common";
import { Upload, File, FileText, X } from "lucide-react";
import { VoiceInput } from "@/components/upload/VoiceInput";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { apiClient } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useTranslations } from "@/lib/i18n";
import { aiDisclaimer } from "@/components/common/LegalPage";

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "analyzing" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const setCurrentDocument = useAppStore((state) => state.setCurrentDocument);
  const setCurrentAnalysis = useAppStore((state) => state.setCurrentAnalysis);
  const t = useTranslations();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) setFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    const validSize = file.size <= 10 * 1024 * 1024; // 10MB
    return validTypes.includes(file.type) && validSize;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      const uploadResponse = await apiClient.uploadDocument(file);
      if (!uploadResponse.data) throw new Error("The document upload did not return a document.");
      setCurrentDocument(uploadResponse.data);
      setUploadProgress(100);

      setUploadStatus("analyzing");
      const analysisResponse = await apiClient.analyzeDocument(uploadResponse.data.id);
      if (analysisResponse.data) setCurrentAnalysis(analysisResponse.data);

      setUploadStatus("success");

      // Redirect to analysis result after success
      setTimeout(() => router.push("/analysis"), 800);
    } catch (error) {
      setUploadStatus("error");
      console.error("Upload failed:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">{t("analyzeTitle")}</h1>
          <p className="text-muted-foreground">{t("analyzeDescription")}</p>
          <p className="border-primary/20 bg-primary/5 text-muted-foreground mt-4 rounded-lg border p-4 text-sm leading-6">
            {aiDisclaimer}
          </p>
        </div>

        <div className="mb-8 space-y-6">
          <VoiceInput onSubmit={(question) => console.info("Voice question:", question)} />
          <ChatInterface />
        </div>

        {uploadStatus === "success" ? (
          <Card className="py-12 text-center">
            <CardContent>
              <div className="mb-4">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-foreground mb-2 text-xl font-semibold">{t("uploadSuccess")}</h3>
              <p className="text-muted-foreground mb-6">{t("analyzingRedirect")}</p>
              <LoadingState />
            </CardContent>
          </Card>
        ) : uploadStatus === "error" ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-destructive/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-destructive h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">{t("uploadFailed")}</h3>
                <p className="text-muted-foreground mb-6">{t("uploadError")}</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setFile(null);
                    setUploadStatus("idle");
                    setUploadProgress(0);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : file && uploadStatus !== "idle" ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {uploadStatus === "uploading" ? t("uploading") : t("analyzingDocument")}
                  </p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-muted-foreground mt-2 text-right text-xs">{uploadProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {/* Upload Area */}
            <div className="md:col-span-2">
              <Card
                className={`border-2 border-dashed transition-all ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="mb-4">
                    <Upload className="text-primary mx-auto mb-4 h-12 w-12 opacity-50" />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">{t("dragDrop")}</h3>
                  <p className="text-muted-foreground mb-6">{t("or")}</p>

                  <label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        (e.target as HTMLElement).previousElementSibling?.dispatchEvent(
                          new MouseEvent("click"),
                        );
                      }}
                    >
                      {t("browseFiles")}
                    </Button>
                  </label>

                  <p className="text-muted-foreground mt-4 text-xs">{t("supportedFileTypes")}</p>
                </CardContent>
                <div
                  className="absolute inset-0 hidden"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              </Card>

              {file && uploadStatus === "idle" && (
                <div className="mt-8 space-y-4">
                  <div className="bg-muted/50 border-border flex items-center gap-4 rounded-lg border p-4">
                    {file.type.includes("pdf") ? (
                      <FileText className="text-primary h-8 w-8 flex-shrink-0" />
                    ) : (
                      <File className="text-primary h-8 w-8 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate font-medium">{file.name}</p>
                      <p className="text-muted-foreground text-sm">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFile(null)}
                      aria-label={t("removeFile")}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <Button variant="primary" size="lg" className="w-full" onClick={handleUpload}>
                    {t("uploadAnalyze")}
                  </Button>
                </div>
              )}
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("whatWeAnalyze")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Document type and purpose",
                    "Key decisions and requirements",
                    "Missing information",
                    "Important dates and deadlines",
                    "Recommended next steps",
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("supportedFormats")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-foreground space-y-2 text-sm">
                    <li>• PDF</li>
                    <li>• JPG/JPEG</li>
                    <li>• PNG</li>
                  </ul>
                  <p className="text-muted-foreground mt-4 text-xs">{t("maximumFileSize")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
