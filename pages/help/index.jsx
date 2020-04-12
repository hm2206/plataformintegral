import React, { Component } from 'react';
import { Body } from '../../components/Utils';
import { AUTHENTICATE } from '../../services/auth';
import { BtnFloat } from '../../components/Utils';

export default class IndexHelp extends Component {

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname, store } = ctx;
        return { query, pathname };
    }

    render() {
        return (
            <div className="col-md-12">
                <Body>
                    <h3><i className="fas fa-info-circle"></i> Ayuda de Usuario</h3>
                    <hr/>
                </Body>

                <BtnFloat theme="btn-primary">
                    <i className="fas fa-question"></i>
                </BtnFloat>
            </div>
        )
    }

}