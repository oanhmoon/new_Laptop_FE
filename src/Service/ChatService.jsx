import {baseService} from "./BaseService";
import axios from "axios";

export class ChatService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    get_message_by_id = (page, size,senderId,receiverId) => {
        return this.get(`api/v1/users/message?page=${page}&size=${size}&senderId=${senderId}&receiverId=${receiverId}`,true);
    };
    get_information = (page, size) => {
        return this.get(`api/v1/users/information?page=${page}&size=${size}`);
    };

    // upload_file = (formData) => {
    // return axios.post(`http://localhost:8081/api/v1/chat/upload`, formData, {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // });

    upload_file = (formData) => {
  const token = localStorage.getItem("accessToken");
  return axios.post(`http://localhost:8081/api/v1/chat/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`,
    },
  });


  };

}

export const chatService = new ChatService();
