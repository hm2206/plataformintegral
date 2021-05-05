import React, { useContext, useState } from 'react';
import Router from 'next/router';
import Show from '../components/show';
import moment from 'moment';
import btoa from 'btoa';
import { NotificationContext } from '../contexts/notification/NotificationContext';
import { types } from '../contexts/notification/NotificationReducer';

const Notification = () => {

    // estado
    const [show, setShow] = useState(false);

    // notification
    const { notificationes, loading, count_unread, dispatch } = useContext(NotificationContext);

    // click notification
    const handleClick = (e, index, notify) => {
        e.preventDefault();
        let slug = btoa(notify.id || '_error');
        let link = `/notify/${slug}`;
        dispatch({ type: types.NOTIFICATION_READ, payload: notify });
        Router.push(link);
    }

    // response
    return (
        <>
            <li className={`nav-item dropdown header-nav-dropdown ${count_unread ? 'has-notified' : ''} ${show ? 'show' : ''}`}
                onClick={(e) => setShow(!show)}
            >
                <a
                    className="nav-link"
                    href="#"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    <span className="fas fa-bell"></span>
                </a>
                
                <div className={`dropdown-menu dropdown-menu-rich dropdown-menu-right ${show ? 'show' : ''}`}>
                    <div className="dropdown-arrow"></div>
                    <h6 className="dropdown-header ">
                        <span>Notificaciones</span>
                        <a href="#">
                            Marcar todas como leídas
                        </a>
                    </h6>
                    <div className="dropdown-scroll perfect-scrollbar" style={{ overflowY: 'auto' }}>
                        {notificationes.map((notify, indexN) => 
                            <a key={`notification-alert-${notify.id}-index-${indexN}`}
                                className={`dropdown-item ${notify.read_at ? 'read' : 'unread'}`}
                                onClick={(e) => handleClick(e, indexN, notify)}
                            >
                                <Show condicion={!notify?.method?.image}>
                                    <div className="notify-icon">
                                        <i className={notify.icon}></i>
                                    </div>
                                </Show>
                                <Show condicion={notify?.method?.image}>
                                    <div className="user-avatar" style={{ objectFit: 'contain' }}>
                                        <img src={notify?.method?.image}/>
                                    </div>
                                </Show>
                                <div className="dropdown-item-body">
                                    <p className="subject"> {notify?.send?.username} </p>
                                    <p className="text text-truncate">
                                    {" "}
                                    {notify.title}
                                    </p>
                                    <span className="date">{moment(notify.created_at, "YYYY/MM/DD HH:mm:ss").fromNow()}</span>
                                </div>
                            </a>    
                        )}
                        {/* no hay notificaciones */}
                        <Show condicion={!loading && !notificationes.length}>
                            <div className={`dropdown-item text-center`}>
                                <div className="dropdown-item-body">
                                    <p className="subject"> </p>
                                    <p className="text text-truncate">
                                        {" "}
                                        No hay registros disponibles
                                    </p>
                                    <span className="date"></span>
                                </div>
                            </div>  
                        </Show>
                    </div>
                    <a href="#" className="dropdown-footer"
                        onClick={(e) => {
                            e.preventDefault();
                            Router.push({ pathname: '/notify', query: { tab: 'nav-bar' } });
                        }}
                    >
                        Todas las notificaciones
                        <i className="fas fa-fw fa-long-arrow-alt-right"></i>
                    </a>
                </div>
            </li>
        </>
    )
}

export default Notification;