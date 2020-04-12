import React, { Component, Fragment } from 'react';
import PageNav from '../components/pageNav';
import { AUTHENTICATE } from '../services/auth';

export default class Notify extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname, store } = ctx;
        return { query, pathname };
    }

    render() {
        return (
           <Fragment>
               <div className="col-md-12">
                   <PageNav 
                    options={[
                        { key: "all", text: "Todas las notificaciones", active: true },
                        { key: "unread", text: "No leídas", active: false },
                        { key: "read", text: "Leídas", active: false }
                    ]}
                   />
               </div>
           </Fragment>
        )
    }

}