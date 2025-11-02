import { baseService } from "./BaseService";

export class FavoriteService extends baseService {
    constructor() {
        super();
    }

    addFavorite = (userId, productOptionId) => {
        return this.post(`api/favorites/${userId}/add/${productOptionId}`, {}, true);
    };

    removeFavorite = (userId, productOptionId) => {
        return this.delete(`api/favorites/${userId}/remove/${productOptionId}`, true);
    };

    checkFavorite = (userId, productOptionId) => {
        return this.get(`api/favorites/${userId}/check/${productOptionId}`, true);
    };

    getAllFavorites = (userId) => {
        return this.get(`api/favorites/${userId}`, true);
    };
}

export const favoriteService = new FavoriteService();
