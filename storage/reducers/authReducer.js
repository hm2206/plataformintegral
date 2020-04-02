import { authsActionsTypes } from '../actions/authsActions';

const initialState = {
    user: {}
};

const auth = (state = initialState, action) => {
    switch (action.type) {
        case authsActionsTypes.AUTH:
            state.user = action.payload;
            return state;
        case authsActionsTypes.LOGOUT:
            state.user = {};
            return state;
        default:
            return state;
    }
}

export default auth;