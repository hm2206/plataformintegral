import React, { useContext } from 'react';
import Router from 'next/router';
import Show from '../components/show';
import moment from 'moment';
import Link from 'next/link';
import toast from 'toastify-js';
import { NotificationContext } from '../contexts/NotificationContext';

const Notification = () => {

    // notification
    const { notification, loading } = useContext(NotificationContext);

    // response
    return (
        <>
            <li className={`nav-item dropdown header-nav-dropdown ${true ? 'has-notified' : ''}`}>
                <a
                    className="nav-link"
                    href="#"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    <span className="fas fa-bell"></span>
                </a>
                
                <div className="dropdown-menu dropdown-menu-rich dropdown-menu-right">
                    <div className="dropdown-arrow"></div>
                    <h6 className="dropdown-header ">
                        <span>Notificaciones</span>
                        <a href="#">
                            Marcar todas como leídas
                        </a>
                    </h6>
                    <div className="dropdown-scroll perfect-scrollbar" style={{ overflowY: 'auto' }}>
                        {notification.map((notify, indexN) => 
                            <Link href={`/notify?id=${notify.id}`} key={`notification-alert-${notify.id}-index-${indexN}`}>
                                <a className={`dropdown-item ${notify.read_at ? 'read' : 'unread'}`}>
                                    <Show condicion={!notify.image}>
                                        <div className="notify-icon">
                                            <i className={notify.icon}></i>
                                        </div>
                                    </Show>
                                    <Show condicion={notify.image}>
                                        <div className="user-avatar" style={{ objectFit: 'contain' }}>
                                            <img src={notify.image}/>
                                        </div>
                                    </Show>
                                    <div className="dropdown-item-body">
                                        <p className="subject"> {notify.send && notify.send.username} </p>
                                        <p className="text text-truncate">
                                        {" "}
                                        {notify.title}
                                        </p>
                                        <span className="date">{moment(notify.created_at, "YYYY/MM/DD HH:mm:ss").fromNow()}</span>
                                    </div>
                                </a>  
                            </Link>      
                        )}
                        {/* no hay notificaciones */}
                        <Show condicion={!loading && !notification.length}>
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