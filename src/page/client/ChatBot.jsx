import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendChat } from "../../Redux/actions/chatai";

export default function ChatBoxAI({ showChatBox, toggleChatBox }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const chatState = useSelector((s) => s.chatReducer);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, showChatBox]);

  const onSend = async () => {
    if (!msg.trim()) return;

    setHistory((prev) => [...prev, { role: "user", text: msg }]);
    try {
      const botAnswer = await dispatch(sendChat(msg));
      setHistory((prev) => [...prev, { role: "bot", text: botAnswer }]);
    } catch (err) {
      setHistory((prev) => [...prev, { role: "bot", text: "❌ Lỗi server, vui lòng thử lại." }]);
    }
    setMsg("");
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
                background: h.role === "user" ? "#1677ff" : "#f1f1f1",
                color: h.role === "user" ? "#fff" : "#000",
                borderBottomRightRadius: h.role === "user" ? 4 : 16,
                borderBottomLeftRadius: h.role === "user" ? 16 : 4
              }}
            >
              {h.text}
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
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Hỏi về laptop, cấu hình, chính sách..."
          style={styles.input}
        />
        <button onClick={onSend} style={styles.sendBtn}>
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
    height: 480,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
    overflow: "hidden"
  },
  header: {
    padding: "12px 16px",
    background: "linear-gradient(135deg, #1677ff, #69b1ff)",
    color: "#fff",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  close: {
    cursor: "pointer",
    fontSize: 20
  },
  body: {
    flex: 1,
    padding: 12,
    overflowY: "auto",
    background: "#fafafa"
  },
  bubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.4
  },
  warning: {
    fontSize: 12,
    padding: "8px 12px",
    background: "#fffbe6",
    color: "#ad8b00",
    borderTop: "1px solid #ffe58f"
  },
  inputBox: {
    display: "flex",
    padding: 8,
    borderTop: "1px solid #eee"
  },
  input: {
    flex: 1,
    borderRadius: 20,
    border: "1px solid #ddd",
    padding: "8px 12px",
    outline: "none",
    fontSize: 14
  },
  sendBtn: {
    marginLeft: 8,
    padding: "0 16px",
    borderRadius: 20,
    border: "none",
    background: "#1677ff",
    color: "#fff",
    cursor: "pointer"
  },
  loading: {
    textAlign: "center",
    fontSize: 12,
    paddingBottom: 6,
    color: "#888"
  }
};
