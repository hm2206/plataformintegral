import { userActionsTypes } from '../actions/userActions';

const initialState = {
    page_user: {},
};

const user = (state = initialState, action) => {
    switch (action.type) {
        case userActionsTypes.PAGE_USER:
            state.page_user = action.payload;
            return state;
        case userActionsTypes.CLEAR_USER:
            return initialState;
        default:
            return state;
    }
}

export default user;