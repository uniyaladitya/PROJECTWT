"use client";

import React, { useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Forms";
import { Card } from "@/components/common/Card";
import { apiClient } from "@/lib/api";
import type { AnalysisResult } from "@/types";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  analysis?: AnalysisResult;
}

export function ChatInterface({ conversationId }: { conversationId?: string }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! Describe your legal or civic issue (e.g. tenancy dispute, RTI inquiry, welfare scheme), and I will analyze it for you.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(conversationId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setQuery("");
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await apiClient.analyze(userText, activeConvId);
      if (response.success && response.data) {
        if (!activeConvId && response.data.conversationId) {
          setActiveConvId(response.data.conversationId);
        }

        const aiMsg: ChatMessage = {
          id: response.data.aiMessageId || (Date.now() + 1).toString(),
          sender: "ai",
          analysis: response.data.analysis,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "ai",
            text: typeof response.error === "string" ? response.error : "Failed to analyze query.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "An error occurred while connecting to the assistant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex h-[600px] flex-col overflow-hidden border">
      {/* Header */}
      <div className="border-border bg-card flex items-center gap-2 border-b p-4">
        <Bot className="text-primary h-5 w-5" />
        <h2 className="text-foreground font-semibold">Civic AI Assistant</h2>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center border">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 text-sm ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground border"
                  : "bg-muted text-foreground border"
              }`}
            >
              {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
              {msg.analysis && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="bg-accent text-accent-foreground px-2 py-0.5 text-xs font-semibold">
                      {msg.analysis.category}
                    </span>
                    <span className="font-semibold">{msg.analysis.summary}</span>
                  </div>

                  {msg.analysis.issues?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider">
                        Key Issues Identified
                      </p>
                      <ul className="list-inside list-disc space-y-1">
                        {msg.analysis.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.analysis.recommendedActions?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider">
                        Recommended Actions
                      </p>
                      <ul className="list-inside list-disc space-y-1">
                        {msg.analysis.recommendedActions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.analysis.relevantAuthorities?.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider">
                        Authorities to Contact
                      </p>
                      <div className="space-y-1">
                        {msg.analysis.relevantAuthorities.map((auth, idx) => (
                          <div key={idx} className="bg-background/50 border p-2 text-xs">
                            <span className="font-semibold">{auth.name}</span> - {auth.role}
                            {auth.contactHint && (
                              <p className="text-muted-foreground">{auth.contactHint}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {msg.sender === "user" && (
              <div className="bg-secondary text-secondary-foreground flex h-8 w-8 shrink-0 items-center justify-center border">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Analyzing query with AI agent...
          </div>
        )}
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSend} className="border-border bg-card flex gap-2 border-t p-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your civic issue..."
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" variant="primary" disabled={loading || !query.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
