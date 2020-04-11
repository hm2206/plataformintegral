import React, { Component } from 'react';
import { AUTH, AUTHENTICATE } from '../services/auth';
import CoverSimple from '../components/coverSimple';
import { authentication } from '../services/apis';


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
                    image={user.person && user.person.image ? `${authentication.path}/${user.person.image}` : '/img/perfil.png'}
                    titulo={user.person.fullname}
                    username={user.username}
                    email={user.email}
                />
            </div>
        )
    }

}