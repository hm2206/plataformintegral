import React, { Component } from 'react';
import { AUTH, AUTHENTICATE } from '../services/auth';
import { authentication } from '../services/apis';
import { Body } from '../components/Utils';
import { Image } from 'semantic-ui-react';
import CardProfile from '../components/cardProfile';
import CardToken from '../components/cardToken';

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
                <Body>
                    <div className="row">
                        <div className="col-md-7">
                            <div className="card">
                                <CardProfile {...this.props}/>
                            </div>
                        </div>

                        <div className="col-md-5">
                            <CardToken />
                        </div>
                    </div>
                </Body>
            </div>
        )
    }

}