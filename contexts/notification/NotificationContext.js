import React, { createContext, useContext, useEffect, useState, useReducer } from 'react';
import { authentication } from '../../services/apis';
import { AuthContext } from '../AuthContext';
import { SocketContext } from '../SocketContext';
import { NotificationReducer, types, initialState } from './NotificationReducer';
import Toastify from 'toastify-js';

export const NotificationContext = createContext();


export const NotificationProvider = ({ children }) => {

    // auth
    const { is_logged } = useContext(AuthContext);

    // socket
    const { socket } = useContext(SocketContext);

    // reducer
    const [state, dispatch] = useReducer(NotificationReducer, initialState);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);

    // show notification toastify
    const showNotification = (notify = {}) => {
        Toastify({
            text: notify.title,
            duration: 5000, 
            newWindow: true,
            close: true,
            gravity: 'bottom',
            position: 'left',
            className: "info",
        }).showToast();
    }

    // get notificationes
    const getNotifications = async (add = false) => {
        setCurrentLoading(true);
        await authentication.get(`auth/notification`)
        .then(res => {
            if (!add) return dispatch({ type: types.NOTIFICATION_ALL, payload: res.data }); 
        }).catch(err => console.log());
        setCurrentLoading(false);
    }

    // notificación agregada
    const onNotificationStore = () => {
        socket?.on('NotificationListener.store', (data) => {
            dispatch({ type: types.NOTIFICATION_ADD, payload: data });
            showNotification(data);
        });
    }

    // executar consulta
    useEffect(() => {
        if (is_logged) getNotifications();
    }, [is_logged]);

    // executar notification agregada
    useEffect(() => {
        if (socket, !current_loading) onNotificationStore();
    }, [socket, current_loading]);

    // desactivar audio play
    // useEffect(() => {
    //     if (!audio_play) setAudioPlay(false);
    // }, [audio_play]);

    // response
    return (
        <NotificationContext.Provider 
            value={{   
                loading: current_loading,
                ...state,
                dispatch
            }}
        >
            {/* agregar audio */}
            {/* <audio autoPlay={audio_play} controls={true} hidden>
                <source type="audio/mp3" src="../audio/notification.mp3"/>
            </audio> */}
            {/* renderizar curpo */}
            {children}
        </NotificationContext.Provider>
    )
}