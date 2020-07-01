import { personalActionsTypes } from '../actions/personalActions';

const initialState = {
    pege_personal: {},
    personal: {}
};

const personal = (state = initialState, action) => {
    switch (action.type) {
        case personalActionsTypes.PAGE_PERSONAL:
            state.page_personal = action.payload;
            return state;
        case personalActionsTypes.FIND_PERSONAL: 
            state.personal = action.payload;
            return state;
        case personalActionsTypes.CLEAR_PERSONAL:
            state = initialState;
            return state;
        default:
            return state;
    }
}

export default personal;