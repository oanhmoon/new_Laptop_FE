import { baseService } from "./BaseService";

export class UserViewHistoryService extends baseService {
    constructor() {
        super();
    }

    // ✅ Ghi lại lịch sử xem sản phẩm
    recordView = (userId, productId) => {
        // Gửi request POST /api/v1/products/{productId}/view?userId={userId}
        return this.post(`api/v1/products/${productId}/view?userId=${userId}`, null);
    };

    // ✅ (Tuỳ chọn) Lấy lịch sử xem của người dùng
    getUserHistory = (userId, page = 1, size = 10) => {
        return this.get(`api/v1/user-view-history/${userId}?page=${page}&size=${size}`);
    };
}

export const userViewHistoryService = new UserViewHistoryService();
