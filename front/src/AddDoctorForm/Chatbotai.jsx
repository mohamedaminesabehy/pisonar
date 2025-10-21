import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Chatbotai.css';

function Chatbotai() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // Read API key from environment
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) {
    console.warn("⚠️ VITE_GEMINI_API_KEY is missing in .env");
  }

  // Initialize the Gemini model
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const handleRequest = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    const systemInstruction = `
You are a helpful and professional **medical assistant**. 
You can only answer questions related to **health, medicine, diseases, symptoms, treatments, medications, and wellness**.
If a user asks something outside this domain, respond: 
"I'm sorry, I can only help with questions related to medicine and health."`;

    try {
      const fullPrompt = `${systemInstruction}\n\nUser: ${prompt}`;
      const result = await model.generateContent(fullPrompt);
      const text = await result.response.text();
      setResponse(text);
    } catch (err) {
      console.error("Error generating response:", err);
      setResponse("There was an error generating a response.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRequest();
    }
  };

  return (
    <div className="Chatbot">
      <h1>Ask Your Medical Assistant</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your medical question here..."
        onKeyDown={handleKeyPress}
      />
      <button onClick={handleRequest} disabled={loading}>
        {loading ? "Generating..." : "Get Medical Advice"}
      </button>

      <div className="response-section">
        <h3>Response:</h3>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default Chatbotai;
