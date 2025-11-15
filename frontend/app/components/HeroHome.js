"use client";

import { useState } from "react";

export default function HeroHome() {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      title: "Document Analysis",
      description:
        "AI-powered analysis of legal documents with constitutional compliance checking",
    },
    {
      title: "Multi-language Support",
      description:
        "Translate legal documents between Hindi, English, and other Indian languages",
    },
    {
      title: "Constitutional Guidance",
      description:
        "Expert chatbot trained on Indian Constitution and legal precedents",
    },
    {
      title: "Scam Protection",
      description:
        "Identify fraudulent documents and protect against legal scams",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">
      {/* Clean background - no patterns */}

      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        {/* Navigation could go here */}

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-8 py-20">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3 mb-4">
            <div
              className="p-3 rounded-xl text-white text-2xl font-bold shadow-lg"
              style={{ backgroundColor: "#f15533" }}
            >
              ⚖️
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold"
              style={{ color: "#141414" }}
            >
              Nyayika AI
            </h1>
          </div>

          {/* Tagline */}
          <div className="space-y-4 max-w-4xl">
            <h2
              className="text-xl md:text-2xl font-medium"
              style={{ color: "#141414" }}
            >
              Your Trusted AI Legal Assistant
            </h2>
            <p
              className="text-3xl md:text-5xl font-bold leading-tight"
              style={{ color: "#141414" }}
            >
              Analyze, Translate & Understand
              <span className="block" style={{ color: "#f15533" }}>
                Legal Documents
              </span>
              <span
                className="block text-lg md:text-xl font-normal mt-4"
                style={{ color: "#666666" }}
              >
                Powered by Indian Constitutional Law & AI
              </span>
            </p>
          </div>

          {/* Description */}
          <p
            className="text-lg md:text-xl max-w-3xl leading-relaxed"
            style={{ color: "#666666" }}
          >
            Protect yourself from legal scams and understand complex documents
            with our AI-powered platform. Get instant translations,
            constitutional compliance checks, and expert legal guidance in
            multiple Indian languages.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              className="px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              style={{ backgroundColor: "#f15533" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Upload Document
            </button>
            <button
              className="px-8 py-4 border-2 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
              style={{
                borderColor: "#141414",
                color: "#141414",
              }}
            >
              Chat with AI Lawyer
            </button>
          </div>

          {/* Trust Indicators */}
          <div
            className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm"
            style={{ color: "#666666" }}
          >
            <div className="flex items-center space-x-2">
              <span style={{ color: "#f15533" }}>✓</span>
              <span>Constitutional Compliance</span>
            </div>
            <div className="flex items-center space-x-2">
              <span style={{ color: "#f15533" }}>✓</span>
              <span>Multi-language Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <span style={{ color: "#f15533" }}>✓</span>
              <span>Scam Protection</span>
            </div>
            <div className="flex items-center space-x-2">
              <span style={{ color: "#f15533" }}>✓</span>
              <span>100% Secure</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "#141414" }}
              >
                {feature.title}
              </h3>
              <p className="leading-relaxed" style={{ color: "#666666" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Constitutional Quote */}
        <div className="text-center py-16 border-t border-gray-200">
          <blockquote
            className="text-xl md:text-2xl font-medium italic max-w-4xl mx-auto"
            style={{ color: "#141414" }}
          >
            "Justice, Liberty, Equality and Fraternity"
          </blockquote>
          <cite className="block mt-4" style={{ color: "#666666" }}>
            - Preamble to the Constitution of India
          </cite>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 text-center">
          <div>
            <div
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "#f15533" }}
            >
              1000+
            </div>
            <div className="mt-2" style={{ color: "#666666" }}>
              Documents Analyzed
            </div>
          </div>
          <div>
            <div
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "#f15533" }}
            >
              15+
            </div>
            <div className="mt-2" style={{ color: "#666666" }}>
              Languages Supported
            </div>
          </div>
          <div>
            <div
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "#f15533" }}
            >
              99.9%
            </div>
            <div className="mt-2" style={{ color: "#666666" }}>
              Accuracy Rate
            </div>
          </div>
          <div>
            <div
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "#f15533" }}
            >
              100%
            </div>
            <div className="mt-2" style={{ color: "#666666" }}>
              Secure & Private
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
