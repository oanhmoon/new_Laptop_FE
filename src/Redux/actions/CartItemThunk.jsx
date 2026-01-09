import { cartItemService } from "../../Service/CartItemService";

/* LẤY DANH SÁCH GIỎ HÀNG*/
export const getCartItemByIdUser = (page, size, idUser) => async (dispatch) => {
    try {
        const res = await cartItemService.getCartItemByIdUser(page, size, idUser);

        if (res && res.data && res.data.content) {
            dispatch({
                type: "SET_CART_ITEMS",
                payload: res.data,
            });

            // cập nhật luôn tổng số lượng
            dispatch({
                type: "SET_TOTAL_CART_ITEMS",
                payload: res.data.totalElements ?? res.data.content.length,
            });
        } else {
            console.log("No cart data found.");
        }

        return res.data;
    } catch (error) {
        if (error.response?.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};

/*THÊM SẢN PHẨM VÀO GIỎ */
export const insertCartItem = ({ quantity, productVariantId, userId }) => async (dispatch) => {
    try {
        const body = { quantity, productVariantId, userId };
        const res = await cartItemService.insertCartItem(body);

        if (res?.code === 200) {
            
            const totalRes = await cartItemService.totalCartItemById(userId);

            dispatch({
                type: "SET_TOTAL_CART_ITEMS",
                payload: totalRes.data,
            });
        }

        return res.code;
    } catch (error) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 401) {
            throw new Error("Vui lòng đăng nhập để sử dụng chức năng");
        }

        if (message) {
            throw new Error(message);
        }

        throw new Error("Thêm vào giỏ hàng thất bại");
    }
};

/*XÓA 1 SẢN PHẨM*/
export const deleteCartItem = (id, userId) => async (dispatch) => {
    try {
        const res = await cartItemService.deleteCartItem(id);

        if (res?.code === 200) {
            const totalRes = await cartItemService.totalCartItemById(userId);

            dispatch({
                type: "SET_TOTAL_CART_ITEMS",
                payload: totalRes.data,
            });
        }

        return res.code;
    } catch (error) {
        if (error.response?.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};

/*CẬP NHẬT SỐ LƯỢNG */
export const updateCartItemQuantity = ({ id, quantity, userId }) => async (dispatch) => {
    try {
        const res = await cartItemService.updateQuantity(id, quantity);

        // if (res?.code === 200) {
        //     const totalRes = await cartItemService.totalCartItemById(userId);

        //     dispatch({
        //         type: "SET_TOTAL_CART_ITEMS",
        //         payload: totalRes.data,
        //     });
        // }

        // return res.code;
        if (res?.data?.code === 200) {
    const totalRes = await cartItemService.totalCartItemById(userId);

    dispatch({
        type: "SET_TOTAL_CART_ITEMS",
        payload: totalRes.data,
    });
}

return res?.data?.code;

    } catch (error) {
        if (error.response?.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};

/*XÓA TOÀN BỘ GIỎ HÀNG */
export const deleteAllCartItems = (userId) => async (dispatch) => {
    try {
        const cartResponse = await cartItemService.getCartItemByIdUser(0, 1000, userId);
        const allCartItems = cartResponse.data.content;

        if (!allCartItems || allCartItems.length === 0) {
            throw new Error("Giỏ hàng trống");
        }

        const listCartId = allCartItems.map(item => item.id);
        const res = await cartItemService.deleteCartItems(listCartId);

        if (res?.code === 200) {
            dispatch({
                type: "SET_TOTAL_CART_ITEMS",
                payload: 0,
            });
        }

        return res.code;
    } catch (error) {
        throw error;
    }
};

/*LẤY TỔNG SỐ SẢN PHẨM */
export const totalCartItem = (userId) => async (dispatch) => {
    try {
        const res = await cartItemService.totalCartItemById(userId);

        if (res?.code === 200) {
            dispatch({
                type: "SET_TOTAL_CART_ITEMS",
                payload: res.data,
            });
        }

        return res.data;
    } catch (error) {
        if (error.response?.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
    }
};
