import { appsActionsTypes } from '../actions/appsActions';

const initialState = {
    page_apps: {},
};

const apps = (state = initialState, action) => {
    switch (action.type) {
        case appsActionsTypes.PAGE_APPS:
            state.page_apps = action.payload;
            return state;
        case appsActionsTypes.CLEAR_APPS:
            state.page_apps = {};
            return state;
        default:
            return state;
    }
}

export default apps;