"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

// Indian Legal Color Palette - consistent with home page
const PRIMARY_COLORS = {
  justiceNavy: "#1B365D",
  saffronGold: "#FF9933",
};

const SECONDARY_COLORS = {
  ashokGreen: "#138808",
  constitutionMaroon: "#800020",
  parchmentCream: "#F5F5DC",
  charcoalGray: "#36454F",
};

const ResultPage = () => {
  const params = useParams();
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [language, setLanguage] = useState("");
  const [isStreamingSummary, setIsStreamingSummary] = useState(false);
  const [isStreamingTranslation, setIsStreamingTranslation] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [translationError, setTranslationError] = useState("");

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("documentResult");
    if (storedData) {
      const data = JSON.parse(storedData);
      setExtractedText(data.extractedText || "");
      setFileName(data.fileName || "");
      setLanguage(data.language || "");

      // Start streaming both summary and translation from backend
      if (data.extractedText) {
        streamSummaryFromBackend(data.extractedText);
        streamTranslationFromBackend(data.extractedText, data.language);
      }
    }
  }, []);

  // Stream summary from backend using Server-Sent Events
  const streamSummaryFromBackend = async (text) => {
    setIsStreamingSummary(true);
    setSummary("");
    setSummaryError("");

    try {
      const formData = new FormData();
      formData.append("text", text);

      const response = await fetch("http://localhost:8000/stream_summary/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                setSummary((prev) => prev + data.chunk);
              } else if (data.done) {
                setIsStreamingSummary(false);
              } else if (data.error) {
                setSummaryError(data.error);
                setIsStreamingSummary(false);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming summary:", error);
      setSummaryError("Failed to load summary. Please try again.");
      setIsStreamingSummary(false);
    }
  };

  // Stream translation from backend using Server-Sent Events
  const streamTranslationFromBackend = async (text, targetLanguage) => {
    setIsStreamingTranslation(true);
    setTranslatedText("");
    setTranslationError("");

    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("language", targetLanguage);

      const response = await fetch(
        "http://localhost:8000/stream_translation/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                setTranslatedText((prev) => prev + data.chunk);
              } else if (data.done) {
                setIsStreamingTranslation(false);
              } else if (data.error) {
                setTranslationError(data.error);
                setIsStreamingTranslation(false);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming translation:", error);
      setTranslationError("Failed to load translation. Please try again.");
      setIsStreamingTranslation(false);
    }
  };

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "system",
      text: "Hello! I'm your document assistant. Ask me anything about the extracted text.",
    },
  ]);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim() === "") return;

    // Simple placeholder logic for response
    const newUserMessage = { role: "user", text: chatInput };
    const newSystemResponse = {
      role: "system",
      text: `I processed your request: "${chatInput}". I'd provide a real answer here based on the document!`,
    };

    setChatHistory([...chatHistory, newUserMessage, newSystemResponse]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10"
              style={{ color: PRIMARY_COLORS.saffronGold }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{ color: PRIMARY_COLORS.justiceNavy }}
            >
              Document Analysis Results
            </h1>
          </div>

          {fileName && (
            <div
              className="inline-flex items-center space-x-2 sm:space-x-3 bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-md border-l-4"
              style={{ borderLeftColor: PRIMARY_COLORS.saffronGold }}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                style={{ color: PRIMARY_COLORS.saffronGold }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 block truncate">
                  {fileName}
                </span>
                <span className="text-xs text-gray-500 block sm:inline sm:ml-3">
                  Language: {language.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {extractedText ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column: Main Content - Extracted & Translated Text */}
            <div className="lg:col-span-2 space-y-6">
              {/* Extracted Text Section */}
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div
                  className="px-4 sm:px-6 py-3 sm:py-4 border-b-2"
                  style={{
                    backgroundColor: `${PRIMARY_COLORS.justiceNavy}10`,
                    borderBottomColor: PRIMARY_COLORS.justiceNavy,
                  }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: PRIMARY_COLORS.justiceNavy }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h2
                      className="text-lg sm:text-xl font-bold"
                      style={{ color: PRIMARY_COLORS.justiceNavy }}
                    >
                      Original Extracted Text
                    </h2>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="max-h-96 overflow-y-auto text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-serif">
                    {extractedText}
                  </div>
                </div>
              </div>

              {/* Translated Text Section */}
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div
                  className="px-4 sm:px-6 py-3 sm:py-4 border-b-2"
                  style={{
                    backgroundColor: `${SECONDARY_COLORS.ashokGreen}10`,
                    borderBottomColor: SECONDARY_COLORS.ashokGreen,
                  }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: SECONDARY_COLORS.ashokGreen }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                    <h2
                      className="text-lg sm:text-xl font-bold"
                      style={{ color: SECONDARY_COLORS.ashokGreen }}
                    >
                      Translated Text
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  {isStreamingTranslation && !translatedText && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Translating text...
                    </div>
                  )}
                  {translationError && (
                    <div className="text-red-600 text-sm">
                      {translationError}
                    </div>
                  )}
                  {translatedText && (
                    <div
                      className="max-h-280 overflow-y-auto text-gray-700 text-base leading-relaxed whitespace-pre-wrap font-serif"
                      dangerouslySetInnerHTML={{ __html: translatedText }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Summary and Chat */}
            <div className="lg:col-span-1 space-y-6">
              {/* Summary Section */}
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div
                  className="px-4 sm:px-6 py-3 sm:py-4 border-b-2"
                  style={{
                    backgroundColor: `${PRIMARY_COLORS.saffronGold}10`,
                    borderBottomColor: PRIMARY_COLORS.saffronGold,
                  }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: PRIMARY_COLORS.saffronGold }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <h2
                      className="text-lg sm:text-xl font-bold"
                      style={{ color: PRIMARY_COLORS.saffronGold }}
                    >
                      Key Summary
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  {isStreamingSummary && !summary && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating summary...
                    </div>
                  )}
                  {summaryError && (
                    <div className="text-red-600 text-sm">{summaryError}</div>
                  )}
                  {summary && (
                    <div
                      className="text-gray-700 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: summary }}
                    />
                  )}
                </div>
              </div>

              {/* Chat with Document Section */}
              <div
                className="bg-white shadow-lg rounded-xl overflow-hidden border-2"
                style={{ borderColor: SECONDARY_COLORS.constitutionMaroon }}
              >
                <div
                  className="px-4 sm:px-6 py-3 sm:py-4"
                  style={{
                    backgroundColor: SECONDARY_COLORS.constitutionMaroon,
                  }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Chat with Document
                    </h2>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  {/* Chat History */}
                  <div className="h-48 sm:h-64 overflow-y-auto mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-2 sm:mb-3 ${
                          message.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block max-w-[90%] sm:max-w-[85%] p-2 sm:p-3 rounded-lg text-xs sm:text-sm shadow-sm ${
                            message.role === "user"
                              ? "text-white"
                              : "bg-white text-gray-800 border"
                          }`}
                          style={{
                            backgroundColor:
                              message.role === "user"
                                ? SECONDARY_COLORS.constitutionMaroon
                                : "white",
                            borderColor:
                              message.role === "system"
                                ? `${SECONDARY_COLORS.constitutionMaroon}40`
                                : "transparent",
                          }}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleChatSubmit} className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about the document..."
                      className="flex-grow p-2 sm:p-3 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none transition-colors"
                      style={{
                        focusBorderColor: SECONDARY_COLORS.constitutionMaroon,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor =
                          SECONDARY_COLORS.constitutionMaroon;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                      }}
                    />
                    <button
                      type="submit"
                      className="px-3 sm:px-4 py-2 sm:py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs sm:text-sm"
                      style={{
                        backgroundColor: SECONDARY_COLORS.constitutionMaroon,
                      }}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 sm:mt-10 p-6 sm:p-12 bg-white shadow-lg rounded-xl border border-gray-200 text-center">
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p
              className="text-xl sm:text-2xl font-semibold mb-2"
              style={{ color: PRIMARY_COLORS.justiceNavy }}
            >
              No Document Data Available
            </p>
            <p className="text-sm sm:text-base text-gray-500">
              Please upload and analyze a document to see results here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
