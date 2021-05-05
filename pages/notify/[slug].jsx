import React from 'react';
import { Body, BtnBack } from '../../components/Utils';
import CardHeaderFeed from '../../components/cardHeaderFeed';
import NotificationProvider from '../../providers/authentication/NotificationProvider';
import { AUTHENTICATE } from '../../services/auth';
import NotFoundData from '../../components/notFoundData';
import BoardSimple from '../../components/boardSimple';
import CardUser from '../../components/cardUser';
import ContentDynamicNotify from '../../components/contentDynamicNotify';
import atob from 'atob';

// providers
const notificationProvider = new NotificationProvider();

const SlugNotify = ({ pathname, query, success, notification }) => {

    if (!success) return <NotFoundData/>

    return (
        <div className="col-12">
            <BoardSimple
                options={[]}
                bg="light"
                prefix={<BtnBack/>}
                title="Notificación"
                info={["Información detallada de la notificación"]}
            >
                <div className="mt-4">
                    <CardHeaderFeed
                        title={notification.title}
                        description={notification.description}
                        image={notification?.method?.image}
                    />
                    {/* content */}
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <CardUser
                                    name={notification?.send?.person?.fullname}
                                    image={notification?.send?.image}
                                    username={notification?.send?.username}
                                />
                            </div>
                            {/* contenido dínamico */}
                            <div className="col-12">
                                <div className="card">
                                    <ContentDynamicNotify notification={notification}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BoardSimple>
        </div>
    );
}

SlugNotify.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let id = atob(query.slug || '_error');
    let { success, notification } = await notificationProvider.show(id, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, notification: {} }));
    return { pathname, query, success, notification };
}

export default SlugNotify;