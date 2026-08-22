"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
} from "@/components/common";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MessageSquare } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export default function HelpPage() {
  const t = useTranslations();

  const faqs = [
    {
      question: t("faqUploadQuestion"),
      answer: t("faqUploadAnswer"),
    },
    {
      question: t("faqFormatsQuestion"),
      answer: t("faqFormatsAnswer"),
    },
    {
      question: t("faqTimeQuestion"),
      answer: t("faqTimeAnswer"),
    },
    {
      question: t("faqSecurityQuestion"),
      answer: t("faqSecurityAnswer"),
    },
    {
      question: t("faqExportQuestion"),
      answer: t("faqExportAnswer"),
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">{t("helpSupport")}</h1>
          <p className="text-muted-foreground">{t("helpDescription")}</p>
        </div>

        {/* Contact Options */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="text-primary mx-auto mb-4 h-8 w-8" />
              <h3 className="text-foreground mb-2 font-semibold">{t("emailSupport")}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{t("supportHelp")}</p>
              <Button variant="primary" size="md">
                support@nayasathi.ai
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="text-primary mx-auto mb-4 h-8 w-8" />
              <h3 className="text-foreground mb-2 font-semibold">{t("liveChat")}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{t("chatSupport")}</p>
              <Button variant="primary" size="md">
                {t("openChat")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-foreground mb-6 text-2xl font-bold">{t("faq")}</h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion className="space-y-3">
                {faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="border-border rounded-lg border px-4"
                  >
                    <AccordionTrigger className="py-4 no-underline hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>{t("needMoreHelp")}</CardTitle>
            <CardDescription>{t("documentationDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="md">
              {t("readDocumentation")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
