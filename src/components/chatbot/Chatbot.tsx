
import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbot, ChatMessage } from "@/hooks/useChatbot";

interface ChatbotProps {
  reportId: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ reportId }) => {
  const { messages, isLoading, isOpen, sendMessage, toggleChat } = useChatbot(reportId);
  const [message, setMessage] = useState<string>("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };
  
  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-96 bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden z-50">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <h3 className="font-medium">AI Assistant</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          onClick={toggleChat}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center p-4">
            <div className="space-y-2">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Ask me anything about your credit analysis report.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    msg.is_user
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
