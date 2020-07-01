import { authentication } from '../../services/apis';


export const appsActionsTypes = {
    PAGE_APPS: 'PAGE_APPS',
    CLEAR_APPS: 'CLEAR_APPS'
};


export const pageApps = (ctx) => {
    return async (dispatch) => {
        let { query } = ctx;
        await authentication.get(`app?page=${query.page || 1}&query_search=${query.query_search || ""}`, {}, ctx)
        .then(res =>  dispatch({ type: appsActionsTypes.PAGE_APPS, payload: res.data }))
        .catch(err => console.log(err.message));
    }
}