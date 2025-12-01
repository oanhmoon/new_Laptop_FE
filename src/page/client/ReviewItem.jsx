// import { Avatar, Rate } from 'antd';
// import {StarFilled, StarOutlined, UserOutlined} from '@ant-design/icons';

// export default function ReviewItem({ name, avatar, date, rating, comment }) {
//     return (
//         <div className="review-item">
//             <div className="flex justify-between items-start">
//                 <div className="flex items-center space-x-4">
//                     <Avatar
//                         size={48}
//                         src={avatar || "/placeholder.svg"}
//                         icon={<UserOutlined />}
//                         alt={name}
//                     />
//                     <div>
//                         <div className="reviewer-name">{name}</div>
//                         <div className="review-date">{date}</div>
//                     </div>
//                 </div>
//                 <Rate
//                     disabled
//                     defaultValue={rating}
//                     className="review-rating"
//                     character={({ index }) => index < rating ? <StarFilled /> : <StarOutlined />}
//                 />
//             </div>
//             <p className="review-comment">{comment}</p>
//         </div>
//     );
// }

import { Avatar, Rate } from "antd";
import {
    StarFilled,
    StarOutlined,
    UserOutlined
} from "@ant-design/icons";

export default function ReviewItem({
    name,
    avatar,
    date,
    rating,
    comment,
    images = [],
    videos = []
}) {
    return (
        <div className="review-item">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <Avatar
                        size={48}
                        src={avatar || "/placeholder.svg"}
                        icon={<UserOutlined />}
                        alt={name}
                    />
                    <div>
                        <div className="reviewer-name">{name}</div>
                        <div className="review-date">{date}</div>
                    </div>
                </div>

                <Rate
                    disabled
                    defaultValue={rating}
                    className="review-rating"
                    character={({ index }) =>
                        index < rating ? <StarFilled /> : <StarOutlined />
                    }
                />
            </div>

            {/* Comment */}
            <p className="review-comment">{comment}</p>

            {/* IMAGES */}
            {images.length > 0 && (
                <div className="review-images mt-3 flex flex-wrap gap-3">
                    {images.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt={`review-img-${idx}`}
                            className="w-28 h-28 object-cover rounded-md border"
                            onError={(e) => {
                                e.target.src = "/placeholder.svg";
                            }}
                        />
                    ))}
                </div>
            )}

            {/* VIDEOS */}
            {videos.length > 0 && (
                <div className="review-videos mt-3 flex flex-wrap gap-3">
                    {videos.map((url, idx) => (
                        <video
                            key={idx}
                            src={url}
                            controls
                            className="w-40 rounded-md border"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
