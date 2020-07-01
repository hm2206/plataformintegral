import { workActionsTypes } from '../actions/workActions';

const initialState = {
    work: {},
    page_work: {}
};

const work = (state = initialState, action) => {
    switch (action.type) {
        case workActionsTypes.FIND_WORK :
            state.work = action.payload;
            return state;
        case workActionsTypes.PAGE_WORK:
            state.page_work = action.payload;
            return state;
        case workActionsTypes.CLEAR_WORK:
            return initialState;
        default:
            return state;
    }
}

export default work;