
import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ShoppingBag,
  Package,
  Truck,
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
import "../style/PurchaseHistory.css";
import { NotificationContext } from "../../components/NotificationProvider";
import RatingModal from "./RatingModal";

const PurchaseHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notification = useContext(NotificationContext);

  const { orders, loading, error } = useSelector((state) => state.OrderReducer);

  const [userData] = useState(() => {
    const savedUser = localStorage.getItem("USER_LOGIN");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mergedOrdersData, setMergedOrdersData] = useState([]);

  const ordersPerPage = 5;

  // === FETCH ORDERS ===
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let allOrders = [];

        if (statusFilter === "RETURNED") {
          const allReturnStatuses = [
            "PENDING_RETURNED",
            "CONFIRMED_RETURNED",
            "SHIPPED_RETURNED",
            "RETURNED",
          ];

          const responses = await Promise.all(
            allReturnStatuses.map((status) =>
              dispatch(
                getAllHistoryOrder(
                  currentPage - 1,
                  ordersPerPage,
                  status,
                  sortOrder === "newest" ? "desc" : "asc",
                  userData?.id
                )
              )
            )
          );

          allOrders = responses
            .filter((res) => res?.content)
            .flatMap((res) => res.content);
        } else if (statusFilter === "COMPLETED") {
          const allCompletedStatuses = ["COMPLETED", "REJECTED_RETURNED"];

          const responses = await Promise.all(
            allCompletedStatuses.map((status) =>
              dispatch(
                getAllHistoryOrder(
                  currentPage - 1,
                  ordersPerPage,
                  status,
                  sortOrder === "newest" ? "desc" : "asc",
                  userData?.id
                )
              )
            )
          );

          allOrders = responses
            .filter((res) => res?.content)
            .flatMap((res) => res.content);
        } else {
          const apiStatus =
            statusFilter === "all" ? null : statusFilter.toUpperCase();

          const res = await dispatch(
            getAllHistoryOrder(
              currentPage - 1,
              ordersPerPage,
              apiStatus,
              sortOrder === "newest" ? "desc" : "asc",
              userData?.id
            )
          );

          allOrders = res?.content || [];
        }

        setMergedOrdersData(allOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchOrders();
  }, [currentPage, statusFilter, sortOrder, dispatch, userData?.id]);

  // === Chuẩn hóa dữ liệu đơn hàng ===
  const filteredOrders = useMemo(() => {
    const source = mergedOrdersData.length > 0 ? mergedOrdersData : orders?.content || [];

    let result = source.map((order) => ({
      id: `ORD-${order.orderId}`,
      // date: new Date(order.createdAt || Date.now()),
      date: new Date(order.updatedAt || order.createdAt || Date.now()),

      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      total:
        order.orderItems.reduce(
          (sum, item) => sum + item.priceAtOrderTime * item.quantity,
          0
        ) - (order.discount || 0),
      items: order.orderItems.map((item) => ({
        id: item.orderItemId,
        name: item.productName,
        price: item.priceAtOrderTime,
        quantity: item.quantity,
        image: item.productImage,
        color: item.productColor,
        code: item.productCode,
        productOptionId: item.productOptionId ?? item.productVariantId,
      })),
    }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.items.some(
            (item) =>
              item.name.toLowerCase().includes(term) ||
              item.code.toLowerCase().includes(term)
          )
      );
    }

    return result;
  }, [mergedOrdersData, orders, searchTerm]);

  // === Helper ===
  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // === Hiển thị badge trạng thái ===
  const StatusBadge = ({ status, paymentStatus }) => {
    const combinedStatus = `${paymentStatus || ""}_${status}`;

    const statusConfig = {
      PENDING: { label: "Chờ xác nhận", className: "status-badge pending" },
      CONFIRMED: { label: "Đã xác nhận", className: "status-badge confirmed" },
      SHIPPED: { label: "Đang giao hàng", className: "status-badge shipped" },
      COMPLETED: { label: "Hoàn thành", className: "status-badge completed" },
      REJECTED_RETURNED: {
        label: "Hoàn hàng bị từ chối",
        className: "status-badge completed",
      },
      CANCELLED: { label: "Đã hủy", className: "status-badge cancelled" },
      "REFUNDED_PENDING_RETURNED": {
        label: "Chờ xử lý hoàn hàng",
        className: "status-badge refunded",
      },
      "REFUNDED_CONFIRMED_RETURNED": {
        label: "Đã xác nhận hoàn hàng",
        className: "status-badge refunded",
      },
      "REFUNDED_SHIPPED_RETURNED": {
        label: "Đang kiểm tra hàng hoàn",
        className: "status-badge refunded",
      },
      "REFUNDED_SUCCESSFUL_RETURNED": {
        label: "Hoàn hàng thành công",
        className: "status-badge refunded-success",
      },
    };

    const config =
      statusConfig[combinedStatus] ||
      statusConfig[status] ||
      statusConfig.PENDING;

    return <span className={config.className}>{config.label}</span>;
  };

  // === Action ===
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedOrder(null);
  };

  const handleReturnRequest = async (id) => {
    const idNumber = id.substring(4);
    const res = await dispatch(refundOrder(idNumber));
    if (res.code === 200) {
      notification.success({
        message: "Thành công",
        description: "Yêu cầu hoàn hàng đã được gửi!",
      });
      window.location.reload();
    } else {
      notification.warning({
        message: "Cảnh báo",
        description: "Không thể gửi yêu cầu hoàn hàng!",
      });
    }
  };

  const handleCancelRequest = async (id) => {
    const idNumber = id.substring(4);
    const res = await dispatch(cancelOrder(idNumber));
    if (res.code === 200) {
      notification.success({
        message: "Thành công",
        description: "Đơn hàng đã được hủy!",
      });
      window.location.reload();
    } else {
      notification.warning({
        message: "Cảnh báo",
        description: "Không thể hủy đơn hàng!",
      });
    }
  };

  // === Review ===
  const handleOpenReview = (product) => {
    setSelectedProduct(product);
    setIsRatingModalOpen(true);
  };

  const handleSubmitReview = async ({ rating, review }) => {
    if (!selectedProduct) return;
    try {
      const body = {
        userId: userData.id,
        productOptionId: selectedProduct.productOptionId,
        rating,
        comment: review,
      };
      const response = await dispatch(createReview(body));
      if (response && response.data) {
        notification.success({
          message: "Thành công",
          description: "Cảm ơn bạn đã gửi đánh giá!",
        });
        setIsRatingModalOpen(false);
        setSelectedProduct(null);
      } else {
        notification.warning({
          message: "Không thể gửi đánh giá",
          description: "Đã xảy ra lỗi khi gửi đánh giá.",
        });
      }
    } catch {
      notification.error({
        message: "Lỗi mạng",
        description: "Không thể gửi đánh giá, vui lòng thử lại.",
      });
    }
  };

  // === Giao diện ===
  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải lịch sử mua hàng...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Đã xảy ra lỗi</h3>
          <p>{error.message || "Không thể tải lịch sử mua hàng"}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );

  return (
    <div className="purchase-history-container">
      <div className="purchase-history-header">
        <h1>Lịch sử mua hàng</h1>
        <div className="history-controls">
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            prefix={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            className="sort-select"
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value);
              setCurrentPage(1);
            }}
            options={[
              { value: "newest", label: "Mới nhất" },
              { value: "oldest", label: "Cũ nhất" },
            ]}
          />
        </div>
      </div>

      {/* Tabs trạng thái */}
      <div className="status-tabs">
        {[
          "all",
          "PENDING",
          "CONFIRMED",
          "SHIPPED",
          "COMPLETED",
          "CANCELLED",
          "RETURNED",
        ].map((status) => (
          <button
            key={status}
            className={`status-tab ${statusFilter === status ? "active" : ""}`}
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
          >
            {status === "all"
              ? "Tất cả"
              : status === "PENDING"
              ? "Chờ xác nhận"
              : status === "CONFIRMED"
              ? "Đã xác nhận"
              : status === "SHIPPED"
              ? "Đang giao"
              : status === "COMPLETED"
              ? "Hoàn thành"
              : status === "RETURNED"
              ? "Trả hàng"
              : "Đã hủy"}
          </button>
        ))}
      </div>

      {/* Danh sách đơn hàng */}
      <div className="orders-list-container">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} className="empty-icon" />
            <p className="empty-text">Không tìm thấy đơn hàng nào</p>
            <button className="continue-shopping-btn" onClick={() => navigate("/")}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-summary" onClick={() => toggleOrderExpand(order.id)}>
                  <div className="order-meta">
                    <div className="order-id-date">
                      <span className="order-id">{order.id}</span>
                      <span className="order-date">
                        {new Intl.DateTimeFormat("vi-VN").format(order.date)}
                      </span>
                    </div>
                    <StatusBadge
                      status={order.status}
                      paymentStatus={order.paymentStatus}
                    />
                  </div>
                  <div className="order-amount">
                    <span className="total-amount">{formatPrice(order.total)}</span>
                    <span className="items-count">{order.items.length} sản phẩm</span>
                    {expandedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="order-details-expanded">
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
                              <p className="product-quantity">Số lượng: {item.quantity}</p>
                              <p className="product-color">Màu: {item.color}</p>

                              {order.status === "COMPLETED" && (
                                <button
                                  className="review-btn"
                                  onClick={() => handleOpenReview(item)}
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

                    {/* Khu vực hành động */}
                    <div className="order-actions">
                      <div className="status-info">
                        {order.status === "PENDING" && (
                          <div className="status-message pending">
                            <Package size={20} />
                            <span>Đang chờ xác nhận</span>
                            <button
                              className="cancel-button"
                              onClick={() => handleCancelRequest(order.id)}
                            >
                              Huỷ đơn hàng
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
                                onClick={() => handleReturnRequest(order.id)}
                              >
                                Trả hàng / Hoàn tiền
                              </button>
                            </div>
                          )}

                        {order.paymentStatus === "REFUNDED" &&
                          ["PENDING_RETURNED", "CONFIRMED_RETURNED", "SHIPPED_RETURNED"].includes(
                            order.status
                          ) && (
                            <div className="status-message refunded">
                              <RefreshCw size={20} />
                              <span>Đang xử lý hoàn hàng...</span>
                            </div>
                          )}

                        {order.paymentStatus === "REFUNDED_SUCCESSFUL" &&
                          order.status === "RETURNED" && (
                            <div className="status-message refunded-success">
                              <CheckCircle size={20} />
                              <span>Đã hoàn hàng thành công 🎉</span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="pagination-wrapper">
              <Pagination
                current={currentPage}
                total={orders?.totalElements || 0}
                pageSize={ordersPerPage}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
              />
            </div>
          </>
        )}
      </div>

      {/* Modal đánh giá */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};

export default PurchaseHistory;

