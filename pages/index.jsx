import React, { Component } from 'react';
import { AUTH, AUTHENTICATE } from '../services/auth';
import { Body } from '../components/Utils';
import CardProfile from '../components/cardProfile';
import CardToken from '../components/cardToken';
import CardChangePassword from '../components/cardChangePassword';

export default class Index extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        return { query, pathname }
    }

    
    render() {

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
                            <CardChangePassword {...this.props}/>
                            <CardToken/>
                        </div>
                    </div>
                </Body>
            </div>
        )
    }

}