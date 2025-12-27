import { CHAT_REQUEST, CHAT_SUCCESS, CHAT_FAIL } from "../actions/chatai";

const initialState = {
    loading: false,
    answer: null,
    error: null
};

export const chatReducer =(state = initialState, action) =>{
    switch(action.type) {
        case CHAT_REQUEST:
            return { ...state, loading: true, error: null };
        case CHAT_SUCCESS:
            return { ...state, loading: false, answer: action.payload };
        case CHAT_FAIL:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
