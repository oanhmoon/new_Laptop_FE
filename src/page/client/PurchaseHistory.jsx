
import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ShoppingBag,
  Package,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Pagination, Spin, Input, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  cancelOrder,
  getAllHistoryOrder,
  refundOrder,
} from "../../Redux/actions/OrderItemThunk";
import { createReview } from "../../Redux/actions/RatingThunk";
import { retryPayment } from "../../Redux/actions/PaymentThunk";
import "../style/PurchaseHistory.css";
import { NotificationContext } from "../../components/NotificationProvider";
import RatingModal from "./RatingModal";
import RefundModal from "./RefundModal";

const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
  {
    value: "RETURNED",
    label: "Trả hàng",
    group: [
      "PENDING_RETURNED",
      "CONFIRMED_RETURNED",
      "SHIPPED_RETURNED",
      "RETURNED",
    ],
  },
];

const PurchaseHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notification = useContext(NotificationContext);

  const { loading, error } = useSelector((state) => state.OrderReducer);

  const [ordersSource, setOrdersSource] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedOrderRefundId, setSelectedOrderRefundId] = useState(null);

  const ordersPerPage = 5;

  const [userData] = useState(() => {
    const u = localStorage.getItem("USER_LOGIN");
    return u ? JSON.parse(u) : null;
  });

  // Fetch orders
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dispatch(
          getAllHistoryOrder(0, 9999, null, "desc", userData?.id)
        );
        setOrdersSource(res?.content || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [dispatch, userData?.id]);

  // Normalize
  const normalizeOrder = (order) => ({
    id: `ORD-${order.orderId}`,
    date: new Date(order.updatedAt || order.createdAt),
    status:
      order.orderStatus ||
      order.status ||
      order.currentStatus ||
      order?.order?.status,
    total:
      order.orderItems.reduce(
        (sum, item) => sum + item.priceAtOrderTime * item.quantity,
        0
      ) - (order.discount || 0),
    

    refundReason: order.refundReason,
  refundImageUrl: order.refundImageUrl,
  refundVideoUrl: order.refundVideoUrl,
    paymentStatus:
      order.paymentStatus ||
      order?.payment?.paymentStatus ||
      order?.payment?.status,

    paymentMethod:
      order.paymentMethod ||
      order?.payment?.paymentMethod ||
      order?.payment?.provider ||
      order?.paymentInfo?.paymentMethod,
    items: order.orderItems.map((i) => ({
      id: i.orderItemId,
      name: i.productName,
      price: i.priceAtOrderTime,
      quantity: i.quantity,
      image: i.productImage,
      color: i.productColor,
      code: i.productCode,
      productOptionId: i.productOptionId || i.productVariantId,
    })),
  });

  // Payment method label
  const getPaymentMethodLabel = (method) => {
    const map = {
      COD: "Thanh toán khi nhận hàng",
      VNPAY: "VNPay",
      IN_APP: "Thanh toán trong ứng dụng",
    };
    return map[method] || method || "Không xác định";
  };

  // Payment status badge
  const PaymentStatusBadge = ({ status }) => {
    const config = {
      PAID: {
        label: "Đã thanh toán",
        className: "payment-status-badge paid",
      },
      UNPAID: {
        label: "Chưa thanh toán",
        className: "payment-status-badge unpaid",
      },
      FAILED: {
        label: "Thanh toán thất bại",
        className: "payment-status-badge failed",
      },
      REFUNDED: {
        label: "Yêu cầu hoàn tiền",
        className: "payment-status-badge refunded",
      },
      REFUNDED_SUCCESSFUL: {
        label: "Đã hoàn tiền",
        className: "payment-status-badge refunded-success",
      },
    };

    const r =
      config[status] || {
        label: status || "Không xác định",
        className: "payment-status-badge default",
      };

    return <span className={r.className}>{r.label}</span>;
  };

  const StatusBadge = ({ status }) => {
    const config = {
      PENDING: { label: "Chờ xác nhận", className: "status-badge pending" },
      CONFIRMED: { label: "Đã xác nhận", className: "status-badge confirmed" },
      SHIPPED: { label: "Đang giao hàng", className: "status-badge shipped" },
      COMPLETED: { label: "Hoàn thành", className: "status-badge completed" },
      CANCELLED: { label: "Đã hủy", className: "status-badge cancelled" },
      PENDING_RETURNED: {
        label: "Chờ xử lý hoàn hàng",
        className: "status-badge refunded",
      },
      CONFIRMED_RETURNED: {
        label: "Đã xác nhận, yêu cầu gửi hàng hoàn",
        className: "status-badge refunded",
      },
      SHIPPED_RETURNED: {
        label: "Đang kiểm tra hàng hoàn",
        className: "status-badge refunded",
      },
      RETURNED: {
        label: "Hoàn hàng thành công",
        className: "status-badge refunded-success",
      },
    };

    const r = config[status] || config.PENDING;

    return <span className={r.className}>{r.label}</span>;
  };

  // Filter + search + sort
  const filteredOrders = useMemo(() => {
    let list = ordersSource.map(normalizeOrder);

    const tab = STATUS_TABS.find((t) => t.value === statusFilter);

    if (statusFilter !== "all") {
      if (tab.group) {
        list = list.filter((o) => tab.group.includes(o.status));
      } else {
        list = list.filter((o) => o.status === statusFilter);
      }
    }

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(t) ||
          o.items.some(
            (i) =>
              i.name.toLowerCase().includes(t) ||
              i.code.toLowerCase().includes(t)
          )
      );
    }

    list.sort((a, b) =>
      sortOrder === "newest" ? b.date - a.date : a.date - b.date
    );

    return list;
  }, [ordersSource, searchTerm, statusFilter, sortOrder]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, currentPage]);

  // Actions
  const toggleOrderExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);

  const handleCancelOrder = async (id) => {
    const oid = id.substring(4);
    const res = await dispatch(cancelOrder(oid));
    if (res.code === 200) {
      notification.success({ message: "Huỷ thành công" });
      window.location.reload();
    }
    };

  const handleReturnOrder = async (id) => {
    const oid = id.substring(4);
    const res = await dispatch(refundOrder(oid));
    if (res.code === 200) {
      notification.success({ message: "Đã gửi yêu cầu hoàn hàng" });
      window.location.reload();
    }
  };

  

  const handleSubmitReview = async (body) => {
    if (!selectedProduct) return;

    // Override productOptionId để đảm bảo đúng SP
    body.productOptionId = selectedProduct.productOptionId;

    // Không gửi userId vì backend tự lấy từ token
    const res = await dispatch(createReview(body));

    if (res?.data) {
        notification.success({ message: "Đã gửi đánh giá" });
        setIsRatingModalOpen(false);
    }
};


  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p>Không thể tải lịch sử mua hàng</p>
      </div>
    );

  return (
    <div className="purchase-history-container">
      {/* HEADER */}
      <div className="purchase-history-header">
        <h1>Lịch sử mua hàng</h1>

        <div className="history-controls">
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            prefix={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select
            className="sort-select"
            value={sortOrder}
            onChange={(v) => setSortOrder(v)}
            options={[
              { value: "newest", label: "Mới nhất" },
              { value: "oldest", label: "Cũ nhất" },
            ]}
          />
        </div>
      </div>

      {/* TABS */}
      <div className="status-tabs">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            className={`status-tab ${
              statusFilter === t.value ? "active" : ""
            }`}
            onClick={() => {
              setStatusFilter(t.value);
              setCurrentPage(1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ORDERS */}
      <div className="orders-list-container">
        {paginatedOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} className="empty-icon" />
            <p className="empty-text">Không tìm thấy đơn hàng nào</p>
            <button
              className="continue-shopping-btn"
              onClick={() => navigate("/")}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            {paginatedOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div
                  className="order-summary"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="order-meta">
                    <div className="order-id-date">
                      <span className="order-id">{order.id}</span>
                      <span className="order-date">
                        {new Intl.DateTimeFormat("vi-VN").format(order.date)}
                      </span>
                    </div>

                    <StatusBadge status={order.status} />

                    <div className="order-payment-meta">
                      <span className="payment-method-pill">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>

                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>

                  <div className="order-amount">
                    <span className="total-amount">
                      {formatPrice(order.total)}
                    </span>

                    <span className="items-count">
                      {order.items.length} sản phẩm
                    </span>

                    {expandedOrder === order.id ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>
                </div>

                {/* EXPANDED */}
                {expandedOrder === order.id && (
                  <div className="order-details-expanded">
                  {order.status.includes("RETURNED") || order.paymentStatus === "REFUNDED" ? (
                    <div className="refund-info">
                      <h3>Thông tin hoàn hàng</h3>

                      <p><strong>Lý do:</strong> {order.refundReason || "Không có lý do"}</p>

                      <div className="refund-media-grid">

                    <div className="refund-media-item">
                      <strong>Ảnh minh chứng:</strong>
                      {order.refundImageUrl ? (
                        <img src={order.refundImageUrl} className="refund-image" />
                      ) : (
                        <span>Không có ảnh</span>
                      )}
                    </div>

                    <div className="refund-media-item">
                      <strong>Video minh chứng:</strong>
                      {order.refundVideoUrl ? (
                        <video src={order.refundVideoUrl} controls className="refund-video" />
                      ) : (
                        <span>Không có video</span>
                      )}
                    </div>

                  </div>

                    </div>
                  ) : null}

                    {/* PAYMENT INFO */}
                    <div className="order-details-section">
                      <h3>Thông tin thanh toán</h3>

                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Phương thức</span>
                          <span className="detail-value">
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            Trạng thái thanh toán
                          </span>
                          <span className="detail-value">
                            <PaymentStatusBadge
                              status={order.paymentStatus}
                            />
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">Tổng thanh toán</span>
                          <span className="detail-value">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PRODUCTS */}
                    <div className="products-section">
                      <h3>Sản phẩm</h3>

                      <div className="products-list">
                        {order.items.map((item) => (
                          <div key={item.id} className="product-item">
                            <div className="product-image-container">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg";
                                  e.target.onerror = null;
                                }}
                              />
                            </div>

                            <div className="product-info">
                              <h4 className="product-name">{item.name}</h4>
                              <p className="product-code">Mã: {item.code}</p>
                              <p className="product-quantity">
                                SL: {item.quantity}
                              </p>
                              <p className="product-color">Màu: {item.color}</p>

                              {order.status === "COMPLETED" && (
                                <button
                                  className="review-btn"
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setIsRatingModalOpen(true);
                                  }}
                                >
                                  ✏️ Viết đánh giá
                                </button>
                              )}
                            </div>

                            <div className="product-price">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="order-actions">

                      {order.paymentMethod === "VNPAY" && order.paymentStatus === "UNPAID" && (
                        <button
                            className="pay-again-button"
                            onClick={() => dispatch(retryPayment(order.id.substring(4)))}
                        >
                            🔄 Tiếp tục thanh toán
                        </button>
                    )}

                      {order.status === "PENDING" && (
                        <div className="status-message pending">
                          <Package size={20} />
                          <span>Đang chờ xác nhận</span>

                          <button
                            className="cancel-button"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Hủy đơn hàng
                          </button>
                        </div>
                      )}

                      {order.status === "COMPLETED" &&
                        order.paymentStatus === "PAID" && (
                          <div className="status-message completed">
                            <CheckCircle size={20} />
                            <span>Đã giao hàng thành công</span>

                            <button
                              className="secondary-button"
                              onClick={() => {
                                setSelectedOrderRefundId(order.id);
                                setIsRefundModalOpen(true);
                              }}
                            >
                              Trả hàng / Hoàn tiền
                            </button>
                          </div>
                        )}

                      {["PENDING_RETURNED", "CONFIRMED_RETURNED", "SHIPPED_RETURNED"].includes(
                        order.status
                      ) &&
                        order.paymentStatus === "REFUNDED" && (
                          <div className="status-message refunded">
                            <RefreshCw size={20} />
                            <span>Đang xử lý hoàn hàng...</span>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="pagination-wrapper">
              <Pagination
                current={currentPage}
                total={filteredOrders.length}
                pageSize={ordersPerPage}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleSubmitReview}
      />

      {isRefundModalOpen && (
        <RefundModal
          orderId={selectedOrderRefundId}
          onClose={() => setIsRefundModalOpen(false)}
          onSuccess={() => {
            notification.success({ message: "Đã gửi yêu cầu hoàn hàng" });
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default PurchaseHistory;
