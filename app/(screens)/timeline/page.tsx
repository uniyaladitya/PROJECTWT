"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common";
import { Calendar, Check, AlertCircle } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export default function TimelinePage() {
  const t = useTranslations();
  const mockTimelines = [
    {
      id: "1",
      title: t("consumerComplaint"),
      events: [
        { title: t("documentUploaded"), date: "18 Aug 2024", status: "completed", type: "upload" },
        {
          title: t("analysisCompleted"),
          date: "18 Aug 2024",
          status: "completed",
          type: "analysis",
        },
        { title: t("evidenceRequired"), date: "19 Aug 2024", status: "completed", type: "alert" },
        {
          title: t("applicationDeadline"),
          date: "15 Sep 2024",
          status: "pending",
          type: "deadline",
        },
        { title: t("decisionPending"), date: "TBD", status: "pending", type: "decision" },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">{t("timeline")}</h1>
          <p className="text-muted-foreground">{t("timelineDescription")}</p>
        </div>

        {/* Timelines */}
        <div className="space-y-8">
          {mockTimelines.map((timeline) => (
            <Card key={timeline.id}>
              <CardHeader>
                <CardTitle>{timeline.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {timeline.events.map((event, idx) => (
                    <div
                      key={idx}
                      className={`relative flex gap-4 pb-6 ${
                        idx !== timeline.events.length - 1 ? "border-border border-b" : ""
                      }`}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${event.status === "completed" ? "border-accent bg-accent/10" : "border-border bg-background"}`}
                      >
                        {event.status === "completed" ? (
                          <Check className="text-accent-foreground h-5 w-5" />
                        ) : event.type === "alert" ? (
                          <AlertCircle className="text-secondary-foreground h-5 w-5" />
                        ) : (
                          <Calendar className="text-muted-foreground h-5 w-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{event.title}</p>
                        <p className="text-muted-foreground text-sm">{event.date}</p>
                      </div>

                      {/* Timeline line */}
                      {idx !== timeline.events.length - 1 && (
                        <div
                          className={`absolute top-10 bottom-0 left-5 -z-0 w-0.5 ${event.status === "completed" ? "bg-accent" : "bg-border"}`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
