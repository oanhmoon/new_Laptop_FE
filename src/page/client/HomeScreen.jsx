import React, { useContext, useEffect, useState } from "react";


import { USER_LOGIN } from "../../Utils/Setting/Config";
import { useSelector } from "react-redux";
import HeroSection from "./HeroSection";
import ProductSections from "./ProductSections";
import Features from "./Features";
import TestimonialsNewsletter from "./TestimonialsNewsletter";
import ChatBox from "./SupportChat"; // chat cũ
import ChatBoxAI from "./ChatBot"; // chat mới
import khImg from '../../assets/kh.jpg';
import khImg2 from '../../assets/chatbot.jpg';
import "../style/HomeScreen.css";
import { NotificationContext } from "../../components/NotificationProvider";

const HomeScreen = () => {
  const { isAuthenticated } = useSelector((state) => state.UserReducer);
  const [userRole, setUserRole] = useState("");
  const [showChatBox, setShowChatBox] = useState(false);       // chat cũ
  const [showOpenAIChat, setShowOpenAIChat] = useState(false); // chat mới
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem(USER_LOGIN);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const notification = useContext(NotificationContext);

  useEffect(() => {
    if (isAuthenticated) {
      const userDetails = JSON.parse(localStorage.getItem(USER_LOGIN));
      if (userDetails && userDetails.role) {
        setUserRole(userDetails.role.name);
      }
    }
  }, [isAuthenticated]);
  

  const toggleChatBox = () => {
    if (!userData) {
      notification.warning({
        message: 'Thông báo',
        description: 'Đăng nhập để được hỗ trợ!',
        placement: 'topRight',
      });
      return;
    }
    setShowChatBox(!showChatBox);
  };

  const toggleOpenAIChat = () => {
    if (!userData) {
      notification.warning({
        message: 'Thông báo',
        description: 'Đăng nhập để sử dụng OpenAI Chat!',
        placement: 'topRight',
      });
      return;
    }
    setShowOpenAIChat(!showOpenAIChat);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-screen-container">
      <HeroSection />
      <ProductSections />
      <TestimonialsNewsletter />
      <Features />

      {/* Icon Chat cũ */}
      <div 
        className="chat-icon" 
        onClick={toggleChatBox} 
        style={{ position: "fixed", bottom: 90, right: 20, cursor: "pointer", zIndex: 1000 }}
      >
        <img src={khImg} alt="Chat Icon" style={{ width: 50, height: 50, borderRadius: "50%" }} />
      </div>

      {/* Chat cũ */}
      <ChatBox showChatBox={showChatBox} toggleChatBox={toggleChatBox} />
      



      {/* Icon Chat mới (OpenAI) */}
      <div 
        className="chat-icon" 
        onClick={toggleOpenAIChat} 
        style={{ position: "fixed", bottom: 20, right: 20, cursor: "pointer", zIndex: 1000 }}
      >
        <img src={khImg2} alt="OpenAI Chat Icon" style={{ width: 50, height: 50, borderRadius: "50%" }} />
      </div>

      {/* Chat mới (OpenAI) */}
      <ChatBoxAI showChatBox={showOpenAIChat} toggleChatBox={toggleOpenAIChat} />
    </div>
  );
};

export default HomeScreen;

