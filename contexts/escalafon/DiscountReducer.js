

export const initialStates = {
    year: "",
    config_discount: {},
    month: "",
    type_categoria_id: "",
    cargo_id: "",
    page: 1,
    last_page: 0,
    total: 0,
    data: []
}

export const discountTypes = {
    SET_YEAR: "SET[YEAR]",
    SET_CONFIG_DISCOUNT: "SET[CONFIG_DISCOUNT]",
    SET_MONTH: "SET[MONTH]",
    SET_TYPE_CATEGORIA_ID: "SET[TYPE_CATEGORIA_ID]",
    SET_CARGO_ID: "SET[CARGO_ID]",
    SET_DATA: "SET[DATA]",
    ADD_DATA: "ADD[DATA]",
    SET_PAGE: 'SET[PAGE]',
    ADD_PAGE: 'ADD[PAGE]',
    SET_LAST_PAGE: 'SET[LAST_PAGE]',
    SET_TOTAL: 'SET[TOTAL]',
    UPDATE_INFO: 'UPDATE[INFO]',
    UPDATE_SCHEDULE: 'UPDATE[SCHEDULE]'
}

export const DiscountReducer = (state = initialStates, action = {}) => {
    let newState = Object.assign({}, state);
    let { type, payload } = action;
    switch (type) {
        case discountTypes.SET_YEAR:
            newState.year = payload
            return newState;
        case discountTypes.SET_CONFIG_DISCOUNT:
            let setConfigDiscount = payload || {};
            newState.config_discount = setConfigDiscount;
            return newState
        case discountTypes.SET_MONTH:
            newState.month = payload
            return newState;
        case discountTypes.SET_TYPE_CATEGORIA_ID:
            newState.type_categoria_id = payload
            return newState;
        case discountTypes.SET_CARGO_ID:
            newState.cargo_id = payload
            return newState;
        case discountTypes.SET_DATA:
            newState.data = payload || [];
            return newState
        case discountTypes.ADD_DATA:
            newState.data = [...newState.data, ...payload]
            return newState;
        case discountTypes.SET_PAGE:
            newState.page = payload
            return newState
        case discountTypes.ADD_PAGE:
            newState.page += 1;
            return newState;
        case discountTypes.SET_LAST_PAGE:
            newState.last_page = payload;
            return newState
        case discountTypes.SET_TOTAL: 
            newState.total = payload;
            return newState;
        case discountTypes.UPDATE_INFO:
            let updateInfo = payload || {}
            newState.data.map(info => {
                if (info.id != updateInfo.id) return info;
                info.base = updateInfo.base;
                info.count = updateInfo.count;
                info.discount = updateInfo.discount;
                info.discount_min = updateInfo.discount_min;
                return info;
            });
            return newState;
        case discountTypes.UPDATE_SCHEDULE:
            let updateSchedule = payload || {}
            newState.data.map(info => {
                if (info.id != updateSchedule.info_id) return info;
                let dates = info.dates || []
                dates.map(d => {
                    let isSchedule = Object.keys(d.schedule || {}).length
                    if (!isSchedule) return d;
                    if (d.schedule.id != updateSchedule.id) return d;
                    d.schedule = updateSchedule;
                    return d;
                });
                return info;
            });
            return newState;
        default:
            return newState;
    }
}