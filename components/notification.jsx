import React, { Component } from 'react';
import Router from 'next/router';


export default class Notification extends Component
{

    render() {
        return (
            <li className="nav-item dropdown header-nav-dropdown has-notified">
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
                    <h6 className="dropdown-header stop-propagation">
                        <span>Notificaciones</span> <a href="#">Marcar todas como leídas</a>
                    </h6>
                    <div className="dropdown-scroll perfect-scrollbar">
                        <a href="#" className="dropdown-item unread">
                            <div className="user-avatar">
                                <img src="/img/avatars/team1.jpg" alt="" />
                            </div>
                            <div className="dropdown-item-body">
                                <p className="subject"> Stilearning </p>
                                <p className="text text-truncate">
                                {" "}
                                Invitation: Joe's Dinner @ Fri Aug 22{" "}
                                </p>
                                <span className="date">2 hours ago</span>
                            </div>
                        </a>
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