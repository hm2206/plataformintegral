
// menus
const current_status_default = [
    { key: "INBOX", icon: 'fas fa-inbox', text: 'Recibidos', index: 0, filtros: ['RECIBIDO', 'COPIA', 'PENDIENTE', 'DERIVADO', 'RECHAZADO', 'FINALIZADO'], count: 0 },
    { key: "SENT", icon: 'fas fa-paper-plane', text: 'Enviados', index: 1, filtros: ['RESPONDIDO', 'ACEPTADO', 'REGISTRADO', 'RECHAZADO', 'ENVIADO'], count: 0 },
    { key: "ANULADO", icon: 'fas fa-trash', text: 'Anulados', index: 2, filtros: ['ANULADO'], count: 0 },
    { key: "FINALIZADOS", icon: 'fas fa-check-double', text: 'Finalizados', index: 3, filtros: ['FINALIZADO'], count: 0 }
];

export const intialState = {
    menu: null,
    tab: null,
    trackings: [],
    status: current_status_default,
    filtros: [],
    render: null,
};

export const tramiteTypes = {
    INITIAL: "INITIAL[TRACKING]",
    PUSH: "PUSH[tracking]",
    INITIAL_MENU: "INITIAL[MENU]",
    CHANGE_MENU: "CHANGE[MENU]",
    CHANGE_TAB: "CHANGE[TAB]",
    CHANGE_RENDER: "CHANGE[RENDER]"
};

export const tramiteReducer = (state = initialState, { type = "", payload = {} }) => {
    let newState = Object.assign({}, state);
    switch (type) {
        case tramiteTypes.INITIAL:
            newState.trackings = payload;
            return newState;
        case tramiteTypes.PUSH:
            newState.trackings.push(...payload);
            return newState;
        case tramiteTypes.CHANGE_RENDER:
            newState.render = payload;
            return newState;
        case tramiteTypes.INITIAL_MENU: 
            let newStatus = [...newState.status];
            for (let status of newStatus) {
                let count = 0;
                for (let f of status.filtros) {
                    count += typeof payload[f] != 'undefined' ? parseInt(payload[f]) : 0;
                    // add count
                    status.count = count;
                }
            }
            // response
            return newState;
        case tramiteTypes.CHANGE_MENU:
            newState.render = "TAB";
            newState.menu = payload;
            for (let status of newState.status) {
                if (status.key == newState.menu) {
                    newState.filtros = status.filtros;
                    break;
                }
            }
            return newState;
        case tramiteTypes.CHANGE_TAB:
            newState.tab = payload;
            return newState;
        default:
            return newState;
    }
}