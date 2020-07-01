import { cronogramaActionsTypes } from '../actions/cronogramaActions';

const initialState = {
    cronograma: {},
    cronogramas: {},
    remove: {},
};

const cronograma = (state = initialState, action) => {
    switch (action.type) {
        case cronogramaActionsTypes.FIND_CRONOGRAMA :
            state.cronograma = action.payload;
            return state;
        case cronogramaActionsTypes.ALL_CRONOGRAMA :
            state.cronogramas = action.payload;
            return state;
        case cronogramaActionsTypes.REMOVE :
            state.remove = action.payload;
            return state;
        case cronogramaActionsTypes.CLEAR_CRONOGRAMA:
            state.cronograma = {};
            state.cronogramas = {},
            state.remove = {}
            return state;
        default:
            return state;
    }
}

export default cronograma;