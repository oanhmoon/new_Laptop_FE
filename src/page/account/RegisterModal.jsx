
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  requestRegisterOtp,
  verifyRegisterOtp,
  confirmRegister,
} from "../../Redux/actions/UserThunk";
import "./RegisterModal.css";

const RegisterModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset state mỗi khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm({
        username: "",
        password: "",
        fullName: "",
        email: "",
        otp: "",
      });
      setError("");
      setSuccess("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateBeforeOtp = () => {
    const { username, password, fullName, email } = form;
    if (!username || !password || !fullName || !email) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return false;
    }
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt"
      );
      return false;
    }
    return true;
  };

  const handleRequestOtp = async () => {
    if (!validateBeforeOtp()) return;

    setIsLoading(true);
    try {
      const res = await dispatch(requestRegisterOtp(form.email));
      if (res?.error) {
        setError(res.error.message);
      } else {
        setSuccess(res.message || "OTP đã được gửi đến email!");
        setStep(2);
      }
    } catch (err) {
      setError(err.message || "Gửi OTP thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otp) {
      setError("Vui lòng nhập OTP");
      return;
    }

    setIsLoading(true);
    try {
      const res = await dispatch(verifyRegisterOtp(form.email, form.otp));
      if (res?.error) {
        setError(res.error.message);
      } else {
        const result = await dispatch(
          confirmRegister(
            form.username,
            form.password,
            form.fullName,
            form.email
          )
        );
        if (result?.error) {
          setError(result.error.message);
        } else {
          setSuccess("Đăng ký thành công!");
          // Đóng modal sau 1.5s để user thấy message
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`register-modal ${isOpen ? "open" : ""}`}>
      <div className="register-modal__overlay" onClick={onClose} />
      <div className="register-modal__content">
        <div className="register-modal__header">
          <h2 className="register-modal__title">Đăng ký tài khoản</h2>
          <button
            className="register-modal__close"
            onClick={onClose}
            disabled={isLoading}
          >
            X
          </button>
        </div>

        {/* Hiển thị error & success */}
        {error && <div className="register-modal__error">{error}</div>}
        {success && <div className="register-modal__success">{success}</div>}

        {step === 1 && (
          <div className="register-form">
            <input
              name="username"
              placeholder="Tên đăng nhập"
              value={form.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              name="fullName"
              placeholder="Tên hiển thị"
              value={form.fullName}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <button onClick={handleRequestOtp} disabled={isLoading}>
              {isLoading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="register-form">
            <input
              name="otp"
              placeholder="Nhập OTP"
              value={form.otp}
              onChange={handleChange}
              disabled={isLoading}
            />
            <button onClick={handleVerifyOtp} disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Xác minh & Đăng ký"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterModal;



