"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// console.log(BACKEND_URL)

const FileUpload = () => {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    setFile(selectedFile);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      const response = await fetch(`${BACKEND_URL}/analyze/`, {
        method: "POST",
        body: formData,
      });
      if(response.ok){
        console.log("connection successful")
      }

      if (!response.ok) {
        throw new Error("Failed to analyze the file");
      }
      

      const result = await response.json();
      const encodedText = encodeURIComponent(result.extracted_text);
      router.push(`/result/${encodedText}`);
    } catch (error) {
      console.error("Error analyzing file:", error);
      alert("An error occurred while analyzing the file.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <h2>Upload Legal Document</h2>
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <select
        value={language}
        onChange={handleLanguageChange}
        style={{ display: "block", marginBottom: "10px" }}
      >
        <option value="hi">Hindi</option>
        <option value="gu">Gujarati</option>
        <option value="en">English</option>
        <option value="mr">Marathi</option>
        <option value="ta">Tamil</option>
      </select>
      <button
        onClick={handleAnalyze}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Analyze
      </button>
      {extractedText && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <h3>Extracted Text:</h3>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
