import React, { Component } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';

export default class Register extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query, store } = ctx;
        return { pathname, query }
    }

    handleBack = () => {
        let { push, pathname } = Router;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({ pathname: newPath.join('/') });
    }

    render() {
        return (
            <Form>
                <div className="col-md-12">
                    <Button 
                        onClick={this.handleBack}
                    >
                        <i className="fas fa-arrow-left"></i> Atrás
                    </Button>
                </div>
            </Form>
        )
    }

}