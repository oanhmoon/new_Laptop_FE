
import React from 'react';
import '../style/LaptopCard.scss';
import { Star } from "lucide-react";

const renderLaptopTitle = (laptop) => {
  const productName = laptop.product?.name || "";
  const optionCode = laptop.code || laptop.productVariant?.code || "";

  return [productName, optionCode].filter(Boolean).join(" ");
};


const LaptopCard = ({ laptop }) => {
  const discountPercentage = laptop.price
    ? Math.round(((laptop.price * 1.1 - laptop.price) / (laptop.price * 1.1)) * 100)
    : 0;

  //  Xử lý logic sao và giá trị hiển thị
  const rating = Number(laptop?.ratingAverage); // chuyển thành số
  const hasRating = !isNaN(rating) && rating > 0; 
  const starColor = hasRating ? '#fadb14' : '#ccc'; 
  const ratingValue = hasRating ? rating.toFixed(1) : '0.0';

  return (
    <div
      className="laptop-card"
      onClick={() => window.location.href = `/products/${laptop.id}`}
    >
      <div className="card-badge">{laptop.product.brand.name.toUpperCase()}</div>

      <div className="card-image">
        <img
          src={laptop.productVariant.imageUrl}
          alt={laptop.name}
          loading="lazy"
        />
      </div>

      <div className="card-content">
        <h3 className="card-title">{renderLaptopTitle(laptop)}</h3>


        <div className="card-specs">
          <p><strong>CPU:</strong> {laptop.cpu}</p>
          <p><strong>RAM:</strong> {laptop.ram}</p>
          <p><strong>Ổ cứng:</strong> {laptop.storage}</p>
          <p><strong>Màn hình:</strong> {laptop.displaySize}</p>
        </div>

        <div className="price-container">
          <div className="card-price">
            {laptop.price.toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div className="card-footer-laptop">
          <div className="card-rating-laptop">
            <Star
              className="star-icon-laptop"
              size={14}
              color={starColor}
              fill={starColor}
            />
            <span>{ratingValue}</span>
          </div>

          <div className="sales-count">
            Đã bán <strong>{laptop.salesCount || 0}+</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopCard;
