import uid from 'uid';

// tipo de action
export const groupTypes = {
    FILE_ADD: "FILE[ADD]",
    FILE_DELETE: "FILE[DELETE]",
    UPLOAD_DELETE: "UPLOAD[DELETE]",
    UPLOAD_READY: "UPLOAD[READY]",
    CLEAR: "FILE[CLEAR]",
    DOWNLOAD_FILE: "FILE[DOWNLOAD]",
    DOWNLOAD_PUSH: "PUSH[DOWNLOAD]",
    DOWNLOAD_DELETE: "DELETE[DOWNLOAD]",
    SET_COUNT_TOTAL: "SET[COUNT_TOTAL]",
    INCREMENT_COUNT_TOTAL: "INCREMENT[COUNT_TOTAL]",
    DECREMENT_COUNT_TOTAL: "DECREMENT[COUNT_TOTAL]",
    SET_COUNT_VERIFY: "SET[COUNT_VERIFY]",
    INCREMENT_COUNT_VERIFY: "INCREMENT[COUNT_VERIFY]",
    DECREMENT_COUNT_VERIFY: "DECREMENT[COUNT_VERIFY]",
    SET_TEAM: "SET[TEAM]",
    PUSH_TEAM: "PUSH[TEAM]",
    DELETE_TEAM: "DELETE[TEAM]",
};

// estado inicial
export const initialState = {
    files: [], // archivos sin subir
    upload: [], // archivos a subir
    ready: false, // flag para saber cuando el proceso está listo
    download: [], // archivos para descargar
    count_total: 0, //  total de team agregados
    count_verify: 0, // contador de team verificados
    teams: [], // arreglo del equipo
};

// reducer
export const Reducer = (state = initialState, action = { type: "", payload: {} }) => {
    // clonar estado
    let newState = Object.assign({}, state);
    let { payload } = action;
    // seleccionar
    switch (action.type) {
        case groupTypes.FILE_ADD:
            let file_temp = action.payload.files;
            // validar upload
            let upload_count = newState.upload.length;
            // append datos
            if (upload_count < 5)  {
                let limit = 5 - upload_count;
                Object.values(file_temp).forEach((f, indexF) => {
                    let newFile = f;
                    newFile.id = uid(8);
                    if (indexF < limit) newState.upload.push(newFile);
                    else newState.files.push(newFile);
                });
            } else newState.files.push(...file_temp);
            // clear input
            action.payload.value = null;
            // response
            newState.ready = false;
            return newState;
        case groupTypes.FILE_DELETE:
            newState.files.splice(action.payload, 1);
            // response
            return newState;
        case groupTypes.UPLOAD_DELETE:
            newState.upload.splice(action.payload, 1);
            let upload_add = newState.files[0];
            if (upload_add) {
                newState.upload.push(upload_add);
                newState.files.shift();
            }
            // response
            return newState;
        case groupTypes.UPLOAD_READY:
            // flag uploaded
            let newUpload = newState.upload.filter(f => f.id != payload.id);
            newState.upload = newUpload;
            // response
            return newState;
        case groupTypes.DOWNLOAD_FILE:
            newState.download = action.payload;
            return newState;
        case groupTypes.DOWNLOAD_PUSH:
            newState.download.push(...payload);
            return newState;
        case groupTypes.DOWNLOAD_DELETE:
            newState.download = state.download.filter(d => d.id != action.payload);
            return newState;
        case groupTypes.SET_COUNT_TOTAL: 
            newState.count_total = action.payload;
            return newState;
        case groupTypes.INCREMENT_COUNT_TOTAL:
            newState.count_total = state.count_total + 1;
            return newState;
        case groupTypes.DECREMENT_COUNT_TOTAL:
            newState.count_total = state.count_total - 1;
            return newState;
        case groupTypes.SET_COUNT_VERIFY: 
            newState.count_verify = action.payload;
            return newState;
        case groupTypes.INCREMENT_COUNT_VERIFY:
            newState.count_verify = state.count_verify + 1;
            return newState;
        case groupTypes.DECREMENT_COUNT_VERIFY:
            newState.count_verify = state.count_verify - 1;
            return newState;
        case groupTypes.SET_TEAM:
            newState.teams = action.payload;
            return newState;
        case groupTypes.PUSH_TEAM:
            newState.teams.push(...payload);
            return newState;
        case groupTypes.DELETE_TEAM:
            newState.teams = state.teams.filter(d => d.id != action.payload);
            return newState;
        case groupTypes.CLEAR:
            return initialState;
        default:
            return state;
    }
}