import { metaActionsTypes } from '../actions/metaActions';

const initialState = {
    metas: [],
    page_meta: {}
};

const meta = (state = initialState, action) => {
    switch (action.type) {
        case metaActionsTypes.PAGE_META:
            state.page_meta = action.payload;
            return state;
        case metaActionsTypes.CLEAR_META:
            state.metas = [];
            state.page_meta = {};
            return state;
        default:
            return state;
    }
}

export default meta;