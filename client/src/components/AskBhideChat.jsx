import React, { useState, useEffect } from "react";
import axios from "axios";

const AskBhideChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && firstOpen) {
      setFirstOpen(false);
      setMessages([{
        sender: "bhide",
        text: "Namaskar beta! 👋 Welcome to Ask Bhide Sir. Please ask your study-related questions. I'm here to help with your academic doubts!"
      }]);
    }
  }, [isOpen, firstOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (input.length > 200) {
      setMessages((prev) => [
        ...prev,
        { sender: "bhide", text: "Beta, itna lamba essay mat likho. Short mein pucho." },
      ]);
      setInput("");
      return;
    }

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setCooldown(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BOT_API}`, {
        question: input,
      });

      const botMsg = { sender: "bhide", text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg =
        err.response?.status === 429
          ? "Bhide Sir abhi available nahi hai... woh society ke kaam mein busy hai. Thoda ruk jao beta."
          : "Bhide Sir is unavailable right now. Plz try again later.";

      setMessages((prev) => [
        ...prev,
        { sender: "bhide", text: errorMsg },
      ]);
    }

    setIsTyping(false);
    setTimeout(() => setCooldown(false), 3000);
  };

  // Calculate responsive dimensions
  const chatWidth = windowWidth < 400 ? '90vw' : windowWidth < 640 ? '22rem' : '24rem';
  const chatHeight = windowWidth < 400 ? '70vh' : '80vh';

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] box-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
      >
        💬 Ask Bhide Sir
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-full right-0 mb-4 bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-purple-500 flex flex-col transform transition-all duration-300"
          style={{
            width: chatWidth,
            maxHeight: chatHeight,
            bottom: windowWidth < 640 ? 'calc(100% + 1rem)' : 'calc(100% + 1.5rem)'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-3 px-4 text-center font-bold text-sm sm:text-lg">
            Ask Bhide Sir
          </div>

          {/* Typing indicator */}
          {isTyping && (
            <div className="text-gray-500 italic px-4 py-1 sm:py-2 text-xs sm:text-sm animate-pulse">
              Bhide Sir is typing...
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-2 sm:p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 sm:mb-3 p-2 sm:p-3 rounded-lg max-w-[85%] text-xs sm:text-sm ${msg.sender === "user"
                    ? "ml-auto bg-blue-100 text-blue-900 rounded-br-none"
                    : "mr-auto bg-purple-100 text-purple-900 rounded-bl-none"
                  }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-2 sm:p-3 flex flex-shrink-0 box-border">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !cooldown && !isTyping) {
                  sendMessage();
                }
              }}
              placeholder="Ask study-related questions..."
              disabled={isTyping}
              className="flex-1 border border-gray-300 rounded-l-lg px-2 sm:px-4 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-xs sm:text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={cooldown || isTyping || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm"
            >
              {isTyping ? (
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white mx-1 sm:mx-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AskBhideChat;