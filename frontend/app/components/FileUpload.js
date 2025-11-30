"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// The component relies on this environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const FileUpload = () => {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  // Retaining the extractedText state, though it's currently unused for display in the final step.
  const [extractedText, setExtractedText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setUploadError(null); // Clear previous errors
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
      if (response.ok) {
        console.log("connection successful");
      }

      if (!response.ok) {
        // Attempt to read the error message from the backend if available
        const errorData = await response
          .json()
          .catch(() => ({ message: "Server response error." }));
        throw new Error(errorData.message || "Failed to analyze the file.");
      }

      const result = await response.json();
      console.log("extracted text:", result.extracted_text);
      console.log("summary:", result.summary);

      // Store the result data in localStorage to pass to the result page
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

      // Navigate to the result page
      router.push(`/result/${Date.now()}`);
    } catch (error) {
      console.error("Error analyzing file:", error);
      setUploadError(`❌ Analysis failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-3 sm:p-4">
      <div className="w-full max-w-md mx-auto bg-white shadow-2xl rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 border border-indigo-200">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center flex items-center justify-center">
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          PDF Document Analyzer
        </h2>

        <p className="text-center text-sm sm:text-base text-gray-500">
          Upload a PDF file and select the document's language for analysis.
        </p>

        {/* --- File Input Section --- */}
        <div className="space-y-4">
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700"
          >
            1. Select PDF Document
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer transition duration-300 ${
                file
                  ? "border-green-500 bg-green-50 hover:bg-green-100"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <p className="mb-2 text-xs sm:text-sm text-green-600 font-semibold">
                      File selected:
                    </p>
                    <p className="text-xs text-green-500 truncate w-32 sm:w-40 px-2">
                      {file.name}
                    </p>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 014 5H5a2 2 0 00-2 2v1h1a2 2 0 012-2h4a2 2 0 012 2v3a2 2 0 002 2h3.5"
                      ></path>
                    </svg>
                    <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF (Max 10MB)</p>
                  </>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* --- Language Selection Section --- */}
        <div className="space-y-4">
          <label
            htmlFor="language-select"
            className="block text-sm font-medium text-gray-700"
          >
            2. Select Document Language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 sm:py-2.5 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm appearance-none"
          >
            <option value="en">English (en)</option>
            <option value="hi">Hindi (hi)</option>
            <option value="gu">Gujarati (gu)</option>
            <option value="mr">Marathi (mr)</option>
            <option value="ta">Tamil (ta)</option>
          </select>
        </div>

        {/* --- Analyze Button --- */}
        <button
          onClick={handleAnalyze}
          disabled={isUploading || !file}
          className={`w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-lg font-medium text-white transition duration-300 ${
            isUploading || !file
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Analyzing Document...
            </div>
          ) : (
            "3. Analyze Document"
          )}
        </button>

        {/* --- Error Display --- */}
        {uploadError && (
          <div
            className="p-3 text-xs sm:text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
