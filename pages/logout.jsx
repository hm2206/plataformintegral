import React, { Component } from 'react';
import { AUTHENTICATE } from '../services/auth';
import { logout } from '../storage/actions/authsActions';
import cookies from 'js-cookie';
import { Button } from 'semantic-ui-react';
import Router from 'next/router';

export default class Logout extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname, store } = ctx;
        await store.dispatch(logout(ctx));
        let { user } = await store.getState().auth;
        let device = cookies.get('device');
        if (ctx.isServer == false) {
            await history.go('/');
        }
        // redirigir
        await AUTHENTICATE(ctx);
        return { query, pathname, device, user }
    }

    saveUser = async () => {
        await cookies.set("old_user", JSON.stringify(this.props.user));
        history.go('/login')
    }

    handleGo = () => {
        history.go('/login');
    }

    render() {
        return (
           <div className="col-md-12 mt-5">
              <div className="row justify-content-center mt-5">
                  <div className="col-md-6 mt-5 text-center">
                    <h1><i className="fas fa-check-circle text-success"></i></h1>
                    <h3 className="text-center"> 
                        {this.props.device}
                        <div className="mt-5 row justify-content-center">
                            <Button basic 
                                color="blue"
                                onClick={this.handleGo}
                            >
                                Ir al Inicio
                            </Button>

                            <Button
                                color="black"
                                onClick={this.saveUser}
                            >
                                Guardar Usuario
                            </Button>
                        </div>
                    </h3>
                  </div>
              </div>
           </div> 
        )
    }

}