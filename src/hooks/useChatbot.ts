
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";
import { useAuth } from "@/context/AuthContext";

export interface ChatMessage {
  id: string;
  content: string;
  is_user: boolean;
  timestamp: string;
}

export const useChatbot = (reportId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Load chat history on component mount
  useEffect(() => {
    if (reportId && user?.id) {
      loadChatHistory();
    }
  }, [reportId, user?.id]);

  // Function to load chat history from Supabase
  const loadChatHistory = async () => {
    if (!reportId || !user?.id) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('report_id', reportId)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          content: msg.content,
          is_user: msg.is_user,
          timestamp: msg.timestamp
        })));
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send message to chatbot API
  const sendMessage = async (content: string) => {
    if (!content.trim() || !reportId || !user?.id) return;
    
    // Generate a temporary ID for optimistic UI
    const tempId = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: tempId,
      content,
      is_user: true,
      timestamp
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Save user message to Supabase
      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert([{
          report_id: reportId,
          user_id: user.id,
          content,
          is_user: true,
          timestamp
        }]);
      
      if (saveError) {
        throw saveError;
      }
      
      // Call chatbot API
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_id: reportId,
          message: content
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add bot response to UI
      const botTimestamp = new Date().toISOString();
      const botMessage: ChatMessage = {
        id: botTimestamp,
        content: data.response || "Sorry, I couldn't process your request.",
        is_user: false,
        timestamp: botTimestamp
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to Supabase
      await supabase
        .from('chat_messages')
        .insert([{
          report_id: reportId,
          user_id: user.id,
          content: botMessage.content,
          is_user: false,
          timestamp: botTimestamp
        }]);
      
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Message failed to send", {
        description: err instanceof Error ? err.message : "Failed to communicate with chatbot"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle chatbot visibility
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return {
    messages,
    isLoading,
    isOpen,
    sendMessage,
    toggleChat
  };
};
