import React from "react";
import "../style/termsService.css";

const WarrantyPolicy = () => {
    return (
        <div className="terms-container">
            <h1 className="terms-title">Chính sách bảo hành</h1>

            <section className="terms-section">
                <h2>1. Điều kiện đổi trả:</h2>
                <ul>
                    <li>Sản phẩm không đúng thể loại, mẫu mã như đơn đặt hoặc như mô tả trên 
                        shop. 
                    </li>
                    <li>
                        Thiếu bộ phận, phụ kiện so với đơn hàng (ví dụ thiếu sạc). 
                    </li>
                    <li>
                        Sản phẩm bị hư hại bên ngoài, như: rách bao bì, bong tróc, méo, vỡ bề mặt 
                        (do vận chuyển). 
                    </li>
                    <li>
                        Các lỗi do nhà sản xuất hoặc xử lý kém (nếu có thể xác minh được). 
                    </li>
                </ul>
                <p>Lưu ý: Sản phẩm đổi trả phải giữ nguyên tình trạng ban đầu — chưa sử dụng, không bị 
                    tác động thêm, còn đầy đủ phụ kiện, tem/mác, bao bì nếu có. 
                </p>

            </section>

            <section className="terms-section">
                <h2>2. Thời hạn thông báo & gửi hàng đổi trả: </h2>
                <p>Thông báo đổi trả: Trong vòng 48 giờ kể từ khi nhận hàng, nếu phát hiện lỗi, thiếu phụ 
                    kiện hoặc sai mẫu. 
                </p>
                <p>Gửi trả sản phẩm: Trong vòng 14 ngày kể từ ngày bạn nhận hàng.</p>
                <p>Khách hàng có thể lựa chọn: </p>
                <ul>
                    <li>Mang hàng đến trực tiếp cửa hàng OHT STORE (nếu thuận tiện).</li>
                    <li>
                        Gửi sản phẩm qua đường bưu điện / đơn vị vận chuyển (theo hướng dẫn của 
                        shop).
                    </li>
                </ul>
                <p>Trong trường hợp bạn có khiếu nại hoặc thắc mắc về chất lượng sản phẩm, vui lòng 
                    liên hệ bộ phận chăm sóc khách hàng của chúng tôi để được hỗ trợ nhanh chóng. 
                </p>
            </section>

            <section className="terms-section">
                <h2>3. Quy trình đổi trả & hoàn tiền / gửi sản phẩm thay thế:</h2>
                <p>Chọn Hoàn hàng gửi kèm ảnh và video minh chứng.</p>
                <p>Liên hệ shop và gửi hình ảnh/video thực tế của sản phẩm kèm mô tả lỗi/khuyết điểm 
                    trong trường hợp đơn hàng chưa được xác nhận.
                </p>
                <p>Khi shop xác nhận chấp thuận đổi trả, bạn gửi sản phẩm về địa chỉ được hướng dẫn. </p>
                <p>Shop kiểm tra tình trạng sản phẩm đổi trả. </p>
                <ul>
                    <li>Nếu hợp lệ, shop sẽ gửi sản phẩm thay thế hoặc hoàn tiền (theo thỏa 
                        thuận) trong 3–5 ngày làm việc kể từ khi nhận được sản phẩm trả về.
                    </li>
                    <li>Nếu không hợp lệ (hư hỏng do sử dụng sai cách, mất phụ kiện, sai quy định 
                        đổi trả), shop giữ quyền từ chối đổi/ trả và gửi lại sản phẩm cho khách hàng. 
                    </li>
                    
                </ul>
                
            </section>

            <section className="terms-section">
                <h2>4. Chi phí vận chuyển đổi trả:</h2>
                <ul>
                    <li>Trong trường hợp lỗi do shop (sai mẫu, hư hỏng khi giao), OHT STORE chịu 
                        chi phí vận chuyển đổi trả. 
                    </li>
                    
                    <li>
                        Nếu bạn đổi trả vì lý do cá nhân (muốn thay đổi loại khác, không vừa ý) hoặc 
                        lỗi do bạn thì bạn chịu phí vận chuyển hai chiều (gửi trả + gửi lại). 
                    </li>
                </ul>
            </section>

            <section className="terms-section">
                <h2>5. Cam kết từ OHT STORE:</h2>
                <p>Chúng tôi luôn mong muốn mỗi sản phẩm đến tay bạn phải là món quà trọn vẹn — 
                    không chỉ đẹp về thiết kế mà còn đúng về chất lượng. Mọi yêu cầu đổi trả hợp lệ sẽ 
                    được xử lý công minh, nhanh chóng và tận tâm. 
                </p>
                <p>Mọi thắc mắc hoặc khiếu nại, bạn cứ thoải mái liên hệ — chúng tôi cam kết đồng hành 
                    và phục vụ bạn đến tận cùng.
                </p>
            </section>
        </div>
    );
};

export default WarrantyPolicy;
