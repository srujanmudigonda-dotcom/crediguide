
import { useState } from "react";
import chatbotService from "../services/chatbotService";

function FinancialChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello. I can help you understand your simulated credit score, loans, EMIs, payments and repayment strategies.",
    },
  ]);

  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: trimmedMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const data = await chatbotService.sendMessage(
        trimmedMessage,
        language
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            data.response ||
            "I could not generate a response right now.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            error.response?.data?.message ||
            "Unable to connect to the financial assistant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              AI Financial Assistant
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Ask questions about your CrediGuide loans,
              payments and simulated credit behavior.
            </p>
          </div>

          <div>
            <label
              htmlFor="chat-language"
              className="mb-1 block text-xs font-medium text-gray-500"
            >
              Language
            </label>

            <select
              id="chat-language"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="te">Telugu</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[420px] overflow-y-auto bg-slate-50 p-4 sm:p-6">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 shadow-sm"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                Analyzing your information...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask about your score, EMI, loans or repayment..."
            rows={2}
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Press Enter to send. Use Shift + Enter for a new line.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gray-200 bg-blue-50 px-4 py-3 sm:px-6">
        <p className="text-xs leading-5 text-blue-800">
          This assistant provides educational guidance using
          your CrediGuide data. It does not provide an official
          CIBIL score or professional financial advice.
        </p>
      </div>
    </div>
  );
}

export default FinancialChatbot;
