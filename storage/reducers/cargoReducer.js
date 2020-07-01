import { cargoActionsTypes } from '../actions/cargoActions';

const initialState = {
    cargos: [],
    page_cargos: {}
};

const cargo = (state = initialState, action) => {
    switch (action.type) {
        case cargoActionsTypes.PAGE_CARGO:
            state.page_cargos = action.payload;
            return state;
        case cargoActionsTypes.ALL_CARGO:
            state.cargos = action.payload;
            return state;
        case cargoActionsTypes.CLEAR_CARGO:
            state.cargos = [];
            state.page_cargos = {};
            return state;
        default:
            return state;
    }
}

export default cargo;