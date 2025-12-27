import React from "react";
import "../style/termsService.css";

const TermsService = () => {
    return (
        <div className="terms-container">
            <h1 className="terms-title">Điều khoản dịch vụ</h1>

            <section className="terms-section">
                <h2>1. Giới thiệu</h2>
                <p>
                    Chào mừng bạn đến với <strong>OHT STORE</strong>.
                </p>
                <p>
                    Khi quý khách truy cập vào website của chúng tôi có nghĩa là quý khách
                    đồng ý với các điều khoản này. Website có quyền thay đổi, chỉnh sửa,
                    thêm hoặc lược bỏ bất kỳ phần nào trong Điều khoản mua bán hàng hóa
                    vào bất cứ lúc nào.
                </p>
                <p>
                    Các thay đổi có hiệu lực ngay khi được đăng trên website mà không cần
                    thông báo trước. Việc tiếp tục sử dụng website đồng nghĩa với việc
                    quý khách chấp nhận những thay đổi đó.
                </p>
            </section>

            <section className="terms-section">
                <h2>2. Người dùng</h2>
                <ul>
                    <li>Bạn cần có đầy đủ năng lực hành vi dân sự theo quy định pháp luật.</li>
                    <li>
                        Nếu dưới 18 tuổi, cần có sự đồng ý hoặc giám sát của người đại diện
                        hợp pháp.
                    </li>
                    <li>
                        Cam kết sử dụng dịch vụ đúng mục đích, không vi phạm pháp luật,
                        không gây ảnh hưởng đến shop hoặc bên thứ ba.
                    </li>
                </ul>
            </section>

            <section className="terms-section">
                <h2>3. Giao dịch & Thanh toán</h2>
                <p>Hình thức thanh toán:</p>
                <ul>
                    <li>COD (Thanh toán khi nhận hàng)</li>
                    <li>Chuyển khoản ngân hàng / VNPay</li>
                    <li>Thanh toán bằng ví cá nhân</li>
                </ul>
                <p>
                    OHT STORE cam kết bảo mật thông tin thanh toán. Mọi chi phí phát sinh
                    (nếu có) sẽ được thông báo rõ ràng trước khi xác nhận đơn hàng.
                </p>
            </section>

            <section className="terms-section">
                <h2>4. Vận chuyển & Giao hàng</h2>
                <ul>
                    <li>Đơn hàng được xử lý trong 1–3 ngày làm việc sau khi xác nhận.</li>
                    <li>Thời gian giao hàng phụ thuộc vào đơn vị vận chuyển và địa chỉ nhận.</li>
                    <li>
                        Shop không chịu trách nhiệm nếu khách hàng cung cấp sai thông tin
                        giao hàng.
                    </li>
                </ul>
            </section>

            <section className="terms-section">
                <h2>5. Giới hạn trách nhiệm</h2>
                <ul>
                    <li>
                        OHT STORE cam kết cung cấp sản phẩm đúng mô tả và chất lượng.
                    </li>
                    <li>
                        Không chịu trách nhiệm với hư hỏng, mất mát do sử dụng sai cách
                        hoặc các yếu tố bất khả kháng (thiên tai, gián đoạn vận chuyển…).
                    </li>
                </ul>
            </section>
        </div>
    );
};

export default TermsService;
