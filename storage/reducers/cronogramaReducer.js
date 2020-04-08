import { cronogramaActionsTypes } from '../actions/cronogramaActions';

const initialState = {
    cronograma: {}
};

const cronograma = (state = initialState, action) => {
    switch (action.type) {
        case cronogramaActionsTypes.FIND_CRONOGRAMA :
            state.cronograma = action.payload;
            return state;
        default:
            return state;
    }
}

export default cronograma;