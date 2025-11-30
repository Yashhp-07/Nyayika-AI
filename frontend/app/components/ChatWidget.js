"use client";

import { useState, useRef, useEffect } from "react";

// Indian Legal Color Palette
const PRIMARY_COLORS = {
  justiceNavy: "#1B365D",
  saffronGold: "#FF9933",
};

// Helper function to format markdown-like text to HTML
const formatMessageContent = (content) => {
  if (!content) return "";

  let formatted = content;

  // Convert **bold** to <strong> tags first (before handling asterisk bullets)
  formatted = formatted.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-semibold text-gray-900">$1</strong>'
  );

  // Convert asterisk bullets * at start of line to bullet points
  formatted = formatted.replace(
    /^\*\s+(.+)$/gm,
    '<div class="flex items-start mb-2"><span class="mr-2 mt-1 text-orange-600">•</span><span>$1</span></div>'
  );

  // Convert bullet points • to proper list items
  formatted = formatted.replace(
    /^•\s+(.+)$/gm,
    '<div class="flex items-start mb-2"><span class="mr-2 mt-1 text-orange-600">•</span><span>$1</span></div>'
  );

  // Convert numbered lists 1. 2. 3. to proper formatting
  formatted = formatted.replace(
    /^(\d+)\.\s+(.+)$/gm,
    '<div class="flex items-start mb-2"><span class="mr-2 font-semibold text-blue-700">$1.</span><span>$2</span></div>'
  );

  // Convert double line breaks to paragraph breaks
  formatted = formatted.replace(/\n\n/g, '<div class="mb-3"></div>');

  // Convert single line breaks to <br>
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
};

export default function ChatWidget({ backendUrl }) {
  const messagesEndRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content:
        "👋 Hi! I'm your AI legal assistant trained on Indian Constitution. Ask me anything about Indian law!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setIsTyping(true);
    setCurrentResponse("");

    try {
      const response = await fetch(`${backendUrl}/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "response" && data.chunk) {
                accumulatedResponse += data.chunk;
                setCurrentResponse(accumulatedResponse);
              } else if (data.type === "done") {
                setMessages((prev) => [
                  ...prev,
                  { type: "bot", content: accumulatedResponse },
                ]);
                setCurrentResponse("");
                setIsTyping(false);
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error("Error parsing SSE:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: `❌ Sorry, I encountered an error: ${error.message}`,
        },
      ]);
      setIsTyping(false);
      setCurrentResponse("");
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isTyping) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
      >
        <div
          className="transition-transform duration-300 ease-in-out"
          style={{ transform: isChatOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          {isChatOpen ? (
            <svg
              className="w-6 h-6 text-white mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-white mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-40 w-[calc(100vw-1rem)] sm:w-96 h-[70vh] sm:h-[500px] max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200">
          <div
            className="flex items-center justify-between p-3 sm:p-4 rounded-t-lg text-white"
            style={{ backgroundColor: PRIMARY_COLORS.justiceNavy }}
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="font-semibold text-sm sm:text-base">
                Legal AI Assistant
              </h3>
            </div>
          </div>

          <div className="flex flex-col h-[calc(70vh-3rem)] sm:h-[440px]">
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${
                    msg.type === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-lg p-3 text-sm ${
                      msg.type === "user"
                        ? "text-white"
                        : "bg-gray-50 text-gray-800"
                    }`}
                    style={{
                      backgroundColor:
                        msg.type === "user"
                          ? PRIMARY_COLORS.saffronGold
                          : undefined,
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        msg.type === "user"
                          ? msg.content
                          : formatMessageContent(msg.content),
                    }}
                  />
                </div>
              ))}

              {/* Show current streaming response */}
              {isTyping && currentResponse && (
                <div className="text-left">
                  <div
                    className="inline-block max-w-[80%] rounded-lg p-3 text-sm bg-gray-50 text-gray-800"
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(currentResponse),
                    }}
                  />
                  <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>
                </div>
              )}

              {/* Typing indicator when waiting for first chunk */}
              {isTyping && !currentResponse && (
                <div className="text-left">
                  <div className="inline-block rounded-lg p-3 text-sm bg-gray-50">
                    <div className="flex space-x-2">
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-200">
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about Indian Constitution..."
                  autoComplete="off"
                  className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputMessage.trim()}
                  className="px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                >
                  Send
                </button>
              </div>

              <div className="hidden sm:flex flex-wrap gap-1">
                {[
                  "What is Article 14?",
                  "Tell me about property rights",
                  "Explain fundamental rights",
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isTyping}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
