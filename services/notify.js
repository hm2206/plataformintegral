import { authentication } from './apis';

export const markAsReadAll = async () => {
    return  await authentication.get(`auth/notification/mark_as_read_all`)
    .then(res => res.data)
    .catch(err => ({
        success: false,
        status: err.status || 501,
        message: err.message
    }));
}