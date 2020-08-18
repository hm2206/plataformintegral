import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import Router from 'next/router';
import { backUrl } from '../../../services/utils';
import { Form } from 'semantic-ui-react';


export default class IndexTramiteInterno extends Component
{

    static getInitialProps = async (ctx) => {
        let { query, pathname } = ctx;
        return { query, pathname }
    } 

    componentDidMount = () => {
        this.props.fireEntity({ render: true });
    }

    render() {
        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tramite Interno
                    </div>
                    <div className="card-body">
                        <Form className="row">
                            <div className="col-md-6">
                                <Form.Field>
                                    <label htmlFor="">Mi Dependencia</label>
                                </Form.Field>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>
        )
    }

}