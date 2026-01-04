import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../Redux/actions/UserThunk";
import { User, Loader2, X, Eye, EyeOff } from "lucide-react";

import "./Login.css";

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({ username: false, password: false });
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (!isOpen) {
      setFormData({ username: "", password: "" });
      setError("");
      setInputErrors({ username: false, password: false });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id in inputErrors) setInputErrors((prev) => ({ ...prev, [id]: false }));
    if (error) setError("");
  };

  const validateForm = () => {
    const errors = {
      username: !formData.username.trim(),
      password: !formData.password,
    };
    setInputErrors(errors);
    if (errors.username || errors.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await dispatch(
        loginUser({ username: formData.username.trim(), password: formData.password })
      );

      if (result?.error) throw new Error(result.error.message || "Đăng nhập thất bại");

      if (result?.success) {
        onClose();
      } else {
        throw new Error("Không nhận được token đăng nhập");
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`login-modal ${isOpen ? "open" : ""}`}>
      <div className="login-modal__overlay" onClick={onClose} />
      <div className="login-modal__content">
        <div className="login-modal__header">
          <h2 className="login-modal__title">
            <User size={20} className="icon" /> Đăng nhập
          </h2>
          <button className="login-modal__close" onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="login-modal__error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className={`form-group ${inputErrors.username ? "error" : ""}`}>
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="username"
            />
            {inputErrors.username && <span className="error-message">Vui lòng nhập tên đăng nhập</span>}
          </div>

          <div className={`form-group ${inputErrors.password ? "error" : ""}`}>
  <label htmlFor="password">Mật khẩu</label>

  <div className="input-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      id="password"
      placeholder="Nhập mật khẩu"
      value={formData.password}
      onChange={handleChange}
      disabled={isLoading}
      autoComplete="current-password"
    />

    {/* Icon toggle ẩn/hiện mật khẩu - CHỈ CÒN ICON NÀY */}
    <button
      type="button"
      className="toggle-password-btn"
      onClick={() => setShowPassword((prev) => !prev)}
      disabled={isLoading}
    >
      {showPassword ? (
        <EyeOff size={18} className="eye-icon" />
      ) : (
        <Eye size={18} className="eye-icon" />
      )}
    </button>
  </div>

  {inputErrors.password && (
    <span className="error-message">Vui lòng nhập mật khẩu</span>
  )}
</div>



          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Đang xử lý...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <div className="extra-actions">
            <button
              type="button"
              className="forgot-password-link"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToForgotPassword?.();
              }}
              disabled={isLoading}
            >
              Quên mật khẩu?
            </button>
          </div>

          <div className="register-prompt">
            Chưa có tài khoản?{" "}
            <button type="button" className="register-link" onClick={onSwitchToRegister} disabled={isLoading}>
              Đăng ký ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
