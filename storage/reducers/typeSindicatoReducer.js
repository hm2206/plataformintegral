import { typeSindicatoActionsTypes } from '../actions/typeSindicatoActions';

const initialState = {
    type_sindicatos: [],
};

const type_sindicato = (state = initialState, action) => {
    switch (action.type) {
        case typeSindicatoActionsTypes.TYPE_SINDICATO:
            state.type_sindicatos = action.payload;
            return state;
        case typeSindicatoActionsTypes.CLEAR_TYPE_SINDICATO:
            return initialState;
        default:
            return state;
    }
}

export default type_sindicato;