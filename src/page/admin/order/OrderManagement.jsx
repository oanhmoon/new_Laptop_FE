
// import React, { useState, useEffect, useContext } from "react";
// import {
//   Table,
//   Button,
//   Row,
//   Col,
//   Modal,
//   Form,
//   Typography,
//   Select,
//   Card,
//   Tag,
//   Divider,
//   Space,
//   Descriptions,
//   Pagination,
//   ConfigProvider,
//   Empty,
//   DatePicker
// } from "antd";
// import {
//   EditOutlined,
//   EyeOutlined,
//   SortAscendingOutlined,
//   SortDescendingOutlined,
//   ExclamationCircleFilled,
//   CheckCircleOutlined,
//   FilePdfOutlined,
//   CloseCircleOutlined
// } from "@ant-design/icons";
// import { useDispatch } from "react-redux";
// import {
//   getAllOrders,
//   updateOrderStatus,
//   acceptRefund,
//   acceptReturn,
//   verifyReturn,
//   rejectRefund
// } from "../../../Redux/actions/OrderItemThunk";
// import dayjs from "dayjs";
// import { NotificationContext } from "../../../components/NotificationProvider";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

// // Fonts (nếu bạn dùng)
// import timesNewRomanNormal from "../../../assets/fonts/times.ttf";
// import timesNewRomanBold from "../../../assets/fonts/times-bold.ttf";

// const { Title } = Typography;
// const { Option } = Select;
// const { RangePicker } = DatePicker;

// const getStatusColor = (status) => {
//   const statusColors = {
//     CANCELLED: "red",
//     COMPLETED: "green",
//     CONFIRMED: "blue",
//     PENDING: "orange",
//     SHIPPED: "purple",
//     PENDING_RETURNED: "orange",
//     CONFIRMED_RETURNED: "blue",
//     SHIPPED_RETURNED: "purple",
//     REJECTED_RETURNED: "red",
//     RETURNED: "cyan"
//   };
//   return statusColors[status] || "default";
// };

// const getStatusText = (status) => {
//   const statusMap = {
//     CANCELLED: "Đã hủy",
//     COMPLETED: "Hoàn thành",
//     CONFIRMED: "Đã xác nhận",
//     PENDING: "Đang xử lý",
//     SHIPPED: "Đang giao hàng",
//     PENDING_RETURNED: "Chờ xác nhận trả hàng",
//     CONFIRMED_RETURNED: "Chờ hoàn hàng",
//     SHIPPED_RETURNED: "Đã nhận hàng hoàn",
//     RETURNED: "Trả hàng thành công",
//     REJECTED_RETURNED: "Từ chối hoàn hàng"
//   };
//   return statusMap[status] || status;
// };

// const getPaymentStatusColor = (status) => {
//   const statusColors = {
//     FAILED: "red",
//     PAID: "green",
//     REFUNDED: "orange",
//     REFUNDED_SUCCESSFUL: "cyan",
//     UNPAID: "gold"
//   };
//   return statusColors[status] || "default";
// };

// const getPaymentStatusText = (status) => {
//   const statusMap = {
//     FAILED: "Thất bại",
//     PAID: "Đã thanh toán",
//     REFUNDED: "Yêu cầu hoàn tiền",
//     REFUNDED_SUCCESSFUL: "Đã hoàn tiền",
//     UNPAID: "Chưa thanh toán"
//   };
//   return statusMap[status] || status;
// };

// const formatAddress = (info) => {
//   if (!info || !info.ward) return "N/A";
//   const { detailAddress, ward } = info;
//   return `${detailAddress}, ${ward.name}, ${ward.district.name}, ${ward.district.province.name}`;
// };

// const OrderManagement = () => {
//   // state
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [totalElements, setTotalElements] = useState(0);

//   const [paymentMethod, setPaymentMethod] = useState(null);
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [orderStatus, setOrderStatus] = useState(null);
//   const [sortField, setSortField] = useState("createdAt");
//   const [sortDirection, setSortDirection] = useState("desc");

//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(5);

//   const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
//   const [currentOrder, setCurrentOrder] = useState(null);

//   const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
//   const [orderToRefund, setOrderToRefund] = useState(null);

//   const [dateRange, setDateRange] = useState(null);

//   const [form] = Form.useForm();
//   const dispatch = useDispatch();
//   const notification = useContext(NotificationContext);

//   useEffect(() => {
//     fetchOrders();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentPage, pageSize, paymentMethod, paymentStatus, orderStatus, sortField, sortDirection, dateRange]);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       let startDate = null;
//       let endDate = null;
//       if (dateRange && dateRange.length === 2) {
//         startDate = dateRange[0].format("YYYY-MM-DD");
//         endDate = dateRange[1].format("YYYY-MM-DD");
//       }

//       const res = await dispatch(
//         getAllOrders(startDate, endDate, orderStatus, paymentMethod, paymentStatus, currentPage, pageSize, sortField, sortDirection)
//       );

//       if (res && res.content) {
//         setOrders(res.content);
//         setTotalElements(res.totalElements);
//       } else {
//         setOrders([]);
//         setTotalElements(0);
//       }
//     } catch (error) {
//       console.error("Fetch orders error", error);
//       notification.error({ message: "Đã xảy ra lỗi khi tải dữ liệu" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDateRangeChange = (dates) => {
//     setDateRange(dates);
//     setCurrentPage(1);
//   };

//   const handleViewDetails = (order) => {
//     setCurrentOrder(order);
//     setIsDetailModalVisible(true);
//   };

//   const handleStatusUpdateModal = (order) => {
//     if (order.status === "CANCELLED" || order.status === "COMPLETED") {
//       notification.warning({
//         message: "Không thể cập nhật",
//         description: order.status === "CANCELLED" ? "Đơn hàng đã bị hủy không thể cập nhật trạng thái." : "Đơn hàng đã hoàn thành không thể cập nhật trạng thái."
//       });
//       return;
//     }
//     setCurrentOrder(order);
//     form.setFieldsValue({ status: order.status });
//     Modal.info({
//       title: "Cập nhật trạng thái",
//       content: "Vui lòng dùng box cập nhật trạng thái (mở modal Cập nhật)."
//     });
//     setIsDetailModalVisible(false);
//     setTimeout(() => setIsStatusModalVisible(true), 0); // not used but kept compatibility (we'll use our modal below)
//   };

//   // We'll reuse your existing Status Update modal logic:
//   const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);

//   const handleStatusUpdate = async () => {
//     try {
//       const values = await form.validateFields();
//       if (!currentOrder) return;

//       if (currentOrder.status === "CANCELLED" || currentOrder.status === "COMPLETED" || currentOrder.status === "REJECTED_RETURNED") {
//         notification.warning({ message: "Không thể cập nhật" });
//         setIsStatusModalVisible(false);
//         return;
//       }

//       setLoading(true);
//       const code = await dispatch(updateOrderStatus(currentOrder.id, { status: values.status }));
//       if (code === 200) {
//         notification.success({ message: "Cập nhật trạng thái đơn hàng thành công" });
//         fetchOrders();
//         setIsStatusModalVisible(false);
//       } else {
//         notification.error({ message: "Không thể cập nhật trạng thái đơn hàng" });
//       }
//     } catch (error) {
//       console.error(error);
//       notification.error({ message: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Accept refund (existing)
//   const handleAcceptRefund = async (order) => {
//     if (!order) return;
//     try {
//       setLoading(true);
//       const code = await dispatch(acceptRefund(order.id));
//       if (code === 200) {
//         notification.success({ message: "Hoàn tiền thành công", description: `Đơn hàng #${order.id} đã được hoàn tiền.` });
//         fetchOrders();
//       } else {
//         notification.error({ message: "Hoàn tiền thất bại" });
//       }
//     } catch (error) {
//       console.error(error);
//       notification.error({ message: "Đã xảy ra lỗi khi hoàn tiền" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // NEW: accept return (/accept/return/{orderId})
//   const handleAcceptReturn = async (order) => {
//     if (!order) return;
//     try {
//       setLoading(true);
//       const code = await dispatch(acceptReturn(order.id));
//       if (code === 200) {
//         notification.success({ message: "Đã xác nhận trả hàng", description: `Đơn hàng #${order.id}` });
//         fetchOrders();
//       } else {
//         notification.error({ message: "Xác nhận trả hàng thất bại" });
//       }
//     } catch (error) {
//       console.error(error);
//       notification.error({ message: "Đã xảy ra lỗi khi xác nhận trả hàng" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // NEW: verify return (/verify/return/{orderId})
//   const handleVerifyReturn = async (order) => {
//     if (!order) return;
//     try {
//       setLoading(true);
//       const code = await dispatch(verifyReturn(order.id));
//       if (code === 200) {
//         notification.success({ message: "Đã xác minh hàng trả về", description: `Đơn hàng #${order.id}` });
//         fetchOrders();
//       } else {
//         notification.error({ message: "Xác minh thất bại" });
//       }
//     } catch (error) {
//       console.error(error);
//       notification.error({ message: "Đã xảy ra lỗi khi xác minh trả hàng" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // NEW: reject refund (/reject/refund/{orderId})
//   const handleRejectRefund = async (order) => {
//     if (!order) return;
//     try {
//       setLoading(true);
//       const code = await dispatch(rejectRefund(order.id));
//       if (code === 200) {
//         notification.success({ message: "Đã từ chối hoàn tiền", description: `Đơn hàng #${order.id}` });
//         fetchOrders();
//       } else {
//         notification.error({ message: "Từ chối hoàn tiền thất bại" });
//       }
//     } catch (error) {
//       console.error(error);
//       notification.error({ message: "Đã xảy ra lỗi khi từ chối hoàn tiền" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper for calculating discount and totals (kept same)
//   const calculateDiscountAmount = (order) => {
//     if (!order || !order.discount) return 0;
//     const { discount } = order;
//     const subtotal = order.orderItems.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0);
//     if (discount.discountType === "PERCENT") {
//       return (subtotal * discount.discountValue) / 100;
//     } else if (discount.discountType === "FIXED") {
//       return discount.discountValue;
//     }
//     return 0;
//   };

//   // PDF exporter (kept your previous code)
//   const exportInvoiceToPdf = (order) => {
//     if (!order) return;
//     const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
//     // register fonts if present
//     try {
//       doc.addFont(timesNewRomanNormal, "TimesNewRoman", "normal");
//       doc.addFont(timesNewRomanBold, "TimesNewRoman", "bold");
//     } catch (e) {
//       // fonts optional
//     }
//     doc.setFontSize(20);
//     doc.setFont("TimesNewRoman", "bold");
//     doc.text("HÓA ĐƠN BÁN HÀNG", 105, 20, { align: "center" });
//     doc.setFontSize(12);
//     doc.setFont("TimesNewRoman", "normal");
//     doc.text("TECH LAPTOP", 105, 30, { align: "center" });
//     doc.text("Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HN", 105, 35, { align: "center" });
//     doc.text("Điện thoại: 0123456789 - Email: contact@techstore.com", 105, 40, { align: "center" });

//     doc.setFontSize(11);
//     doc.line(15, 45, 195, 45);
//     doc.text(`Mã đơn hàng: #${order.id}`, 15, 55);
//     doc.text(`Ngày tạo: ${dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}`, 15, 60);
//     doc.text(`Trạng thái: ${getStatusText(order.status)}`, 15, 65);
//     doc.text(
//       `Phương thức thanh toán: ${
//         order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : order.paymentMethod === "VNPAY" ? "VN Pay" : order.paymentMethod === "IN_APP" ? "Thanh toán trong ứng dụng" : order.paymentMethod
//       }`,
//       15,
//       70
//     );

//     // buyer info
//     doc.setFontSize(12);
//     doc.setFont("TimesNewRoman", "bold");
//     doc.text("THÔNG TIN NGƯỜI MUA", 15, 80);
//     doc.setFont("TimesNewRoman", "normal");
//     doc.setFontSize(11);
//     doc.text(`Họ tên: ${order.user?.fullName || "N/A"}`, 15, 85);
//     doc.text(`Email: ${order.user?.email || "N/A"}`, 15, 90);
//     doc.text(`Điện thoại: ${order.user?.phoneNumber || "N/A"}`, 15, 95);

//     let currentY = 105;
//     doc.setFontSize(12);
//     doc.setFont("TimesNewRoman", "bold");
//     doc.text("THÔNG TIN NGƯỜI NHẬN", 15, currentY);
//     doc.setFont("TimesNewRoman", "normal");
//     doc.setFontSize(11);

//     currentY += 5;
//     doc.text(`Họ tên: ${order.infoUserReceive?.fullName || "N/A"}`, 15, currentY);
//     currentY += 5;
//     doc.text(`Email: ${order.infoUserReceive?.email || "N/A"}`, 15, currentY);
//     currentY += 5;
//     doc.text(`Điện thoại: ${order.infoUserReceive?.phoneNumber || "N/A"}`, 15, currentY);

//     const address = formatAddress(order.infoUserReceive);
//     const maxWidth = 175;
//     const addressLines = doc.splitTextToSize(address, maxWidth);

//     currentY += 5;
//     doc.text(`Địa chỉ:`, 15, currentY);
//     addressLines.forEach((line, index) => {
//       doc.text(line, 30, currentY + index * 5);
//     });

//     const tableStartY = currentY + addressLines.length * 5 + 10;

//     // product table
//     doc.setFontSize(12);
//     doc.setFont("TimesNewRoman", "bold");
//     doc.text("CHI TIẾT SẢN PHẨM", 15, tableStartY);

//     const tableColumn = ["STT", "Tên sản phẩm", "Mã SP", "Màu sắc", "Đơn giá", "SL", "Thành tiền"];
//     const tableRows = [];

//     order.orderItems.forEach((item, index) => {
//       const priceFormatted = new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(item.priceAtOrderTime);
//       const totalFormatted = new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(item.priceAtOrderTime * item.quantity);
//       tableRows.push([index + 1, item.productName, item.productCode, item.productColor, priceFormatted, item.quantity, totalFormatted]);
//     });

//     autoTable(doc, {
//       startY: tableStartY + 5,
//       head: [tableColumn],
//       body: tableRows,
//       theme: "grid",
//       styles: { cellPadding: 3, fontSize: 10 },
//       margin: { left: 15, right: 15 }
//     });

//     const finalY = (doc.lastAutoTable?.finalY || tableStartY + 5) + 15;
//     const subtotal = order.orderItems.reduce((t, it) => t + it.priceAtOrderTime * it.quantity, 0);
//     const discountAmount = order.discount ? calculateDiscountAmount(order) : 0;
//     const total = subtotal - discountAmount;

//     doc.setFontSize(11);
//     doc.text("Tổng tiền sản phẩm:", 20, finalY);
//     doc.text(`${new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(subtotal)} VNĐ`, 180, finalY, { align: "right" });

//     if (order.discount) {
//       doc.text(`Giảm giá: -${new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(discountAmount)} VNĐ`, 180, finalY + 8, { align: "right" });
//     }

//     doc.setFont("TimesNewRoman", "bold");
//     doc.text(`TỔNG THANH TOÁN: ${new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(total)} VNĐ`, 180, finalY + 20, { align: "right" });

//     doc.save(`Hoa_don_${order.id}_${dayjs().format("DDMMYYYY")}.pdf`);
//   };

//   // Render action buttons: keep old actions and add rules for new combos
//   const renderActions = (record) => {
//     const elems = [];

//     // always: view details
//     elems.push(
//       <Button key="view" type="primary" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} size="middle" title="Xem chi tiết" style={{ borderRadius: 4 }} />
//     );

//     // Preserve existing "update status" button logic (as before)
//     if (record.status !== "CANCELLED" && record.status !== "COMPLETED" && record.status !== "REJECTED_RETURNED" && record.status !== "PENDING_RETURNED" && record.status !== "CONFIRMED_RETURNED" && record.status !== "SHIPPED_RETURNED") {
//       elems.push(
//         <Button key="update" type="primary" style={{ background: "#52c41a", borderRadius: 4 }} icon={<EditOutlined />} onClick={() => { setCurrentOrder(record); form.setFieldsValue({ status: record.status }); setIsStatusModalVisible(true); }} size="middle" title="Cập nhật trạng thái" />
//       );
//     }

//     // Special cases based on paymentStatus + order.status (new)
//     // REFUNDED + PENDING_RETURNED -> View + Accept Return (/accept/return) + Reject Refund (/reject/refund)
//     if (record.paymentStatus === "REFUNDED" && record.status === "PENDING_RETURNED") {
//       elems.push(
//         <Button key="acceptReturn" type="default" icon={<CheckCircleOutlined />} onClick={() => handleAcceptReturn(record)} title="Xác nhận trả hàng" size="middle" />
//       );
//       elems.push(
//         <Button key="rejectRefund1" danger type="default" icon={<CloseCircleOutlined />} onClick={() => handleRejectRefund(record)} title="Từ chối hoàn tiền" size="middle" />
//       );
//       return <Space>{elems}</Space>;
//     }

//     // REFUNDED + CONFIRMED_RETURNED -> View + Verify Return (/verify/return)
//     if (record.paymentStatus === "REFUNDED" && record.status === "CONFIRMED_RETURNED") {
//       elems.push(
//         <Button key="verifyReturn" type="default" icon={<CheckCircleOutlined />} onClick={() => handleVerifyReturn(record)} title="Xác minh hàng trả về" size="middle" />
//       );
//       return <Space>{elems}</Space>;
//     }

//     // REFUNDED + SHIPPED_RETURNED -> View + Accept Refund (/accept/refund) + Reject (/reject/refund)
//     if (record.paymentStatus === "REFUNDED" && record.status === "SHIPPED_RETURNED") {
//       elems.push(
//         <Button key="acceptRefund" type="primary" style={{ background: "#1890ff", borderRadius: 4 }} icon={<CheckCircleOutlined />} onClick={() => handleAcceptRefund(record)} size="middle" title="Chấp nhận hoàn tiền" />
//       );
//       elems.push(
//         <Button key="rejectRefund2" danger type="default" icon={<CloseCircleOutlined />} onClick={() => handleRejectRefund(record)} title="Từ chối hoàn tiền" size="middle" />
//       );
//       return <Space>{elems}</Space>;
//     }

//     // REFUNDED_SUCCESSFUL + RETURNED -> Only view
//     if (record.paymentStatus === "REFUNDED_SUCCESSFUL" && record.status === "RETURNED") {
//       return <Space>{elems}</Space>;
//     }

//     // Fallback: show existing acceptRefund if paymentStatus === REFUNDED (old behavior)
//     if (record.paymentStatus === "REFUNDED") {
//       elems.push(
//         <Button key="acceptRefund" type="primary" style={{ background: "#1890ff", borderRadius: 4 }} icon={<CheckCircleOutlined />} onClick={() => handleAcceptRefund(record)} size="middle" title="Chấp nhận hoàn tiền" />
//       );
//     }

//     // Existing PDF button
//     if (record.status === "COMPLETED") {
//       elems.push(
//         <Button key="pdf" type="primary" style={{ background: "#722ed1", borderRadius: 4 }} icon={<FilePdfOutlined />} onClick={() => exportInvoiceToPdf(record)} size="middle" title="Xuất hoá đơn" />
//       );
//     }

//     return <Space>{elems}</Space>;
//   };

//   // table columns
//   const columns = [
//     {
//       title: "STT",
//       key: "index",
//       width: 60,
//       align: "center",
//       render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
//     },
//     {
//       title: "Mã đơn hàng",
//       dataIndex: "id",
//       key: "id",
//       width: 100,
//       render: (id) => <span>#{id}</span>
//     },
//     {
//       title: "Khách hàng",
//       dataIndex: "user",
//       key: "user",
//       width: 150,
//       render: (user) => <span>{user?.fullName || "N/A"}</span>
//     },
//     {
//       title: "Người nhận",
//       dataIndex: "infoUserReceive",
//       key: "recipient",
//       width: 150,
//       render: (info) => <span>{info?.fullName || "N/A"}</span>
//     },
//     {
//       title: "Phương thức",
//       dataIndex: "paymentMethod",
//       key: "paymentMethod",
//       width: 140,
//       render: (method) => {
//         const methodMap = {
//           COD: "Thanh toán khi nhận hàng",
//           VNPAY: "VN Pay",
//           IN_APP: "Thanh toán trong ứng dụng"
//         };
//         return <span>{methodMap[method] || method}</span>;
//       }
//     },
//     {
//       title: "Trạng thái thanh toán",
//       dataIndex: "paymentStatus",
//       key: "paymentStatus",
//       width: 160,
//       render: (status) => <Tag color={getPaymentStatusColor(status)}>{getPaymentStatusText(status)}</Tag>
//     },
//     {
//       title: "Trạng thái đơn hàng",
//       dataIndex: "status",
//       key: "status",
//       width: 160,
//       render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
//     },
//     {
//       title: "Ngày tạo",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       width: 150,
//       render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-")
//     },
//     {
//       title: "Cập nhật",
//       dataIndex: "updatedAt",
//       key: "updatedAt",
//       width: 150,
//       render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-")
//     },
//     {
//       title: "Tổng tiền",
//       key: "totalAmount",
//       width: 150,
//       render: (_, record) => {
//         const subtotal = record.orderItems?.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0) || 0;
//         const discountAmount = record.discount ? calculateDiscountAmount(record) : 0;
//         const total = subtotal - discountAmount;
//         return (
//           <span style={{ fontWeight: "bold", color: "#ff4d4f" }}>
//             {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(total)}
//           </span>
//         );
//       }
//     },
//     {
//       title: "Thao tác",
//       key: "actions",
//       width: 260,
//       align: "center",
//       render: (_, record) => renderActions(record)
//     }
//   ];

//   return (
//     <ConfigProvider
//       theme={{
//         components: {
//           Table: {
//             headerBg: "#1890ff",
//             headerColor: "white"
//           }
//         }
//       }}
//     >
//       <div style={{ padding: 24, background: "#fff" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
//           <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
//             Quản lý đơn hàng
//           </Title>
//         </div>

//         <div style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 16 }}>
//           <RangePicker placeholder={["Từ ngày", "Đến ngày"]} style={{ width: 280 }} value={dateRange} onChange={handleDateRangeChange} format="DD/MM/YYYY" allowClear size="large" />

//           <Select placeholder="Phương thức thanh toán" style={{ width: 180 }} allowClear onChange={setPaymentMethod} value={paymentMethod} size="large">
//             <Option value="COD">Thanh toán khi nhận hàng</Option>
//             <Option value="VNPAY">VN Pay</Option>
//             <Option value="IN_APP">Thanh toán trong ứng dụng</Option>
//           </Select>

//           <Select placeholder="Trạng thái thanh toán" style={{ width: 180 }} allowClear onChange={setPaymentStatus} value={paymentStatus} size="large">
//             <Option value="FAILED">Thất bại</Option>
//             <Option value="PAID">Đã thanh toán</Option>
//             <Option value="REFUNDED">Yêu cầu hoàn tiền</Option>
//             <Option value="REFUNDED_SUCCESSFUL">Đã hoàn tiền</Option>
//             <Option value="UNPAID">Chưa thanh toán</Option>
//           </Select>

//           <Select placeholder="Trạng thái đơn hàng" style={{ width: 180 }} allowClear onChange={setOrderStatus} value={orderStatus} size="large">
//             <Option value="CANCELLED">Đã hủy</Option>
//             <Option value="COMPLETED">Hoàn thành</Option>
//             <Option value="CONFIRMED">Đã xác nhận</Option>
//             <Option value="PENDING">Đang xử lý</Option>
//             <Option value="SHIPPED">Đang giao hàng</Option>
//             <Option value="PENDING_RETURNED">Chờ xác nhận trả hàng</Option>
//             <Option value="CONFIRMED_RETURNED">Chờ hoàn hàng</Option>
//             <Option value="SHIPPED_RETURNED">Đã nhận hàng hoàn</Option>
//             <Option value="RETURNED">Trả hàng thành công</Option>
//           </Select>
//         </div>

//         <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
//             <span>Sắp xếp theo:</span>
//             <Select value={sortField} onChange={(v) => { setSortField(v); setCurrentPage(1); }} style={{ width: 180 }} size="middle">
//               <Option value="createdAt">Ngày tạo</Option>
//               <Option value="id">Mã đơn hàng</Option>
//               <Option value="updatedAt">Ngày cập nhật</Option>
//             </Select>
//             <Button onClick={() => { setSortDirection((s) => (s === "asc" ? "desc" : "asc")); setCurrentPage(1); }} icon={sortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}>
//               {sortDirection === "asc" ? "Tăng dần" : "Giảm dần"}
//             </Button>
//           </div>

//           <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
//             <span>Hiển thị:</span>
//             <Select value={pageSize} onChange={(v) => { setPageSize(v); setCurrentPage(1); }} style={{ width: 80 }} size="middle">
//               <Option value={5}>5</Option>
//               <Option value={10}>10</Option>
//               <Option value={20}>20</Option>
//               <Option value={50}>50</Option>
//             </Select>
//             <span>mục / trang</span>
//           </div>
//         </div>

//         <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} pagination={false} bordered />

//         <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
//           <Pagination current={currentPage} pageSize={pageSize} total={totalElements} onChange={(p) => setCurrentPage(p)} showQuickJumper showSizeChanger={false} showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} mục`} />
//         </div>

//         {/* Detail Modal */}
//         <Modal title={`Chi tiết đơn hàng #${currentOrder?.id}`} open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={[
//           <Button key="close" onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>,
//           currentOrder && currentOrder.status === "COMPLETED" && <Button key="export" type="primary" icon={<FilePdfOutlined />} onClick={() => exportInvoiceToPdf(currentOrder)}>Xuất hoá đơn</Button>,
//           currentOrder && currentOrder.status !== "CANCELLED" && currentOrder.status !== "COMPLETED" && <Button key="update" type="primary" onClick={() => { setIsDetailModalVisible(false); setIsStatusModalVisible(true); setCurrentOrder(currentOrder); form.setFieldsValue({ status: currentOrder.status }); }}>Cập nhật trạng thái</Button>
//         ].filter(Boolean)} width={800}>
//           {currentOrder ? (
//             <>
//               <Descriptions title="Thông tin đơn hàng" bordered>
//                 <Descriptions.Item label="Trạng thái" span={3}>
//                   <Tag color={getStatusColor(currentOrder.status)}>{getStatusText(currentOrder.status)}</Tag>
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Phương thức thanh toán" span={1}>
//                   {currentOrder.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : currentOrder.paymentMethod === "VNPAY" ? "VN Pay" : currentOrder.paymentMethod === "IN_APP" ? "Thanh toán trong ứng dụng" : currentOrder.paymentMethod}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Trạng thái thanh toán" span={2}>
//                   <Tag color={getPaymentStatusColor(currentOrder.paymentStatus)}>{getPaymentStatusText(currentOrder.paymentStatus)}</Tag>
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Ngày tạo" span={1}>{dayjs(currentOrder.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
//                 <Descriptions.Item label="Cập nhật lần cuối" span={2}>{currentOrder.updatedAt ? dayjs(currentOrder.updatedAt).format("DD/MM/YYYY HH:mm") : "Chưa cập nhật"}</Descriptions.Item>
//                 <Descriptions.Item label="Ghi chú" span={3}>{currentOrder.note || "Không có ghi chú"}</Descriptions.Item>
//               </Descriptions>

//               <Divider />

//               <Title level={4}>Sản phẩm đã đặt</Title>
//               {currentOrder.orderItems && currentOrder.orderItems.length > 0 ? (
//                 <>
//                   {currentOrder.orderItems.map((item, idx) => (
//                     <Card key={idx} style={{ marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
//                       <div style={{ display: "flex", alignItems: "center" }}>
//                         <div style={{ width: 80, height: 80, marginRight: 16 }}>
//                           <img src={item.productImage} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
//                         </div>
//                         <div style={{ flex: 1 }}>
//                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                             <div>
//                               <div style={{ fontWeight: "bold", marginBottom: 4 }}>{item.productName}</div>
//                               <div style={{ color: "#666", fontSize: 13 }}>Mã: {item.productCode}</div>
//                               <div style={{ color: "#666", fontSize: 13 }}>Màu: {item.productColor}</div>
//                             </div>
//                             <div style={{ textAlign: "right" }}>
//                               <div style={{ fontWeight: "bold", color: "#ff4d4f" }}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(item.priceAtOrderTime)}</div>
//                               <div style={{ color: "#666", fontSize: 13 }}>Số lượng: {item.quantity}</div>
//                               <div style={{ fontWeight: "bold", marginTop: 4 }}>Thành tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(item.priceAtOrderTime * item.quantity)}</div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </Card>
//                   ))}

//                   <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, marginBottom: 24 }}>
//                     <Card style={{ width: 300 }} bodyStyle={{ padding: 16 }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
//                         <span>Tổng tiền sản phẩm:</span>
//                         <span style={{ fontWeight: "bold" }}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(currentOrder.orderItems.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0))}</span>
//                       </div>

//                       {currentOrder.discount && (
//                         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
//                           <span>Giảm giá{currentOrder.discount.discountType === "PERCENT" ? ` (${currentOrder.discount.discountValue}%)` : ""}:</span>
//                           <span style={{ fontWeight: "bold", color: "#52c41a" }}>-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(calculateDiscountAmount(currentOrder))}</span>
//                         </div>
//                       )}

//                       <Divider style={{ margin: "8px 0" }} />

//                       <div style={{ display: "flex", justifyContent: "space-between" }}>
//                         <span style={{ fontWeight: "bold" }}>Tổng thanh toán:</span>
//                         <span style={{ fontWeight: "bold", fontSize: 18, color: "#ff4d4f" }}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(currentOrder.orderItems.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0) - calculateDiscountAmount(currentOrder))}</span>
//                       </div>
//                     </Card>
//                   </div>
//                 </>
//               ) : (
//                 <Empty description="Không có sản phẩm" />
//               )}

//               <Divider />

//               <Row gutter={16}>
//                 <Col span={12}>
//                   <Card title="Thông tin người mua" bordered={false} style={{ height: "100%" }}>
//                     <p><strong>Tên:</strong> {currentOrder.user?.fullName || "N/A"}</p>
//                     <p><strong>Email:</strong> {currentOrder.user?.email || "N/A"}</p>
//                   </Card>
//                 </Col>
//                 <Col span={12}>
//                   <Card title="Thông tin người nhận" bordered={false} style={{ height: "100%" }}>
//                     <p><strong>Tên:</strong> {currentOrder.infoUserReceive?.fullName || "N/A"}</p>
//                     <p><strong>Email:</strong> {currentOrder.infoUserReceive?.email || "N/A"}</p>
//                     <p><strong>SĐT:</strong> {currentOrder.infoUserReceive?.phoneNumber || "N/A"}</p>
//                     <p><strong>Địa chỉ:</strong> {formatAddress(currentOrder.infoUserReceive)}</p>
//                   </Card>
//                 </Col>
//               </Row>
//             </>
//           ) : null}
//         </Modal>

//         {/* Status Update Modal */}
//         <Modal title="Cập nhật trạng thái đơn hàng" open={isStatusModalVisible} onCancel={() => setIsStatusModalVisible(false)} footer={[
//           <Button key="cancel" onClick={() => setIsStatusModalVisible(false)}>Hủy</Button>,
//           <Button key="submit" type="primary" loading={loading} onClick={handleStatusUpdate}>Cập nhật</Button>
//         ]}>
//           <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
//             <ExclamationCircleFilled style={{ color: "#faad14", fontSize: 22 }} />
//             <p style={{ margin: 0 }}>Bạn đang cập nhật trạng thái đơn hàng <strong>#{currentOrder?.id}</strong></p>
//           </div>

//           <Form form={form} layout="vertical" initialValues={{ status: currentOrder?.status }}>
//             <Form.Item name="status" label="Trạng thái đơn hàng" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
//               <Select>
//                 <Option value="CANCELLED">Đã hủy</Option>
//                 <Option value="COMPLETED">Hoàn thành</Option>
//                 <Option value="CONFIRMED">Đã xác nhận</Option>
//                 <Option value="PENDING">Đang xử lý</Option>
//                 <Option value="SHIPPED">Đang giao hàng</Option>
//                 {/* <Option value="PENDING_RETURNED">Chờ xác nhận trả hàng</Option>
//                 <Option value="CONFIRMED_RETURNED">Chờ hoàn hàng</Option>
//                 <Option value="SHIPPED_RETURNED">Đã nhận hàng hoàn</Option>
//                 <Option value="RETURNED">Trả hàng thành công</Option> */}
//               </Select>
//             </Form.Item>
//           </Form>
//         </Modal>

//       </div>
//     </ConfigProvider>
//   );
// };

// export default OrderManagement;



import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Button,
  Row,
  Col,
  Modal,
  Form,
  Typography,
  Select,
  Card,
  Tag,
  Divider,
  Space,
  Descriptions,
  Pagination,
  ConfigProvider,
  Empty,
  DatePicker
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExclamationCircleFilled,
  CheckCircleOutlined,
  FilePdfOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import {
  getAllOrders,
  updateOrderStatus,
  acceptRefund,
  acceptReturn,
  verifyReturn,
  rejectRefund
} from "../../../Redux/actions/OrderItemThunk";
import dayjs from "dayjs";
import { NotificationContext } from "../../../components/NotificationProvider";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Fonts (nếu bạn dùng)
import timesNewRomanNormal from "../../../assets/fonts/times.ttf";
import timesNewRomanBold from "../../../assets/fonts/times-bold.ttf";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const getStatusColor = (status) => {
  const statusColors = {
    CANCELLED: "red",
    COMPLETED: "green",
    CONFIRMED: "blue",
    PENDING: "orange",
    SHIPPED: "purple",
    PENDING_RETURNED: "orange",
    CONFIRMED_RETURNED: "blue",
    SHIPPED_RETURNED: "purple",
    REJECTED_RETURNED: "red",
    RETURNED: "cyan"
  };
  return statusColors[status] || "default";
};

const getStatusText = (status) => {
  const statusMap = {
    CANCELLED: "Đã hủy",
    COMPLETED: "Hoàn thành",
    CONFIRMED: "Đã xác nhận",
    PENDING: "Đang xử lý",
    SHIPPED: "Đang giao hàng",
    PENDING_RETURNED: "Chờ xác nhận trả hàng",
    CONFIRMED_RETURNED: "Chờ hoàn hàng",
    SHIPPED_RETURNED: "Đã nhận hàng hoàn",
    RETURNED: "Trả hàng thành công",
    REJECTED_RETURNED: "Từ chối hoàn hàng"
  };
  return statusMap[status] || status;
};

const getPaymentStatusColor = (status) => {
  const statusColors = {
    FAILED: "red",
    PAID: "green",
    REFUNDED: "orange",
    REFUNDED_SUCCESSFUL: "cyan",
    UNPAID: "gold"
  };
  return statusColors[status] || "default";
};

const getPaymentStatusText = (status) => {
  const statusMap = {
    FAILED: "Thất bại",
    PAID: "Đã thanh toán",
    REFUNDED: "Yêu cầu hoàn tiền",
    REFUNDED_SUCCESSFUL: "Đã hoàn tiền",
    UNPAID: "Chưa thanh toán"
  };
  return statusMap[status] || status;
};

const formatAddress = (info) => {
  if (!info || !info.ward) return "N/A";
  const { detailAddress, ward } = info;
  return `${detailAddress}, ${ward.name}, ${ward.district.name}, ${ward.district.province.name}`;
};

const OrderManagement = () => {
  // state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState(null);

  const [dateRange, setDateRange] = useState(null);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const notification = useContext(NotificationContext);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, paymentMethod, paymentStatus, orderStatus, sortField, sortDirection, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let startDate = null;
      let endDate = null;
      if (dateRange && dateRange.length === 2) {
        startDate = dateRange[0].format("YYYY-MM-DD");
        endDate = dateRange[1].format("YYYY-MM-DD");
      }

      const res = await dispatch(
        getAllOrders(startDate, endDate, orderStatus, paymentMethod, paymentStatus, currentPage, pageSize, sortField, sortDirection)
      );

      if (res && res.content) {
        setOrders(res.content);
        setTotalElements(res.totalElements);
      } else {
        setOrders([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Fetch orders error", error);
      notification.error({ message: "Đã xảy ra lỗi khi tải dữ liệu" });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const handleViewDetails = (order) => {
    setCurrentOrder(order);
    setIsDetailModalVisible(true);
  };

  const handleStatusUpdateModal = (order) => {
    if (order.status === "CANCELLED" || order.status === "COMPLETED") {
      notification.warning({
        message: "Không thể cập nhật",
        description: order.status === "CANCELLED" ? "Đơn hàng đã bị hủy không thể cập nhật trạng thái." : "Đơn hàng đã hoàn thành không thể cập nhật trạng thái."
      });
      return;
    }
    setCurrentOrder(order);
    form.setFieldsValue({ status: order.status });
    Modal.info({
      title: "Cập nhật trạng thái",
      content: "Vui lòng dùng box cập nhật trạng thái (mở modal Cập nhật)."
    });
    setIsDetailModalVisible(false);
    setTimeout(() => setIsStatusModalVisible(true), 0); // not used but kept compatibility (we'll use our modal below)
  };

  // We'll reuse your existing Status Update modal logic:
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);

  const handleStatusUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!currentOrder) return;

      if (currentOrder.status === "CANCELLED" || currentOrder.status === "COMPLETED" || currentOrder.status === "REJECTED_RETURNED") {
        notification.warning({ message: "Không thể cập nhật" });
        setIsStatusModalVisible(false);
        return;
      }

      setLoading(true);
      const code = await dispatch(updateOrderStatus(currentOrder.id, { status: values.status }));
      if (code === 200) {
        notification.success({ message: "Cập nhật trạng thái đơn hàng thành công" });
        fetchOrders();
        setIsStatusModalVisible(false);
      } else {
        notification.error({ message: "Không thể cập nhật trạng thái đơn hàng" });
      }
    } catch (error) {
      console.error(error);
      notification.error({ message: "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng" });
    } finally {
      setLoading(false);
    }
  };

  // Accept refund (existing)
  const handleAcceptRefund = async (order) => {
    if (!order) return;
    try {
      setLoading(true);
      const code = await dispatch(acceptRefund(order.id));
      if (code === 200) {
        notification.success({ message: "Hoàn tiền thành công", description: `Đơn hàng #${order.id} đã được hoàn tiền.` });
        fetchOrders();
      } else {
        notification.error({ message: "Hoàn tiền thất bại" });
      }
    } catch (error) {
      console.error(error);
      notification.error({ message: "Đã xảy ra lỗi khi hoàn tiền" });
    } finally {
      setLoading(false);
    }
  };

  // NEW: accept return (/accept/return/{orderId})
  const handleAcceptReturn = async (order) => {
    if (!order) return;
    try {
      setLoading(true);
      const code = await dispatch(acceptReturn(order.id));
      if (code === 200) {
        notification.success({ message: "Đã xác nhận trả hàng", description: `Đơn hàng #${order.id}` });
        fetchOrders();
      } else {
        notification.error({ message: "Xác nhận trả hàng thất bại" });
      }
    } catch (error) {
      console.error(error);
      notification.error({ message: "Đã xảy ra lỗi khi xác nhận trả hàng" });
    } finally {
      setLoading(false);
    }
  };

  // NEW: verify return (/verify/return/{orderId})
  const handleVerifyReturn = async (order) => {
    if (!order) return;
    try {
      setLoading(true);
      const code = await dispatch(verifyReturn(order.id));
      if (code === 200) {
        notification.success({ message: "Đã xác minh hàng trả về", description: `Đơn hàng #${order.id}` });
        fetchOrders();
      } else {
        notification.error({ message: "Xác minh thất bại" });
      }
    } catch (error) {
      console.error(error);
      notification.error({ message: "Đã xảy ra lỗi khi xác minh trả hàng" });
    } finally {
      setLoading(false);
    }
  };

  // NEW: reject refund (/reject/refund/{orderId})
  const handleRejectRefund = async (order) => {
    if (!order) return;
    try {
      setLoading(true);
      const code = await dispatch(rejectRefund(order.id));
      if (code === 200) {
        notification.success({ message: "Đã từ chối hoàn tiền", description: `Đơn hàng #${order.id}` });
        fetchOrders();
      } else {
        notification.error({ message: "Từ chối hoàn tiền thất bại" });
      }
    } catch (error) {
      console.error(error);
      notification.error({ message: "Đã xảy ra lỗi khi từ chối hoàn tiền" });
    } finally {
      setLoading(false);
    }
  };

  // Helper for calculating discount and totals (kept same)
  const calculateDiscountAmount = (order) => {
    if (!order || !order.discount) return 0;
    const { discount } = order;
    const subtotal = order.orderItems.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0);
    if (discount.discountType === "PERCENT") {
      return (subtotal * discount.discountValue) / 100;
    } else if (discount.discountType === "FIXED") {
      return discount.discountValue;
    }
    return 0;
  };

  // PDF exporter (kept your previous code)
  const exportInvoiceToPdf = (order) => {
    if (!order) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // register fonts if present
    try {
      doc.addFont(timesNewRomanNormal, "TimesNewRoman", "normal");
      doc.addFont(timesNewRomanBold, "TimesNewRoman", "bold");
    } catch (e) {
      // fonts optional
    }
    doc.setFontSize(20);
    doc.setFont("TimesNewRoman", "bold");
    doc.text("HÓA ĐƠN BÁN HÀNG", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("TimesNewRoman", "normal");
    doc.text("TECH LAPTOP", 105, 30, { align: "center" });
    doc.text("Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HN", 105, 35, { align: "center" });
    doc.text("Điện thoại: 0123456789 - Email: contact@techstore.com", 105, 40, { align: "center" });

    doc.setFontSize(11);
    doc.line(15, 45, 195, 45);
    doc.text(`Mã đơn hàng: #${order.id}`, 15, 55);
    doc.text(`Ngày tạo: ${dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}`, 15, 60);
    doc.text(`Trạng thái: ${getStatusText(order.status)}`, 15, 65);
    doc.text(
      `Phương thức thanh toán: ${
        order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : order.paymentMethod === "VNPAY" ? "VN Pay" : order.paymentMethod === "IN_APP" ? "Thanh toán trong ứng dụng" : order.paymentMethod
      }`,
      15,
      70
    );

    // buyer info
    doc.setFontSize(12);
    doc.setFont("TimesNewRoman", "bold");
    doc.text("THÔNG TIN NGƯỜI MUA", 15, 80);
    doc.setFont("TimesNewRoman", "normal");
    doc.setFontSize(11);
    doc.text(`Họ tên: ${order.user?.fullName || "N/A"}`, 15, 85);
    doc.text(`Email: ${order.user?.email || "N/A"}`, 15, 90);
    doc.text(`Điện thoại: ${order.user?.phoneNumber || "N/A"}`, 15, 95);

    let currentY = 105;
    doc.setFontSize(12);
    doc.setFont("TimesNewRoman", "bold");
    doc.text("THÔNG TIN NGƯỜI NHẬN", 15, currentY);
    doc.setFont("TimesNewRoman", "normal");
    doc.setFontSize(11);

    currentY += 5;
    doc.text(`Họ tên: ${order.infoUserReceive?.fullName || "N/A"}`, 15, currentY);
    currentY += 5;
    doc.text(`Email: ${order.infoUserReceive?.email || "N/A"}`, 15, currentY);
    currentY += 5;
    doc.text(`Điện thoại: ${order.infoUserReceive?.phoneNumber || "N/A"}`, 15, currentY);

    const address = formatAddress(order.infoUserReceive);
    const maxWidth = 175;
    const addressLines = doc.splitTextToSize(address, maxWidth);

    currentY += 5;
    doc.text(`Địa chỉ:`, 15, currentY);
    addressLines.forEach((line, index) => {
      doc.text(line, 30, currentY + index * 5);
    });

    const tableStartY = currentY + addressLines.length * 5 + 10;

    // product table
    doc.setFontSize(12);
    doc.setFont("TimesNewRoman", "bold");
    doc.text("CHI TIẾT SẢN PHẨM", 15, tableStartY);

    const tableColumn = ["STT", "Tên sản phẩm", "Mã SP", "Màu sắc", "Đơn giá", "SL", "Thành tiền"];
    const tableRows = [];

    order.orderItems.forEach((item, index) => {
      const priceFormatted = new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(item.priceAtOrderTime);
      const totalFormatted = new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(item.priceAtOrderTime * item.quantity);
      tableRows.push([index + 1, item.productName, item.productCode, item.productColor, priceFormatted, item.quantity, totalFormatted]);
    });

    autoTable(doc, {
      startY: tableStartY + 5,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { cellPadding: 3, fontSize: 10 },
      margin: { left: 15, right: 15 }
    });

    const finalY = (doc.lastAutoTable?.finalY || tableStartY + 5) + 15;
    const subtotal = order.orderItems.reduce((t, it) => t + it.priceAtOrderTime * it.quantity, 0);
    const discountAmount = order.discount ? calculateDiscountAmount(order) : 0;
    const total = subtotal - discountAmount;

    doc.setFontSize(11);
    doc.text("Tổng tiền sản phẩm:", 20, finalY);
    doc.text(`${new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(subtotal)} VNĐ`, 180, finalY, { align: "right" });

    if (order.discount) {
      doc.text(`Giảm giá: -${new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(discountAmount)} VNĐ`, 180, finalY + 8, { align: "right" });
    }

    doc.setFont("TimesNewRoman", "bold");
    doc.text(`TỔNG THANH TOÁN: ${new Intl.NumberFormat("vi-VN", { style: "decimal", maximumFractionDigits: 0 }).format(total)} VNĐ`, 180, finalY + 20, { align: "right" });

    doc.save(`Hoa_don_${order.id}_${dayjs().format("DDMMYYYY")}.pdf`);
  };

  // Render action buttons: keep old actions and add rules for new combos
  const renderActions = (record) => {
    const elems = [];

    // always: view details
    elems.push(
      <Button key="view" type="primary" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} size="middle" title="Xem chi tiết" style={{ borderRadius: 4 }} />
    );

    // Preserve existing "update status" button logic (as before)
    if (record.status !== "CANCELLED" && record.status !== "COMPLETED" && record.status !== "REJECTED_RETURNED" && record.status !== "PENDING_RETURNED" && record.status !== "CONFIRMED_RETURNED" && record.status !== "SHIPPED_RETURNED") {
      elems.push(
        <Button key="update" type="primary" style={{ background: "#52c41a", borderRadius: 4 }} icon={<EditOutlined />} onClick={() => { setCurrentOrder(record); form.setFieldsValue({ status: record.status }); setIsStatusModalVisible(true); }} size="middle" title="Cập nhật trạng thái" />
      );
    }

    // Special cases based on paymentStatus + order.status (new)
    // REFUNDED + PENDING_RETURNED -> View + Accept Return (/accept/return) + Reject Refund (/reject/refund)
    if (record.paymentStatus === "REFUNDED" && record.status === "PENDING_RETURNED") {
      elems.push(
        <Button key="acceptReturn" type="default" icon={<CheckCircleOutlined />} onClick={() => handleAcceptReturn(record)} title="Xác nhận trả hàng" size="middle" />
      );
      elems.push(
        <Button key="rejectRefund1" danger type="default" icon={<CloseCircleOutlined />} onClick={() => handleRejectRefund(record)} title="Từ chối hoàn tiền" size="middle" />
      );
      return <Space>{elems}</Space>;
    }

    // REFUNDED + CONFIRMED_RETURNED -> View + Verify Return (/verify/return)
    if (record.paymentStatus === "REFUNDED" && record.status === "CONFIRMED_RETURNED") {
      elems.push(
        <Button key="verifyReturn" type="default" icon={<CheckCircleOutlined />} onClick={() => handleVerifyReturn(record)} title="Xác minh hàng trả về" size="middle" />
      );
      return <Space>{elems}</Space>;
    }

    // REFUNDED + SHIPPED_RETURNED -> View + Accept Refund (/accept/refund) + Reject (/reject/refund)
    if (record.paymentStatus === "REFUNDED" && record.status === "SHIPPED_RETURNED") {
      elems.push(
        <Button key="acceptRefund" type="primary" style={{ background: "#1890ff", borderRadius: 4 }} icon={<CheckCircleOutlined />} onClick={() => handleAcceptRefund(record)} size="middle" title="Chấp nhận hoàn tiền" />
      );
      elems.push(
        <Button key="rejectRefund2" danger type="default" icon={<CloseCircleOutlined />} onClick={() => handleRejectRefund(record)} title="Từ chối hoàn tiền" size="middle" />
      );
      return <Space>{elems}</Space>;
    }

    // REFUNDED_SUCCESSFUL + RETURNED -> Only view
    if (record.paymentStatus === "REFUNDED_SUCCESSFUL" && record.status === "RETURNED") {
      return <Space>{elems}</Space>;
    }

    // Fallback: show existing acceptRefund if paymentStatus === REFUNDED (old behavior)
    if (record.paymentStatus === "REFUNDED") {
      elems.push(
        <Button key="acceptRefund" type="primary" style={{ background: "#1890ff", borderRadius: 4 }} icon={<CheckCircleOutlined />} onClick={() => handleAcceptRefund(record)} size="middle" title="Chấp nhận hoàn tiền" />
      );
    }

    // Existing PDF button
    if (record.status === "COMPLETED") {
      elems.push(
        <Button key="pdf" type="primary" style={{ background: "#722ed1", borderRadius: 4 }} icon={<FilePdfOutlined />} onClick={() => exportInvoiceToPdf(record)} size="middle" title="Xuất hoá đơn" />
      );
    }

    return <Space>{elems}</Space>;
  };

  // table columns
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <span>#{id}</span>
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
      key: "user",
      width: 150,
      render: (user) => <span>{user?.fullName || "N/A"}</span>
    },
    {
      title: "Người nhận",
      dataIndex: "infoUserReceive",
      key: "recipient",
      width: 150,
      render: (info) => <span>{info?.fullName || "N/A"}</span>
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 140,
      render: (method) => {
        const methodMap = {
          COD: "Thanh toán khi nhận hàng",
          VNPAY: "VN Pay",
          IN_APP: "Thanh toán trong ứng dụng"
        };
        return <span>{methodMap[method] || method}</span>;
      }
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 160,
      render: (status) => <Tag color={getPaymentStatusColor(status)}>{getPaymentStatusText(status)}</Tag>
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-")
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-")
    },
    {
      title: "Tổng tiền",
      key: "totalAmount",
      width: 150,
      render: (_, record) => {
        const subtotal = record.orderItems?.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0) || 0;
        const discountAmount = record.discount ? calculateDiscountAmount(record) : 0;
        const total = subtotal - discountAmount;
        return (
          <span style={{ fontWeight: "bold", color: "#ff4d4f" }}>
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(total)}
          </span>
        );
      }
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 260,
      align: "center",
      render: (_, record) => renderActions(record)
    }
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#1890ff",
            headerColor: "white"
          }
        }
      }}
    >
      <div style={{ padding: 24, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
            Quản lý đơn hàng
          </Title>
        </div>

        <div style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 16 }}>
          <RangePicker placeholder={["Từ ngày", "Đến ngày"]} style={{ width: 280 }} value={dateRange} onChange={handleDateRangeChange} format="DD/MM/YYYY" allowClear size="large" />

          <Select placeholder="Phương thức thanh toán" style={{ width: 180 }} allowClear onChange={setPaymentMethod} value={paymentMethod} size="large">
            <Option value="COD">Thanh toán khi nhận hàng</Option>
            <Option value="VNPAY">VN Pay</Option>
            <Option value="IN_APP">Thanh toán trong ứng dụng</Option>
          </Select>

          <Select placeholder="Trạng thái thanh toán" style={{ width: 180 }} allowClear onChange={setPaymentStatus} value={paymentStatus} size="large">
            <Option value="FAILED">Thất bại</Option>
            <Option value="PAID">Đã thanh toán</Option>
            <Option value="REFUNDED">Yêu cầu hoàn tiền</Option>
            <Option value="REFUNDED_SUCCESSFUL">Đã hoàn tiền</Option>
            <Option value="UNPAID">Chưa thanh toán</Option>
          </Select>

          <Select placeholder="Trạng thái đơn hàng" style={{ width: 180 }} allowClear onChange={setOrderStatus} value={orderStatus} size="large">
            <Option value="CANCELLED">Đã hủy</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CONFIRMED">Đã xác nhận</Option>
            <Option value="PENDING">Đang xử lý</Option>
            <Option value="SHIPPED">Đang giao hàng</Option>
            <Option value="PENDING_RETURNED">Chờ xác nhận trả hàng</Option>
            <Option value="CONFIRMED_RETURNED">Chờ hoàn hàng</Option>
            <Option value="SHIPPED_RETURNED">Đã nhận hàng hoàn</Option>
            <Option value="RETURNED">Trả hàng thành công</Option>
          </Select>
        </div>

        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span>Sắp xếp theo:</span>
            <Select value={sortField} onChange={(v) => { setSortField(v); setCurrentPage(1); }} style={{ width: 180 }} size="middle">
              <Option value="createdAt">Ngày tạo</Option>
              <Option value="id">Mã đơn hàng</Option>
              <Option value="updatedAt">Ngày cập nhật</Option>
            </Select>
            <Button onClick={() => { setSortDirection((s) => (s === "asc" ? "desc" : "asc")); setCurrentPage(1); }} icon={sortDirection === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}>
              {sortDirection === "asc" ? "Tăng dần" : "Giảm dần"}
            </Button>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span>Hiển thị:</span>
            <Select value={pageSize} onChange={(v) => { setPageSize(v); setCurrentPage(1); }} style={{ width: 80 }} size="middle">
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={50}>50</Option>
            </Select>
            <span>mục / trang</span>
          </div>
        </div>

        <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} pagination={false} bordered />

        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <Pagination current={currentPage} pageSize={pageSize} total={totalElements} onChange={(p) => setCurrentPage(p)} showQuickJumper showSizeChanger={false} showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} mục`} />
        </div>

        {/* Detail Modal */}
        {/* <Modal title={`Chi tiết đơn hàng #${currentOrder?.id}`} open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>,
          currentOrder && currentOrder.status === "COMPLETED" && <Button key="export" type="primary" icon={<FilePdfOutlined />} onClick={() => exportInvoiceToPdf(currentOrder)}>Xuất hoá đơn</Button>,
          currentOrder && currentOrder.status !== "CANCELLED" && currentOrder.status !== "COMPLETED" && <Button key="update" type="primary" onClick={() => { setIsDetailModalVisible(false); setIsStatusModalVisible(true); setCurrentOrder(currentOrder); form.setFieldsValue({ status: currentOrder.status }); }}>Cập nhật trạng thái</Button>
        ].filter(Boolean)} width={800}>
          {currentOrder ? (
            <>
              <Descriptions title="Thông tin đơn hàng" bordered>
                {(currentOrder.refundReason || currentOrder.refundImageUrl || currentOrder.refundVideoUrl) && (
  <>
    <Divider />

    <Title level={4}>Thông tin hoàn hàng</Title>

    <Descriptions bordered column={1}>
      <Descriptions.Item label="Lý do hoàn hàng">
        {currentOrder.refundReason || "Không có lý do"}
      </Descriptions.Item>

      <Descriptions.Item label="Ảnh khách hàng gửi">
        {currentOrder.refundImageUrl ? (
          <img
            src={currentOrder.refundImageUrl}
            alt="Refund"
            style={{
              width: 220,
              borderRadius: 6,
              border: "1px solid #f0f0f0",
              padding: 4,
            }}
          />
        ) : (
          <span>Không có ảnh</span>
        )}
      </Descriptions.Item>

      <Descriptions.Item label="Video khách hàng gửi">
        {currentOrder.refundVideoUrl ? (
          <video
            src={currentOrder.refundVideoUrl}
            controls
            style={{
              width: 300,
              borderRadius: 6,
              border: "1px solid #f0f0f0",
              padding: 4,
            }}
          />
        ) : (
          <span>Không có video</span>
        )}
      </Descriptions.Item>
    </Descriptions>
  </>
)}


                <Descriptions.Item label="Trạng thái" span={3}>
                  <Tag color={getStatusColor(currentOrder.status)}>{getStatusText(currentOrder.status)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán" span={1}>
                  {currentOrder.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : currentOrder.paymentMethod === "VNPAY" ? "VN Pay" : currentOrder.paymentMethod === "IN_APP" ? "Thanh toán trong ứng dụng" : currentOrder.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái thanh toán" span={2}>
                  <Tag color={getPaymentStatusColor(currentOrder.paymentStatus)}>{getPaymentStatusText(currentOrder.paymentStatus)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo" span={1}>{dayjs(currentOrder.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối" span={2}>{currentOrder.updatedAt ? dayjs(currentOrder.updatedAt).format("DD/MM/YYYY HH:mm") : "Chưa cập nhật"}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={3}>{currentOrder.note || "Không có ghi chú"}</Descriptions.Item>
              </Descriptions>

              <Divider />

              <Title level={4}>Sản phẩm đã đặt</Title>
              {currentOrder.orderItems && currentOrder.orderItems.length > 0 ? (
                <>
                  {currentOrder.orderItems.map((item, idx) => (
                    <Card key={idx} style={{ marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ width: 80, height: 80, marginRight: 16 }}>
                          <img src={item.productImage} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontWeight: "bold", marginBottom: 4 }}>{item.productName}</div>
                              <div style={{ color: "#666", fontSize: 13 }}>Mã: {item.productCode}</div>
                              <div style={{ color: "#666", fontSize: 13 }}>Màu: {item.productColor}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: "bold", color: "#ff4d4f" }}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(item.priceAtOrderTime)}</div>
                              <div style={{ color: "#666", fontSize: 13 }}>Số lượng: {item.quantity}</div>
                              <div style={{ fontWeight: "bold", marginTop: 4 }}>Thành tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(item.priceAtOrderTime * item.quantity)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, marginBottom: 24 }}>
                    <Card style={{ width: 300 }} bodyStyle={{ padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span>Tổng tiền sản phẩm:</span>
                        <span style={{ fontWeight: "bold" }}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(currentOrder.orderItems.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0))}</span>
                      </div>

                      {currentOrder.discount && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span>Giảm giá{currentOrder.discount.discountType === "PERCENT" ? ` (${currentOrder.discount.discountValue}%)` : ""}:</span>
                          <span style={{ fontWeight: "bold", color: "#52c41a" }}>-{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(calculateDiscountAmount(currentOrder))}</span>
                        </div>
                      )}

                      <Divider style={{ margin: "8px 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: "bold" }}>Tổng thanh toán:</span>
                        <span style={{ fontWeight: "bold", fontSize: 18, color: "#ff4d4f" }}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(currentOrder.orderItems.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0) - calculateDiscountAmount(currentOrder))}</span>
                      </div>
                    </Card>
                  </div>
                </>
              ) : (
                <Empty description="Không có sản phẩm" />
              )}

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Thông tin người mua" bordered={false} style={{ height: "100%" }}>
                    <p><strong>Tên:</strong> {currentOrder.user?.fullName || "N/A"}</p>
                    <p><strong>Email:</strong> {currentOrder.user?.email || "N/A"}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Thông tin người nhận" bordered={false} style={{ height: "100%" }}>
                    <p><strong>Tên:</strong> {currentOrder.infoUserReceive?.fullName || "N/A"}</p>
                    <p><strong>Email:</strong> {currentOrder.infoUserReceive?.email || "N/A"}</p>
                    <p><strong>SĐT:</strong> {currentOrder.infoUserReceive?.phoneNumber || "N/A"}</p>
                    <p><strong>Địa chỉ:</strong> {formatAddress(currentOrder.infoUserReceive)}</p>
                  </Card>
                </Col>
              </Row>
            </>
          ) : null}
        </Modal> */}

        <Modal
  title={`Chi tiết đơn hàng #${currentOrder?.id}`}
  open={isDetailModalVisible}
  onCancel={() => setIsDetailModalVisible(false)}
  footer={[
    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>,
    currentOrder && currentOrder.status === "COMPLETED" && (
      <Button key="export" type="primary" icon={<FilePdfOutlined />} onClick={() => exportInvoiceToPdf(currentOrder)}>Xuất hoá đơn</Button>
    ),
    currentOrder && currentOrder.status !== "CANCELLED" && currentOrder.status !== "COMPLETED" && (
      <Button key="update" type="primary" onClick={() => { 
        setIsDetailModalVisible(false); 
        setIsStatusModalVisible(true); 
        setCurrentOrder(currentOrder); 
        form.setFieldsValue({ status: currentOrder.status }); 
      }}>Cập nhật trạng thái</Button>
    )
  ].filter(Boolean)}
  width={800}
>
  {currentOrder ? (
    <>
      {/* Thông tin đơn hàng - 2 cột */}
      <Descriptions title="Thông tin đơn hàng" bordered column={2} layout="horizontal" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Trạng thái">
          <Tag color={getStatusColor(currentOrder.status)}>{getStatusText(currentOrder.status)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {currentOrder.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : currentOrder.paymentMethod === "VNPAY" ? "VN Pay" : "Thanh toán trong ứng dụng"}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
          <Tag color={getPaymentStatusColor(currentOrder.paymentStatus)}>{getPaymentStatusText(currentOrder.paymentStatus)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{dayjs(currentOrder.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
        <Descriptions.Item label="Cập nhật lần cuối">{currentOrder.updatedAt ? dayjs(currentOrder.updatedAt).format("DD/MM/YYYY HH:mm") : "Chưa cập nhật"}</Descriptions.Item>
        <Descriptions.Item label="Ghi chú" span={2}>{currentOrder.note || "Không có ghi chú"}</Descriptions.Item>
      </Descriptions>

      {/* Thông tin hoàn hàng - 1 cột */}
      {currentOrder.paymentStatus === "REFUNDED" && (
        <>
          <Divider />
          <Title level={4}>Thông tin hoàn hàng</Title>
          <Descriptions bordered column={1} layout="vertical" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Lý do hoàn hàng">
              {currentOrder.refundReason || "Không có lý do"}
            </Descriptions.Item>
            <Descriptions.Item label="Ảnh/Video khách hàng gửi">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-start" }}>
                {currentOrder.refundImageUrl ? (
                  <img
                    src={currentOrder.refundImageUrl}
                    alt="Refund"
                    style={{ maxWidth: 150, maxHeight: 120, objectFit: "cover", borderRadius: 6 }}
                  />
                ) : (
                  <span>Không có ảnh</span>
                )}
                {currentOrder.refundVideoUrl ? (
                  <video
                    src={currentOrder.refundVideoUrl}
                    controls
                    style={{ maxWidth: 200, maxHeight: 120, borderRadius: 6 }}
                  />
                ) : (
                  <span>Không có video</span>
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </>
      )}

      <Divider />
      <Title level={4}>Sản phẩm đã đặt</Title>

      {/* Danh sách sản phẩm */}
      {currentOrder.orderItems && currentOrder.orderItems.length > 0 ? (
        <>
          {currentOrder.orderItems.map((item, idx) => (
            <Card key={idx} style={{ marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 80, height: 80, marginRight: 16 }}>
                  <img src={item.productImage} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>{item.productName}</div>
                      <div style={{ color: "#666", fontSize: 13 }}>Mã: {item.productCode}</div>
                      <div style={{ color: "#666", fontSize: 13 }}>Màu: {item.productColor}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: "#ff4d4f" }}>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(item.priceAtOrderTime)}
                      </div>
                      <div style={{ color: "#666", fontSize: 13 }}>Số lượng: {item.quantity}</div>
                      <div style={{ fontWeight: "bold", marginTop: 4 }}>
                        Thành tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(item.priceAtOrderTime * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Tổng thanh toán */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, marginBottom: 24 }}>
            <Card style={{ width: 300 }} bodyStyle={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Tổng tiền sản phẩm:</span>
                <span style={{ fontWeight: "bold" }}>
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
                    currentOrder.orderItems.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0)
                  )}
                </span>
              </div>

              {currentOrder.discount && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span>Giảm giá{currentOrder.discount.discountType === "PERCENT" ? ` (${currentOrder.discount.discountValue}%)` : ""}:</span>
                  <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                    -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(calculateDiscountAmount(currentOrder))}
                  </span>
                </div>
              )}

              <Divider style={{ margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>Tổng thanh toán:</span>
                <span style={{ fontWeight: "bold", fontSize: 18, color: "#ff4d4f" }}>
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
                    currentOrder.orderItems.reduce((total, item) => total + item.priceAtOrderTime * item.quantity, 0) - calculateDiscountAmount(currentOrder)
                  )}
                </span>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Empty description="Không có sản phẩm" />
      )}

      <Divider />

      {/* Thông tin người mua & người nhận */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Thông tin người mua" bordered={false} style={{ height: "100%" }}>
            <p><strong>Tên:</strong> {currentOrder.user?.fullName || "N/A"}</p>
            <p><strong>Email:</strong> {currentOrder.user?.email || "N/A"}</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thông tin người nhận" bordered={false} style={{ height: "100%" }}>
            <p><strong>Tên:</strong> {currentOrder.infoUserReceive?.fullName || "N/A"}</p>
            <p><strong>Email:</strong> {currentOrder.infoUserReceive?.email || "N/A"}</p>
            <p><strong>SĐT:</strong> {currentOrder.infoUserReceive?.phoneNumber || "N/A"}</p>
            <p><strong>Địa chỉ:</strong> {formatAddress(currentOrder.infoUserReceive)}</p>
          </Card>
        </Col>
      </Row>
    </>
  ) : null}
</Modal>


        {/* Status Update Modal */}
        <Modal title="Cập nhật trạng thái đơn hàng" open={isStatusModalVisible} onCancel={() => setIsStatusModalVisible(false)} footer={[
          <Button key="cancel" onClick={() => setIsStatusModalVisible(false)}>Hủy</Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleStatusUpdate}>Cập nhật</Button>
        ]}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <ExclamationCircleFilled style={{ color: "#faad14", fontSize: 22 }} />
            <p style={{ margin: 0 }}>Bạn đang cập nhật trạng thái đơn hàng <strong>#{currentOrder?.id}</strong></p>
          </div>

          <Form form={form} layout="vertical" initialValues={{ status: currentOrder?.status }}>
            <Form.Item name="status" label="Trạng thái đơn hàng" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
              <Select>
                <Option value="CANCELLED">Đã hủy</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="PENDING">Đang xử lý</Option>
                <Option value="SHIPPED">Đang giao hàng</Option>
                {/* <Option value="PENDING_RETURNED">Chờ xác nhận trả hàng</Option>
                <Option value="CONFIRMED_RETURNED">Chờ hoàn hàng</Option>
                <Option value="SHIPPED_RETURNED">Đã nhận hàng hoàn</Option>
                <Option value="RETURNED">Trả hàng thành công</Option> */}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

      </div>
    </ConfigProvider>
  );
};

export default OrderManagement;
