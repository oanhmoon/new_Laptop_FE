
// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { Card, Button, Image, message } from "antd";
// import { getAllFavorites, removeFavorite } from "../../Redux/actions/FavoriteThunk";
// import "../style/ProductSections.css"; // bạn có thể thêm CSS tùy ý

// const FavoriteProducts = () => {
//   const [favorites, setFavorites] = useState([]);
//   const dispatch = useDispatch();

//   const [userData] = useState(() => {
//     const savedUser = localStorage.getItem("USER_LOGIN");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   useEffect(() => {
//     const fetchFavorites = async () => {
//       if (!userData?.id) return;
//       const data = await dispatch(getAllFavorites(userData.id));
//       console.log("⭐ Favorites from API:", data);
//       setFavorites(data || []);
//     };
//     fetchFavorites();
//   }, [dispatch, userData?.id]);

//   const handleRemove = async (productOptionId) => {
//     const ok = await dispatch(removeFavorite(userData.id, productOptionId));
//     if (ok) {
//       setFavorites((prev) => prev.filter((p) => p.productOptionId !== productOptionId));
//       message.success("Đã xóa khỏi danh sách yêu thích");
//     } else {
//       message.error("Xóa không thành công");
//     }
//   };

//   const formatPrice = (price) =>
//     new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(price);

//   return (
//     <div className="container" style={{ marginTop: 40 }}>
//       <h2 className="section-title">Sản phẩm yêu thích của bạn</h2>

//       {favorites.length === 0 ? (
//         <p style={{ textAlign: "center", marginTop: 20 }}>
//           Bạn chưa có sản phẩm yêu thích nào.
//         </p>
//       ) : (
//         <div className="products-grid-home-screen">
//           {favorites.map((product) => (
//             <Card
//               key={product.id}
//               className="product-card-home-screen"
//               onClick={() =>
//                 (window.location.href = `/products/${product.productOptionId}`)
//               }
//             >
//               <div className="image-container-home-screen">
//                 <Image
//                   src={product.imageUrl || "/products/default-laptop.jpg"}
//                   preview={false}
//                   alt={product.productName}
//                   className="product-image-home-screen"
//                   onError={(e) => {
//                     e.target.src = "/products/default-laptop.jpg";
//                     e.target.onerror = null;
//                   }}
//                 />
//               </div>

//               <div className="product-content-home-screen">
//                 <h3 className="product-name-home-screen">{product.productName}</h3>

//                 <div className="price-container-home-screen">
//                   <span className="current-price-home-screen">
//                     {formatPrice(product.price)}
//                   </span>
//                 </div>

//                 <Button
//                   type="primary"
//                   danger
//                   style={{ marginTop: 8 }}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleRemove(product.productOptionId);
//                   }}
//                 >
//                   Xóa khỏi yêu thích
//                 </Button>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FavoriteProducts;

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Card, Button, Image, message } from "antd";
import { getAllFavorites, removeFavorite } from "../../Redux/actions/FavoriteThunk";
import { getProductDetailById } from "../../Redux/actions/ProductThunk"; // API lấy chi tiết sản phẩm
import "../style/ProductSections.css";

const FavoriteProducts = () => {
  const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();

  const [userData] = useState(() => {
    const savedUser = localStorage.getItem("USER_LOGIN");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userData?.id) return;

      try {
        const data = await dispatch(getAllFavorites(userData.id));
        if (!data) return;

        // Fetch thêm chi tiết sản phẩm từng item
        const detailedFavorites = await Promise.all(
          data.map(async (item) => {
            try {
              const detailRes = await dispatch(getProductDetailById(item.productOptionId));
              return { ...item, ...detailRes }; // merge dữ liệu chi tiết
            } catch (err) {
              return item; // nếu lỗi fetch chi tiết thì vẫn trả item cũ
            }
          })
        );

        setFavorites(detailedFavorites);
      } catch (err) {
        message.error("Không thể tải sản phẩm yêu thích");
      }
    };

    fetchFavorites();
  }, [dispatch, userData?.id]);

  const handleRemove = async (productOptionId) => {
    const ok = await dispatch(removeFavorite(userData.id, productOptionId));
    if (ok) {
      setFavorites((prev) => prev.filter((p) => p.productOptionId !== productOptionId));
      message.success("Đã xóa khỏi danh sách yêu thích");
    } else {
      message.error("Xóa không thành công");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
    <div className="container" style={{ marginTop: 40 }}>
      <h2 className="section-title">Sản phẩm yêu thích của bạn</h2>

      {favorites.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: 20 }}>
          Bạn chưa có sản phẩm yêu thích nào.
        </p>
      ) : (
        <div className="products-grid-home-screen">
          {favorites.map((product) => (
            <Card
              key={product.id}
              className="product-card-home-screen"
              onClick={() => (window.location.href = `/products/${product.productOptionId}`)}
            >
              {/* Hình ảnh */}
              <div className="image-container-home-screen">
                <Image
                  src={product.imageUrl || "/products/default-laptop.jpg"}
                  preview={false}
                  alt={product.productName}
                  className="product-image-home-screen"
                  onError={(e) => {
                    e.target.src = "/products/default-laptop.jpg";
                    e.target.onerror = null;
                  }}
                />
              </div>

              {/* Nội dung sản phẩm */}
              <div className="product-content-home-screen">
                <h3 className="product-name-home-screen">{product.productName}</h3>

                {/* Thông số kỹ thuật */}
                <div className="product-specs-home-screen">
                  {product.cpu && <p><strong>CPU:</strong> {product.cpu}</p>}
                  {product.ram && <p><strong>RAM:</strong> {product.ram}</p>}
                  {product.storage && <p><strong>Bộ nhớ:</strong> {product.storage}</p>}
                  {product.displaySize && <p><strong>Màn hình:</strong> {product.displaySize}</p>}
                </div>

                {/* Giá */}
                <div className="price-container-home-screen">
                  <span className="current-price-home-screen">{formatPrice(product.price)}</span>
                </div>

                {/* Nút xóa */}
                <Button
                  type="primary"
                  danger
                  style={{ marginTop: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(product.productOptionId);
                  }}
                >
                  Xóa khỏi yêu thích
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteProducts;
