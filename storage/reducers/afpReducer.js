import { afpActionsTypes } from '../actions/afpActions';

const initialState = {
    afps: [],
};

const afp = (state = initialState, action) => {
    switch (action.type) {
        case afpActionsTypes.ALL_AFP:
            state.afps = action.payload;
            return state;
        case afpActionsTypes.CLEAR_AFP:
            state.afps = [];
        default:
            return state;
    }
}

export default afp;