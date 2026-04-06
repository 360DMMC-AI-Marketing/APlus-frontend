import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send } from "lucide-react";

const WEBHOOK_URL =
  "https://chi-360dmmc.app.n8n.cloud/webhook/03c8c541-1822-4471-a897-c879683ead0d/chat";
const SESSION_KEY = "apmd-chat-session-id";

function getOrCreateSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const TypingDots = () => (
  <div className="flex items-start gap-2 mb-3">
    <img
      src="/APMD_FULL_LOGO.jpg"
      alt=""
      className="w-7 h-7 rounded-full flex-shrink-0 mt-1 object-contain bg-white border border-gray-200 p-1"
    />
    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div
        className="flex space-x-1.5 items-center"
        aria-live="polite"
        aria-label="Assistant is typing"
      >
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  </div>
);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sessionIdRef = useRef(getOrCreateSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Render message text with clickable URLs
  const renderMessageContent = (text) => {
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 break-all"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible]);

  // Escape to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setIsVisible(true)),
    );
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 200);
  };

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg = { id: Date.now(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsLoading(true);

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatInput: trimmed,
            sessionId: sessionIdRef.current,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        let content;
        try {
          const data = JSON.parse(text);
          content =
            data.output || data.message || data.text || JSON.stringify(data);
        } catch {
          content = text;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            content: content || "No response received.",
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            content: "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleNewConversation = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, newId);
    sessionIdRef.current = newId;
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 bg-gradient-to-r from-lightblue to-blue-600 pl-3 pr-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          aria-label="Open chat"
        >
          <img
            src="/APMD_FULL_LOGO.jpg"
            alt="APMD"
            className="w-10 h-10 rounded-full object-contain bg-white p-0.5   shadow-xl"
          />
          <span className="text-sm font-semibold text-white">Chat Now</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with APMD Assistant"
          className={`fixed z-[60] bottom-0 right-0 w-full h-[85vh] sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[500px] flex flex-col bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden transition-all duration-200 ease-out ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src="/APMD_FULL_LOGO.jpg"
                alt="APMD"
                className="h-9 w-9 object-contain rounded-full bg-white p-1"
              />
              <div>
                <p className="text-white font-semibold text-sm">
                  APMD Assistant
                </p>
                <p className="text-gray-300 text-[10px]">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewConversation}
                className="text-gray-300 hover:text-white text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
                title="New conversation"
              >
                New Chat
              </button>
              <button
                onClick={handleClose}
                className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-1">
            {/* Welcome message if no history */}
            {messages.length === 0 && !isLoading && (
              <div className="flex items-start gap-2 mb-3">
                <img
                  src="/APMD_FULL_LOGO.jpg"
                  alt=""
                  className="w-7 h-7 rounded-full flex-shrink-0 mt-1 object-contain bg-white border border-gray-200 p-1"
                />
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
                  <p className="text-sm text-neutral leading-relaxed whitespace-pre-line">
                    Hello! I'm the APMD Assistant. How can I help you today?
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) =>
              msg.role === "bot" ? (
                <div key={msg.id} className="flex items-start gap-2 mb-3">
                  <img
                    src="/APMD_FULL_LOGO.jpg"
                    alt=""
                    className="w-7 h-7 rounded-full flex-shrink-0 mt-1 object-contain bg-white border border-gray-200 p-1"
                  />
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
                    <p className="text-sm text-neutral leading-relaxed break-words whitespace-pre-line">
                      {renderMessageContent(msg.content)}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex justify-end mb-3">
                  <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-white leading-relaxed break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ),
            )}

            {isLoading && <TypingDots />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-200 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-white rounded-full text-sm text-neutral placeholder-gray-400 outline-none border border-gray-300 focus:border-gray-400 transition-all disabled:opacity-50"
              aria-label="Type your message"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#F03C3C" }}
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
