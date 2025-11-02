
import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Input,
  Button,
  Avatar,
  Typography,
  List,
  message as antdMessage,
} from "antd";
import {
  SendOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import {
  get_all_messages,
  get_all_users,
  upload_file_thunk,
} from "../../Redux/actions/MessageThunk";
import { USER_LOGIN } from "../../Utils/Setting/Config";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const ChatManager = () => {
  const dispatch = useDispatch();

  const [adminId, setAdminId] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);

  const users = useSelector((state) => state.MessageReducer.users);
  const messagesFromStore = useSelector(
    (state) => state.MessageReducer.messages
  );

  const chatContentRef = useRef(null);
  const fileInputRef = useRef(null);

const openFileDialog = () => {
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
};

  // 🟢 Lấy adminId từ localStorage
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem(USER_LOGIN));
    if (admin?.id) setAdminId(admin.id);
  }, []);

  // 🟢 Kết nối WebSocket
  useEffect(() => {
    if (!adminId) return;

    const socket = new SockJS("http://localhost:8081/ws");
    const client = Stomp.over(socket);

    client.connect({}, () => {
      client.subscribe(`/user/${adminId}/queue/messages`, (message) => {
        try {
          const msg = JSON.parse(message.body);
          console.log("📩 WS message:", msg);
          // Nếu là cuộc trò chuyện đang mở
          if (msg.senderId === activeUser || msg.receiverId === activeUser) {
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
          }
        } catch (err) {
          console.error("Lỗi nhận tin nhắn:", err);
        }
      });
    });

    setStompClient(client);
    return () => client.disconnect();
  }, [adminId, activeUser]);

  // 🟢 Lấy danh sách user
  useEffect(() => {
    dispatch(get_all_users(0, 10));
  }, [dispatch]);

  // 🟢 Khi chọn user để chat
  useEffect(() => {
    if (activeUser && adminId) {
      dispatch(get_all_messages(0, 20, adminId, activeUser));
    }
  }, [activeUser, adminId, dispatch]);

  // 🟢 Khi Redux cập nhật messages
  useEffect(() => {
    if (messagesFromStore.length > 0) {
      setMessages(messagesFromStore);
      scrollToBottom();
    }
  }, [messagesFromStore]);

  // 🟢 Gửi tin nhắn text
  const sendMessage = () => {
    if (!messageInput.trim() || !stompClient || !activeUser) return;

    const msg = {
      senderId: adminId,
      receiverId: activeUser,
      content: messageInput,
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
    };

    stompClient.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify(msg),
    });

    //setMessages((prev) => [...prev, msg]);
    setMessageInput("");
    scrollToBottom();
  };

  // 🟢 Gửi file ảnh / video
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !activeUser || !stompClient) return;

    try {
      // Gọi API BE upload -> Cloudinary -> trả về URL
      const res = await dispatch(upload_file_thunk(file));
      const url = res; // thunk sẽ return URL string
      const type = file.type.startsWith("video") ? "VIDEO" : "IMAGE";

      const msg = {
        senderId: adminId,
        receiverId: activeUser,
        content: "",
        messageType: type,
        mediaUrl: url,
        createdAt: new Date().toISOString(),
      };

      stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(msg),
      });

      //setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    } catch (err) {
      console.error("Upload error:", err);
      antdMessage.error("Tải tệp thất bại");
    }
  };

  // 🟢 Cuộn xuống cuối khi có tin mới
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContentRef.current) {
        chatContentRef.current.scrollTop =
          chatContentRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <Layout style={{ height: "80vh" }}>
      {/* Sidebar */}
      <Sider width={250} style={{ background: "#fff", borderRight: "1px solid #eee" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
          <Title level={4}>
            <MessageOutlined /> Người dùng
          </Title>
        </div>

        <List
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              onClick={() => setActiveUser(user.id)}
              style={{
                cursor: "pointer",
                background: activeUser === user.id ? "#e6f7ff" : "transparent",
                padding: 10,
              }}
            >
              <Avatar style={{ backgroundColor: "#1890ff" }}>
                {user.userName?.charAt(0).toUpperCase()}
              </Avatar>
              <span style={{ marginLeft: 10 }}>{user.userName}</span>
            </List.Item>
          )}
        />
      </Sider>

      {/* Chat main */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #eee",
            paddingLeft: 20,
          }}
        >
          <Title level={4}>
            {activeUser
              ? `Đang trò chuyện với ${
                  users.find((u) => u.id === activeUser)?.userName ||
                  `User ${activeUser}`
                }`
              : "Chưa chọn người dùng"}
          </Title>
        </Header>

        <Content style={{ padding: 16 }}>
          <div
            ref={chatContentRef}
            style={{
              height: "60vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: m.senderId === adminId ? "right" : "left",
                  marginBottom: 10,
                }}
              >
                {m.messageType === "IMAGE" ? (
                  <img
                    src={m.mediaUrl}
                    alt="img"
                    style={{ maxWidth: 250, borderRadius: 8 }}
                  />
                ) : m.messageType === "VIDEO" ? (
                  <video
                    src={m.mediaUrl}
                    controls
                    style={{ maxWidth: 300, borderRadius: 8 }}
                  />
                ) : (
                  <div
                    style={{
                      display: "inline-block",
                      background:
                        m.senderId === adminId ? "#1890ff" : "#f0f0f0",
                      color: m.senderId === adminId ? "#fff" : "#000",
                      padding: "8px 12px",
                      borderRadius: 8,
                      maxWidth: "70%",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {/* <label>
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={handleFileUpload}
              />
              <Button icon={<PictureOutlined />} />
            </label> */}
            <input
  ref={fileInputRef}
  type="file"
  accept="image/*,video/*"
  hidden
  onChange={handleFileUpload}
/>

<Button
  icon={<PictureOutlined />}
  onClick={openFileDialog}
/>

            <Input.TextArea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Nhập tin nhắn..."
              autoSize={{ minRows: 1, maxRows: 3 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChatManager;
