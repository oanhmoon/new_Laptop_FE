import React, { useState } from "react";
import { AppRouter } from "./config/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import các modal
import LoginModal from "./page/account/LoginModal";
import RegisterModal from "./page/account/RegisterModal";
import ForgotPasswordModal from "./page/account/ForgotPasswordModal";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  return (
    <>
      {/* Router chính */}
      <AppRouter />

      {/* Toast thông báo */}
      <ToastContainer />

      {/* Modal Đăng nhập */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onSwitchToForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotOpen(true);
        }}
      />

      {/* Modal Đăng ký */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* Modal Quên mật khẩu */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onSwitchToLogin={() => {
          setIsForgotOpen(false);
          setIsLoginOpen(true);
        }}
      />

      
    </>
  );
}

export default App;
