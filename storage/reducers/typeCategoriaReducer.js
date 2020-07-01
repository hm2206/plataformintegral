import { typeCategoriaActionsTypes } from '../actions/typeCategoriaActions';

const initialState = {
    page_type_categoria: {}
};

const type_categoria = (state = initialState, action) => {
    switch (action.type) {
        case typeCategoriaActionsTypes.PAGE_TYPE_CATEGORIA:
            state.page_type_categoria = action.payload;
            return state;
        case typeCategoriaActionsTypes.CLEAR_TYPE_CATEGORIA:
            return initialState;
        default:
            return state;
    }
}

export default type_categoria;