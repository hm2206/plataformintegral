import { systemActionsTypes } from '../actions/systemActions';

const initialState = {
    page_system: {},
};

const system = (state = initialState, action) => {
    switch (action.type) {
        case systemActionsTypes.PAGE_SYSTEM:
            state.page_system = action.payload;
            return state;
        case systemActionsTypes.CLEAR_SYSTEM:
            return initialState;
        default:
            return state;
    }
}

export default system;