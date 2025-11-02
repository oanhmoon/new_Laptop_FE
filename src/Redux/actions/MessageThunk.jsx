import {chatService} from "../../Service/ChatService";


export const get_all_messages = (page,size,senderId,receiverId) => {
    return async (dispatch) => {
        try {
            const res = await chatService.get_message_by_id(page,size,senderId,receiverId);
            dispatch({
                type: "GET_MESSAGE",
                payload: res.data
            })
        } catch (error) {
            console.log(error);
        }
    }
}
export const get_all_users = (page,size) => {
    return async (dispatch) => {
        try {
            const res = await chatService.get_information(page,size);

            dispatch({
                type: "GET_USER",
                payload: res.data
            })
        } catch (error) {
            console.log(error);
        }
    }
}

// 🆕 Upload file (ảnh / video)
export const upload_file_thunk = (file) => {
  return async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await chatService.upload_file(formData);
      return res.data; // trả về URL Cloudinary
    } catch (error) {
      console.log("Upload file error:", error);
      throw error;
    }
  }
}
