import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const STUDENT_SUGGESTIONS = [
  "How is my attendance looking?",
  "What assignments should I focus on?",
  "Summarize my latest campus updates",
];
const STAFF_SUGGESTIONS = [
  "Summarize attendance across my course",
  "Which students are below 75% attendance?",
  "What assignments are coming up?",
];

export default function CampusGPT() {
  const { user } = useAuth();
  const suggestions = user?.role === "student" ? STUDENT_SUGGESTIONS : STAFF_SUGGESTIONS;
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, sending]);

  async function sendMessage(text = draft) {
    const content = text.trim();
    if (!content || sending) return;
    const prior = messages;
    setMessages([...prior, { role: "user", content }]);
    setDraft("");
    setError("");
    setSending(true);
    try {
      const result = await api.chat(content, prior.slice(-8));
      setMessages((current) => [...current, { role: "assistant", content: result.answer, source: result.source }]);
    } catch (err) {
      setError(err.message || "Couldn't reach CampusGPT. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="gpt-page">
      <header className="gpt-heading">
        <div className="gpt-mark" aria-hidden="true">✦</div>
        <div>
          <p className="gpt-eyebrow">CAMPUS MIND ASSISTANT</p>
          <h1>My CampusGPT</h1>
          <p>Campus and academic help for {user?.fullName?.split(" ")[0] || "you"}.</p>
        </div>
      </header>

      <div className="gpt-chat" aria-live="polite">
        {messages.length === 0 ? (
          <div className="gpt-welcome">
            <h2>What can I help you with?</h2>
            <p>Ask about the academic and campus information available to your account.</p>
            <div className="gpt-suggestions">
              {suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendMessage(suggestion)}>{suggestion}<span>↗</span></button>)}
            </div>
          </div>
        ) : (
          <div className="gpt-messages">
            {messages.map((message, index) => (
              <article className={`gpt-message ${message.role}`} key={`${index}-${message.role}`}>
                <span className="gpt-avatar">{message.role === "user" ? "You" : "✦"}</span>
                <p>{message.content}</p>
              </article>
            ))}
            {sending && <article className="gpt-message assistant"><span className="gpt-avatar">✦</span><p className="gpt-typing">CampusGPT is thinking…</p></article>}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form className="gpt-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
        <label className="sr-only" htmlFor="gpt-prompt">Message My CampusGPT</label>
        <textarea id="gpt-prompt" rows="2" maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }}
          placeholder="Ask about attendance, assignments, campus updates…" disabled={sending} />
        <button className="btn-primary gpt-send" type="submit" disabled={!draft.trim() || sending} aria-label="Send message">↑</button>
        {error && <div className="gpt-error" role="alert">{error}</div>}
      </form>
      <p className="gpt-note">CampusGPT uses the records your role is allowed to see. Confirm important decisions with your university.</p>
    </section>
  );
}
