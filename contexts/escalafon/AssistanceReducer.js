
import collect from 'collect.js';

export const initialStates = {
    assistances: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    }
};

export const assistanceTypes = {
    SET_ASSISTANCES: "SET[ASSISTANCES]",
    PUSH_ASSISTANCES: "PUSH[ASSISTANCES]",
    UPDATE_ASSISTANCE: "UPDATE[ASSISTANCE]",
    DELETE_ASSISTANCE: "DELETE[ASSISTANCE]",
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
        case assistanceTypes.PUSH_ASSISTANCES:
            newState.assistances = {
                ...state.assistances,
                page: payload.page || 1,
                last_page: payload.last_page || 0,
                total: payload.total || 0,
                data: [...newState.assistances.data, ...payload.data]
            };
            return newState;
        case assistanceTypes.UPDATE_ASSISTANCE:
            let updateAssistancePlucked = collect(newState.assistances.data).pluck('id').toArray();
            let updateAssistanceIndex = updateAssistancePlucked.indexOf(payload.id);
            if (updateAssistanceIndex < 0) break;
            let updateAssistance = Object.assign(newState.assistances.data[updateAssistanceIndex], payload);
            newState.assistances.data[updateAssistanceIndex] = updateAssistance;
            return newState;
        case assistanceTypes.DELETE_ASSISTANCE:
            let deleteAssistances = newState.assistances.data.filter(a => a.id != payload);
            newState.assistances.data = deleteAssistances;
            newState.assistances.total -= 1; 
            return newState;
        default:
            return newState;
    }
}