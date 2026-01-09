import { favoriteService } from "../../Service/FavoriteService";


export const checkFavorite = (userId, productOptionId) => {
  return async (dispatch) => {
    try {
      const res = await favoriteService.checkFavorite(userId, productOptionId);
      console.log(" checkFavorite API raw:", res);

      //  Nếu API trả về boolean trực tiếp (true/false)
      const result = res === true;

      return result; 
    } catch (error) {
      console.error(" Error checking favorite:", error);
      return false;
    }
  };
};




export const addFavorite = (userId, productOptionId) => async () => {
    try {
        await favoriteService.addFavorite(userId, productOptionId);
        return true;
    } catch (error) {
        console.error("Error adding favorite:", error);
        return false;
    }
};

export const removeFavorite = (userId, productOptionId) => async () => {
    try {
        await favoriteService.removeFavorite(userId, productOptionId);
        return true;
    } catch (error) {
        console.error("Error removing favorite:", error);
        return false;
    }
};



export const getAllFavorites = (userId) => async () => {
  try {
    const res = await favoriteService.getAllFavorites(userId);
    console.log(" API raw response:", res);

    
    return Array.isArray(res) ? res : res?.data || [];
  } catch (error) {
    console.error(" Error fetching favorites:", error);
    return [];
  }
};
