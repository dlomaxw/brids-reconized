import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, BrainCircuit, Trash2, History } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';
import clsx from 'clsx';

const CHAT_STORAGE_KEY = 'birding_guide_chat_history';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const apiKey = process.env.API_KEY || '';
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []);

  // Save history on update
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    if (!apiKey) return;

    const initializeChat = (isExpert: boolean) => {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const model = isExpert ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
        const config = isExpert ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
        
        // Convert stored messages to history format for Gemini
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        chatRef.current = ai.chats.create({
          model: model,
          history: history,
          config: {
            systemInstruction: `You are an expert ornithologist and safari guide for Uganda and Rwanda. 
            Help users identify birds, plan trips, and understand the ecosystem.
            Base your ornithological knowledge and taxonomy on standard regional guides such as 'Birds of East Africa' by Stevenson & Fanshawe and 'Birds of Eastern Africa' by Ber Van Perlo.
            Refer to specific sites like Kazinga Channel, Munyanyange Crater, and Lake Mburo using recent monitoring data where possible.
            ${isExpert ? "You are in EXPERT MODE. Think deeply about complex ecological relationships, taxonomy, and detailed itinerary planning." : "Keep responses concise and helpful."}`,
            ...config
          }
        });
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      }
    };
    
    initializeChat(expertMode);
  }, [apiKey, expertMode]); // Re-init if mode changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearMemory = () => {
    if (window.confirm("Are you sure you want to clear the conversation memory?")) {
      setMessages([]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      // Re-initialize chat with empty history
      if (apiKey) {
         const ai = new GoogleGenAI({ apiKey });
         chatRef.current = ai.chats.create({
            model: expertMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
            config: {
              systemInstruction: "You are an expert ornithologist..."
            }
         });
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatRef.current || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const resultStream = await chatRef.current.sendMessageStream({ message: userMsg });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]); 

      for await (const chunk of resultStream) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1].text = fullResponse;
            return newArr;
          });
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to the bird database. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-emerald-50/50">
      <div className="bg-white p-4 shadow-sm border-b border-emerald-100 flex justify-between items-center backdrop-blur-md bg-white/80 sticky top-0 z-10">
        <div>
           <h2 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
             <Bot className="w-5 h-5 text-emerald-600" />
             Safari Guide AI
           </h2>
           <p className="text-xs text-emerald-600/70">Ask about birds, habitats, or plan your trip</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={clearMemory}
            className="p-2 rounded-full text-emerald-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Clear Memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setExpertMode(!expertMode)}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              expertMode 
                ? "bg-purple-100 text-purple-700 border-purple-200 shadow-sm" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            )}
          >
            {expertMode ? <BrainCircuit className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            {expertMode ? "Deep Think" : "Fast"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-emerald-800/30 space-y-4 opacity-70 animate-in fade-in zoom-in duration-500">
            <Bot className="w-16 h-16" />
            <p className="text-center text-sm max-w-xs font-medium">
              Jambo! I remember our past conversations. 
              <br/>
              Ask me about the "Grey Crowned Cranes in Kaku Wetland" or "Shoebills in Mabamba".
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={clsx("flex gap-3 animate-in slide-in-from-bottom-2 duration-300", msg.role === 'user' ? "justify-end" : "justify-start")}>
             {msg.role === 'model' && (
               <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm", expertMode ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600")}>
                 <Bot className="w-5 h-5" />
               </div>
             )}
             
             <div className={clsx(
               "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
               msg.role === 'user' 
                 ? "bg-emerald-700 text-white rounded-tr-none" 
                 : "bg-white border border-emerald-100 text-emerald-900 rounded-tl-none"
             )}>
               {msg.text}
             </div>

             {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                 <User className="w-5 h-5 text-emerald-700" />
               </div>
             )}
          </div>
        ))}
        {loading && (
           <div className="flex gap-3 justify-start animate-pulse">
             <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", expertMode ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600")}>
                 <Bot className="w-5 h-5" />
             </div>
             <div className="bg-white border border-emerald-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
               <Loader2 className={clsx("w-4 h-4 animate-spin", expertMode ? "text-purple-500" : "text-emerald-500")} />
               <span className="text-xs text-stone-400">{expertMode ? "Analyzing deeply..." : "Typing..."}</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-emerald-100">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={expertMode ? "Ask a complex question about ecology..." : "Ask a question..."}
            className="w-full bg-emerald-50 border-emerald-100 rounded-2xl py-3 pl-4 pr-12 text-emerald-900 placeholder-emerald-800/40 focus:ring-2 focus:ring-emerald-500 outline-none resize-none max-h-32 min-h-[48px] shadow-inner transition-all focus:bg-white"
            rows={1}
          />
          <button 
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={clsx(
              "absolute right-2 p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95",
              !input.trim() || loading ? "text-emerald-200" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {expertMode && (
          <p className="text-[10px] text-purple-600 mt-2 text-center flex items-center justify-center gap-1 opacity-80">
            <BrainCircuit className="w-3 h-3" />
            Gemini 3.0 Thinking enabled
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBot;