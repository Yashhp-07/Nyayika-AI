"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react"; // Importing useState and useEffect

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
    const storedData = localStorage.getItem('documentResult');
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
      formData.append('text', text);

      const response = await fetch('http://localhost:8000/stream_summary/', {
        method: 'POST',
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
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
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
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming summary:', error);
      setSummaryError('Failed to load summary. Please try again.');
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
      formData.append('text', text);
      formData.append('language', targetLanguage);

      const response = await fetch('http://localhost:8000/stream_translation/', {
        method: 'POST',
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
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
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
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming translation:', error);
      setTranslationError('Failed to load translation. Please try again.');
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 border-b-4 border-indigo-500 pb-2">
          📄 Document Analysis Result
        </h1>
        
        {fileName && (
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold">File:</span> {fileName} | <span className="font-semibold">Language:</span> {language}
          </p>
        )}

        {extractedText ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Extracted Text and Translated Text (Main Content) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Extracted Text Box */}
              <SectionCard
                title="📖 Extracted Text (Original)"
                color="bg-indigo-50"
                borderColor="border-indigo-500"
              >
                <div className="max-h-96 overflow-y-auto text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                  {extractedText}
                </div>
              </SectionCard>

              {/* Translated Text Box */}
              <SectionCard
                title="🌐 Translated Text"
                color="bg-green-50"
                borderColor="border-green-500"
              >
                {isStreamingTranslation && !translatedText && (
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Translating text...
                  </div>
                )}
                {translationError && (
                  <div className="text-red-600 text-sm">{translationError}</div>
                )}
                {translatedText && (
                  <div 
                    className="text-gray-700 text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: translatedText }}
                  />
                )}
              </SectionCard>
            </div>

            {/* Right Column: Summary and Chat with Document (Side Content) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Summary Box */}
              <SectionCard
                title="✨ Key Summary"
                color="bg-yellow-50"
                borderColor="border-yellow-500"
              >
                {isStreamingSummary && !summary && (
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating summary...
                  </div>
                )}
                {summaryError && (
                  <div className="text-red-600 text-sm">{summaryError}</div>
                )}
                {summary && (
                  <div 
                    className="text-gray-700 text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: summary }}
                  />
                )}
              </SectionCard>

              {/* Chat with Document Box */}
              <div className="bg-white shadow-xl rounded-lg p-5 border border-red-200">
                <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    ></path>
                  </svg>
                  Chat with Document
                </h3>

                {/* Chat History */}
                <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-md border border-gray-200">
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-2 max-w-[80%] ${
                        message.role === "user"
                          ? "ml-auto text-right"
                          : "mr-auto text-left"
                      }`}
                    >
                      <span
                        className={`inline-block p-2 rounded-lg text-sm shadow-md ${
                          message.role === "user"
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-800 border border-red-300"
                        }`}
                      >
                        {message.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleChatSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about the text..."
                    className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="bg-red-500 text-white p-2 rounded-lg font-semibold hover:bg-red-600 transition duration-150 shadow-md"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xl text-gray-500 mt-10 p-8 bg-white shadow-md rounded-lg">
            😔 No document data was passed for analysis.
          </p>
        )}
      </div>
    </div>
  );
};

// Reusable Section Card Component for cleaner code
const SectionCard = ({ title, children, color, borderColor }) => (
  <div
    className={`bg-white shadow-xl rounded-lg p-5 border-l-4 ${borderColor}`}
  >
    <h3
      className={`text-xl font-semibold text-gray-700 mb-4 border-b pb-2 ${
        color === "bg-indigo-50"
          ? "text-indigo-700"
          : color === "bg-green-50"
          ? "text-green-700"
          : "text-yellow-700"
      }`}
    >
      {title}
    </h3>
    {children}
  </div>
);

export default ResultPage;
