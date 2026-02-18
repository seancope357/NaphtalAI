"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore, createUserMessage } from "@/stores/chatStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Send,
  Sparkles,
  Settings,
  User,
  Bot,
  Link2,
  Hash,
  Loader2,
  AlertCircle,
  MessageCircleQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface OverseerSidebarProps {
  onAnalyze: (mode: string, nodeIds?: string[]) => Promise<void>;
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
  const [feedback, setFeedback] = useState("");
  const [openAIKey, setOpenAIKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
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
      // Get context from selected nodes
      const contextNodes = getNodesByIds(selectedNodes);
      const nodeContext = contextNodes.map((node) => ({
        type: node.data.type,
        label: node.data.label,
        content: node.data.content?.substring(0, 500),
      }));

      // Call the AI analysis
      const { openAIKey, anthropicKey } = useChatStore.getState();
      await onAnalyze("chat", selectedNodes, aiProvider, openAIKey, anthropicKey);
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
      await onAnalyze(action, selectedNodes);
    } finally {
      setLoading(false);
    }
  };

  const selectedNodeData = getNodesByIds(selectedNodes);

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center ring-1 ring-primary/30">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display font-semibold text-sidebar-foreground tracking-tight">
              NaphtalAI
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <MessageCircleQuestion className="w-4 h-4" />
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
                "h-8 w-8 text-muted-foreground hover:text-primary transition-colors",
                showSettings && "text-primary bg-primary/10"
              )}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/70 mt-2 mb-4 pl-9">
          AI-powered analysis and discovery
        </p>

        {/* Settings Dialog */}
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
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-6 py-5 border-b border-sidebar-border bg-muted/30">
          <h3 className="text-sm font-medium mb-3">AI Provider</h3>
          <div className="flex gap-2.5">
            <Button
              variant={aiProvider === "openai" ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1",
                aiProvider === "openai" && "bg-primary"
              )}
              onClick={() => setAIProvider("openai")}
            >
              OpenAI
            </Button>
            <Button
              variant={aiProvider === "anthropic" ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1",
                aiProvider === "anthropic" && "bg-primary"
              )}
              onClick={() => setAIProvider("anthropic")}
            >
              Anthropic
            </Button>
          </div>
        </div>
      )}

      {/* Context Display */}
      {selectedNodes.length > 0 && (
        <div className="px-6 py-4 border-b border-sidebar-border bg-primary/5">
          <div className="flex items-center gap-2 mb-2.5">
            <Link2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Context · {selectedNodes.length} node{selectedNodes.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedNodeData.map((node) => (
              <Badge
                key={node.id}
                variant="secondary"
                className="text-[10px] px-2 py-0.5 border border-primary/20 bg-primary/10 text-primary"
              >
                {node.data.label.substring(0, 20)}
                {node.data.label.length > 20 && "…"}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-5 py-4 border-b border-sidebar-border">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs justify-start gap-2 pl-3"
            onClick={() => handleQuickAction("extract_entities")}
            disabled={isLoading}
          >
            <Hash className="w-3 h-3 shrink-0" />
            Extract
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs justify-start gap-2 pl-3"
            onClick={() => handleQuickAction("connect")}
            disabled={isLoading}
          >
            <Link2 className="w-3 h-3 shrink-0" />
            Connect
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs justify-start gap-2 pl-3"
            onClick={() => handleQuickAction("analyze_symbol")}
            disabled={isLoading}
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            Symbol
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs justify-start gap-2 pl-3"
            onClick={() => handleQuickAction("chat")}
            disabled={isLoading}
          >
            <Eye className="w-3 h-3 shrink-0" />
            Summarize
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-14 h-14 rounded-full bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center mb-5">
              <Bot className="w-7 h-7 text-primary/70" />
            </div>
            <p className="text-sm text-sidebar-foreground font-medium mb-2">
              Ready to Investigate
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-[180px] leading-relaxed">
              Select canvas nodes and ask questions, or use quick actions above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Illuminating…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-5 py-4 border-t border-sidebar-border">
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
            className="min-h-[76px] max-h-[140px] pr-12 text-sm resize-none focus-visible:ring-primary/40 focus-visible:border-primary/50"
            disabled={isLoading}
          />
          <Button
            variant="gold"
            size="icon"
            className="absolute bottom-2.5 right-2.5 h-7 w-7 rounded-md"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-2 text-center tracking-wide">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-2.5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-5 h-5 rounded-md bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Eye className="w-2.5 h-2.5 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-lg p-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary/15 text-sidebar-foreground border border-primary/25"
            : "bg-muted/60 text-card-foreground border border-sidebar-border border-l-2 border-l-primary/40"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.nodeContext && message.nodeContext.length > 0 && (
          <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-border/30">
            <Hash className="w-2.5 h-2.5 text-muted-foreground mt-0.5" />
            <span className="text-[10px] text-muted-foreground">
              {message.nodeContext.length} nodes referenced
            </span>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-5 h-5 rounded-md bg-primary/15 ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-2.5 h-2.5 text-primary" />
        </div>
      )}
    </div>
  );
}
