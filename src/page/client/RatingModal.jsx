

import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import '../style/RatingModal.css';
import { ratingService } from "../../Service/RatingService";

const RatingModal = ({ isOpen, onClose, onSubmit, productOptionId }) => {

  
    // API UPLOAD MEDIA
   
    const uploadMediaAPI = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await ratingService.postFormData(
            "api/v1/product-reviews/upload-media",
            formData
        );

        return response.data; // trả về URL thật
    };

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [videoUrls, setVideoUrls] = useState([]);

    const [userData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    if (!isOpen) return null;

    if (!userData)
        return (
            <div className="modal-overlay">
                <div className="rating-modal">
                    <button className="close-button-modal" onClick={onClose}>
                        &times;
                    </button>
                    <h2>Yêu cầu đăng nhập</h2>
                    <p>Bạn cần đăng nhập để có thể đánh giá sản phẩm.</p>
                </div>
            </div>
        );

    // Upload ẢNH
 
    const handleImageSelect = async (e) => {
        const files = e.target.files;
        const uploaded = [];

        for (let file of files) {
            const url = await uploadMediaAPI(file);
            uploaded.push(url);
        }

        setImageUrls(prev => [...prev, ...uploaded]);
    };

   
    // Upload VIDEO
 
    const handleVideoSelect = async (e) => {
        const files = e.target.files;
        const uploaded = [];

        for (let file of files) {
            const url = await uploadMediaAPI(file);
            uploaded.push(url);
        }

        setVideoUrls(prev => [...prev, ...uploaded]);
    };

  
    // GỬI ĐÁNH GIÁ
    
    const handleSubmit = async () => {
        if (!reviewText.trim()) {
            alert("Bạn phải nhập nội dung đánh giá!");
            return;
        }

        const body = {
            productOptionId,
            rating,
            comment: reviewText,
            imageUrls,
            videoUrls
        };

        await onSubmit(body);

        // Reset form
        setRating(0);
        setReviewText('');
        setImageUrls([]);
        setVideoUrls([]);

        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="rating-modal">
                <button className="close-button-modal" onClick={onClose}>
                    &times;
                </button>

                <h2>Đánh giá của bạn</h2>

                {/* Stars */}
                <div className="stars-container-modal">
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                />
                                <FaStar
                                    className="star-modal"
                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                    size={40}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>

                {/* Comment */}
                <textarea
                    className="review-textarea-modal"
                    placeholder="Hãy chia sẻ cảm nhận của bạn..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                />

                {/* Upload Image */}
                <div className="upload-box">
                    <label>Thêm ảnh:</label>
                    
                    <label className="custom-upload-btn">
                        Chọn ảnh
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleImageSelect} 
                            hidden
                        />
                    </label>

                </div>


                <div className="preview-container">
                    {imageUrls.map((url, idx) => (
                        <div className="preview-item" key={idx}>
                            <img src={url} alt="preview" className="preview-img" />
                            <button
                                className="remove-media-btn"
                                onClick={() => {
                                    setImageUrls(prev => prev.filter((_, i) => i !== idx));
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>


                {/* Upload Video */}
                <div className="upload-box">
                    <label>Thêm video:</label>
                    
                    <label className="custom-upload-btn">
                        Chọn video
                        <input 
                            type="file" 
                            accept="video/*" 
                            multiple 
                            onChange={handleVideoSelect} 
                            hidden
                        />
                    </label>

                </div>

                

                <div className="preview-container">
                    {videoUrls.map((url, idx) => (
                        <div className="preview-item" key={idx}>
                            <video src={url} controls className="preview-video" />
                            <button
                                className="remove-media-btn"
                                onClick={() => {
                                    setVideoUrls(prev => prev.filter((_, i) => i !== idx));
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>


                <button
                    className="submit-button-modal"
                    onClick={handleSubmit}
                    disabled={rating === 0}
                >
                    Gửi đánh giá
                </button>
            </div>
        </div>
    );
};

export default RatingModal;

