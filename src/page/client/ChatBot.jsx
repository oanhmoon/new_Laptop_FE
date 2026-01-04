import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendChat } from "../../Redux/actions/chatai";
import ReactMarkdown from "react-markdown";


export default function ChatBoxAI({ showChatBox, toggleChatBox }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);


  const dispatch = useDispatch();
  const chatState = useSelector((s) => s.chatReducer);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, showChatBox]);


  const onSend = async () => {
    if (!msg.trim()) return;


    const currentMsg = msg;   // ✅ giữ lại message
    setMsg("");               // ✅ clear input ngay
    inputRef.current?.focus();


    setHistory((prev) => [...prev, { role: "user", text: currentMsg }]);


    try {
      const botAnswer = await dispatch(sendChat(currentMsg));
      setHistory((prev) => [...prev, { role: "bot", text: botAnswer }]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { role: "bot", text: "❌ Lỗi server, vui lòng thử lại." }
      ]);
    }
  };


  if (!showChatBox) return null;


  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <span>🤖 Trợ lý Laptop AI</span>
        <span onClick={toggleChatBox} style={styles.close}>×</span>
      </div>


      {/* BODY */}
      <div style={styles.body}>
        {history.map((h, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: h.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 8
            }}
          >
          <div
  style={{
    ...styles.bubble,
    background: h.role === "user" ? "#1677ff" : "#f4f6f8",
    color: h.role === "user" ? "#fff" : "#1f1f1f"
  }}
>
  <ReactMarkdown
    components={{
      p: ({ children }) => (
        <p style={{ margin: "0 0 8px 0" }}>{children}</p>
      ),
      ul: ({ children }) => (
        <ul style={{ paddingLeft: 18, margin: "4px 0 8px" }}>{children}</ul>
      ),
      li: ({ children }) => (
        <li style={{ marginBottom: 4 }}>{children}</li>
      ),
      strong: ({ children }) => (
        <strong style={{ fontWeight: 600 }}>{children}</strong>
      )
    }}
  >
    {h.text}
  </ReactMarkdown>
</div>




          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>


      {/* WARNING */}
      <div style={styles.warning}>
        ⚠️ Thông tin do AI cung cấp có thể chưa hoàn toàn chính xác.
        Vui lòng kiểm tra lại trước khi quyết định mua hàng.
      </div>


      {/* INPUT */}
      <div style={styles.inputBox}>
        <input
          ref={inputRef}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Hỏi về laptop, cấu hình, chính sách..."
          style={styles.input}
        />
        <button
          onClick={onSend}
          style={styles.sendBtn}
          disabled={chatState.loading}
        >
          Gửi
        </button>
      </div>


      {chatState.loading && (
        <div style={styles.loading}>⏳ Đang xử lý...</div>
      )}
    </div>
  );
}


const styles = {
  wrapper: {
    position: "fixed",
    bottom: 140,
    right: 20,
    width: 380,
    height: 520,
    borderRadius: 20,
    background: "#ffffff",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.16)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
    overflow: "hidden",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont"
  },


  /* ===== HEADER ===== */
  header: {
    padding: "14px 18px",
    background: "linear-gradient(135deg, #1f6cff, #4f8dff)",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 15,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    letterSpacing: "0.2px"
  },


  close: {
    cursor: "pointer",
    fontSize: 22,
    opacity: 0.85,
    transition: "opacity 0.2s ease"
  },


  /* ===== CHAT BODY ===== */
  body: {
    flex: 1,
    padding: "16px 14px",
    overflowY: "auto",
    background: "#f5f7fb"
  },


  /* ===== CHAT BUBBLE ===== */
  bubble: {
    maxWidth: "78%",
    padding: "12px 14px",
    borderRadius: 18,
    fontSize: 14,
    lineHeight: 1.55,
    wordBreak: "break-word",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)"
  },


  /* ===== WARNING ===== */
  warning: {
    fontSize: 12,
    padding: "10px 14px",
    background: "#fff8e1",
    color: "#8a6d1d",
    borderTop: "1px solid #ffe8a1",
    lineHeight: 1.4
  },


  /* ===== INPUT ===== */
  inputBox: {
    display: "flex",
    alignItems: "center",
    padding: 10,
    gap: 8,
    borderTop: "1px solid #e6e9ef",
    background: "#ffffff"
  },


  input: {
    flex: 1,
    borderRadius: 22,
    border: "1px solid #d0d5dd",
    padding: "10px 14px",
    outline: "none",
    fontSize: 14,
    color: "#1f2937",
    background: "#ffffff"
  },


  sendBtn: {
    padding: "0 18px",
    height: 38,
    borderRadius: 20,
    border: "none",
    background: "linear-gradient(135deg, #1f6cff, #4f8dff)",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(31, 108, 255, 0.35)"
  },


  /* ===== LOADING ===== */
  loading: {
    textAlign: "center",
    fontSize: 12,
    paddingBottom: 8,
    color: "#6b7280"
  }
};
