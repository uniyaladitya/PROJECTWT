"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Button,
  Card,
  CardContent,
  StatusBadge,
  EmptyState,
  ErrorState,
  LoadingState,
  Input,
} from "@/components/common";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useTranslations } from "@/lib/i18n";

export default function CasesPage() {
  const router = useRouter();
  const t = useTranslations();
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "action_required" | "pending" | "completed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const storedCases = useAppStore((state) => state.cases);
  const setCases = useAppStore((state) => state.setCases);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient
      .getCases()
      .then((response) => {
        if (active && response.data) setCases(response.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, [setCases]);

  const cases = storedCases;
  const filteredCases = cases.filter((c) => {
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">{t("myCases")}</h1>
          <p className="text-muted-foreground">{t("casesDescription")}</p>
        </div>

        {/* Filters and Search */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder={t("searchCases")}
              aria-label={t("searchCases")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10"
            />
          </div>

          {/* Filter */}
          <ToggleGroup
            value={[filterStatus]}
            onValueChange={(value) => value[0] && setFilterStatus(value[0] as typeof filterStatus)}
            variant="outline"
            size="sm"
            className="flex gap-2 overflow-x-auto pb-2"
            aria-label={t("status")}
          >
            {[
              { value: "all", label: t("all") },
              { value: "active", label: t("active") },
              { value: "action_required", label: t("actionRequired") },
              { value: "pending", label: t("pending") },
              { value: "completed", label: t("completed") },
            ].map((filter) => (
              <ToggleGroupItem
                key={filter.value}
                value={filter.value}
                className="whitespace-nowrap"
              >
                {filter.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Cases Grid */}
        {loading ? (
          <LoadingState message={t("loadingCases")} />
        ) : error ? (
          <ErrorState
            title={t("casesUnavailable")}
            message={t("casesLoadError")}
            onRetry={() => window.location.reload()}
          />
        ) : filteredCases.length > 0 ? (
          <div className="grid gap-6">
            {filteredCases.map((caseItem) => (
              <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                <Card hoverable>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-foreground mb-2 text-xl font-semibold">
                              {caseItem.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {t("updated")} {caseItem.lastUpdated}
                            </p>
                          </div>
                          <StatusBadge status={caseItem.status || "active"} size="sm" />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-muted-foreground text-xs">{t("progress")}</span>
                              <span className="text-foreground text-xs font-medium">
                                {caseItem.progress ?? 65}%
                              </span>
                            </div>
                            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                              <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${caseItem.progress ?? 65}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <span className="text-muted-foreground text-xs">
                              {t("deadline")}: {caseItem.deadline || "30 days"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between md:items-end">
                        <div className="mb-4">
                          <p className="text-muted-foreground mb-2 text-xs">{t("nextAction")}</p>
                          <p className="text-foreground font-semibold">
                            {caseItem.nextAction || "Review guidance steps"}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          {t("openCase")} →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("noCasesFound")}
            message={t("adjustFilters")}
            action={{
              label: t("createNewCase"),
              onClick: () => router.push("/analyze"),
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
