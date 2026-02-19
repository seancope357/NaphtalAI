"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore, createUserMessage } from "@/stores/chatStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BotMessageSquare,
  FileText,
  Fingerprint,
  Loader2,
  MessageCircleQuestionMark,
  Presentation,
  ScanEye,
  SendHorizontal,
  Settings2,
  UserRound,
  WandSparkles,
  Waypoints,
  Sparkles,
  Brain,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface OverseerSidebarProps {
  onAnalyze: (
    mode: "chat" | "connect" | "analyze_symbol" | "extract_entities" | "presentation" | "report" | string,
    nodeIds?: string[],
    provider?: "openai" | "anthropic",
    openAIKey?: string,
    anthropicKey?: string,
    customQuery?: string
  ) => Promise<void>;
}

export default function OverseerSidebar({ onAnalyze }: OverseerSidebarProps) {
  const {
    messages,
    addMessage,
    isLoading,
    setLoading,
    contextNodeIds,
    aiProvider,
    setAIProvider,
    setApiKeys,
  } = useChatStore();

  const { selectedNodes, getNodesByIds } = useCanvasStore();
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<"assistant" | "studio">("assistant");
  const [feedback, setFeedback] = useState("");
  const [openAIKey, setOpenAIKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [studioOutput, setStudioOutput] = useState<"presentation" | "report">("presentation");
  const [studioGoal, setStudioGoal] = useState("");
  const [studioAudience, setStudioAudience] = useState("Research team and decision makers");
  const [studioTone, setStudioTone] = useState("Scholarly and concise");
  const [studioDepth, setStudioDepth] = useState<"brief" | "standard" | "deep">("standard");
  const [studioSlideCount, setStudioSlideCount] = useState("10");
  const [studioSectionCount, setStudioSectionCount] = useState("6");
  const [studioFollowUp, setStudioFollowUp] = useState("");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = createUserMessage(
      input.trim(),
      selectedNodes.length > 0 ? selectedNodes : undefined
    );

    addMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      const { openAIKey, anthropicKey } = useChatStore.getState();
      await onAnalyze("chat", selectedNodes, aiProvider, openAIKey, anthropicKey, input.trim());
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please check your API key in settings and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        toast({ title: "Feedback submitted", description: "Thank you for your feedback!" });
        setFeedback("");
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to submit feedback." });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'connect' && selectedNodes.length < 2) {
      addMessage({
        role: "assistant",
        content: "Please select at least two nodes on the canvas to find connections.",
      });
      return;
    }

    if (selectedNodes.length === 0) {
      addMessage({
        role: "assistant",
        content: "Please select nodes on the canvas to use this feature. Click on nodes while holding Shift to multi-select.",
      });
      return;
    }

    setLoading(true);
    try {
      const { openAIKey, anthropicKey } = useChatStore.getState();
      await onAnalyze(action, selectedNodes, aiProvider, openAIKey, anthropicKey);
    } finally {
      setLoading(false);
    }
  };

  const handleStudioGenerate = async () => {
    if (selectedNodes.length === 0) {
      addMessage({
        role: "assistant",
        content: "Select at least one node on the canvas before running Studio Mode generation.",
      });
      return;
    }

    const mode = studioOutput === "presentation" ? "presentation" : "report";
    const quantityInstruction =
      studioOutput === "presentation"
        ? `Target slides: ${studioSlideCount || "10"}.`
        : `Target report sections: ${studioSectionCount || "6"}.`;

    const depthInstruction =
      studioDepth === "brief"
        ? "Keep output compact and executive-ready."
        : studioDepth === "deep"
        ? "Provide deep analytical detail, explicit assumptions, and alternative interpretations."
        : "Provide balanced strategic depth with clear evidence flow.";

    const studioPrompt = [
      `Studio brief: ${studioGoal.trim() || "Synthesize selected canvas research into a polished deliverable."}`,
      `Audience: ${studioAudience}.`,
      `Tone: ${studioTone}.`,
      `Depth: ${studioDepth}.`,
      quantityInstruction,
      depthInstruction,
      "Use connection edges as hard reasoning constraints.",
      "Cite source nodes and supporting edges for every substantive claim.",
    ].join("\n");

    addMessage(
      createUserMessage(
        `Studio Mode (${studioOutput === "presentation" ? "Deck" : "Report"})\n${studioPrompt}`,
        selectedNodes
      )
    );

    setLoading(true);
    try {
      const { openAIKey: currentOpenAIKey, anthropicKey: currentAnthropicKey } = useChatStore.getState();
      await onAnalyze(mode, selectedNodes, aiProvider, currentOpenAIKey, currentAnthropicKey, studioPrompt);
    } finally {
      setLoading(false);
    }
  };

  const handleStudioFollowUp = async () => {
    if (!studioFollowUp.trim() || selectedNodes.length === 0 || isLoading) return;

    const mode = studioOutput === "presentation" ? "presentation" : "report";
    const query = `Studio follow-up request:\n${studioFollowUp.trim()}\n\nKeep all conclusions tied to node and edge citations.`;

    addMessage(createUserMessage(`Studio follow-up\n${studioFollowUp.trim()}`, selectedNodes));
    setStudioFollowUp("");
    setLoading(true);
    try {
      const { openAIKey: currentOpenAIKey, anthropicKey: currentAnthropicKey } = useChatStore.getState();
      await onAnalyze(mode, selectedNodes, aiProvider, currentOpenAIKey, currentAnthropicKey, query);
    } finally {
      setLoading(false);
    }
  };

  const selectedNodeData = getNodesByIds(selectedNodes);

  return (
    <div className="h-full flex flex-col bg-[#0d0d0f] overflow-hidden">
      {/* Premium Header */}
      <div className="relative px-4 pt-4 pb-3 border-b border-white/[0.06] overflow-hidden">
        {/* Subtle gradient glow behind header */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8622a]/[0.07] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8622a]/40 to-transparent" />

        <div className="relative flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-3">
            {/* Premium icon badge */}
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(232,98,42,0.25) 0%, rgba(232,98,42,0.08) 100%)",
                boxShadow: "0 0 12px rgba(232,98,42,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
                border: "1px solid rgba(232,98,42,0.3)",
              }}
            >
              <Brain className="w-4 h-4 text-[#e8622a]" strokeWidth={2} />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#e8622a] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="font-mono font-bold text-[13px] text-white tracking-tight leading-none">
                NaphtalAI
              </h2>
              <p className="text-[9px] text-[#e8622a]/80 tracking-[0.12em] uppercase font-medium mt-0.5">
                Research Agent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-[#e8622a] hover:bg-[#e8622a]/10 transition-all">
                  <MessageCircleQuestionMark className="w-3.5 h-3.5" strokeWidth={2.2} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Beta Feedback</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 pt-3">
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you think..."
                    className="min-h-[140px]"
                  />
                  <Button onClick={handleFeedbackSubmit} className="w-full">Submit</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 text-white/30 hover:text-[#e8622a] hover:bg-[#e8622a]/10 transition-all",
                showSettings && "text-[#e8622a] bg-[#e8622a]/10"
              )}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="w-3.5 h-3.5" strokeWidth={2.2} />
            </Button>
          </div>
        </div>

        {/* Status indicator row */}
        <div className="relative flex items-center gap-2 mt-2 pl-11">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-emerald-400/80 font-medium tracking-wide">ONLINE</span>
          </div>
          <span className="text-[10px] text-white/25 tracking-wide">AI-powered analysis & discovery</span>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input id="openai-key" type="password" value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input id="anthropic-key" type="password" value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} />
                </div>
                <Button onClick={() => {
                  setApiKeys(openAIKey, anthropicKey);
                  toast({ title: "API keys saved", description: "Your API keys have been saved locally." });
                  setShowSettings(false);
                }}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
          <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-medium mb-3">AI Provider</h3>
          <div className="flex gap-2">
            <button
              className={cn(
                "flex-1 h-8 rounded-md text-[11px] font-medium transition-all border",
                aiProvider === "openai"
                  ? "bg-[#e8622a]/15 border-[#e8622a]/40 text-[#e8622a]"
                  : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.15]"
              )}
              onClick={() => setAIProvider("openai")}
            >
              OpenAI
            </button>
            <button
              className={cn(
                "flex-1 h-8 rounded-md text-[11px] font-medium transition-all border",
                aiProvider === "anthropic"
                  ? "bg-[#e8622a]/15 border-[#e8622a]/40 text-[#e8622a]"
                  : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.15]"
              )}
              onClick={() => setAIProvider("anthropic")}
            >
              Anthropic
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="relative flex rounded-lg p-0.5 bg-white/[0.04] border border-white/[0.06]">
          {/* Sliding indicator */}
          <div
            className={cn(
              "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md transition-all duration-200",
              workspaceMode === "assistant" ? "left-0.5" : "left-[calc(50%+1px)]"
            )}
            style={{
              background: "linear-gradient(135deg, rgba(232,98,42,0.2) 0%, rgba(232,98,42,0.1) 100%)",
              boxShadow: "0 0 8px rgba(232,98,42,0.15)",
              border: "1px solid rgba(232,98,42,0.25)",
            }}
          />
          <button
            className={cn(
              "relative flex-1 h-8 text-[11px] font-medium rounded-md transition-colors z-10",
              workspaceMode === "assistant" ? "text-[#e8622a]" : "text-white/35 hover:text-white/55"
            )}
            onClick={() => setWorkspaceMode("assistant")}
          >
            Assistant
          </button>
          <button
            className={cn(
              "relative flex-1 h-8 text-[11px] font-medium rounded-md transition-colors z-10",
              workspaceMode === "studio" ? "text-[#e8622a]" : "text-white/35 hover:text-white/55"
            )}
            onClick={() => setWorkspaceMode("studio")}
          >
            Studio
          </button>
        </div>
      </div>

      {/* Context Display */}
      {selectedNodes.length > 0 && (
        <div className="px-4 py-2.5 border-b border-white/[0.06]"
          style={{ background: "linear-gradient(180deg, rgba(232,98,42,0.06) 0%, transparent 100%)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Waypoints className="w-3 h-3 text-[#e8622a]" strokeWidth={2.2} />
            <span className="text-[10px] font-medium text-[#e8622a] tracking-wide">
              CONTEXT · {selectedNodes.length} NODE{selectedNodes.length !== 1 ? "S" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedNodeData.map((node) => (
              <span
                key={node.id}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(232,98,42,0.12)",
                  border: "1px solid rgba(232,98,42,0.25)",
                  color: "rgba(232,98,42,0.9)",
                }}
              >
                {node.data.label.substring(0, 20)}
                {node.data.label.length > 20 && "…"}
              </span>
            ))}
          </div>
        </div>
      )}

      {workspaceMode === "assistant" ? (
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-medium mb-2.5">Quick Actions</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { action: "extract_entities", icon: Fingerprint, label: "Extract", color: "#a78bfa" },
              { action: "connect", icon: Waypoints, label: "Connect", color: "#34d399" },
              { action: "analyze_symbol", icon: WandSparkles, label: "Symbol", color: "#fbbf24" },
              { action: "chat", icon: ScanEye, label: "Summarize", color: "#60a5fa" },
            ].map(({ action, icon: Icon, label, color }) => (
              <button
                key={action}
                className={cn(
                  "group h-[34px] flex items-center gap-2 px-3 rounded-lg text-[11px] font-medium transition-all border",
                  "bg-white/[0.03] border-white/[0.07] text-white/50",
                  "hover:bg-white/[0.06] hover:border-white/[0.14] hover:text-white/80",
                  isLoading && "opacity-40 pointer-events-none"
                )}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                <Icon className="w-3 h-3 flex-shrink-0 transition-colors" strokeWidth={2.2}
                  style={{ color: isLoading ? undefined : color }}
                />
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-white/[0.06] space-y-3 bg-white/[0.01]">
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-medium">Studio Mode</p>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/30">
              Notebook-style
            </span>
          </div>

          <div className="relative flex rounded-lg p-0.5 bg-white/[0.04] border border-white/[0.06]">
            <div
              className={cn(
                "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md transition-all duration-200",
                studioOutput === "presentation" ? "left-0.5" : "left-[calc(50%+1px)]"
              )}
              style={{
                background: "linear-gradient(135deg, rgba(232,98,42,0.2) 0%, rgba(232,98,42,0.1) 100%)",
                border: "1px solid rgba(232,98,42,0.25)",
              }}
            />
            <button
              className={cn(
                "relative flex-1 h-8 flex items-center justify-center gap-1.5 text-[11px] font-medium z-10 transition-colors",
                studioOutput === "presentation" ? "text-[#e8622a]" : "text-white/35 hover:text-white/55"
              )}
              onClick={() => setStudioOutput("presentation")}
            >
              <Presentation className="w-3 h-3" strokeWidth={2.2} />
              Slide Deck
            </button>
            <button
              className={cn(
                "relative flex-1 h-8 flex items-center justify-center gap-1.5 text-[11px] font-medium z-10 transition-colors",
                studioOutput === "report" ? "text-[#e8622a]" : "text-white/35 hover:text-white/55"
              )}
              onClick={() => setStudioOutput("report")}
            >
              <FileText className="w-3 h-3" strokeWidth={2.2} />
              Report
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-[0.12em] text-white/30 font-medium">Generation Brief</label>
            <Textarea
              value={studioGoal}
              onChange={(e) => setStudioGoal(e.target.value)}
              placeholder="What should this deliverable accomplish?"
              className="min-h-[64px] text-xs bg-white/[0.03] border-white/[0.08] text-white/70 placeholder:text-white/20 resize-none focus-visible:border-[#e8622a]/40 focus-visible:ring-[#e8622a]/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.12em] text-white/30">Audience</label>
              <Input
                value={studioAudience}
                onChange={(e) => setStudioAudience(e.target.value)}
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/70 focus-visible:border-[#e8622a]/40 focus-visible:ring-[#e8622a]/15"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.12em] text-white/30">Tone</label>
              <Input
                value={studioTone}
                onChange={(e) => setStudioTone(e.target.value)}
                className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/70 focus-visible:border-[#e8622a]/40 focus-visible:ring-[#e8622a]/15"
              />
            </div>
          </div>

          <div className="flex gap-1.5">
            {(["brief", "standard", "deep"] as const).map((depth) => (
              <button
                key={depth}
                className={cn(
                  "flex-1 h-7 rounded-md text-[10px] font-medium transition-all border capitalize",
                  studioDepth === depth
                    ? "bg-[#e8622a]/15 border-[#e8622a]/35 text-[#e8622a]"
                    : "bg-white/[0.03] border-white/[0.07] text-white/35 hover:text-white/55 hover:border-white/[0.14]"
                )}
                onClick={() => setStudioDepth(depth)}
              >
                {depth}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {studioOutput === "presentation" ? (
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-[0.12em] text-white/30">Slides</label>
                <Input
                  value={studioSlideCount}
                  onChange={(e) => setStudioSlideCount(e.target.value)}
                  className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/70 focus-visible:border-[#e8622a]/40 focus-visible:ring-[#e8622a]/15"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-[0.12em] text-white/30">Sections</label>
                <Input
                  value={studioSectionCount}
                  onChange={(e) => setStudioSectionCount(e.target.value)}
                  className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/70 focus-visible:border-[#e8622a]/40 focus-visible:ring-[#e8622a]/15"
                />
              </div>
            )}
            <div className="flex items-end">
              <button
                className={cn(
                  "w-full h-8 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                  "text-white",
                  isLoading ? "opacity-60" : "hover:brightness-110 active:scale-[0.98]"
                )}
                style={{
                  background: isLoading
                    ? "rgba(232,98,42,0.3)"
                    : "linear-gradient(135deg, #e8622a 0%, #d4521f 100%)",
                  boxShadow: isLoading ? "none" : "0 2px 12px rgba(232,98,42,0.3)",
                }}
                onClick={handleStudioGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" strokeWidth={2.2} />
                )}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(232,98,42,0.15) 0%, rgba(232,98,42,0.05) 100%)",
                boxShadow: "0 0 32px rgba(232,98,42,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                border: "1px solid rgba(232,98,42,0.2)",
              }}
            >
              <Brain className="w-7 h-7 text-[#e8622a]/70" strokeWidth={1.8} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #e8622a 0%, #d4521f 100%)",
                  boxShadow: "0 0 8px rgba(232,98,42,0.4)",
                }}
              >
                <Zap className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-sm font-semibold text-white/70 mb-1.5">
              {workspaceMode === "studio" ? "Studio Ready" : "Ready to Investigate"}
            </p>
            <p className="text-[11px] text-white/25 max-w-[160px] leading-relaxed">
              {workspaceMode === "studio"
                ? "Select canvas nodes, set a brief, and generate a deck or report."
                : "Select canvas nodes and ask questions, or use quick actions above."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2.5 py-1">
                <div className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{
                    background: "rgba(232,98,42,0.12)",
                    border: "1px solid rgba(232,98,42,0.2)",
                  }}
                >
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-[#e8622a]" />
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-[#e8622a]/50 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      {workspaceMode === "assistant" ? (
        <div className="px-4 py-3 border-t border-white/[0.06]"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(232,98,42,0.03) 100%)" }}
        >
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedNodes.length > 0
                  ? `Ask about ${selectedNodes.length} selected node${selectedNodes.length !== 1 ? "s" : ""}…`
                  : "Ask a question…"
              }
              className="min-h-[76px] max-h-[140px] pr-12 text-sm resize-none bg-white/[0.04] border-white/[0.09] text-white/80 placeholder:text-white/20 focus-visible:border-[#e8622a]/40 focus-visible:ring-[#e8622a]/15"
              disabled={isLoading}
            />
            <button
              className={cn(
                "absolute bottom-2.5 right-2.5 h-7 w-7 rounded-md flex items-center justify-center transition-all",
                (!input.trim() || isLoading)
                  ? "bg-white/[0.04] border border-white/[0.08] text-white/20 cursor-not-allowed"
                  : "text-white hover:brightness-110 active:scale-95"
              )}
              style={input.trim() && !isLoading ? {
                background: "linear-gradient(135deg, #e8622a 0%, #d4521f 100%)",
                boxShadow: "0 2px 8px rgba(232,98,42,0.35)",
              } : {}}
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <SendHorizontal className="w-3 h-3" strokeWidth={2.2} />
              )}
            </button>
          </div>
          <p className="text-[9px] text-white/15 mt-2 text-center tracking-widest uppercase">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-medium mb-2">Studio Follow-Up</p>
          <div className="relative">
            <Textarea
              value={studioFollowUp}
              onChange={(e) => setStudioFollowUp(e.target.value)}
              placeholder="Refine the draft: ask for slide changes, tighter narrative, different report structure..."
              className="min-h-[72px] max-h-[120px] pr-12 text-sm resize-none bg-white/[0.04] border-white/[0.09] text-white/80 placeholder:text-white/20 focus-visible:border-[#e8622a]/40 focus-visible:ring-[#e8622a]/15"
              disabled={isLoading || selectedNodes.length === 0}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleStudioFollowUp();
                }
              }}
            />
            <button
              className={cn(
                "absolute bottom-2.5 right-2.5 h-7 w-7 rounded-md flex items-center justify-center transition-all",
                (!studioFollowUp.trim() || isLoading || selectedNodes.length === 0)
                  ? "bg-white/[0.04] border border-white/[0.08] text-white/20 cursor-not-allowed"
                  : "text-white hover:brightness-110 active:scale-95"
              )}
              style={studioFollowUp.trim() && !isLoading && selectedNodes.length > 0 ? {
                background: "linear-gradient(135deg, #e8622a 0%, #d4521f 100%)",
                boxShadow: "0 2px 8px rgba(232,98,42,0.35)",
              } : {}}
              onClick={handleStudioFollowUp}
              disabled={!studioFollowUp.trim() || isLoading || selectedNodes.length === 0}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <SendHorizontal className="w-3 h-3" strokeWidth={2.2} />
              )}
            </button>
          </div>
          <p className="text-[9px] text-white/15 mt-2 text-center tracking-widest uppercase">
            Follow-ups stay citation-bound to selected graph nodes
          </p>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: "rgba(232,98,42,0.12)",
            border: "1px solid rgba(232,98,42,0.22)",
          }}
        >
          <Brain className="w-2.5 h-2.5 text-[#e8622a]" strokeWidth={2} />
        </div>
      )}
      <div
        className={cn("max-w-[85%] rounded-xl p-3 text-[12px] leading-relaxed", isUser ? "" : "")}
        style={isUser ? {
          background: "linear-gradient(135deg, rgba(232,98,42,0.18) 0%, rgba(232,98,42,0.08) 100%)",
          border: "1px solid rgba(232,98,42,0.25)",
          color: "rgba(255,255,255,0.8)",
        } : {
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderLeft: "2px solid rgba(232,98,42,0.4)",
          color: "rgba(255,255,255,0.75)",
        }}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.nodeContext && message.nodeContext.length > 0 && (
          <div className="flex gap-1 mt-2 pt-2 border-t border-white/[0.07]">
            <Fingerprint className="w-2.5 h-2.5 text-white/25 mt-0.5" strokeWidth={2.2} />
            <span className="text-[10px] text-white/25">
              {message.nodeContext.length} nodes referenced
            </span>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: "rgba(232,98,42,0.12)",
            border: "1px solid rgba(232,98,42,0.2)",
          }}
        >
          <UserRound className="w-2.5 h-2.5 text-[#e8622a]" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
