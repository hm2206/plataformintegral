import { typeRemuneracionActionsTypes } from '../actions/typeRemuneracionActions';

const initialState = {
    type_remuneraciones: [],
    page_type_remuneracion: {}
};

const type_remuneracion = (state = initialState, action) => {
    switch (action.type) {
        case typeRemuneracionActionsTypes.PAGE_TYPE_REMUNERACION:
            state.page_type_remuneracion = action.payload;
            return state;
        case typeRemuneracionActionsTypes.CLEAR_TYPE_REMUNERACION:
            return initialState;
        default:
            return state;
    }
}

export default type_remuneracion;