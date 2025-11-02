

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CloseOutlined, PictureOutlined } from "@ant-design/icons";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDispatch, useSelector } from "react-redux";
import { USER_LOGIN } from "../../Utils/Setting/Config";
import { get_all_messages } from "../../Redux/actions/MessageThunk";
import "../style/ChatBox.css";

const ChatBox = ({ showChatBox, toggleChatBox }) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  const messagesFromStore = useSelector(
    (state) => state.MessageReducer.messages
  );
  const totalPages =
    useSelector((state) => state.MessageReducer.totalPages) || 1;
  const { isAuthenticated } = useSelector((state) => state.UserReducer);

  const chatContentRef = useRef(null);
  const lastScrollHeight = useRef(0);
  const userScrolling = useRef(false);

  // Lấy user ID khi login
  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem(USER_LOGIN));
      if (user?.id) {
        setUserId(user.id);
        setUserName(user.username);
      }
    }
  }, [isAuthenticated]);

  //  Load messages khi mở hộp chat
  useEffect(() => {
    if (userId && showChatBox) {
      dispatch(get_all_messages(page, 10, 1, userId)); // 1 là adminId
    }
  }, [userId, page, showChatBox, dispatch]);

  //  Cập nhật messages khi store thay đổi
  useEffect(() => {
    if (messagesFromStore.length > 0) {
      if (page === 0) {
        setMessages(messagesFromStore);
        scrollToBottom(false);
      } else {
        setMessages((prev) => [...messagesFromStore, ...prev]);
      }
    }
  }, [messagesFromStore]);

  //  Kết nối WebSocket
  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS("http://localhost:8081/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("✅ WebSocket connected (User)");
        client.subscribe(`/user/${userId}/queue/messages`, (message) => {
          const msg = JSON.parse(message.body);
          console.log("📩 Tin nhắn mới:", msg);
          setMessages((prev) => [...prev, msg]);
          setNewMessageAlert(true);
          if (!userScrolling.current) scrollToBottom(true);
        });
      },
      onStompError: (frame) => console.error("❌ STOMP error:", frame),
    });

    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, [userId]);

  //  Cuộn tải tin nhắn cũ
  const fetchOldMessages = useCallback(() => {
    if (!hasMore || !userId) return;
    if (page < totalPages - 1) setPage((prev) => prev + 1);
    else setHasMore(false);
  }, [page, hasMore, userId, totalPages]);

  const handleScroll = () => {
    const chatBox = chatContentRef.current;
    if (!chatBox) return;

    if (chatBox.scrollTop === 0 && hasMore) {
      lastScrollHeight.current = chatBox.scrollHeight;
      userScrolling.current = true;
      fetchOldMessages();
      setTimeout(() => {
        if (chatBox) {
          chatBox.scrollTo({
            top: chatBox.scrollHeight - lastScrollHeight.current,
            behavior: "auto",
          });
        }
      }, 200);
    }
  };

  //  Gửi tin nhắn text
  const sendMessage = () => {
    if (!messageInput.trim() || !stompClient || !userId) return;

    const msg = {
      senderId: userId,
      receiverId: 1, // adminId
      content: messageInput.trim(),
      messageType: "TEXT",
      mediaUrl: null,
      createdAt: new Date().toISOString(),
    };

    stompClient.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify(msg),
    });

    //setMessages((prev) => [...prev, msg]);
    setMessageInput("");
    scrollToBottom(true);
  };
  //  Upload ảnh/video
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !stompClient) return;

    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8081/api/v1/chat/upload", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Upload thất bại");

      const mediaUrl = await res.text();
      const messageType = file.type.startsWith("video") ? "VIDEO" : "IMAGE";

      const msg = {
        senderId: userId,
        receiverId: 1,
        content: "",
        messageType,
        mediaUrl,
        createdAt: new Date().toISOString(),
      };

      stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(msg),
      });

      //setMessages((prev) => [...prev, msg]);
      scrollToBottom(true);
    } catch (err) {
      console.error("❌ Lỗi upload:", err);
      alert("Tải file thất bại");
    }
  };

  //  Cuộn xuống cuối
  const scrollToBottom = (smooth) => {
    if (chatContentRef.current) {
      setTimeout(() => {
        chatContentRef.current.scrollTo({
          top: chatContentRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (showChatBox) setNewMessageAlert(false);
  }, [showChatBox]);

  return (
    <div className={`chat-box-container ${showChatBox ? "show" : ""}`}>
      {showChatBox && (
        <div className="chat-box">
          {/* Header */}
          <div className="chat-header">
            <span>Trò chuyện với hỗ trợ viên</span>
            {newMessageAlert && (
              <span className="new-message-alert">🔔 Tin nhắn mới</span>
            )}
            <button onClick={toggleChatBox} className="close-button">
              <CloseOutlined />
            </button>
          </div>

          {/* Nội dung chat */}
          <div
            className="chat-content"
            ref={chatContentRef}
            onScroll={handleScroll}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "10px",
              overflowY: "auto",
              height: "100%",
            }}
          >
            {hasMore && page < totalPages - 1 && (
              <p className="load-more" style={{ textAlign: "center" }}>
                Đang tải tin nhắn cũ...
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.senderId === userId ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px",
                    borderRadius: "10px",
                    backgroundColor:
                      msg.senderId === userId ? "#dcf8c6" : "#ececec",
                  }}
                >
                  {msg.messageType === "IMAGE" && msg.mediaUrl ? (
                    <img
                      src={msg.mediaUrl}
                      alt="img"
                      style={{ maxWidth: "250px", borderRadius: 8 }}
                    />
                  ) : msg.messageType === "VIDEO" && msg.mediaUrl ? (
                    <video
                      src={msg.mediaUrl}
                      controls
                      style={{ maxWidth: "300px", borderRadius: 8 }}
                    />
                  ) : (
                    <>
                      <strong>
                        {msg.senderId === userId ? "Bạn" : "Hỗ trợ viên"}:
                      </strong>{" "}
                      {msg.content}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ô nhập + upload */}
          <div className="chat-input">
            <label
              htmlFor="file-upload"
              style={{ cursor: "pointer", marginRight: "8px" }}
              title="Gửi ảnh / video"
            >
              <PictureOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;


