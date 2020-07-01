import React, { Component } from 'react';
import { AUTH, AUTHENTICATE } from '../services/auth';
import CoverSimple from '../components/coverSimple';
import { authentication } from '../services/apis';
import NavCover from '../components/navCover';


export default class Index extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { store, query, pathname } = ctx;
        let { user } = store.getState().auth;
        return { query, pathname, user }
    }

    render() {

        let { user } = this.props;

        return (
            <div className="col-md-12">
                <CoverSimple 
                    image={user.person && user.image ? user.image : '/img/perfil.jpg'}
                    titulo={user.person.fullname}
                    username={user.username}
                    email={user.email}
                />
                <NavCover
                    align="left"
                    active="activity"
                    options={[
                        { key: "activity", text: "Actividad", active: true },
                        { key: "data", text: "Datos Personales" },
                        { key: "account", text: "Cuenta" },
                    ]}
                />
            </div>
        )
    }

}