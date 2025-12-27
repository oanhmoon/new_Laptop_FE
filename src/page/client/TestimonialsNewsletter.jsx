import React from 'react';
import { Star } from 'lucide-react';
import '../style/TestimonialsNewsletter.css';
import {Button, Card, Image, Input} from "antd";
import avt from "../../assets/avt.jpg";
const TestimonialsNewsletter = () => {
    const testimonials = [
        // {
        //     name: "Nguyễn Văn A",
        //     role: "Game thủ chuyên nghiệp",
        //     content: "Laptop gaming tôi mua từ TechLaptop có hiệu năng vượt trội, chơi game mượt mà không giật lag. Dịch vụ chăm sóc khách hàng tuyệt vời.",
        //     rating: 5
        // },
        // {
        //     name: "Trần Thị B",
        //     role: "Nhà thiết kế đồ họa",
        //     content: "Màn hình laptop có độ phủ màu chuẩn, rất phù hợp cho công việc thiết kế. Cấu hình mạnh mẽ xử lý tốt các phần mềm đồ họa nặng.",
        //     rating: 5
        // },
        // {
        //     name: "Lê Văn C",
        //     role: "Doanh nhân",
        //     content: "Ultrabook mỏng nhẹ, thời lượng pin dài, rất tiện lợi khi di chuyển. Chế độ bảo hành và hậu mãi của TechLaptop rất tốt.",
        //     rating: 4
        // }
    ];

    return (
        <>
            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container-x">
                    <h2 className="section-title-test">Chúng Tôi Cam Kết</h2>
                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="testimonial-card">
                                <div className="testimonial-content">
                                    <div className="rating-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`star-icon ${i < testimonial.rating ? 'filled' : ''}`}
                                            />
                                        ))}
                                    </div>

                                    <blockquote className="testimonial-text">
                                        <p>{testimonial.content}</p>
                                    </blockquote>

                                    <div className="testimonial-author">
                                        <div className="author-avatar">
                                            <Image
                                                src={avt}
                                                alt={testimonial.name}
                                                width={40}
                                                height={40}
                                                className="avatar-image"
                                                onError={(e) => {
                                                    e.target.src = '/avatars/default-avatar.jpg';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                        </div>
                                        <div className="author-info">
                                            <p className="author-name">{testimonial.name}</p>
                                            <p className="author-role">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            
        </>
    );
};

export default TestimonialsNewsletter;