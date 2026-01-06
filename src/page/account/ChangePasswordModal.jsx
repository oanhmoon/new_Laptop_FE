import React, { useState } from 'react';
import { useDispatch } from 'react-redux'; // Import dispatch to trigger Redux actions
import { changePassword } from '../../Redux/actions/UserThunk'; // Import changePassword action
import "./changepass.css";
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import { message } from 'antd';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch(); // Initialize the Redux dispatch
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();


    const isStrongPassword = (password) => {
        const minLength = password.length >= 8;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasUppercase = /[A-Z]/.test(password);

        return minLength && hasSpecialChar && hasNumber && hasUppercase;
    };


    // Reset form when closing modal
    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setIsLoading(false);
        onClose();
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     if (newPassword !== confirmPassword) {
    //         setError('Mật khẩu xác nhận không khớp');
    //         return;
    //     }

    //     setIsLoading(true);
    //     setError(''); // Reset error before making the API call
    //     try {
    //         const result = await dispatch(changePassword(currentPassword, newPassword, confirmPassword));
    //         console.log(result); // Check the result here
    //         setIsLoading(false);
    //         handleClose(); // Close modal after successful password change
    //     } catch (error) {
    //         console.error("Đã xảy ra lỗi:", error);
    //         setError('Đã xảy ra lỗi khi thay đổi mật khẩu');
    //         setIsLoading(false);
    //     }
    // };
    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     if (newPassword !== confirmPassword) {
    //         setError('Mật khẩu xác nhận không khớp');
    //         return;
    //     }

    //     if (!isStrongPassword(newPassword)) {
    //         setError(
    //             'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt'
    //         );
    //         return;
    //     }

    //     setIsLoading(true);
    //     setError('');

    //     // try {
    //     //     await dispatch(changePassword(currentPassword, newPassword, confirmPassword));
    //     //     handleClose();
    //     // } catch (err) {
    //     //     // BẮT LỖI BACKEND
    //     //     if (err?.response?.data?.message) {
    //     //         setError(err.response.data.message);
    //     //     } else {
    //     //         setError('Đã xảy ra lỗi khi thay đổi mật khẩu');
    //     //     }
    //     // } finally {
    //     //     setIsLoading(false);
    //     // }
    //     try {
    //         const res = await dispatch(
    //             changePassword(currentPassword, newPassword, confirmPassword)
    //         );

    //         console.log("CHANGE PASSWORD RESPONSE:", res);

    //         message.success(res?.message || "Đổi mật khẩu thành công");

    //         setTimeout(() => {
    //             handleClose();
    //         }, 1000); 

    //         } catch (err) {
    //         if (err?.response?.data?.message) {
    //             setError(err.response.data.message);
    //         } else {
    //             setError("Đã xảy ra lỗi khi thay đổi mật khẩu");
    //         }
    //         } finally {
    //         setIsLoading(false);
    //         }


    // };
    const handleSubmit = async (e) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    setError("Mật khẩu xác nhận không khớp");
    return;
  }

  if (!isStrongPassword(newPassword)) {
    setError(
      "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt"
    );
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    const res = await dispatch(
      changePassword(currentPassword, newPassword, confirmPassword)
    );

    console.log("CHANGE PASSWORD RESPONSE:", res);

    messageApi.success(res?.message || "Đổi mật khẩu thành công");

    setTimeout(() => {
      handleClose();
    }, 1000); // 1s như bạn muốn

  } catch (err) {
    if (err?.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("Đã xảy ra lỗi khi thay đổi mật khẩu");
    }
  } finally {
    setIsLoading(false);
  }
};



    const togglePasswordVisibility = (field) => {
        if (field === 'current') setShowCurrentPassword(!showCurrentPassword);
        if (field === 'new') setShowNewPassword(!showNewPassword);
        if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
    };

    if (!isOpen) return null;

    return (
        <>
    {contextHolder}
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose}>
                    <FaTimes />
                </button>
                <h2>Thay đổi mật khẩu</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                        <div className="password-input-container">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />

                          <span
                            className="eye-icon"
                            onClick={() => togglePasswordVisibility("current")}
                          >
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">Mật khẩu mới</label>
                        <div className="password-input-container">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />

                          <span
                            className="eye-icon"
                            onClick={() => togglePasswordVisibility("new")}
                          >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                        <div className="password-input-container">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />

                          <span
                            className="eye-icon"
                            onClick={() => togglePasswordVisibility("confirm")}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>

                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default ChangePasswordModal;
