import React, { useState, useRef, useEffect } from 'react';
import { BACKEND_API_BASE } from '../config/backend';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const QUICK_ACTIONS = [
  "💰 ما هي أسعار خطط العضويات؟",
  "📍 أين تقع فروع النادي؟",
  "⚽ ما هي الألعاب الرياضية المتاحة؟",
  "📞 كيف يمكنني الاشتراك؟"
];

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const stripEmoji = (text: string) => {
    // Strips emojis by targeting Unicode Emoji properties
    return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Format history for the backend (excluding the message just sent)
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch(`${BACKEND_API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}` // Include token if needed
        },
        body: JSON.stringify({
          message: text,
          history
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: data.reply || 'Sorry, I received an empty response.',
        sender: 'ai'
      }]);

    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch response';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `عذراً، حدث خطأ أثناء الاتصال بالخادم. ${errorMessage}`,
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleQuickAction = (actionText: string) => {
    const textWithoutEmoji = stripEmoji(actionText);
    handleSendMessage(textWithoutEmoji);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start" dir="rtl">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white border border-slate-200 rounded-2xl shadow-[0_24px_70px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-l from-cyan-600 to-sky-500 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V3m0 3h.01M7.5 10.5h9A2.5 2.5 0 0 1 19 13v4a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17v-4a2.5 2.5 0 0 1 2.5-2.5Zm2.25 4h.01m4.49 0h.01M8.75 17h6.5" />
                </svg>
              </span>
              <div>
                <h3 className="font-bold text-sm">المساعد الذكي للنادي</h3>
                <p className="text-xs text-cyan-50">Capital University Club</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full text-white/80 hover:bg-white/15 hover:text-white transition-colors"
            >
              ✖
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-cyan-200 scrollbar-track-slate-100">
            {messages.length === 0 && (
              <div className="text-center mt-2 mb-6">
                <p className="text-slate-500 text-sm mb-4">أهلاً بك! كيف يمكنني مساعدتك اليوم؟</p>
                <div className="flex flex-col gap-2">
                  {QUICK_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action)}
                      className="bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-700 hover:text-orange-500 text-sm py-2.5 px-3 rounded-xl shadow-sm transition-colors text-right"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'mr-auto items-end' : 'ml-auto items-start'}`}
              >
                <div 
                  className={`p-3 rounded-2xl whitespace-pre-wrap text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none shadow-sm' 
                      : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ml-auto w-fit mr-2">
                <div className="bg-slate-100 border border-slate-200 text-slate-600 p-3 rounded-2xl rounded-tl-none text-sm inline-flex items-center gap-2 shadow-sm">
                  <span>Thinking... 🤖</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white p-3 border-t border-slate-200">
            <form onSubmit={onFormSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm rounded-xl px-4 py-2 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl px-4 py-2 flex items-center justify-center shadow-sm transition-colors"
                aria-label="إرسال"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -rotate-90">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-[0_14px_35px_rgba(8,145,178,0.35)] flex items-center justify-center hover:scale-105 transition-all duration-300"
          aria-label="افتح المساعد الذكي"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V3m0 3h.01M7.5 10.5h9A2.5 2.5 0 0 1 19 13v4a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17v-4a2.5 2.5 0 0 1 2.5-2.5Zm2.25 4h.01m4.49 0h.01M8.75 17h6.5" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AIChatbot;
