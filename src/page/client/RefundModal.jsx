import React, { useState, useRef } from "react";
import { orderItemService } from "../../Service/OrderItemService";
import "../style/RefundModal.css";

export default function RefundModal({ orderId, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // ref để xoá giá trị input file
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // chọn video
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // gửi yêu cầu hoàn hàng
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
    <div className="refund-overlay">
      <div className="refund-modal">

        <h2 className="refund-title">Yêu cầu hoàn hàng</h2>

        {error && <p className="refund-error">{error}</p>}

        <textarea
          className="refund-textarea"
          placeholder="Nhập lý do hoàn hàng..."
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {/* ẢNH */}
        <label className="refund-label">Ảnh minh chứng</label>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {imagePreview && (
          <div className="preview-item">
            <img src={imagePreview} className="preview-img" alt="preview" />
            <button
              className="remove-media-btn"
              onClick={() => {
                setImage(null);
                setImagePreview(null);
                imageInputRef.current.value = "";
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* VIDEO */}
        <label className="refund-label mt-3">Video minh chứng</label>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />

        {videoPreview && (
          <div className="preview-item">
            <video src={videoPreview} controls className="preview-video" />
            <button
              className="remove-media-btn"
              onClick={() => {
                setVideo(null);
                setVideoPreview(null);
                videoInputRef.current.value = "";
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* BUTTONS */}
        <div className="refund-actions">
          <button onClick={onClose} className="refund-btn cancel">
            Hủy
          </button>
          <button onClick={submitRefund} className="refund-btn submit">
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}
