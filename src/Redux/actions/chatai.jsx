import API from "../../Service/api";

export const CHAT_REQUEST = "CHAT_REQUEST";
export const CHAT_SUCCESS = "CHAT_SUCCESS";
export const CHAT_FAIL = "CHAT_FAIL";

export const sendChat = (message) => async dispatch => {
    try {
        dispatch({ type: CHAT_REQUEST });
        const res = await API.post("/api/chat", { question: message });
        const answer = res.data?.answer ?? "Xin lỗi, hiện chưa có phản hồi.";
        dispatch({ type: CHAT_SUCCESS, payload: answer });
        return answer; // <-- trả về answer để caller có thể dùng ngay
    } catch (err) {
        const errMsg = err.message || "Lỗi";
        dispatch({ type: CHAT_FAIL, payload: errMsg });
        throw err; // hoặc return Promise.reject(err)
    }
};
