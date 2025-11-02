import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { sendOtp, resetPassword } from "../../Redux/actions/UserThunk";
import { Loader2, X } from "lucide-react";
import "./ForgotPasswordModal.css";

const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset modal khi đóng
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
      setError("");
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError("");
  };

  // Gửi OTP
  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(sendOtp(formData.email));
      if (result?.error) {
        setError(result.error.message || "Gửi OTP thất bại");
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || "Gửi OTP thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Đặt lại mật khẩu
  const handleResetPassword = async () => {
    const { otp, newPassword, confirmPassword } = formData;

    if (!otp || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // ✅ Kiểm tra độ mạnh của mật khẩu
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(resetPassword(formData));
      if (result?.error) {
        setError(result.error.message || "Đặt lại mật khẩu thất bại");
      } else {
        alert("Đặt lại mật khẩu thành công!");
        onClose();
      }
    } catch (err) {
      setError(err.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`forgot-modal ${isOpen ? "open" : ""}`}
      style={{ zIndex: 1100 }}
    >
      <div className="forgot-modal__overlay" onClick={onClose} />
      <div className="forgot-modal__content">
        <div className="forgot-modal__header">
          <h2 className="forgot-modal__title">Quên mật khẩu</h2>
          <button
            className="forgot-modal__close"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {error && <div className="forgot-modal__error">{error}</div>}

        {/* STEP 1: Nhập email */}
        {step === 1 && (
          <div className="forgot-step1">
            <label>Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              disabled={isLoading}
            />
            <button onClick={handleSendOtp} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Đang gửi...
                </>
              ) : (
                "Gửi OTP"
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Nhập OTP và mật khẩu mới */}
        {step === 2 && (
          <div className="forgot-step2">
            <label>OTP</label>
            <input
              id="otp"
              type="text"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Nhập mã OTP"
              disabled={isLoading}
            />

            <label>Mật khẩu mới</label>
            <input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              disabled={isLoading}
            />

            <label>Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu"
              disabled={isLoading}
            />

            <button onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Đang xử lý...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
