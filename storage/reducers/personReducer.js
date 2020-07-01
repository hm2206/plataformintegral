import { personActionsTypes } from '../actions/personActions';

const initialState = {
    person: {}
};

const person = (state = initialState, action) => {
    switch (action.type) {
        case personActionsTypes.FIND_PERSON:
            state.person = action.payload;
            return state;
        case personActionsTypes.CLEAR_PERSON:
            return initialState;
        default:
            return state;
    }
}

export default person;