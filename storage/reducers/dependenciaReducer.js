import { dependenciaActionsTypes } from '../actions/dependenciaActions';

const initialState = {
    dependencias: [],
};

const dependencia = (state = initialState, action) => {
    switch (action.type) {
        case dependenciaActionsTypes.ALL_DEPENDENCIAS:
            state.dependencias = action.payload;
            return state;
        case dependenciaActionsTypes.CLEAR_DEPENDENCIAS:
            state.dependencias = [];
            return state;
        default:
            return state;
    }
}

export default dependencia;