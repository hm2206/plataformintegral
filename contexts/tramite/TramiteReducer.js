import collect from 'collect.js';

// menus
const current_status_default = [
    { key: "INBOX", icon: 'fas fa-inbox', text: 'Recibidos', index: 0, filtros: ['RECIBIDO', 'COPIA', 'PENDIENTE', 'DERIVADO', 'RECHAZADO', 'FINALIZADO'], count: 0, archived: 0 },
    { key: "SENT", icon: 'fas fa-paper-plane', text: 'Enviados', index: 1, filtros: ['RESPONDIDO', 'ACEPTADO', 'REGISTRADO', 'ENVIADO', 'SUBTRAMITE'], count: 0, archived: 0 },
    { key: "ANULADO", icon: 'fas fa-trash', text: 'Anulados', index: 2, filtros: ['ANULADO'], count: 0, archived: 0 },
    { key: "FINALIZADOS", icon: 'fas fa-check-double', text: 'Finalizados', index: 3, filtros: ['FINALIZADO'], count: 0, archived: 0 },
    { key: "ARCHIVED", icon: 'fas fa-archive', text: 'Archivados', index: 4, filtros: ['REGISTRADO', 'PENDIENTE', 'ACEPTADO', 'DERIVADO', 'FINALIZADO', 'RECHAZADO', 'ANULADO', 'RECIBIDO', 'RESPONDIDO', 'COPIA', 'ENVIADO', 'ARCHIVED'], count: 0, archived: 1 }
];

export const initialState = {
    trackings: [],
    current_tracking: {},
    current_tramite: {},
    menu: null,
    filtros: [],
    render: null,
    sala: null,
    tracking_status: {},
    status: current_status_default,
    is_created: false,
};

export const tramiteTypes = {
    INITIAL: "INITIAL[TRACKING]",
    PUSH: "PUSH[TRACKING]",
    ADD: "ADD[TRACKING]",
    IS_CREATED: "IS[CREATED]",
    CHANGE_IS_CREATED: "CHANGE[IS_CREATED]",
    INITIAL_MENU: "INITIAL[MENU]",
    CHANGE_MENU: "CURRENT[MENU]",
    CHANGE_RENDER: "CHANGE[RENDER]",
    CHANGE_SALA: "CHANGE[SALA]",
    CHANGE_TRACKING: "CHANGE[TRACKING]",
    CHANGE_TRAMITE: "CHANGE[TRAMITE]",
    INCREMENT_FILTRO: "INCREMENT[FILTRO]",
    DECREMENT_FILTRO: "DECREMENT[FILTRO]",
    ADD_FILE_TRACKING: "ADD_FILE[TRACKING]",
    DELETE_FILE_TRACKING: "DELETE_FILE[TRACKING]",
    UPDATE_FILE_TRACKING: "UPDATE_FILE[TRACKING]",
};

export const tramiteReducer = (state, { type = "", payload = {} }) => {
    let newState = Object.assign({}, state);
    switch (type) {
        case tramiteTypes.INITIAL:
            newState.trackings = payload;
            newState.is_created = false;
            return newState;
        case tramiteTypes.PUSH:
            newState.trackings.push(...payload);
            return newState;
        case tramiteTypes.ADD: 
            let newTrackings = collect(payload || []);
            let addTrackings = [];
            // filtrar datos
            for (let track of newState.trackings) {
                let is_add_trackings = newTrackings.where('id', track.id).count();
                if (is_add_trackings) {
                    tramiteReducer(state, { type: tramiteTypes.DECREMENT_FILTRO, payload: 'SENT' })
                    continue;
                }
                // add tracking
                addTrackings.push(track);
            }
            // add nuevo tracking
            addTrackings.unshift(...newTrackings.toArray());
            newState.trackings = addTrackings;
            // new state
            return newState;
        case tramiteTypes.IS_CREATED:
            if (newState.menu == 'SENT' && newState.render == 'TAB') {
                newState.is_created = true;
                newState.current_tracking = payload; 
            }
            // response
            return newState;
        case tramiteTypes.CHANGE_IS_CREATED:
            newState.is_created = payload;
            return newState;
        case tramiteTypes.CHANGE_RENDER:
            newState.render = payload;
            return newState;
        case tramiteTypes.CHANGE_MENU:
            newState.menu = payload;
            return newState;
        case tramiteTypes.INITIAL_MENU: 
            let newStatus = [...newState.status];
            for (let status of newStatus) {
                let count = 0;
                for (let f of status.filtros) {
                    if (status.archived && f != 'ARCHIVED') continue;
                    count += typeof payload[f] != 'undefined' ? parseInt(payload[f]) : 0;
                    // add count
                    status.count = count;
                }
            }
            // response
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
                    if (increment_state.count == 0) continue;
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
                // archivos del tramite
                if (Object.keys(newTrackingFile.tramite && newTrackingFile.tramite.files || {}).length) {
                    newTrackingFile.tramite.files = [...newTrackingFile.tramite.files || []].filter(f => f.id != payload.id) || [];
                }
                // archivos del info
                if (Object.keys(newTrackingFile.info && newTrackingFile.info.files || {}).length) {
                    newTrackingFile.info.files = [...newTrackingFile.info.files || []].filter(f => f.id != payload.id) || []; 
                }
                // archivos del tramite anidado
                if (Object.keys(newTrackingFile.tramite && newTrackingFile.tramite.old_files || {}).length) {
                    newTrackingFile.tramite.old_files = [...newTrackingFile.tramite.old_files || []].filter(f => f.id != payload.id) || [];
                }
                // update
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
                    newTrackingFile.tramite.files = [...newTrackingFile.tramite.files || []].filter(f => f.id != payload.id) || [];
                    newTrackingFile.tramite.files = [...newTrackingFile.tramite.files, payload]; 
                }
                // update file info
                if (isFileInfo) {
                    newTrackingFile.info.files = [...newTrackingFile.info.files || []].filter(f => f.id != payload.id) || []; 
                    newTrackingFile.info.files = [...newTrackingFile.info.files, payload];
                }
                // update file old
                if (isFileOld) {
                    newTrackingFile.tramite.old_files = [...newTrackingFile.tramite.old_files || []].filter(f => f.id != payload.id) || [];
                    newTrackingFile.tramite.old_files = [...newTrackingFile.tramite.old_files, payload]; 
                }
                // update
                newState.current_tracking = newTrackingFile;
            }
            return newState;
        default:
            return newState;
    }
}