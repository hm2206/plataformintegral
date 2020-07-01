import { historialActionsTypes } from '../actions/historialActions';

const initialState = {
    page_historial: {}
};

const historial = (state = initialState, action) => {
    switch (action.type) {
        case historialActionsTypes.ALL_HISTORIAL:
            state.page_historial = action.payload;
            return state;
        case historialActionsTypes.CLEAR_HISTORIAL:
            state.page_historial = {};
            return state;
        default:
            return state;
    }
}

export default historial;