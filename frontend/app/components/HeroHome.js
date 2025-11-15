"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Indian Legal Color Palette
const PRIMARY_COLORS = {
  justiceNavy: "#1B365D", // Deep navy blue - represents authority and trust
  saffronGold: "#FF9933", // Indian saffron - national flag color, represents courage
};

const SECONDARY_COLORS = {
  ashokGreen: "#138808", // Indian flag green - represents faith and chivalry
  constitutionMaroon: "#800020", // Deep maroon - represents dignity and law
  parchmentCream: "#F5F5DC", // Legal document background
  charcoalGray: "#36454F", // Professional text color
};

// The component relies on this environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HeroHome() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // File upload states
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // File upload handlers
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setUploadError(null);
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setUploadError("⚠️ Only PDF files are allowed.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const droppedFile = files[0];
      if (droppedFile.type !== "application/pdf") {
        setUploadError("⚠️ Only PDF files are allowed.");
        return;
      }
      setFile(droppedFile);
      setUploadError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setUploadError("⚠️ Please select a file first.");
      return;
    }

    if (!BACKEND_URL) {
      setUploadError("❌ Backend URL is not configured.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      const response = await fetch(`${BACKEND_URL}/analyze/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Server response error." }));
        throw new Error(errorData.message || "Failed to analyze the file.");
      }

      const result = await response.json();

      localStorage.setItem(
        "documentResult",
        JSON.stringify({
          extractedText: result.extracted_text,
          translatedText: result.translated_text,
          summary: result.summary,
          fileName: result.file_name,
          language: result.language,
        })
      );

      router.push(`/result/${Date.now()}`);
    } catch (error) {
      console.error("Error analyzing file:", error);
      setUploadError(`❌ Analysis failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Embedded File Upload Component
  const EmbeddedFileUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <svg
          className="w-12 h-12 mx-auto mb-4"
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
        <h3
          className="text-2xl font-bold mb-2"
          style={{ color: PRIMARY_COLORS.justiceNavy }}
        >
          PDF Document Analyzer
        </h3>
        <p className="text-gray-600">
          Upload a PDF file and select the document's language for analysis.
        </p>
      </div>

      {/* File Upload Area */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          1. Select PDF Document
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-all duration-300 cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50 scale-105"
              : file
              ? "border-orange-400 bg-orange-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input").click()}
        >
          <div className="text-center">
            {file ? (
              <div className="space-y-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  style={{ color: PRIMARY_COLORS.saffronGold }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p
                  className="font-semibold"
                  style={{ color: PRIMARY_COLORS.saffronGold }}
                >
                  File selected:
                </p>
                <p
                  className="text-sm truncate"
                  style={{ color: PRIMARY_COLORS.justiceNavy }}
                >
                  {file.name}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-600">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-gray-500 text-sm">PDF (Max 10MB)</p>
              </div>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          2. Select Document Language
        </label>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          style={{ borderColor: PRIMARY_COLORS.justiceNavy }}
        >
          <option value="en">English (en)</option>
          <option value="hi">Hindi (hi)</option>
          <option value="gu">Gujarati (gu)</option>
          <option value="mr">Marathi (mr)</option>
          <option value="ta">Tamil (ta)</option>
        </select>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isUploading || !file}
        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 ${
          isUploading || !file
            ? "bg-gray-400 cursor-not-allowed"
            : "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        }`}
        style={{
          backgroundColor:
            isUploading || !file ? "#9CA3AF" : PRIMARY_COLORS.saffronGold,
        }}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Analyzing Document...
          </div>
        ) : (
          "3. Analyze Document"
        )}
      </button>

      {/* Error Display */}
      {uploadError && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
          {uploadError}
        </div>
      )}
    </div>
  );

  // Chatbot Widget Component
  const ChatWidget = () => (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
        <div
          className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 animate-slideUp"
          style={{
            animation: isChatOpen
              ? "slideUp 0.3s ease-out"
              : "slideDown 0.3s ease-in",
          }}
        >
          <style jsx>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            @keyframes slideDown {
              from {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
              to {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
              }
            }
          `}</style>
          <div
            className="flex items-center justify-between p-4 rounded-t-lg text-white"
            style={{ backgroundColor: PRIMARY_COLORS.justiceNavy }}
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5"
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
              <h3 className="font-semibold">Legal AI Assistant</h3>
            </div>
          </div>

          <div className="flex flex-col h-[440px]">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700">
                  👋 Hi! I'm your AI legal assistant trained on Indian
                  Constitution. Ask me anything about Indian law!
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Ask about Indian Constitution..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  className="px-4 py-2 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                >
                  Send
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {["Article 14", "Property rights", "Marriage laws"].map(
                  (question, index) => (
                    <button
                      key={index}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      {question}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Main Hero Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Full Width Heading */}
        <div className="text-center mb-16">
          <h1
            className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            style={{ color: PRIMARY_COLORS.justiceNavy }}
          >
            Nyayika AI Your AI-Powered
            <span
              className="block"
              style={{ color: PRIMARY_COLORS.saffronGold }}
            >
              Legal Assistant
            </span>
          </h1>
          <p
            className="text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto"
            style={{ color: SECONDARY_COLORS.charcoalGray }}
          >
            Get accurate legal translations, constitutional guidance, and
            AI-powered protection from legal scams — all grounded in Indian law
            and the Constitution of India using Retrieval-Augmented Generation
            (RAG).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side - Content */}
          <div className="lg:col-span-6 space-y-8">
            {/* Indian Constitution Preamble Quote */}
            <div className="relative">
              <div
                className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-6 border-l-4"
                style={{ borderLeftColor: PRIMARY_COLORS.saffronGold }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 mt-1"
                      style={{ color: PRIMARY_COLORS.saffronGold }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <blockquote
                      className="text-lg italic leading-relaxed"
                      style={{ color: PRIMARY_COLORS.justiceNavy }}
                    >
                      <span className="text-2xl font-bold">"</span>
                      Justice, liberty, equality, and fraternity for all
                      citizens.
                      <span className="text-2xl font-bold">"</span>
                    </blockquote>
                    <cite
                      className="text-sm font-semibold mt-2 block"
                      style={{ color: SECONDARY_COLORS.constitutionMaroon }}
                    >
                      — Preamble of the Indian Constitution
                    </cite>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Use Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: PRIMARY_COLORS.justiceNavy }}
              >
                How to Use
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  >
                    1
                  </div>
                  <p className="text-gray-700">
                    Upload your legal PDF document
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  >
                    2
                  </div>
                  <p className="text-gray-700">Select language to translate</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  >
                    3
                  </div>
                  <p className="text-gray-700">
                    Click analyze and see the magic!
                  </p>
                </div>
              </div>
            </div>

            {/* Technologies Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: PRIMARY_COLORS.justiceNavy }}
              >
                Skills & Technologies
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    Generative AI & Large Language Models
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    RAG Architecture
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    High-Performance Vector Databases
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    Indian Constitution as a Knowledge Base
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    Python for Backend Development
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIMARY_COLORS.saffronGold }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    Next.js Frontend Architecture
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - File Upload */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <EmbeddedFileUpload />
            </div>
          </div>
        </div>

        {/* Important Disclaimer Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div
            className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 border-l-4"
            style={{ borderLeftColor: SECONDARY_COLORS.constitutionMaroon }}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 mt-1"
                  style={{ color: SECONDARY_COLORS.constitutionMaroon }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: SECONDARY_COLORS.constitutionMaroon }}
                >
                  Important Legal Disclaimer
                </h3>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p className="font-semibold">
                    <strong>
                      NOT A SUBSTITUTE FOR PROFESSIONAL LEGAL ADVICE
                    </strong>
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Educational Purpose Only:</strong> Nyayika AI is
                        designed for educational and informational purposes. It
                        provides AI-generated analysis based on the Indian
                        Constitution and legal documents but is
                        <em className="text-red-700">
                          {" "}
                          not a replacement for qualified legal counsel
                        </em>
                        .
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>No Legal Relationship:</strong> Using this
                        platform does not create an attorney-client
                        relationship. Always consult with a licensed legal
                        professional for specific legal matters.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Accuracy Limitation:</strong> While we strive
                        for accuracy, AI-generated content may contain errors or
                        outdated information. Verify all information with
                        current legal sources and professionals.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Data Privacy:</strong> Your uploaded documents
                        are processed securely, but avoid uploading highly
                        sensitive or confidential legal materials.
                      </span>
                    </li>
                  </ul>
                  <p className="text-sm italic pt-3 border-t border-gray-300">
                    By using Nyayika AI, you acknowledge that you understand
                    these limitations and will seek appropriate professional
                    legal advice for your specific legal needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
