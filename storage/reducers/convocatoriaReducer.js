import { convocatoriaActionsTypes } from '../actions/convocatoriaActions';

const initialState = {
    page_convocatoria: {},
    convocatoria: {}
};

const convocatoria = (state = initialState, action) => {
    switch (action.type) {
        case convocatoriaActionsTypes.PAGE_CONVOCATORIA:
            state.page_convocatoria = action.payload;
            return state;
        case convocatoriaActionsTypes.CONVOCATORIA:
            state.convocatoria = action.payload;
            return state;
        case convocatoriaActionsTypes.CLEAR_CONVOCATORIA:
            state.convocatoria = {};
            state.page_convocatoria = {};
            return state;
        default:
            return state;
    }
}

export default convocatoria;