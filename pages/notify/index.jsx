import React, { Fragment } from 'react';
import PageNav from '../../components/pageNav';
import { AUTHENTICATE } from '../../services/auth';
import CardNotify from '../../components/cardNotify';
import Show from '../../components/show';
import Router from 'next/router';
import NotificationProvider from '../../providers/authentication/NotificationProvider';
import { Pagination } from 'semantic-ui-react';
import btoa from 'btoa';

// provedores
const notificationProvider = new NotificationProvider();

const IndexNotify = ({ pathname, query, success, notification, count_read, count_no_read }) => {

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
                delete newQuery.id;
                push({ pathname, query: newQuery });
                break;
            case 'notify-read':
                newQuery.tab = obj.key;
                newQuery.read = true;
                delete newQuery.id;
                push({ pathname, query: newQuery });
                break;
            default:
                break;
        }
    }

    // cambiar pagina
    const handlePage = async (e, { activePage }) => {
        let { pathname, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    const handleInfo = async (notify) => {
        let slug = btoa(notify.id || '_error');
        Router.push({ pathname: `${pathname}/${slug}` });
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
                                        focus={notify.id == query.id}
                                        username={notify.send && notify.send.username}
                                        title={notify.title}
                                        key={`notification-view-${notify.id}`}
                                        date={notify.created_at}
                                        description={notify.description}
                                        image={notify?.method?.image}
                                        icon={notify.icon}
                                        read={notify.read_at ? true : false}
                                        onClick={() => handleInfo(notify)}
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
                    {/* paginación */}
                    <div className="text-center table-responsive">
                        <Pagination activePage={query.page || 1}
                            totalPages={notification.lastPage || 1}
                            onPageChange={handlePage}
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

// server
IndexNotify.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // filtros
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.read = typeof query.read != 'undefined' ? query.read : '';
    query.tab = typeof query.tab != 'undefined' ? query.tab : 'notify-all';
    // response
    let { success, notification, count_read, count_unread } = await notificationProvider.index(query, {}, ctx)
        .then(res => res)
        .catch(err => ({ success: false, notification: {}, count_read: 0, count_unread: 0 }));
    // verificar id
    let id = query.id;
    if (id) {
        // obtener notification
        let datos = await notificationProvider.show(id, {}, ctx)
            .then(res => res.data)
            .catch(err => ({ success: false, notification: {}, message: err.message }))
        // validar notification
        if (success && datos.success) {
            let newData = await notification.data.filter(n => n.id != datos.notification.id);
            newData.unshift(datos.notification);
            notification.data = newData;
        }
    }
    // response
    return { pathname, query, success, notification, count_read, count_unread };
}

// exportar
export default IndexNotify;