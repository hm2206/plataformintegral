
export const initialStates = {
    config_assistance_id: "",
    assistances: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    }
};

export const assistanceTypes = {
    SET_ASSISTANCES: "SET[ASSISTANCES]",
    SET_CONFIG_ASSISTANCE_ID: "SET[CONFIG_ASSISTANCE_ID]",
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
        case assistanceTypes.SET_CONFIG_ASSISTANCE_ID:
            newState.config_assistance_id = payload;
            return newState;
        default:
            return newState;
    }
}