import React, { Component, Fragment } from 'react';
import { Body } from '../../components/Utils';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { BtnFloat } from '../../components/Utils';
import { AUTHENTICATE } from '../../services/auth';

const Draft = dynamic(() => import('../../components/darftEditor'), { ssr: false });


export default class DocsEditor extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        save: false
    }

    handleSave = async (html) => {
        this.props.fireLoading(true);
        let blob = new Blob([html], { type: 'text/html' });
        let name = await prompt('Ingrese el nombre del archivo');
        if (name) {
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.target = '_blank';
            a.download = `${name}.html`;
            a.click();
        }
        this.props.fireLoading(false);
        this.setState({ save: false });
    }   

    render() {

        let { save } = this.state;

        return <Fragment>
            <Head>
                <link rel="stylesheet" href="/css/editor.css"/>
            </Head>

            <div className="col-md-12">
                <Body>
                    <h3>Editor de Ayuda</h3>
                    <Draft
                        save={save}
                        onSave={this.handleSave}
                    />
                </Body>
            </div>

            <BtnFloat
                disabled={save}
                onClick={(e) => this.setState({ save: true })}
            >
                <i className="fas fa-save"></i>
            </BtnFloat>
        </Fragment>
    }

}