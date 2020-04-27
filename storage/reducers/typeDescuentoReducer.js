import { typeDescuentoActionsTypes } from '../actions/typeDescuentoActions';

const initialState = {
    type_descuentos: [],
    page_type_descuento: {}
};

const type_descuento = (state = initialState, action) => {
    switch (action.type) {
        case typeDescuentoActionsTypes.PAGE_TYPE_DESCUENTO:
            state.page_type_descuento = action.payload;
            return state;
        default:
            return state;
    }
}

export default type_descuento;