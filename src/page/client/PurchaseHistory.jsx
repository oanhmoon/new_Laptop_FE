
// import React, { useState, useEffect, useMemo, useContext } from "react";
// import {
//   ChevronDown,
//   ChevronUp,
//   Search,
//   ShoppingBag,
//   Package,
//   Truck,
//   RefreshCw,
//   CheckCircle,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { Pagination, Spin, Input, Select } from "antd";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   cancelOrder,
//   getAllHistoryOrder,
//   refundOrder,
// } from "../../Redux/actions/OrderItemThunk";
// import { createReview } from "../../Redux/actions/RatingThunk";
// import "../style/PurchaseHistory.css";
// import { NotificationContext } from "../../components/NotificationProvider";
// import RatingModal from "./RatingModal";

// const STATUS_TABS = [
//   { value: "all", label: "Tất cả", statuses: [null] },
//   { value: "PENDING", label: "Chờ xác nhận", statuses: ["PENDING"] },
//   { value: "CONFIRMED", label: "Đã xác nhận", statuses: ["CONFIRMED"] },
//   { value: "SHIPPED", label: "Đang giao", statuses: ["SHIPPED"] },
//   {
//     value: "COMPLETED",
//     label: "Hoàn thành",
//     statuses: ["COMPLETED", "REJECTED_RETURNED"],
//   },
//   {
//     value: "RETURNED",
//     label: "Trả hàng",
//     statuses: [
//       "PENDING_RETURNED",
//       "CONFIRMED_RETURNED",
//       "SHIPPED_RETURNED",
//       "RETURNED",
//     ],
//   },
//   { value: "CANCELLED", label: "Đã hủy", statuses: ["CANCELLED"] },
// ];

// const PurchaseHistory = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const notification = useContext(NotificationContext);

//   const { orders, loading, error } = useSelector((state) => state.OrderReducer);

//   const [userData] = useState(() => {
//     const savedUser = localStorage.getItem("USER_LOGIN");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   const [expandedOrder, setExpandedOrder] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [sortOrder, setSortOrder] = useState("newest");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [mergedOrdersData, setMergedOrdersData] = useState([]);

//   const ordersPerPage = 5;

//   // === FETCH ORDERS ===
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const currentTab =
//           STATUS_TABS.find((tab) => tab.value === statusFilter) ||
//           STATUS_TABS[0];
//         const statusesToLoad =
//           currentTab.statuses && currentTab.statuses.length > 0
//             ? currentTab.statuses
//             : [null];

//         const sortDirection = sortOrder === "newest" ? "desc" : "asc";
//         let allOrders = [];

//         if (statusesToLoad.length === 1) {
//           const targetStatus =
//             statusesToLoad[0] === null ? null : statusesToLoad[0];

//           const res = await dispatch(
//             getAllHistoryOrder(
//               currentPage - 1,
//               ordersPerPage,
//               targetStatus,
//               sortDirection,
//               userData?.id
//             )
//           );

//           allOrders = res?.content || [];
//         } else {
//           const responses = await Promise.all(
//             statusesToLoad.map((status) =>
//               dispatch(
//                 getAllHistoryOrder(
//                   currentPage - 1,
//                   ordersPerPage,
//                   status,
//                   sortDirection,
//                   userData?.id
//                 )
//               )
//             )
//           );

//           allOrders = responses
//             .filter((res) => res?.content)
//             .flatMap((res) => res.content);
//         }

//         setMergedOrdersData(allOrders);
//       } catch (err) {
//         console.error("Failed to fetch orders:", err);
//       }
//     };

//     fetchOrders();
//   }, [currentPage, statusFilter, sortOrder, dispatch, userData?.id]);

//   const resolveStatus = (order) =>
//     order?.orderStatus ||
//     order?.status ||
//     order?.currentStatus ||
//     order?.order?.status ||
//     null;

//   const resolvePaymentMethod = (order) =>
//     order?.paymentMethod ||
//     order?.payment?.paymentMethod ||
//     order?.payment?.method ||
//     order?.paymentInfo?.paymentMethod ||
//     order?.paymentInfo?.method ||
//     order?.paymentDetail?.paymentMethod ||
//     order?.paymentDetail?.method ||
//     order?.payment?.provider ||
//     order?.methodPayment ||
//     null;

//   const resolvePaymentStatus = (order) =>
//     order?.paymentStatus ||
//     order?.payment?.paymentStatus ||
//     order?.payment?.status ||
//     order?.paymentInfo?.paymentStatus ||
//     order?.paymentInfo?.status ||
//     null;

//   // === Chuẩn hóa dữ liệu đơn hàng ===
//   const filteredOrders = useMemo(() => {
//     const source = mergedOrdersData.length > 0 ? mergedOrdersData : orders?.content || [];
//     const currentTab =
//       STATUS_TABS.find((tab) => tab.value === statusFilter) ||
//       STATUS_TABS[0];
//     const statusFilters =
//       currentTab.statuses && currentTab.statuses.length > 0
//         ? currentTab.statuses.filter((status) => status !== null)
//         : null;
//     const normalizedStatusFilters = statusFilters
//       ? statusFilters.map((status) => status.toUpperCase())
//       : null;

//     let result = source.map((order) => ({
//       id: `ORD-${order.orderId}`,
//       // date: new Date(order.createdAt || Date.now()),
//       date: new Date(order.updatedAt || order.createdAt || Date.now()),

//       status: resolveStatus(order),
//       paymentStatus: resolvePaymentStatus(order),
//       paymentMethod: resolvePaymentMethod(order),
//       total:
//         order.orderItems.reduce(
//           (sum, item) => sum + item.priceAtOrderTime * item.quantity,
//           0
//         ) - (order.discount || 0),
//       items: order.orderItems.map((item) => ({
//         id: item.orderItemId,
//         name: item.productName,
//         price: item.priceAtOrderTime,
//         quantity: item.quantity,
//         image: item.productImage,
//         color: item.productColor,
//         code: item.productCode,
//         productOptionId: item.productOptionId ?? item.productVariantId,
//       })),
//     }));

//     if (normalizedStatusFilters && normalizedStatusFilters.length > 0) {
//       result = result.filter((order) =>
//         normalizedStatusFilters.includes((order.status || "").toUpperCase())
//       );
//     }

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(
//         (order) =>
//           order.id.toLowerCase().includes(term) ||
//           order.items.some(
//             (item) =>
//               item.name.toLowerCase().includes(term) ||
//               item.code.toLowerCase().includes(term)
//           )
//       );
//     }

//     return result;
//   }, [mergedOrdersData, orders, searchTerm, statusFilter]);

//   // === Helper ===
//   const toggleOrderExpand = (orderId) => {
//     setExpandedOrder(expandedOrder === orderId ? null : orderId);
//   };

//   const formatPrice = (price) =>
//     new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(price);

//   // === Hiển thị badge trạng thái ===
//   const StatusBadge = ({ status, paymentStatus }) => {
//     const combinedStatus = `${paymentStatus || ""}_${status}`;

//     const statusConfig = {
//       PENDING: { label: "Chờ xác nhận", className: "status-badge pending" },
//       CONFIRMED: { label: "Đã xác nhận", className: "status-badge confirmed" },
//       SHIPPED: { label: "Đang giao hàng", className: "status-badge shipped" },
//       COMPLETED: { label: "Hoàn thành", className: "status-badge completed" },
//       REJECTED_RETURNED: {
//         label: "Hoàn hàng bị từ chối",
//         className: "status-badge completed",
//       },
//       CANCELLED: { label: "Đã hủy", className: "status-badge cancelled" },
//       "REFUNDED_PENDING_RETURNED": {
//         label: "Chờ xử lý hoàn hàng",
//         className: "status-badge refunded",
//       },
//       "REFUNDED_CONFIRMED_RETURNED": {
//         label: "Đã xác nhận hoàn hàng",
//         className: "status-badge refunded",
//       },
//       "REFUNDED_SHIPPED_RETURNED": {
//         label: "Đang kiểm tra hàng hoàn",
//         className: "status-badge refunded",
//       },
//       "REFUNDED_SUCCESSFUL_RETURNED": {
//         label: "Hoàn hàng thành công",
//         className: "status-badge refunded-success",
//       },
//     };

//     const config =
//       statusConfig[combinedStatus] ||
//       statusConfig[status] ||
//       statusConfig.PENDING;

//     return <span className={config.className}>{config.label}</span>;
//   };

//   const getPaymentMethodLabel = (method) => {
//     const map = {
//       COD: "Thanh toán khi nhận hàng",
//       VNPAY: "VNPay",
//       IN_APP: "Thanh toán trong ứng dụng",
//     };
//     return map[method] || method || "Không xác định";
//   };

//   const paymentStatusConfig = {
//     PAID: { label: "Đã thanh toán", className: "payment-status-badge paid" },
//     UNPAID: { label: "Chưa thanh toán", className: "payment-status-badge unpaid" },
//     FAILED: { label: "Thanh toán thất bại", className: "payment-status-badge failed" },
//     REFUNDED: {
//       label: "Yêu cầu hoàn tiền",
//       className: "payment-status-badge refunded",
//     },
//     REFUNDED_SUCCESSFUL: {
//       label: "Đã hoàn tiền",
//       className: "payment-status-badge refunded-success",
//     },
//   };

//   const PaymentStatusBadge = ({ status }) => {
//     const config = paymentStatusConfig[status] || {
//       label: status || "Không xác định",
//       className: "payment-status-badge default",
//     };
//     return <span className={config.className}>{config.label}</span>;
//   };

//   // === Action ===
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     setExpandedOrder(null);
//   };

//   const handleReturnRequest = async (id) => {
//     const idNumber = id.substring(4);
//     const res = await dispatch(refundOrder(idNumber));
//     if (res.code === 200) {
//       notification.success({
//         message: "Thành công",
//         description: "Yêu cầu hoàn hàng đã được gửi!",
//       });
//       window.location.reload();
//     } else {
//       notification.warning({
//         message: "Cảnh báo",
//         description: "Không thể gửi yêu cầu hoàn hàng!",
//       });
//     }
//   };

//   const handleCancelRequest = async (id) => {
//     const idNumber = id.substring(4);
//     const res = await dispatch(cancelOrder(idNumber));
//     if (res.code === 200) {
//       notification.success({
//         message: "Thành công",
//         description: "Đơn hàng đã được hủy!",
//       });
//       window.location.reload();
//     } else {
//       notification.warning({
//         message: "Cảnh báo",
//         description: "Không thể hủy đơn hàng!",
//       });
//     }
//   };

//   // === Review ===
//   const handleOpenReview = (product) => {
//     setSelectedProduct(product);
//     setIsRatingModalOpen(true);
//   };

//   const handleSubmitReview = async ({ rating, review }) => {
//     if (!selectedProduct) return;
//     try {
//       const body = {
//         userId: userData.id,
//         productOptionId: selectedProduct.productOptionId,
//         rating,
//         comment: review,
//       };
//       const response = await dispatch(createReview(body));
//       if (response && response.data) {
//         notification.success({
//           message: "Thành công",
//           description: "Cảm ơn bạn đã gửi đánh giá!",
//         });
//         setIsRatingModalOpen(false);
//         setSelectedProduct(null);
//       } else {
//         notification.warning({
//           message: "Không thể gửi đánh giá",
//           description: "Đã xảy ra lỗi khi gửi đánh giá.",
//         });
//       }
//     } catch {
//       notification.error({
//         message: "Lỗi mạng",
//         description: "Không thể gửi đánh giá, vui lòng thử lại.",
//       });
//     }
//   };

//   // === Giao diện ===
//   if (loading)
//     return (
//       <div className="loading-container">
//         <Spin size="large" />
//         <p>Đang tải lịch sử mua hàng...</p>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="error-container">
//         <div className="error-message">
//           <h3>Đã xảy ra lỗi</h3>
//           <p>{error.message || "Không thể tải lịch sử mua hàng"}</p>
//           <button className="retry-button" onClick={() => window.location.reload()}>
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );

//   return (
//     <div className="purchase-history-container">
//       <div className="purchase-history-header">
//         <h1>Lịch sử mua hàng</h1>
//         <div className="history-controls">
//           <Input
//             placeholder="Tìm kiếm đơn hàng..."
//             prefix={<Search size={16} />}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             allowClear
//           />
//           <Select
//             className="sort-select"
//             value={sortOrder}
//             onChange={(value) => {
//               setSortOrder(value);
//               setCurrentPage(1);
//             }}
//             options={[
//               { value: "newest", label: "Mới nhất" },
//               { value: "oldest", label: "Cũ nhất" },
//             ]}
//           />
//         </div>
//       </div>

//       {/* Tabs trạng thái */}
//       <div className="status-tabs">
//         {[
//           "all",
//           "PENDING",
//           "CONFIRMED",
//           "SHIPPED",
//           "COMPLETED",
//           "CANCELLED",
//           "RETURNED",
//         ].map((status) => (
//           <button
//             key={status}
//             className={`status-tab ${statusFilter === status ? "active" : ""}`}
//             onClick={() => {
//               setStatusFilter(status);
//               setCurrentPage(1);
//             }}
//           >
//             {status === "all"
//               ? "Tất cả"
//               : status === "PENDING"
//               ? "Chờ xác nhận"
//               : status === "CONFIRMED"
//               ? "Đã xác nhận"
//               : status === "SHIPPED"
//               ? "Đang giao"
//               : status === "COMPLETED"
//               ? "Hoàn thành"
//               : status === "RETURNED"
//               ? "Trả hàng"
//               : "Đã hủy"}
//           </button>
//         ))}
//       </div>

//       {/* Danh sách đơn hàng */}
//       <div className="orders-list-container">
//         {filteredOrders.length === 0 ? (
//           <div className="empty-state">
//             <ShoppingBag size={48} className="empty-icon" />
//             <p className="empty-text">Không tìm thấy đơn hàng nào</p>
//             <button className="continue-shopping-btn" onClick={() => navigate("/")}>
//               Tiếp tục mua sắm
//             </button>
//           </div>
//         ) : (
//           <>
//             {filteredOrders.map((order) => (
//               <div key={order.id} className="order-card">
//                 <div className="order-summary" onClick={() => toggleOrderExpand(order.id)}>
//                   <div className="order-meta">
//                     <div className="order-id-date">
//                       <span className="order-id">{order.id}</span>
//                       <span className="order-date">
//                         {new Intl.DateTimeFormat("vi-VN").format(order.date)}
//                       </span>
//                     </div>
//                     <StatusBadge
//                       status={order.status}
//                       paymentStatus={order.paymentStatus}
//                     />
//                     <div className="order-payment-meta">
//                       <span className="payment-method-pill">
//                         {getPaymentMethodLabel(order.paymentMethod)}
//                       </span>
//                       <PaymentStatusBadge status={order.paymentStatus} />
//                     </div>
//                   </div>
//                   <div className="order-amount">
//                     <span className="total-amount">{formatPrice(order.total)}</span>
//                     <span className="items-count">{order.items.length} sản phẩm</span>
//                     {expandedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
//                   </div>
//                 </div>

//                 {expandedOrder === order.id && (
//                   <div className="order-details-expanded">
//                     <div className="order-details-section">
//                       <h3>Thông tin thanh toán</h3>
//                       <div className="details-grid">
//                         <div className="detail-item">
//                           <span className="detail-label">Phương thức</span>
//                           <span className="detail-value">
//                             {getPaymentMethodLabel(order.paymentMethod)}
//                           </span>
//                         </div>
//                         <div className="detail-item">
//                           <span className="detail-label">Trạng thái thanh toán</span>
//                           <span className="detail-value">
//                             <PaymentStatusBadge status={order.paymentStatus} />
//                           </span>
//                         </div>
//                         <div className="detail-item">
//                           <span className="detail-label">Tổng thanh toán</span>
//                           <span className="detail-value">{formatPrice(order.total)}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="products-section">
//                       <h3>Sản phẩm</h3>
//                       <div className="products-list">
//                         {order.items.map((item) => (
//                           <div key={item.id} className="product-item">
//                             <div className="product-image-container">
//                               <img
//                                 src={item.image}
//                                 alt={item.name}
//                                 className="product-image"
//                                 onError={(e) => {
//                                   e.target.src = "/placeholder.svg";
//                                   e.target.onerror = null;
//                                 }}
//                               />
//                             </div>
//                             <div className="product-info">
//                               <h4 className="product-name">{item.name}</h4>
//                               <p className="product-code">Mã: {item.code}</p>
//                               <p className="product-quantity">Số lượng: {item.quantity}</p>
//                               <p className="product-color">Màu: {item.color}</p>

//                               {order.status === "COMPLETED" && (
//                                 <button
//                                   className="review-btn"
//                                   onClick={() => handleOpenReview(item)}
//                                 >
//                                   ✏️ Viết đánh giá
//                                 </button>
//                               )}
//                             </div>
//                             <div className="product-price">
//                               {formatPrice(item.price * item.quantity)}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Khu vực hành động */}
//                     <div className="order-actions">
//                       <div className="status-info">
//                         {order.status === "PENDING" && (
//                           <div className="status-message pending">
//                             <Package size={20} />
//                             <span>Đang chờ xác nhận</span>
//                             <button
//                               className="cancel-button"
//                               onClick={() => handleCancelRequest(order.id)}
//                             >
//                               Huỷ đơn hàng
//                             </button>
//                           </div>
//                         )}

//                         {order.status === "COMPLETED" &&
//                           order.paymentStatus === "PAID" && (
//                             <div className="status-message completed">
//                               <CheckCircle size={20} />
//                               <span>Đã giao hàng thành công</span>
//                               <button
//                                 className="secondary-button"
//                                 onClick={() => handleReturnRequest(order.id)}
//                               >
//                                 Trả hàng / Hoàn tiền
//                               </button>
//                             </div>
//                           )}

//                         {order.paymentStatus === "REFUNDED" &&
//                           ["PENDING_RETURNED", "CONFIRMED_RETURNED", "SHIPPED_RETURNED"].includes(
//                             order.status
//                           ) && (
//                             <div className="status-message refunded">
//                               <RefreshCw size={20} />
//                               <span>Đang xử lý hoàn hàng...</span>
//                             </div>
//                           )}

//                         {order.paymentStatus === "REFUNDED_SUCCESSFUL" &&
//                           order.status === "RETURNED" && (
//                             <div className="status-message refunded-success">
//                               <CheckCircle size={20} />
//                               <span>Đã hoàn hàng thành công 🎉</span>
//                             </div>
//                           )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}

//             <div className="pagination-wrapper">
//               <Pagination
//                 current={currentPage}
//                 total={orders?.totalElements || 0}
//                 pageSize={ordersPerPage}
//                 onChange={handlePageChange}
//                 showSizeChanger={false}
//                 showQuickJumper
//               />
//             </div>
//           </>
//         )}
//       </div>

//       {/* Modal đánh giá */}
//       <RatingModal
//         isOpen={isRatingModalOpen}
//         onClose={() => setIsRatingModalOpen(false)}
//         onSubmit={handleSubmitReview}
//       />
//     </div>
//   );
// };

// export default PurchaseHistory;

// import React, { useState, useEffect, useMemo, useContext } from "react";
// import {
//   ChevronDown,
//   ChevronUp,
//   Search,
//   ShoppingBag,
//   Package,
//   Truck,
//   RefreshCw,
//   CheckCircle,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { Pagination, Spin, Input, Select } from "antd";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   cancelOrder,
//   getAllHistoryOrder,
//   refundOrder,
// } from "../../Redux/actions/OrderItemThunk";
// import { createReview } from "../../Redux/actions/RatingThunk";
// import "../style/PurchaseHistory.css";
// import { NotificationContext } from "../../components/NotificationProvider";
// import RatingModal from "./RatingModal";

// const STATUS_TABS = [
//   { value: "all", label: "Tất cả" },
//   { value: "PENDING", label: "Chờ xác nhận" },
//   { value: "CONFIRMED", label: "Đã xác nhận" },
//   { value: "SHIPPED", label: "Đang giao" },
//   { value: "COMPLETED", label: "Hoàn thành" },
//   { value: "CANCELLED", label: "Đã hủy" },
//   {
//     value: "RETURNED",
//     label: "Trả hàng",
//     group: [
//       "PENDING_RETURNED",
//       "CONFIRMED_RETURNED",
//       "SHIPPED_RETURNED",
//       "RETURNED",
//     ],
//   },
// ];

// const PurchaseHistory = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const notification = useContext(NotificationContext);

//   const { loading, error } = useSelector((state) => state.OrderReducer);

//   const [ordersSource, setOrdersSource] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [sortOrder, setSortOrder] = useState("newest");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [expandedOrder, setExpandedOrder] = useState(null);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

//   const ordersPerPage = 5;

//   const [userData] = useState(() => {
//     const u = localStorage.getItem("USER_LOGIN");
//     return u ? JSON.parse(u) : null;
//   });

//   // ======================================
//   // 🚀 FETCH ALL ORDERS 1 LẦN
//   // ======================================
//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         const res = await dispatch(
//           getAllHistoryOrder(0, 9999, null, "desc", userData?.id)
//         );

//         setOrdersSource(res?.content || []);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetch();
//   }, [dispatch, userData?.id]);

//   // ======================================
//   // 🔥 NORMALIZE DATA
//   // ======================================
//   const normalizeOrder = (order) => ({
//     id: `ORD-${order.orderId}`,
//     date: new Date(order.updatedAt || order.createdAt),
//     status:
//       order.orderStatus ||
//       order.status ||
//       order.currentStatus ||
//       order?.order?.status,
//     total:
//       order.orderItems.reduce(
//         (sum, item) => sum + item.priceAtOrderTime * item.quantity,
//         0
//       ) - (order.discount || 0),
//     paymentStatus:
//       order.paymentStatus ||
//       order?.payment?.paymentStatus ||
//       order?.payment?.status,
//     paymentMethod:
//       order.paymentMethod ||
//       order?.payment?.paymentMethod ||
//       order?.payment?.provider ||
//       order?.paymentInfo?.paymentMethod,
//     items: order.orderItems.map((i) => ({
//       id: i.orderItemId,
//       name: i.productName,
//       price: i.priceAtOrderTime,
//       quantity: i.quantity,
//       image: i.productImage,
//       color: i.productColor,
//       code: i.productCode,
//       productOptionId: i.productOptionId,
//     })),
//   });

//   // ======================================
//   // 🔍 FILTER + SORT + SEARCH (CLIENT SIDE)
//   // ======================================
//   const filteredOrders = useMemo(() => {
//     let list = ordersSource.map(normalizeOrder);

//     // Filter by status
//     const tab = STATUS_TABS.find((t) => t.value === statusFilter);

//     if (statusFilter !== "all") {
//       if (tab.group) {
//         list = list.filter((o) => tab.group.includes(o.status));
//       } else {
//         list = list.filter((o) => o.status === statusFilter);
//       }
//     }

//     // Search
//     if (searchTerm) {
//       const t = searchTerm.toLowerCase();
//       list = list.filter(
//         (o) =>
//           o.id.toLowerCase().includes(t) ||
//           o.items.some(
//             (i) =>
//               i.name.toLowerCase().includes(t) ||
//               i.code.toLowerCase().includes(t)
//           )
//       );
//     }

//     // Sort
//     list.sort((a, b) =>
//       sortOrder === "newest"
//         ? b.date - a.date
//         : a.date - b.date
//     );

//     return list;
//   }, [ordersSource, searchTerm, statusFilter, sortOrder]);

//   // ======================================
//   // PHÂN TRANG (CLIENT)
//   // ======================================
//   const paginatedOrders = useMemo(() => {
//     const start = (currentPage - 1) * ordersPerPage;
//     return filteredOrders.slice(start, start + ordersPerPage);
//   }, [filteredOrders, currentPage]);

//   // ======================================
//   // EVENTS
//   // ======================================

//   const toggleOrderExpand = (id) =>
//     setExpandedOrder(expandedOrder === id ? null : id);

//   const formatPrice = (p) =>
//     new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

//   const handleCancelOrder = async (id) => {
//     const oid = id.substring(4);
//     const res = await dispatch(cancelOrder(oid));
//     if (res.code === 200) {
//       notification.success({ message: "Huỷ thành công" });
//       window.location.reload();
//     }
//   };

//   const handleReturnOrder = async (id) => {
//     const oid = id.substring(4);
//     const res = await dispatch(refundOrder(oid));
//     if (res.code === 200) {
//       notification.success({ message: "Đã gửi yêu cầu hoàn hàng" });
//       window.location.reload();
//     }
//   };

//   const handleSubmitReview = async ({ rating, review }) => {
//     if (!selectedProduct) return;

//     const body = {
//       userId: userData.id,
//       productOptionId: selectedProduct.productOptionId,
//       rating,
//       comment: review,
//     };

//     const res = await dispatch(createReview(body));

//     if (res?.data) {
//       notification.success({ message: "Đã gửi đánh giá" });
//       setIsRatingModalOpen(false);
//     }
//   };

//   // ======================================
//   // RENDER
//   // ======================================

//   if (loading)
//     return (
//       <div className="loading-container">
//         <Spin />
//         <p>Đang tải...</p>
//       </div>
//     );

//   if (error)
//     return <div className="error-container">Không thể tải dữ liệu</div>;

//   return (
//     <div className="purchase-history-container">

//       {/* HEADER */}
//       <div className="purchase-history-header">
//         <h1>Lịch sử mua hàng</h1>

//         <div className="history-controls">
//           <Input
//             placeholder="Tìm kiếm..."
//             prefix={<Search size={16} />}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />

//           <Select
//             value={sortOrder}
//             onChange={(v) => setSortOrder(v)}
//             options={[
//               { value: "newest", label: "Mới nhất" },
//               { value: "oldest", label: "Cũ nhất" },
//             ]}
//           />
//         </div>
//       </div>

//       {/* TABS */}
//       <div className="status-tabs">
//         {STATUS_TABS.map((tab) => (
//           <button
//             key={tab.value}
//             className={`status-tab ${statusFilter === tab.value ? "active" : ""}`}
//             onClick={() => {
//               setStatusFilter(tab.value);
//               setCurrentPage(1);
//             }}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* LIST */}
//       <div className="orders-list-container">
//         {paginatedOrders.length === 0 ? (
//           <div className="empty-state">
//             <ShoppingBag size={40} />
//             <p>Không có đơn hàng</p>
//             <button onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
//           </div>
//         ) : (
//           paginatedOrders.map((order) => (
//             <div key={order.id} className="order-card">

//               <div className="order-summary" onClick={() => toggleOrderExpand(order.id)}>
//                 <div className="order-meta">
//                   <span className="order-id">{order.id}</span>
//                   <span className="order-date">
//                     {new Intl.DateTimeFormat("vi-VN").format(order.date)}
//                   </span>
//                   <span className="status-pill">{order.status}</span>
//                 </div>

//                 <div className="order-amount">
//                   <span>{formatPrice(order.total)}</span>
//                   {expandedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
//                 </div>
//               </div>

//               {expandedOrder === order.id && (
//                 <div className="order-details-expanded">

//                   {/* PRODUCTS */}
//                   <div className="products-section">
//                     {order.items.map((item) => (
//                       <div key={item.id} className="product-item">
//                         <img src={item.image} alt="" />

//                         <div>
//                           <h4>{item.name}</h4>
//                           <p>Mã: {item.code}</p>
//                           <p>Số lượng: {item.quantity}</p>
//                           <p>Màu: {item.color}</p>

//                           {order.status === "COMPLETED" && (
//                             <button
//                               className="review-btn"
//                               onClick={() => {
//                                 setSelectedProduct(item);
//                                 setIsRatingModalOpen(true);
//                               }}
//                             >
//                               Đánh giá
//                             </button>
//                           )}
//                         </div>

//                         <div>{formatPrice(item.price * item.quantity)}</div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* ACTIONS */}
//                   <div className="order-actions">
//                     {order.status === "PENDING" && (
//                       <button
//                         className="cancel-button"
//                         onClick={() => handleCancelOrder(order.id)}
//                       >
//                         Hủy đơn
//                       </button>
//                     )}

//                     {order.status === "COMPLETED" && (
//                       <button
//                         className="return-button"
//                         onClick={() => handleReturnOrder(order.id)}
//                       >
//                         Trả hàng / Hoàn tiền
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))
//         )}

//         {/* PAGINATION */}
//         <Pagination
//           current={currentPage}
//           total={filteredOrders.length}
//           pageSize={ordersPerPage}
//           onChange={(p) => setCurrentPage(p)}
//         />
//       </div>

//       <RatingModal
//         isOpen={isRatingModalOpen}
//         onClose={() => setIsRatingModalOpen(false)}
//         onSubmit={handleSubmitReview}
//       />
//     </div>
//   );
// };

// export default PurchaseHistory;

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
import "../style/PurchaseHistory.css";
import { NotificationContext } from "../../components/NotificationProvider";
import RatingModal from "./RatingModal";

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

  const ordersPerPage = 5;

  const [userData] = useState(() => {
    const u = localStorage.getItem("USER_LOGIN");
    return u ? JSON.parse(u) : null;
  });

  // ======================================================
  // FETCH ALL ORDERS (ONLY 1 TIME)
  // ======================================================
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

  // ======================================================
  // NORMALIZE ORDER
  // ======================================================
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

  // ======================================================
  // PAYMENT METHOD LABEL (OLD VERSION)
  // ======================================================
  const getPaymentMethodLabel = (method) => {
    const map = {
      COD: "Thanh toán khi nhận hàng",
      VNPAY: "VNPay",
      IN_APP: "Thanh toán trong ứng dụng",
    };
    return map[method] || method || "Không xác định";
  };

  // ======================================================
  // PAYMENT STATUS BADGE (OLD VERSION)
  // ======================================================
  const PaymentStatusBadge = ({ status }) => {
    const config = {
      PAID: { label: "Đã thanh toán", className: "payment-status-badge paid" },
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

    const result = config[status] || {
      label: status || "Không xác định",
      className: "payment-status-badge default",
    };

    return <span className={result.className}>{result.label}</span>;
  };

  // ======================================================
  // STATUS BADGE (OLD VERSION - COLORS RESTORED)
  // ======================================================
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
        label: "Đã xác nhận hoàn hàng",
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

  // ======================================================
  // FILTER + SEARCH + SORT (CLIENT)
  // ======================================================
  const filteredOrders = useMemo(() => {
    let list = ordersSource.map(normalizeOrder);

    const tab = STATUS_TABS.find((t) => t.value === statusFilter);

    if (statusFilter !== "all") {
      if (tab.group) list = list.filter((o) => tab.group.includes(o.status));
      else list = list.filter((o) => o.status === statusFilter);
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

  // ======================================================
  // PAGINATION
  // ======================================================
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, currentPage]);

  // ======================================================
  // ACTIONS
  // ======================================================
  const toggleOrderExpand = (id) =>
    setExpandedOrder(expandedOrder === id ? null : id);

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      p
    );

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

  const handleSubmitReview = async ({ rating, review }) => {
    if (!selectedProduct) return;

    const body = {
      userId: userData.id,
      productOptionId: selectedProduct.productOptionId,
      rating,
      comment: review,
    };

    const res = await dispatch(createReview(body));

    if (res?.data) {
      notification.success({ message: "Đã gửi đánh giá" });
      setIsRatingModalOpen(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

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
      {/* ===== HEADER ===== */}
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

      {/* ===== TABS ===== */}
      <div className="status-tabs">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            className={`status-tab ${statusFilter === t.value ? "active" : ""}`}
            onClick={() => {
              setStatusFilter(t.value);
              setCurrentPage(1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== ORDERS LIST ===== */}
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
                <div className="order-summary" onClick={() => toggleOrderExpand(order.id)}>
                  <div className="order-meta">
                    <div className="order-id-date">
                      <span className="order-id">{order.id}</span>
                      <span className="order-date">
                        {new Intl.DateTimeFormat("vi-VN").format(order.date)}
                      </span>
                    </div>

                    {/* Badge cũ */}
                    <StatusBadge status={order.status} />

                    {/* Payment UI cũ */}
                    <div className="order-payment-meta">
                      <span className="payment-method-pill">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>

                  <div className="order-amount">
                    <span className="total-amount">{formatPrice(order.total)}</span>
                    <span className="items-count">{order.items.length} sản phẩm</span>
                    {expandedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="order-details-expanded">
                    {/* PAYMENT DETAIL */}
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
                          <span className="detail-label">Trạng thái thanh toán</span>
                          <span className="detail-value">
                            <PaymentStatusBadge status={order.paymentStatus} />
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
                              <p className="product-quantity">SL: {item.quantity}</p>
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
                              onClick={() => handleReturnOrder(order.id)}
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

            {/* PAGINATION */}
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

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};

export default PurchaseHistory;
