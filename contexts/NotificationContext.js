import React, { createContext, useContext, useEffect, useState } from 'react';
import { authentication } from '../services/apis';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

    // auth
    const { is_logged } = useContext(AuthContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_error, setIsError] = useState(false);
    const [is_next, setIsNext] = useState(false);
    const [count_read, setCountRead] = useState(0);
    const [count_unread, setCountUnread] = useState(0);
    
    // get notificationes
    const getNotifications = async (add = false) => {
        setCurrentLoading(true);
        await authentication.get(`auth/notification`)
        .then(res => {
            let { notification, count_read, count_unread } = res.data;
            setCurrentLastPage(notification.lastPage || 0);
            setCurrentTotal(notification.total || 0);
            setIsError(false);
            setIsNext(notification.lastPage >= (current_page + 1) ? true : false);
            setDatos(add ? [...datos, ...notification.data] : notification.data);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // executar consulta
    useEffect(() => {
        if (is_logged) getNotifications();
    }, [is_logged]);

    // response
    return (
        <NotificationContext.Provider 
            value={{ 
                loading: current_loading,
                notification: datos || [],
                count_read,
                count_unread,
                total: current_total,
                last_page: current_last_page,
                page: current_page
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}