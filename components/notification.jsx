import React, { Component } from 'react';
import Router from 'next/router';
import Show from '../components/show';
import moment from 'moment';
import Link from 'next/link';
import { markAsReadAll } from '../services/notify';
import Swal from 'sweetalert2';


export default class Notification extends Component
{

    markAsReadAll = async (e) => {
        e.preventDefault();
        let { success, message } = await markAsReadAll();
        let icon = success ? 'success' : 'error';
        Swal.fire({ icon, text: message });
        if (success) history.go(location.toString())
    }

    render() {

        let { no_read, notification } = this.props;
 
        return (
            <li className={`nav-item dropdown header-nav-dropdown ${no_read ? 'has-notified' : ''}`}>
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
                        <span>Notificaciones</span> <a href="#" onClick={this.markAsReadAll}>Marcar todas como leídas</a>
                    </h6>
                    <div className="dropdown-scroll perfect-scrollbar">
                        {notification && notification.data.map(no => 
                            <Link href={`/notify?id=${no.id}`} key={`notification-alert-${no.id}`}>
                                <a 
                                    className={`dropdown-item ${no.read_at ? 'read' : 'unread'}`} 
                                >
                                    <Show condicion={!no.image}>
                                        <div className="notify-icon">
                                            <i className={no.icon}></i>
                                        </div>
                                    </Show>
                                    <Show condicion={no.image}>
                                        <div className="user-avatar">
                                            <img src={no.image}/>
                                        </div>
                                    </Show>
                                    <div className="dropdown-item-body">
                                        <p className="subject"> {no.send && no.send.username} </p>
                                        <p className="text text-truncate">
                                        {" "}
                                        {no.title}
                                        </p>
                                        <span className="date">{moment(no.created_at, "YYYY/MM/DD HH:mm:ss").fromNow()}</span>
                                    </div>
                                </a>  
                            </Link>  
                        )}
                        <Show condicion={notification && !notification.total}>
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
                            Router.push({ pathname: '/notify', query: { tab: 'all_notify' } });
                        }}
                    >
                        Todas las notificaciones
                        <i className="fas fa-fw fa-long-arrow-alt-right"></i>
                    </a>
                </div>
            </li>
        );
    }

}