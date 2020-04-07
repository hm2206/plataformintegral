import { workActionsTypes } from '../actions/workActions';

const initialState = {
    work: {}
};

const work = (state = initialState, action) => {
    switch (action.type) {
        case workActionsTypes.FIND_WORK :
            state.work = action.payload;
            return state;
        default:
            return state;
    }
}

export default work;