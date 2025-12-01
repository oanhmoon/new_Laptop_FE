import React, { useState } from "react";
import { orderItemService } from "../../Service/OrderItemService";

export default function RefundModal({ orderId, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");

  const submitRefund = async () => {
    if (!reason.trim()) return setError("Vui lòng nhập lý do");
    if (!image) return setError("Vui lòng chọn ảnh");
    if (!video) return setError("Vui lòng chọn video");

    const fd = new FormData();
    fd.append("reason", reason);
    fd.append("image", image);
    fd.append("video", video);

    try {
      await orderItemService.refund(orderId.replace("ORD-", ""), fd);
      onSuccess();
      onClose();
    } catch (e) {
      setError("Gửi yêu cầu thất bại");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded w-[400px]">

        <h2 className="text-xl font-semibold mb-3">Yêu cầu hoàn hàng</h2>

        {error && <p className="text-red-600">{error}</p>}

        <textarea
          className="border w-full p-2 rounded mb-3"
          placeholder="Nhập lý do hoàn hàng..."
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <label>Ảnh minh chứng</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <label className="mt-3 block">Video minh chứng</label>
        <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Hủy</button>
          <button onClick={submitRefund} className="px-3 py-1 bg-blue-600 text-white rounded">
            Gửi yêu cầu
          </button>
        </div>

      </div>
    </div>
  );
}
