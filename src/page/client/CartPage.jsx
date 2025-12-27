

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { Button, Input, message, Pagination, Tag, Checkbox, Spin } from "antd";
import "../style/CartPage.css";
import { NotificationContext } from "../../components/NotificationProvider";
import {
    deleteAllCartItems,
    deleteCartItem,
    getCartItemByIdUser,
    updateCartItemQuantity
} from "../../Redux/actions/CartItemThunk";
import { useDispatch } from "react-redux";
import ConfirmDeleteModal from "../../components/ModalComponents/ConfirmDeleteModal";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAllVoucher } from "../../Redux/actions/VoucherThunk";

// Constants
const PAGE_SIZE = 5;
const SHIPPING_FEE = 30000;
const FREE_SHIPPING_THRESHOLD = 1000000;

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [discountCode, setDiscountCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const notification = useContext(NotificationContext);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [userData, setUserData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [updatingQuantities, setUpdatingQuantities] = useState({});
    const [vouchers, setVouchers] = useState([]);

    // fetch vouchers
    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const response = await dispatch(getAllVoucher(null, null, null, null, null, 1, 100, null, null));
                if (response && response.content) {
                    setVouchers(response.content);
                }
            } catch (error) {
                console.error("Error fetching vouchers:", error);
            }
        };

        fetchVouchers();
    }, [dispatch]);

    // fetch cart items
    useEffect(() => {
        const fetchCartItems = async () => {
            if (!userData?.id) {
                setCartItems([]);
                setTotalItems(0);
                setSelectedProducts([]);
                return;
            }

            setLoading(true);
            try {
                const response = await dispatch(getCartItemByIdUser(currentPage - 1, PAGE_SIZE, userData.id));
                const items = response?.content || [];
                setCartItems(items);
                setTotalItems(response?.totalElements || 0);

                // chọn mặc định 1 item hợp lệ (nếu trước đó không có selection)
                // hoặc lọc selection hiện có để loại bỏ item không hợp lệ (hết hàng hoặc quantity > stock)
                setSelectedProducts(prev => {
                    // nếu chưa có selection, chọn item đầu tiên hợp lệ
                    const validIds = items
                        .filter(p => {
                            const avail = Number(p.availableStock ?? 0);
                            return avail > 0 && (p.quantity <= avail);
                        })
                        .map(p => p.id);

                    if (!prev || prev.length === 0) {
                        return validIds.length > 0 ? [validIds[0]] : [];
                    }

                    // giữ lại những id vẫn hợp lệ
                    return prev.filter(id => validIds.includes(id));
                });
            } catch (error) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải giỏ hàng',
                    placement: 'topRight',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchCartItems();
    }, [currentPage, userData?.id, dispatch, notification]);

    const showPagination = totalItems > PAGE_SIZE;

    // select / deselect a product
    const handleSelectProduct = (productId, checked) => {
        if (checked) {
            setSelectedProducts(prev => {
                if (!prev.includes(productId)) return [...prev, productId];
                return prev;
            });
        } else {
            setSelectedProducts(prev => prev.filter(id => id !== productId));
        }
    };

    // select all only valid items on current page
    const handleSelectAll = (checked) => {
        if (checked) {
            const currentPageIds = cartItems
                .filter(p => {
                    const avail = Number(p.availableStock ?? 0);
                    const isOut = avail <= 0;
                    const isExceed = p.quantity > avail;
                    return !isOut && !isExceed;
                })
                .map(p => p.id);
            setSelectedProducts(Array.from(new Set(currentPageIds)));
            setSelectAll(true);
        } else {
            setSelectedProducts([]);
            setSelectAll(false);
        }
    };

    const { selectedSubtotal, selectedDiscountValue, shippingFee, selectedTotal } = useMemo(() => {
        const subtotal = cartItems
            .filter(item => selectedProducts.includes(item.id))
            .reduce((sum, item) => {
                const price = Number(item.basePrice ?? 0);
                return sum + (price * Number(item.quantity ?? 0));
            }, 0);

        let discountValue = 0;
        if (appliedVoucher) {
            if (appliedVoucher.discountType === 'PERCENT') {
                discountValue = subtotal * (appliedVoucher.discountValue / 100);
            } else if (appliedVoucher.discountType === 'FIXED') {
                discountValue = Math.min(appliedVoucher.discountValue, subtotal);
            }
        }

        let calculatedShippingFee = SHIPPING_FEE;
        if (appliedVoucher?.code === "FREESHIP" || subtotal >= FREE_SHIPPING_THRESHOLD) {
            calculatedShippingFee = 0;
        }

        const total = Math.max(0, subtotal - discountValue + calculatedShippingFee);

        return {
            selectedSubtotal: subtotal,
            selectedDiscountValue: discountValue,
            shippingFee: calculatedShippingFee,
            selectedTotal: total
        };
    }, [selectedProducts, appliedVoucher, cartItems]);

    // keep selectAll checkbox state in sync
    useEffect(() => {
        const allSelected = cartItems.length > 0 && cartItems.every(item =>
            selectedProducts.includes(item.id)
        );
        setSelectAll(allSelected);
    }, [selectedProducts, cartItems]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleApplyDiscount = () => {
        const code = discountCode.trim().toUpperCase();

        if (appliedVoucher?.code === code) {
            message.warning("Mã giảm giá đã được áp dụng");
            return;
        }

        const voucher = vouchers.find(v =>
            v.code.toUpperCase() === code &&
            v.isActive &&
            !v.isDelete
        );

        if (!voucher) {
            notification.error({
                message: 'Lỗi',
                description: 'Mã giảm giá không hợp lệ hoặc không tồn tại',
                placement: 'topRight',
            });
            return;
        }

        const now = new Date();
        const startDate = new Date(voucher.startDate);
        const endDate = new Date(voucher.endDate);

        if (now < startDate) {
            notification.error({
                message: 'Lỗi',
                description: `Mã giảm giá chưa có hiệu lực (có hiệu lực từ ${startDate.toLocaleDateString()})`,
                placement: 'topRight',
            });
            return;
        }

        if (now > endDate) {
            notification.error({
                message: 'Lỗi',
                description: `Mã giảm giá đã hết hạn (hết hạn ngày ${endDate.toLocaleDateString()})`,
                placement: 'topRight',
            });
            return;
        }

        if (voucher.quantity <= 0) {
            notification.error({
                message: 'Lỗi',
                description: 'Mã giảm giá đã hết số lượng',
                placement: 'topRight',
            });
            return;
        }

        setAppliedVoucher(voucher);
        setDiscountCode("");

        let successMessage = `Áp dụng thành công mã giảm giá ${voucher.code}`;
        if (voucher.discountType === 'PERCENT') {
            successMessage += ` (Giảm ${voucher.discountValue}%)`;
        } else if (voucher.discountType === 'FIXED') {
            successMessage += ` (Giảm ${voucher.discountValue.toLocaleString()}₫)`;
        } else if (voucher.code === "FREESHIP") {
            successMessage = "Áp dụng thành công mã miễn phí vận chuyển";
        }

        message.success(successMessage);
    };

    const handleRemoveDiscount = () => {
        setAppliedVoucher(null);
        message.info("Đã xóa mã giảm giá");
    };

    const handleCheckout = async () => {
        if (selectedProducts.length === 0) {
            notification.warning({
                message: 'Cảnh báo',
                description: 'Vui lòng chọn sản phẩm',
                placement: 'topRight',
            });
            return;
        }

        if (!userData) {
            notification.warning({
                message: 'Cảnh báo',
                description: 'Vui lòng đăng nhập để thanh toán',
                placement: 'topRight',
            });
            return;
        }

        try {
            const selectedItems = cartItems.filter(item =>
                selectedProducts.includes(item.id)
            );

            navigate('/checkout', {
                state: {
                    orderInfo: `Thanh toán ${selectedTotal.toLocaleString()}₫ qua ${paymentMethod}`,
                    cartItems: selectedItems,
                    voucher: appliedVoucher,
                    shippingFee: shippingFee,
                    subtotal: selectedSubtotal,
                    discount: selectedDiscountValue
                }
            });
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Thanh toán không thành công',
                placement: 'topRight',
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteCartItem(id));
            setCartItems(prev => prev.filter(item => item.id !== id));
            setTotalItems(prev => Math.max(0, prev - 1));
            setSelectedProducts(prev => prev.filter(itemId => itemId !== id));
            message.success("Xóa sản phẩm thành công");
            // avoid full reload if possible; but keep behavior close to existing code
            window.location.reload();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể xóa sản phẩm',
                placement: 'topRight',
            });
        }
    };

    const handleDeleteAll = async () => {
        if (!userData?.id) return;

        try {
            setDeleteLoading(true);
            await dispatch(deleteAllCartItems(userData.id));

            setCartItems([]);
            setTotalItems(0);
            setSelectedProducts([]);
            setSelectAll(false);
            notification.success({
                message: 'Thành công',
                description: 'Đã xóa tất cả sản phẩm khỏi giỏ hàng',
                placement: 'topRight',
            });
            window.location.reload();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Xóa sản phẩm thất bại',
                placement: 'topRight',
            });
        } finally {
            setDeleteLoading(false);
            setDeleteModalVisible(false);
        }
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            notification.error({
                message: 'Lỗi',
                description: 'Số lượng không thể nhỏ hơn 1',
                placement: 'topRight',
            });
            return;
        }

        try {
            setUpdatingQuantities(prev => ({ ...prev, [productId]: true }));

            const result = await dispatch(updateCartItemQuantity({
                id: productId,
                quantity: newQuantity
            }));

            // your thunk may return different structure — keep existing behavior
            if (result !== 200) {
                throw new Error('Số lượng mặt hàng này không đủ');
            }

            setCartItems(prev => prev.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error) {
            console.error('Update quantity error:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Số lượng mặt hàng này không đủ',
                placement: 'topRight',
            });
        } finally {
            setUpdatingQuantities(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleContinueShopping = () => {
        window.location.href = "/search";
    };

    if (loading && cartItems.length === 0) {
        return (
            <div className="loading-container">
                <Spin size="large" />
                <p>Đang tải giỏ hàng...</p>
            </div>
        );
    }

    if (totalItems === 0) {
        return (
            <div className="empty-cart">
                <ShoppingCartOutlined className="empty-cart-icon" />
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p>Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm</p>
                <Button type="primary" icon={<ArrowLeft />} onClick={handleContinueShopping}>
                    Tiếp tục mua sắm
                </Button>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h1>Giỏ hàng của bạn</h1>
                <p className="item-count">
                    {totalItems} sản phẩm
                    {selectedProducts.length > 0 && (
                        <span className="selected-count"> ({selectedProducts.length} đã chọn)</span>
                    )}
                </p>
            </div>

            <div className="cart-layout">
                <div className="products-section">
                    <div className="card">
                        <div className="card-header">
                            <div className="select-all-container">
                                <Checkbox
                                    checked={selectAll}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    indeterminate={selectedProducts.length > 0 && !selectAll}
                                >
                                    Chọn tất cả
                                </Checkbox>
                            </div>
                            <h2>Sản phẩm</h2>
                        </div>

                        <div className="card-content">
                            {cartItems.map((product) => {
                                const availStock = Number(product.availableStock ?? 0);
                                const isOutOfStock = availStock <= 0;
                                const isExceedStock = Number(product.quantity ?? 0) > availStock;
                                const disabledItem = isOutOfStock || isExceedStock;

                                return (
                                    <React.Fragment key={product.id}>
                                        <div className="product-item">
                                            <div className="product-select">
                                                <Checkbox
                                                    checked={selectedProducts.includes(product.id)}
                                                    disabled={disabledItem}
                                                    onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                                                />
                                            </div>

                                            <div className="product-image-container">
                                                <img
                                                    src={product.imageUrl || '/default-product-image.png'}
                                                    alt={product.productName}
                                                    className="product-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-product-image.png';
                                                    }}
                                                />
                                            </div>

                                            <div className="product-details">
                                                <div className="product-header-cart">
                                                    <h3 className="product-name">{product.productName + " " + product.productCode}</h3>
                                                    <p className="product-price">
                                                        {(Number(product.basePrice ?? 0) * Number(product.quantity ?? 0)).toLocaleString()}₫
                                                    </p>
                                                </div>

                                                <div className="product-description">
                                                    {product.cpu + ", " + product.ram + ", " + product.storage + ", " + product.gpu + ', ' + product.color}
                                                    {isOutOfStock && (
                                                        <div className="stock-error" style={{ color: '#d93025', marginTop: 6 }}>
                                                            Sản phẩm đã hết hàng — vui lòng xóa khỏi giỏ hàng.
                                                        </div>
                                                    )}

                                                    {!isOutOfStock && isExceedStock && (
                                                        <div className="stock-error" style={{ color: '#d93025', marginTop: 6 }}>
                                                            Số lượng đã vượt quá tồn kho (tồn kho: {availStock}). Vui lòng giảm số lượng.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="product-actions">
                                                    <div className="quantity-control">
                                                        <button
                                                            className="quantity-button"
                                                            onClick={() => handleQuantityChange(product.id, Number(product.quantity) - 1)}
                                                            disabled={Number(product.quantity) <= 1 || updatingQuantities[product.id] || isOutOfStock}
                                                        >
                                                            <Minus className="icon-sm" />
                                                        </button>
                                                        <span className="quantity">
                                                            {updatingQuantities[product.id] ? (
                                                                <Spin size="small" />
                                                            ) : (
                                                                product.quantity
                                                            )}
                                                        </span>
                                                        <button
                                                            className="quantity-button"
                                                            onClick={() => handleQuantityChange(product.id, Number(product.quantity) + 1)}
                                                            disabled={updatingQuantities[product.id] || isOutOfStock || Number(product.quantity) >= availStock}
                                                        >
                                                            <Plus className="icon-sm" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        className="remove-button"
                                                        onClick={() => handleDelete(product.id)}
                                                        disabled={updatingQuantities[product.id]}
                                                    >
                                                        <Trash2 className="icon-sm" />
                                                        <span>Xóa</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="divider"></div>
                                    </React.Fragment>
                                );
                            })}

                            {showPagination && (
                                <div className="pagination-container">
                                    <Pagination
                                        current={currentPage}
                                        total={totalItems}
                                        pageSize={PAGE_SIZE}
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="card-footer">
                            <button className="secondary-button" onClick={handleContinueShopping}>
                                <ShoppingBag className="icon" />
                                <span className="continue">Tiếp tục mua sắm</span>
                            </button>
                            <button
                                className="secondary-button danger"
                                onClick={() => setDeleteModalVisible(true)}
                                disabled={loading || cartItems.length === 0}
                            >
                                <Trash2 className="icon" />
                                <span>Xóa tất cả</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="checkout-section">
                    <div className="card">
                        <div className="card-header">
                            <h2>Tổng đơn hàng</h2>
                            {selectedProducts.length > 0 && (
                                <Tag color="blue">{selectedProducts.length} sản phẩm</Tag>
                            )}
                        </div>

                        <div className="card-content">
                            <div className="discount-code-section">
                                <div className="discount-input-group">
                                    <Tag className="discount-icon" />
                                    <Input
                                        placeholder="Nhập mã giảm giá"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        disabled={!!appliedVoucher}
                                    />
                                    {!appliedVoucher ? (
                                        <Button
                                            type="primary"
                                            onClick={handleApplyDiscount}
                                            disabled={!discountCode.trim()}
                                        >
                                            Áp dụng
                                        </Button>
                                    ) : (
                                        <Button
                                            danger
                                            onClick={handleRemoveDiscount}
                                        >
                                            Xóa
                                        </Button>
                                    )}
                                </div>

                                {appliedVoucher && (
                                    <div className="applied-discount">
                                        <span>
                                            Mã đã áp dụng: <strong>{appliedVoucher.code}</strong>
                                            {appliedVoucher.discountType === 'PERCENT' && (
                                                <span> (Giảm {appliedVoucher.discountValue}%)</span>
                                            )}
                                            {appliedVoucher.discountType === 'FIXED' && (
                                                <span> (Giảm {appliedVoucher.discountValue.toLocaleString()}₫)</span>
                                            )}
                                            {appliedVoucher.code === "FREESHIP" && (
                                                <span> (Miễn phí vận chuyển)</span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="price-row">
                                <span>Tạm tính</span>
                                <span>{selectedSubtotal.toLocaleString()}₫</span>
                            </div>

                            {selectedDiscountValue > 0 && (
                                <div className="price-row">
                                    <span>Giảm giá</span>
                                    <span className="discount">-{selectedDiscountValue.toLocaleString()}₫</span>
                                </div>
                            )}

                            <div className="price-row">
                                <span>Phí vận chuyển</span>
                                <span>
                                    {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString()}₫`}
                                </span>
                            </div>

                            <div className="divider"></div>

                            <div className="price-row total">
                                <span>Tổng cộng</span>
                                <span>{selectedTotal.toLocaleString()}₫</span>
                            </div>

                            <p className="vat-note">Đã bao gồm VAT (nếu có)</p>
                        </div>

                        <div className="card-footer">
                            <button
                                className="primary-button"
                                onClick={handleCheckout}
                                disabled={selectedProducts.length === 0}
                            >
                                <CreditCard className="icon" />
                                <span>Tiến hành thanh toán</span>
                            </button>
                        </div>
                    </div>

                    <div className="card benefits-card">
                        <div className="card-content">
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <ShoppingBag className="icon" />
                                </div>
                                <div>
                                    <p className="benefit-title">Miễn phí vận chuyển</p>
                                    <p className="benefit-description">Cho đơn hàng từ {FREE_SHIPPING_THRESHOLD.toLocaleString()}₫</p>
                                </div>
                            </div>
                            <div className="security-badge">
                                <ShieldCheck className="icon" />
                                <span>Thanh toán an toàn</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal
                visible={deleteModalVisible}
                onCancel={() => setDeleteModalVisible(false)}
                onConfirm={handleDeleteAll}
                itemCount={cartItems.length}
                loading={deleteLoading}
            />
        </div>
    );
};

export default CartPage;
