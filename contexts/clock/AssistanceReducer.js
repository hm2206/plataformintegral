
export const initialStates = {
    assistances: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    }
};

export const assistanceTypes = {
    SET_ASSISTANCES: "SET[ASSISTANCES]"
}

export const AssistanceReducer = (state = initialStates, action = { }) => {
    let newState = Object.assign({}, state);
    let { type, payload } = action;
    switch (type) {
        case assistanceTypes.SET_ASSISTANCES:
            newState.assistances = {
                ...state.assistances,
                ...payload
            };
            return newState;
        default:
            return newState;
    }
}