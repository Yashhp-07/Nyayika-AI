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
  const [fileName, setFileName] = useState("");
  const [language, setLanguage] = useState("");
  const [fullTranslatedText, setFullTranslatedText] = useState("");
  const [streamedTranslatedText, setStreamedTranslatedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("documentResult");
    if (storedData) {
      const data = JSON.parse(storedData);
      setExtractedText(data.extractedText || "");
      setFullTranslatedText(data.translatedText || "");
      setSummary(data.summary || "No summary available.");
      setFileName(data.fileName || "");
      setLanguage(data.language || "");
      setIsStreaming(true);
    }
  }, []);

  useEffect(() => {
    if (!isStreaming || !fullTranslatedText) return;

    const characters = fullTranslatedText.split("");
    let index = 0;

    const streamCharacter = () => {
      if (index < characters.length) {
        setStreamedTranslatedText((prevText) => prevText + characters[index]);
        index++;
        setTimeout(streamCharacter, 10);
      } else {
        setIsStreaming(false);
      }
    };
    streamCharacter();
  }, [fullTranslatedText, isStreaming]);

  // Placeholder content for translation (to be implemented)
  // const translatedText =
  //   "This is a placeholder for the translated version of the extracted text, perhaps into English or another target language.";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <svg
              className="w-10 h-10"
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
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              style={{ color: PRIMARY_COLORS.justiceNavy }}
            >
              Document Analysis Results
            </h1>
          </div>

          {fileName && (
            <div
              className="inline-flex items-center space-x-3 bg-white px-4 py-3 rounded-lg shadow-md border-l-4"
              style={{ borderLeftColor: PRIMARY_COLORS.saffronGold }}
            >
              <svg
                className="w-5 h-5"
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
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  {fileName}
                </span>
                <span className="text-xs text-gray-500 ml-3">
                  Language: {language.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {extractedText ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Main Content - Extracted & Translated Text */}
            <div className="lg:col-span-2 space-y-6">
              {/* Extracted Text Section */}
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div
                  className="px-6 py-4 border-b-2"
                  style={{
                    backgroundColor: `${PRIMARY_COLORS.justiceNavy}10`,
                    borderBottomColor: PRIMARY_COLORS.justiceNavy,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6"
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
                      className="text-xl font-bold"
                      style={{ color: PRIMARY_COLORS.justiceNavy }}
                    >
                      Original Extracted Text
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="max-h-96 overflow-y-auto text-gray-700 text-base leading-relaxed whitespace-pre-wrap font-serif">
                    {extractedText}
                  </div>
                </div>
              </div>

              {/* Translated Text Section */}
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div
                  className="px-6 py-4 border-b-2"
                  style={{
                    backgroundColor: `${SECONDARY_COLORS.ashokGreen}10`,
                    borderBottomColor: SECONDARY_COLORS.ashokGreen,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6"
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
                      className="text-xl font-bold"
                      style={{ color: SECONDARY_COLORS.ashokGreen }}
                    >
                      Translated Text
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div
                    className="text-gray-700 text-base leading-relaxed font-serif"
                    dangerouslySetInnerHTML={{ __html: streamedTranslatedText }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Summary and Chat */}
            <div className="lg:col-span-1 space-y-6">
              {/* Summary Section */}
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div
                  className="px-6 py-4 border-b-2"
                  style={{
                    backgroundColor: `${PRIMARY_COLORS.saffronGold}10`,
                    borderBottomColor: PRIMARY_COLORS.saffronGold,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6"
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
                      className="text-xl font-bold"
                      style={{ color: PRIMARY_COLORS.saffronGold }}
                    >
                      Key Summary
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div
                    className="text-gray-700 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: summary }}
                  />
                </div>
              </div>

              {/* Chat with Document Section */}
              <div
                className="bg-white shadow-lg rounded-xl overflow-hidden border-2"
                style={{ borderColor: SECONDARY_COLORS.constitutionMaroon }}
              >
                <div
                  className="px-6 py-4"
                  style={{
                    backgroundColor: SECONDARY_COLORS.constitutionMaroon,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 text-white"
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
                    <h2 className="text-xl font-bold text-white">
                      Chat with Document
                    </h2>
                  </div>
                </div>

                <div className="p-4">
                  {/* Chat History */}
                  <div className="h-64 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-3 ${
                          message.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${
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
                      className="flex-grow p-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none transition-colors"
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
                      className="px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
          <div className="mt-10 p-12 bg-white shadow-lg rounded-xl border border-gray-200 text-center">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-400"
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
              className="text-2xl font-semibold mb-2"
              style={{ color: PRIMARY_COLORS.justiceNavy }}
            >
              No Document Data Available
            </p>
            <p className="text-gray-500">
              Please upload and analyze a document to see results here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
