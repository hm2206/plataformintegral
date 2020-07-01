import { infoActionsTypes } from '../actions/infoActions';

const initialState = {
    info: {},
    infos_paginate: {},
    infos: []
};

const info = (state = initialState, action) => {
    switch(action.type) {
        case infoActionsTypes.FIND_INFO:
            state.info = action.payload;
        case infoActionsTypes.ALL_INFO :
            state.infos_paginate = action.payload;
            return state;
        case infoActionsTypes.CLEAR_INFO :
            state.info = {};
            state.infos_paginate = {};
            state.infos = [];
            return state;
        default: 
            return state;
    }
}

export default info;