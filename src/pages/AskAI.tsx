import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, User, Loader2, Copy, Edit2, Clock, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const AskAI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.auth.getMe();
        if (!user) {
          navigate("/staff-login");
          return;
        }

        if (user.role !== "admin" && user.role !== "loan_officer") {
          api.auth.logout();
          navigate("/staff-login");
          return;
        }

        await loadConversations();
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/staff-login");
      }
    };

    checkAuth();
  }, [navigate]);

  const loadConversations = async () => {
    try {
      const data = await api.ai.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const data = await api.ai.getMessages(conversationId);
      const loadedMessages: Message[] = (data || []).map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
      setIsHistoryOpen(false);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation.",
        variant: "destructive",
      });
    }
  };

  const createNewConversation = async (firstMessage: string) => {
    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
      const data = await api.ai.createConversation(title);
      await loadConversations();
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
    try {
      await api.ai.saveMessage(conversationId, role, content);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await api.ai.deleteConversation(conversationId);
      await loadConversations();
      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }

      toast({
        title: "Deleted",
        description: "Conversation deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setIsHistoryOpen(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    // Create new conversation if needed
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = await createNewConversation(input.trim());
      if (!conversationId) {
        toast({
          title: "Error",
          description: "Failed to create conversation.",
          variant: "destructive",
        });
        return;
      }
      setCurrentConversationId(conversationId);
    }

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Save user message
    await saveMessage(conversationId, "user", userMessage.content);

    try {
      const data = await api.ai.chat([...messages, userMessage]);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message
      await saveMessage(conversationId, "assistant", assistantMessage.content);
      await loadConversations();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20 flex flex-col">
            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Ask AI
                  </h1>
                  <p className="text-muted-foreground">
                    Your financial assistant - ask about loans, clients, repayments, and more
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={startNewChat}
                    title="Start new chat"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>

                  <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" title="Chat history">
                        <Clock className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md">
                      <SheetHeader>
                        <SheetTitle>Chat History</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                        <div className="space-y-2">
                          {conversations.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              No conversations yet. Start chatting to create your first conversation!
                            </p>
                          ) : (
                            conversations.map((conv) => (
                              <div
                                key={conv.id}
                                className={`group flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${currentConversationId === conv.id ? "bg-muted border-primary" : ""
                                  }`}
                                onClick={() => loadConversation(conv.id)}
                              >
                                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{conv.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(conv.updated_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteConversation(conv.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-0 bg-background/95 backdrop-blur">
                <ScrollArea className="flex-1 p-4 md:p-8" ref={scrollRef}>
                  <div className="space-y-6">
                    {messages.length === 0 && (
                      <div className="text-center py-20 animate-fade-in">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Sparkles className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Welcome to your AI Financial Assistant</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Ask me about loan applications, client information, statistics, or any financial data.
                        </p>
                      </div>
                    )}

                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-4 group animate-fade-in ${message.role === "assistant" ? "justify-start" : "justify-end"
                          }`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                        )}

                        <div className="flex-1 max-w-[85%]">
                          <div
                            className={`rounded-2xl px-5 py-4 ${message.role === "assistant"
                              ? "bg-muted/50 border border-border/50"
                              : "bg-primary text-primary-foreground shadow-sm"
                              }`}
                          >
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>

                          {/* Action buttons */}
                          <div className={`flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${message.role === "assistant" ? "justify-start" : "justify-end"
                            }`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            {message.role === "user" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setInput(message.content)}
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>

                        {message.role === "user" && (
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                            <User className="h-5 w-5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isProcessing && (
                      <div className="flex gap-4 animate-fade-in">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="rounded-2xl px-5 py-4 bg-muted/50 border border-border/50">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t bg-background/50 backdrop-blur p-4">
                  <div className="glow-box relative rounded-lg p-[2px] bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-glow">
                    <div className="bg-background rounded-lg p-3 flex gap-3">
                      <div className="flex-1 relative">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask about loans, clients, statistics..."
                          className="min-h-[56px] resize-none pr-12 rounded-xl border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                          disabled={isProcessing}
                        />
                        <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                          {input.length > 0 && `${input.length} chars`}
                        </div>
                      </div>
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isProcessing}
                        size="icon"
                        className="h-[56px] w-[56px] rounded-xl shadow-sm hover:shadow-md transition-all"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-1">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Shift+Enter</kbd> for new line
                  </p>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AskAI;
