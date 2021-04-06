import collect from 'collect.js';

// menus
const current_status_default = [
    { key: "INBOX", icon: 'fas fa-inbox', text: 'Recibidos', index: 0, filtros: ['RECIBIDO', 'COPIA', 'PENDIENTE', 'DERIVADO', 'RECHAZADO', 'FINALIZADO'], count: 0 },
    { key: "SENT", icon: 'fas fa-paper-plane', text: 'Enviados', index: 1, filtros: ['RESPONDIDO', 'ACEPTADO', 'REGISTRADO', 'RECHAZADO', 'ENVIADO'], count: 0 },
    { key: "ANULADO", icon: 'fas fa-trash', text: 'Anulados', index: 2, filtros: ['ANULADO'], count: 0 },
    { key: "FINALIZADOS", icon: 'fas fa-check-double', text: 'Finalizados', index: 3, filtros: ['FINALIZADO'], count: 0 }
];

export const initialState = {
    menu: null,
    tab: null,
    trackings: [],
    current_tracking: {},
    current_tramite: {},
    status: current_status_default,
    filtros: [],
    render: null,
    sala: null,
};

export const tramiteTypes = {
    INITIAL: "INITIAL[TRACKING]",
    PUSH: "PUSH[tracking]",
    INITIAL_MENU: "INITIAL[MENU]",
    CHANGE_MENU: "CHANGE[MENU]",
    CHANGE_TAB: "CHANGE[TAB]",
    CHANGE_RENDER: "CHANGE[RENDER]",
    CHANGE_SALA: "CHANGE[SALA]",
    CHANGE_TRACKING: "CHANGE[TRACKING]",
    CHANGE_TRAMITE: "CHANGE[TRAMITE]",
    INCREMENT_FILTRO: "INCREMENT[FILTRO]",
    DECREMENT_FILTRO: "DECREMENT[FILTRO]",
    ADD_FILE_TRACKING: "ADD_FILE[TRACKING]",
    DELETE_FILE_TRACKING: "DELETE_FILE[TRACKING]",
    UPDATE_FILE_TRACKING: "UPDATE_FILE[TRACKING]",
    CLEAR: "CLEAR"
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
        case tramiteTypes.CHANGE_SALA:
            newState.sala = payload;
            return newState;
        case tramiteTypes.CHANGE_TRACKING:
            newState.current_tracking = payload || {}
            return newState;
        case tramiteTypes.CHANGE_TRAMITE:
            newState.current_tramite = payload || {};
            return newState;
        case tramiteTypes.INCREMENT_FILTRO:
            for (let increment_state of newState.status) {
                if (increment_state.key == payload) {
                    increment_state.count += 1;
                    break;
                }
            }
            return newState;
        case tramiteTypes.DECREMENT_FILTRO:
            for (let increment_state of newState.status) {
                if (increment_state.key == payload) {
                    increment_state.count -= 1;
                    break;
                }
            }
            return newState;
        case tramiteTypes.ADD_FILE_TRACKING:
            if (Object.keys(newState.current_tracking).length) {
                let newTrackingFile = newState.current_tracking;
                newTrackingFile.tramite = newTrackingFile.tramite || {};
                newTrackingFile.tramite.files = [...newTrackingFile.tramite.files, ...payload];
            }
            return newState;
        case tramiteTypes.DELETE_FILE_TRACKING:
            if (Object.keys(newState.current_tracking).length) {
                let newTrackingFile = newState.current_tracking;
                newTrackingFile.tramite = newTrackingFile.tramite || {};
                newTrackingFile.tramite.files = [...newTrackingFile.tramite?.files || []].filter(f => f.id != payload.id) || [];
                newTrackingFile.info.files = [...newTrackingFile.info?.files || []].filter(f => f.id != payload.id) || []; 
                newTrackingFile.tramite.old_files = [...newTrackingFile.tramite?.old_files || []].filter(f => f.id != payload.id) || [];
                newState.current_tracking = newTrackingFile;
            }
            return newState;
        case tramiteTypes.UPDATE_FILE_TRACKING:
            if (Object.keys(newState.current_tracking).length) {
                let newTrackingFile = newState.current_tracking;
                newTrackingFile.tramite = newTrackingFile.tramite || {};
                let isFileTramite = collect(newTrackingFile.tramite?.files || []).where('id', payload.id).count();
                let isFileInfo = collect(newTrackingFile.info?.files || []).where('id', payload.id).count();
                let isFileOld = collect(newTrackingFile.tramite?.old_files || []).where('id', payload.id).count();
                // update file tramite
                if (isFileTramite) {
                    newTrackingFile.tramite.files = [...newTrackingFile.tramite?.files || []].filter(f => f.id != payload.id) || [];
                    newTrackingFile.tramite.files = [...newTrackingFile.tramite?.files, payload]; 
                }
                // update file info
                if (isFileInfo) {
                    newTrackingFile.info.files = [...newTrackingFile.info?.files || []].filter(f => f.id != payload.id) || []; 
                    newTrackingFile.info.files = [...newTrackingFile.info?.files, payload];
                }
                // update file old
                if (isFileOld) {
                    newTrackingFile.tramite.old_files = [...newTrackingFile.tramite?.old_files || []].filter(f => f.id != payload.id) || [];
                    newTrackingFile.tramite.old_files = [...newTrackingFile.tramite?.old_files, payload]; 
                }
                // update
                newState.current_tracking = newTrackingFile;
            }
            return newState;
        case tramiteTypes.CLEAR:
            newState = initialState;
            return newState;
        default:
            return newState;
    }
}