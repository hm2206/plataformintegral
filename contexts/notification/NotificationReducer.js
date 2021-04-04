import moment from "moment";

export const types = {
    NOTIFICATION_ALL: "NOTIFICATION[ALL]",
    NOTIFICATION_ADD: "NOTIFICATION[ADD]",
    NOTIFICATION_READ: "NOTIFICATION[READ]",
    NOTIFICATION_CLEAR: "NOTIFICATION[CLEAR]",
};

export const initialState = {
    notificationes: [],
    page: 1,
    last_page: 0,
    total: 0,
    count_read: 0,
    count_unread: 0,
    is_next: false
};

export const NotificationReducer = (state, action = { type: "init", payload: {} }) => {
    // clone
    let newState = Object.assign({}, state);
    // condicion
    switch (action.type) {
        case types.NOTIFICATION_ALL:
            let { notification, count_read, count_unread } = action.payload;
            newState.notificationes = notification.data;
            newState.count_read = count_read;
            newState.count_unread = count_unread;
            newState.last_page = notification.last_page || 0;
            newState.total = notification.total || 0;
            newState.page = notification.page || 1;
            newState.is_next = newState.last_page >= (newState.page + 1);
            return newState;
        case types.NOTIFICATION_ADD:
            let new_notification = action.payload;
            newState.notificationes = [new_notification, ...state.notificationes];
            newState.count_unread = state.count_unread + 1;
            return newState;
        case types.NOTIFICATION_READ:
            let read_notification = action.payload;
            // verify read
            if (read_notification.read_at) return newState;
            // add read
            read_notification.read_at = moment('YYYY-MM-DD hh:mm:ss');
            newState.notificationes.map(n => {
                if (n.id == read_notification.id) n = read_notification;
                return n;
            });
            // change count_read y count_unread
            newState.count_read += 1;
            newState.count_unread -= 1;
            // response state
            return newState;
        case types.NOTIFICATION_CLEAR:
            return { };
        default:
            return state;
    }
}