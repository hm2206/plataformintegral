import { typeDetalleActionsTypes } from '../actions/typeDetalleActions';

const initialState = {
    type_detalles: [],
};

const type_detalle = (state = initialState, action) => {
    switch (action.type) {
        case typeDetalleActionsTypes.TYPE_DETALLE:
            state.type_detalles = action.payload;
            return state;
        case typeDetalleActionsTypes.CLEAR_TYPE_DETALLE:
            return initialState;
        default:
            return state;
    }
}

export default type_detalle;