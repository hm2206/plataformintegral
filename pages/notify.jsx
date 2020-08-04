import React, { Component, Fragment } from 'react';
import PageNav from '../components/pageNav';
import { AUTHENTICATE } from '../services/auth';
import CardNotify from '../components/cardNotify';
import Show from '../components/show';

export default class Notify extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname } = ctx;
        return { query, pathname };
    }

    render() {

        let { notification, no_read } = this.props.notification

        return (
           <Fragment>
               <div className="col-md-12">
                   <PageNav 
                    options={[
                        { key: "not-all", text: "Todas las notificaciones", active: true },
                        { key: "not-unread", text: "No leídas", active: false },
                        { key: "not-read", text: "Leídas", active: false }
                    ]}
                   />

                    <div className="page-inner">
                        <div className="page-section">
                            <div className="card">
                                <div className="list-group list-group-messages list-group-flush list-group-bordered">
                                    {notification && notification.data && notification.data.map(no => 
                                        <CardNotify
                                            username={no.send && no.send.username}
                                            title={no.title}
                                            key={`notification-view-${no.id}`}
                                            date={no.created_ad}
                                            description={no.description}
                                            image={no.image}
                                            icon={no.icon}
                                            read={no.read_at ? true : false}
                                        />    
                                    )}
                                    
                                    <Show condicion={notification && !notification.total}>
                                        <div className="card-body text-center"> 
                                            No hay registros disponibles
                                        </div>
                                    </Show>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
           </Fragment>
        )
    }

}