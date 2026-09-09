import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function ConneXLogo() {
  return (
    <div className="connex-logo">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 8L24 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M24 8L8 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="8" cy="8" r="3" fill="currentColor" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
        <circle cx="24" cy="8" r="3" fill="currentColor" />
        <circle cx="8" cy="24" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const currentMessage = message;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: currentMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/chat?message=${encodeURIComponent(
          currentMessage
        )}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("RATE_LIMIT");
        }

        throw new Error("SERVER_ERROR");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply,
          confirmationRequired: data.confirmation_required,
        },
      ]);
    } catch (error) {
      let errorMessage =
        "Something went wrong. Please try again.";

      if (error.message === "RATE_LIMIT") {
        errorMessage =
          "ConneX AI is temporarily unavailable. Please try again in a moment.";
      } else if (error.message === "SERVER_ERROR") {
        errorMessage =
          "ConneX could not process your request. Please try again.";
      } else if (error instanceof TypeError) {
        errorMessage =
          "Unable to connect to the ConneX backend.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const confirmTask = async (confirmed) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.confirmationRequired
          ? { ...msg, confirmationRequired: false }
          : msg
      )
    );

    try {
      const response = await fetch("http://127.0.0.1:8000/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmed }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Unable to complete the action.",
        },
      ]);
    }
  };

  return (
    <div className="app">

      {/* Brand */}
      <aside className="brand-area">
        <div className="brand-card">

          <div className="brand-main">
            <ConneXLogo />

            <div className="brand-text">
              <div className="brand-name">ConneX</div>
              <div className="brand-subtitle">AI Operator</div>
            </div>
          </div>

          <button
            className="new-chat"
            onClick={() => setMessages([])}
          >
            <span className="plus">+</span>
            <span>New conversation</span>
          </button>

        </div>
      </aside>

      {/* User */}
      <header className="topbar">
        <div className="avatar">DP</div>
      </header>

      <main className="main">

        <section className="chat">

          {messages.length === 0 && (
            <div className="welcome">

              <div className="welcome-logo">
                <ConneXLogo />
              </div>

              <h1>How can I help?</h1>

              <p>
                Ask about your leads or let ConneX handle CRM tasks for you.
              </p>

              <div className="suggestions">

                <button
                  onClick={() =>
                    setMessage("How many new leads do we have?")
                  }
                >
                  How many new leads do we have?
                </button>

                <button
                  onClick={() =>
                    setMessage("Show me leads from TechFlow")
                  }
                >
                  Show me leads from TechFlow
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "Create a task to call Aisha Khan on Friday"
                    )
                  }
                >
                  Create a task for Aisha Khan
                </button>

              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${msg.role === "user" ? "user-row" : ""
                }`}
            >

              {msg.role === "assistant" && (
                <div className="ai-avatar">
                  <ConneXLogo />
                </div>
              )}

              <div
                className={`message ${msg.role === "user"
                  ? "user-message"
                  : "ai-message"
                  }`}
              >

                <div className="message-label">
                  {msg.role === "user" ? "You" : "ConneX AI"}
                </div>

                <div className="message-text">
                  {msg.role === "assistant" ? (
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>

                {msg.confirmationRequired && (
                  <div className="confirmation-card">

                    <div className="confirmation-title">
                      Confirm action
                    </div>

                    <div className="confirmation-buttons">

                      <button
                        className="confirm"
                        onClick={() => confirmTask(true)}
                      >
                        Confirm
                      </button>

                      <button
                        className="cancel"
                        onClick={() => confirmTask(false)}
                      >
                        Cancel
                      </button>

                    </div>

                  </div>
                )}

              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row">

              <div className="ai-avatar">
                <ConneXLogo />
              </div>

              <div className="message ai-message thinking-message">

                <div className="message-label">
                  ConneX AI
                </div>

                <div className="thinking">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span className="thinking-text">
                    ConneX is thinking...
                  </span>
                </div>

              </div>

            </div>
          )}

          <div ref={chatEndRef} />

        </section>

        <div className="input-container">

          <div className="input-box">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask ConneX anything..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              disabled={loading}
            />

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={!message.trim() || loading}
            >
              ↑
            </button>

          </div>

          <p className="disclaimer">
            ConneX AI can make mistakes. Verify important actions before confirming.
          </p>

        </div>

      </main>

    </div>
  );
}

export default App;