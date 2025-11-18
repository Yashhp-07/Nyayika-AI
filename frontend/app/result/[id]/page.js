"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react"; // Importing useState and useEffect

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
    const storedData = localStorage.getItem('documentResult');
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

  useEffect(()=> {
    if(!isStreaming || !fullTranslatedText ) return;

    const characters = fullTranslatedText.split('');
    let index = 0;

    const streamCharacter = () => {
      if (index < characters.length){
        setStreamedTranslatedText((prevText) => prevText + characters[index]);
        index++;
        setTimeout(streamCharacter, 10); 
      }
      else{
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
                <div className="text-gray-700 text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: streamedTranslatedText }}
                />
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
                <div 
                  className="text-gray-700 text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: summary }}
                />
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
