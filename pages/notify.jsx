import React, { Component, Fragment } from 'react';
import PageNav from '../components/pageNav';
import { AUTHENTICATE } from '../services/auth';
import CardNotify from '../components/cardNotify';
import Show from '../components/show';
import { authentication } from '../services/apis';
import Router from 'next/router';

const Notify = ({ pathname, query, success, notification, count_read, count_no_read }) => {

    // handleChange
    const handleOption = (e, index, obj) => {
        let { push } = Router;
        let newQuery = Object.assign({}, query);
        switch (obj.key) {
            case 'notify-all':
                newQuery.tab = obj.key;
                delete newQuery.read;
                push({ pathname, query: newQuery });
                break;
            case 'notify-unread':
                newQuery.tab = obj.key;
                newQuery.read = false;
                push({ pathname, query: newQuery });
                break;
            case 'notify-read':
                newQuery.tab = obj.key;
                newQuery.read = true;
                push({ pathname, query: newQuery });
                break;
            default:
                break;
        }
    }

    // renderizar
    return (
        <Fragment>
            <div className="col-md-12">
            <PageNav 
                tab={query.tab}
                options={[
                    { key: "notify-all", text: "Todas las notificaciones", index: 0 },
                    { key: "notify-unread", text: "No leídas", index: 1},
                    { key: "notify-read", text: "Leídas", index: 2 }
                ]}
                onOption={handleOption}
            />

                <div className="page-inner">
                    <div className="page-section">
                        <div className="card">
                            <div className="list-group list-group-messages list-group-flush list-group-bordered">
                                {notification.data && notification.data.map(notify => 
                                    <CardNotify
                                        username={notify.send && notify.send.username}
                                        title={notify.title}
                                        key={`notification-view-${notify.id}`}
                                        date={notify.created_at}
                                        description={notify.description}
                                        image={notify.image}
                                        icon={notify.icon}
                                        read={notify.read_at ? true : false}
                                    />    
                                )}
                                
                                <Show condicion={notification.data && !notification.data.length}>
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

// server
Notify.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.read = typeof query.read != 'undefined' ? query.read : '';
    query.tab = typeof query.tab != 'undefined' ? query.tab : 'notify-all';
    // response
    let query_string = `page=${query.page}&read=${query.read}`;
    let { success, notification, count_read, count_unread } = await authentication.get(`auth/notification?${query_string}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, notification: {}, count_read: 0, count_unread: 0 }));
    // response
    return { pathname, query, success, notification, count_read, count_unread };
}

// exportar
export default Notify;