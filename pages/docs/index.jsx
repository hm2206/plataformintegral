import React, { Component } from 'react';
import { Body } from '../../components/Utils';
import { AUTHENTICATE } from '../../services/auth';
import { BtnFloat } from '../../components/Utils';
import ReactHtmlParser from 'react-html-parser';
import Router from 'next/router';

export default class IndexHelp extends Component {

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        return { query, pathname };
    }

    render() {
        return (
            <div className="col-md-12">
                <Body>
                    <h3><i className="fas fa-info-circle"></i> Centro de Ayuda al Usuario</h3>
                    <hr/>

                    <div>
                        {ReactHtmlParser('<div>Example HTML string</div>')}
                    </div>
                </Body>

                <BtnFloat theme="btn-primary"
                    onClick={(e) => {
                        let { push, pathname } = Router;
                        push({ pathname: `${pathname}/editor` });
                    }}
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </div>
        )
    }

}