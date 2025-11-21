import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Space, Dropdown, Menu } from 'antd';
import {
    Menu as MenuIcon,
    User,
    Heart,
    ShoppingCart,
    Phone,
    LogOut,
    TicketPercent,
    Key,
    History,
    HistoryIcon,
} from 'lucide-react';
import './Header.css';
import logo from '../../assets/logo.jpg';
import LoginModal from "../../page/account/LoginModal";
import RegisterModal from "../../page/account/RegisterModal";
import ChangePasswordModal from "../../page/account/ChangePasswordModal";
import ForgotPasswordModal from "../../page/account/ForgotPasswordModal";
import { NotificationContext } from "../NotificationProvider";
import SearchBar from "../../page/client/SearchBar";
import { useDispatch } from "react-redux";
import { totalCartItem } from "../../Redux/actions/CartItemThunk";
import { getUserBalance } from "../../Redux/actions/UserThunk";
import { MoneyCollectOutlined } from "@ant-design/icons";

const Header = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const [userData, setUserData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [balance, setBalance] = useState(0);
    const [totalCartItems, setTotalCartItems] = useState(0);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notification = useContext(NotificationContext);

    const handleLoginClick = () => {
        setShowLoginModal(true);
        setShowRegisterModal(false);
        setShowForgotPasswordModal(false);
    };

    const switchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const switchToLogin = () => {
        setShowRegisterModal(false);
        setShowForgotPasswordModal(false);
        setShowLoginModal(true);
    };

    const switchToForgotPassword = () => {
        setShowLoginModal(false);
        setShowForgotPasswordModal(true);
    };

    const closeLoginModal = () => setShowLoginModal(false);
    const closeRegisterModal = () => setShowRegisterModal(false);
    const closeForgotPasswordModal = () => setShowForgotPasswordModal(false);
    const toggleChangePasswordModal = () => setIsChangePasswordModalOpen(!isChangePasswordModalOpen);

    const handleLoginSuccess = (user) => {
        setUserData(user);
        setShowLoginModal(false);
    };

    const handleRegisterSuccess = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('USER_LOGIN');
        localStorage.removeItem('TOKEN');
        setUserData(null);
        navigate('/');
    };

    // Load cart items count
    useEffect(() => {
        if (!userData?.id) return;
        const fetchCart = async () => {
            try {
                const res = await dispatch(totalCartItem(userData.id));
                setTotalCartItems(res);
            } catch (err) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải dữ liệu giỏ hàng',
                    placement: 'topRight',
                });
            }
        };
        fetchCart();
    }, [dispatch, userData?.id, notification]);

    // Load user balance
    useEffect(() => {
        if (!userData?.id) return;
        const fetchBalance = async () => {
            try {
                const res = await dispatch(getUserBalance(userData.id));
                setBalance(res.data);
            } catch (err) {}
        };
        fetchBalance();
    }, [dispatch, userData?.id]);

    // User dropdown menu
    const userMenu = (
        <Menu>
            <Menu.Item key="balance" style={{ cursor: 'default', backgroundColor: '#fafafa', color: '#1890ff', fontWeight: 500 }} disabled>
                <Space>
                    <MoneyCollectOutlined />
                    Số dư: {balance || 0} đ
                </Space>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="orders" icon={<History />} onClick={() => navigate(`/history/${userData.id}`)}>
                Lịch sử mua hàng
            </Menu.Item>
            <Menu.Item key="wallet" icon={<MoneyCollectOutlined />} onClick={() => navigate(`/wallet/${userData.id}`)}>
                Rút tiền từ ví TechWallets
            </Menu.Item>
            <Menu.Item key="wallet-history" icon={<HistoryIcon />} onClick={() => navigate(`/wallet-history/${userData.id}`)}>
                Lịch sử rút tiền
            </Menu.Item>
            <Menu.Item key="change-password" icon={<Key />} onClick={toggleChangePasswordModal}>
                Đổi mật khẩu
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogOut />} onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar">
                <div className="container">
                    <div className="top-links">
                        <span className="contact-link">
                            <Phone className="phone-icon" />
                            Hotline: 1800-123-4567
                        </span>
                        <Link to="/stores" className="top-link">Cửa hàng</Link>
                        <Link to="/policy" className="top-link">Chính sách</Link>
                    </div>

                    <div className="auth-links">
                        {userData ? (
                            <span className="welcome-message">
                                Xin chào, <strong>{userData.fullName || userData.email}</strong>
                            </span>
                        ) : (
                            <>
                                <span className="top-link" onClick={handleLoginClick}>Đăng nhập</span>
                                <span className="divider">|</span>
                                <span className="top-link" onClick={switchToRegister}>Đăng ký</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="main-header">
                <div className="container">
                    <div className="header-left">
                        <Button type="text" className="mobile-menu-button">
                            <MenuIcon className="menu-icon" />
                        </Button>
                        <Link to="/" className="logo-link">
                            <img src={logo} alt="TechLaptop Logo" className="logo-image" />
                            <span className="logo-text">OHT STORE</span>
                        </Link>
                    </div>

                    <SearchBar />

                    <div className="header-right">
                        <Button
    type="text"
    className="header-icon"
    onClick={() => {
        if (!userData?.id) {
            notification.error({
                message: 'Thông báo',
                description: 'Vui lòng đăng nhập để xem sản phẩm yêu thích!',
                placement: 'topRight',
            });
            return;
        }
        navigate(`/favorites/${userData.id}`);
    }}
>
    <Heart className="icon" />
</Button>
                        {userData ? (
                            

                            <Dropdown overlay={userMenu} placement="bottomRight">
                                <Button type="text" className="header-icon">
                                    <User className="icon" />
                                </Button>
                            </Dropdown>
                        ) : (
                            <Button type="text" className="header-icon" onClick={handleLoginClick}>
                                <User className="icon" />
                            </Button>
                        )}

                        <Button type="text" className="header-icon" onClick={() => navigate(`/voucher`)}>
                            <TicketPercent className="icon" />
                        </Button>

                        <Button type="text" className="cart-button" onClick={() => {
                            if (!userData?.id) {
                                notification.error({ message: 'Thông báo', description: `Vui lòng đăng nhập!`, placement: 'topRight' });
                                return;
                            }
                            navigate(`/cart/${userData.id}`);
                        }}>
                            <Badge count={totalCartItems || 0} className="cart-badge">
                                <ShoppingCart className="icon" />
                            </Badge>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Authentication Modals */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={closeLoginModal}
                onSwitchToRegister={switchToRegister}
                onSwitchToForgotPassword={switchToForgotPassword}
                onLoginSuccess={handleLoginSuccess}
            />

            <RegisterModal
                isOpen={showRegisterModal}
                onClose={closeRegisterModal}
                onSwitchToLogin={switchToLogin}
                onRegisterSuccess={handleRegisterSuccess}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={toggleChangePasswordModal}
            />

            <ForgotPasswordModal
                isOpen={showForgotPasswordModal}
                onClose={closeForgotPasswordModal}
                onSwitchToLogin={switchToLogin}
            />
        </>
    );
};

export default Header;
