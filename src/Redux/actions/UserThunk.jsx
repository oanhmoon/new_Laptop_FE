import { userService } from "../../Service/UserService";
import {
    LOGIN_SUCCESS,
    TOKEN,
    USER_LOGIN
} from "../../Utils/Setting/Config";

// ---------------- LOGIN ----------------
export const loginUser = (credentials) => async (dispatch) => {
    try {
        const res = await userService.login(credentials.username, credentials.password);
        if (res.data && res.data.accessToken) {
            const { id, accessToken, username, fullName, email, role } = res.data;
            const userDetails = { id, username, fullName, email, role };

            localStorage.setItem(TOKEN, accessToken);
            localStorage.setItem(USER_LOGIN, JSON.stringify(userDetails));

            dispatch({
                type: LOGIN_SUCCESS,
                payload: {
                    userData: userDetails,
                    token: accessToken
                }
            });

            return {
                success: true,
                data: {
                    ...userDetails,
                    accessToken
                }
            };
        } else {
            return {
                success: false,
                error: { message: 'Không nhận được accessToken' }
            };
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
        return {
            success: false,
            error: { message: errorMessage }
        };
    }
};

// ---------------- CHANGE PASSWORD ----------------
export const changePassword =
  (current, newPassword, confirmPassword) => async (dispatch) => {
    try {
      await userService.changePassword(
        current,
        newPassword,
        confirmPassword
      );

      dispatch({
        type: "ChangePassword"
      });

      
      return {
        message: "Đổi mật khẩu thành công"
      };
    } catch (error) {
      throw error;
    }
  };



// ---------------- REGISTER ----------------
export const register = (username, password, fullName, email) => async (dispatch) => {
    try {
        const res = await userService.register(username, password, fullName, email);

        if (res && res.data) {
            dispatch({
                type: "Register",
                payload: res.data,
            });
            return res.data;
        } else {
            return { error: { message: "Dữ liệu không hợp lệ" } };
        }
    } catch (error) {
        console.error("Đăng ký lỗi:", error);

        // Lấy message từ backend nếu có
        const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
        return { error: { message: errorMessage } };
    }
};

// ---------------- GET USER BY USERNAME ----------------
export const getUserByUsername = (username) => async (dispatch) => {
    try {
        const res = await userService.informationUser(username);

        if (res && res.data) {
            dispatch({
                type: "InfoUser",
                payload: res.data,
            });
            return res.data;
        } else {
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        throw error;
    }
};

// ---------------- GET USER BALANCE ----------------
// export const getUserBalance = (id) => async (dispatch) => {
//     try {
//         const res = await userService.getBalanceOfUser(id);

//         if (res) {
//             dispatch({
//                 type: "Balance",
//                 payload: res,
//             });
//             return res;
//         } else {
//             throw new Error('Dữ liệu không hợp lệ');
//         }
//     } catch (error) {
//         console.error("Đã xảy ra lỗi:", error);
//     }
// };
export const getUserBalance = (id) => async (dispatch) => {
    try {
        const res = await userService.getBalanceOfUser(id);

        if (res?.code === 200) {
            dispatch({
                type: "SET_USER_BALANCE",
                payload: res.data, // ✅ CHỈ LẤY SỐ
            });
            return res.data;
        } else {
            throw new Error("Không lấy được số dư");
        }
    } catch (error) {
        console.error("Lỗi lấy số dư:", error);
    }
};


// ---------------- ADMIN GET ALL USER ----------------
export const adminGetAllUser = (keyword, page, size, sortDir, sortBy) => async (dispatch) => {
    try {
        const res = await userService.adminGetAllUser(keyword, page, size, sortDir, sortBy);
        console.log("Users response:", res);
        if (res && res.data && res.data.content) {
            dispatch({
                type: "SET_USERS",
                payload: res.data,
            });
        } else {
            console.log("No user data found.");
        }
        return res.data;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
        throw error;
    }
};

// ---------------- BLOCK USER ----------------
export const blockUser = (userId) => async (dispatch) => {
    try {
        const res = await userService.blockUser(userId);
        console.log("User block response:", res);
        if (res && res.code === 200) {
            dispatch({
                type: "BLOCK_USER",
                payload: {
                    userId: userId,
                    code: res.code
                },
            });
        } else {
            console.log("User block operation failed");
        }
        return res.code;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data.message);
        } else {
            console.error("Unexpected error:", error.message);
        }
        throw error;
    }
};

// ---------------- SEND REQUEST DRAWL ----------------
export const sendRequestDrawl = (body) => async (dispatch) => {
    try {
        const res = await userService.sendRequestDrawl(body);

        if (res) {
            dispatch({
                type: "DRAWL",
                payload: res,
            });
            return res;
        } else {
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        throw error;
    }
};

// ---------------- GET ALL DRAWL ----------------
export const getAllDrawl = (startDate, endDate, page, size, sortBy, sortDirection) => async (dispatch) => {
    try {
        const res = await userService.userGetAllWithdrawals(startDate, endDate, page, size, sortBy, sortDirection);

        if (res) {
            dispatch({
                type: "DRAWL_LIST",
                payload: res.data,
            });
            return res.data;
        } else {
            throw new Error('Dữ liệu không hợp lệ');
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error);
        throw error;
    }
};
// ---------------- SEND OTP ----------------
export const sendOtp = (email) => async (dispatch) => {
  try {
    const res = await userService.sendOtp(email); // res chính là JSON từ server

    if (res) {
      dispatch({
        type: "SEND_OTP_SUCCESS",
        payload: res,
      });
      return res; // trả luôn JSON
    } else {
      throw new Error("Không nhận được phản hồi hợp lệ từ server");
    }
  } catch (error) {
    console.error("Gửi OTP thất bại:", error);
    const errorMessage = error.response?.data?.message || "Không gửi được OTP";
    return { error: { message: errorMessage } };
  }
};


export const resetPassword = (payload) => async (dispatch) => {
  try {
    const res = await userService.resetPassword(payload);

    if (res) {
      dispatch({
        type: "RESET_PASSWORD_SUCCESS",
        payload: res,
      });
      return res;
    } else {
      throw new Error("Không nhận được phản hồi hợp lệ từ server");
    }
  } catch (error) {
    console.error("Đặt lại mật khẩu thất bại:", error);
    const errorMessage = error.response?.data?.message || "Đặt lại mật khẩu thất bại";
    return { error: { message: errorMessage } };
  }
};


// ---------------- REQUEST REGISTER OTP ----------------
// export const requestRegisterOtp = (email) => async (dispatch) => {
//   try {
//     const res = await userService.requestRegisterOtp(email);
//     if (res) {
//       dispatch({ type: "REQUEST_REGISTER_OTP_SUCCESS", payload: res });
//       return res;
//     } else {
//       throw new Error("Không nhận được phản hồi hợp lệ từ server");
//     }
//   } catch (error) {
//     console.error("Request OTP lỗi:", error);
//     const errorMessage = error.response?.data?.message || "Gửi OTP thất bại";
//     return { error: { message: errorMessage } };
//   }
// };
// export const requestRegisterOtp = (email) => async (dispatch) => {
//   try {
//     const res = await userService.requestRegisterOtp(email);

//     dispatch({
//       type: "REQUEST_REGISTER_OTP_SUCCESS",
//       payload: res.data, // lưu gì cũng được
//     });

//     return res; // ✅ QUAN TRỌNG: trả về TOÀN BỘ response
//   } catch (error) {
//     return {
//       error: {
//         message: error.response?.data?.message || "Gửi OTP thất bại",
//       },
//     };
//   }
// };

export const requestRegisterOtp = (registerData) => async (dispatch) => {
  try {
    const res = await userService.requestRegisterOtp(registerData);

    dispatch({
      type: "REQUEST_REGISTER_OTP_SUCCESS",
      payload: res.data,
    });

    return res;
  } catch (error) {
    return {
      error: {
        message: error.response?.data?.message || "Gửi OTP thất bại",
      },
    };
  }
};


// ---------------- VERIFY REGISTER OTP ----------------
export const verifyRegisterOtp = (email, otp) => async (dispatch) => {
  try {
    const res = await userService.verifyRegisterOtp(email, otp);
    if (res) {
      dispatch({ type: "VERIFY_REGISTER_OTP_SUCCESS", payload: res });
      return res;
    } else {
      throw new Error("Không nhận được phản hồi hợp lệ từ server");
    }
  } catch (error) {
    console.error("Verify OTP lỗi:", error);
    const errorMessage = error.response?.data?.message || "Xác minh OTP thất bại";
    return { error: { message: errorMessage } };
  }
};

// ---------------- CONFIRM REGISTER ----------------
export const confirmRegister = (username, password, fullName, email) => async (dispatch) => {
  try {
    const res = await userService.confirmRegister(username, password, fullName, email);
    if (res && res.data) {
      dispatch({ type: "CONFIRM_REGISTER_SUCCESS", payload: res.data });
      return res.data;
    } else {
      return { error: { message: "OTP bạn nhập không chính xác hoặc đã hết hạn" } };
    }
  } catch (error) {
    console.error("Confirm Register lỗi:", error);
    const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
    return { error: { message: errorMessage } };
  }
};
