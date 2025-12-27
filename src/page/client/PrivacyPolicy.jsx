import React from "react";
import "../style/termsService.css";

const PrivacyPolicy = () => {
    return (
        <div className="terms-container">
            <h1 className="terms-title">Chính sách bảo mật</h1>

            <section className="terms-section">
                <h2>1. Thu thập thông tin:</h2>
                <p>
                    Khi mua sắm tại OHT STORE, chúng tôi có thể thu thập: 
                </p>
                <ul>
                    <li>Thông tin cá nhân: họ tên, số điện thoại, địa chỉ, email. </li>
                    <li>
                        Thông tin giao dịch: đơn hàng, phương thức thanh toán, địa chỉ nhận hàng.
                    </li>
                    
                </ul>
            </section>

            <section className="terms-section">
                <h2>2. Mục đích sử dụng thông tin:</h2>
                <ul>
                    <li>Xử lý đơn hàng, giao hàng, hỗ trợ sau bán hàng. </li>
                    <li>
                        Cải thiện trải nghiệm mua sắm và dịch vụ khách hàng. 
                    </li>
                    
                </ul>
            </section>

            <section className="terms-section">
                <h2>3. Bảo mật thông tin:</h2>
                
                <ul>
                    <li>OHT STORE cam kết không bán, chia sẻ thông tin khách hàng cho bên thứ ba trừ khi có sự đồng ý hoặc yêu cầu từ cơ quan chức năng theo quy định 
                        pháp luật. 
                    </li>
                    <li>Thông tin cá nhân được bảo mật bằng các biện pháp an toàn hợp lý.</li>
                    
                </ul>
                
            </section>

            <section className="terms-section">
                <h2>4. Cam kết:</h2>
                <p>Chúng tôi hiểu rằng thông tin của bạn là tài sản quý giá và cam kết bảo mật tối đa, đảm 
bảo trải nghiệm mua sắm an toàn, tin cậy.</p>
                
            </section>

            
        </div>
    );
};

export default PrivacyPolicy;
