import { LOGOUT_SUCCESS } from "../../Utils/Setting/Config";

const initialState = {
    items: [],        // danh sách sản phẩm trong giỏ
    totalItems: 0,    // tổng số sản phẩm
};

export const CartReducer = (state = initialState, action) => {
    switch (action.type) {

        // load danh sách giỏ hàng
        case "SET_CART_ITEMS":
            return {
                ...state,
                items: action.payload.content || [],
                totalItems:
                    action.payload.totalElements ??
                    action.payload.content?.length ??
                    0,
            };

        // chỉ cập nhật tổng số sản phẩm
        case "SET_TOTAL_CART_ITEMS":
            return {
                ...state,
                totalItems: action.payload,
            };

        // xóa toàn bộ giỏ hàng
        case "DELETE_ALL_CART_ITEMS":
            return {
                ...state,
                items: [],
                totalItems: 0,
            };

        // logout → reset cart
        case LOGOUT_SUCCESS:
            return initialState;

        default:
            return state;
    }
};
