import { permissionActionsTypes } from '../actions/permissionActions';

const initialState = {
    page_permission: {},
};

const permission = (state = initialState, action) => {
    switch (action.type) {
        case permissionActionsTypes.PAGE_PERMISSION:
            state.page_permission = action.payload;
            return state;
        case permissionActionsTypes.CLEAR_PERMISSION:
            state.page_permission = {};
            return state;
        default:
            return state;
    }
}

export default permission;