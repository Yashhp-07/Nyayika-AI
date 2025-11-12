"use client";

import React, { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");

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

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze the file");
      }

      const result = await response.json();
      console.log("Analysis result:", result);
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
    </div>
);
};

export default FileUpload;
