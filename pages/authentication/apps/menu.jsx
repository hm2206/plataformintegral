import React, { Component, Fragment } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select, Accordion, Menu, Message } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import AssignUser from '../../../components/authentication/permission/assignUser';
import { AUTHENTICATE } from '../../../services/auth';
import ListCheck from '../../../components/listCheck';


export default class MenuApp extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        form: {},
        check: false,
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
        });
    }

    validate = () => {
        let { module_id } = this.state.form;
        return module_id;
    }

    render() {

        let { pathname, query } = this.props;
        let { form, check } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Agregar Menu
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-9">
                                <div className="row justify-content-end">

                                    <div className="col-md-12">
                                        <ListCheck 
                                            id="menu"
                                            list={[
                                                { id: 1, name: "Hola", checked: true }
                                            ]}
                                            listChild={[
                                                { id: 1, name: "Hola", checked: true }
                                            ]}
                                            onChild={(child, index) => console.log(child)}
                                            onParent={(parent, index) => console.log(parent)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>

                <Show condicion={query && query.assign}>
                    <AssignUser
                        getAdd={this.getAdd}
                        isClose={(e) => {
                            let { push, pathname, query } = Router;
                            query.assign = "";      
                            push({ pathname, query })
                        }}
                    />
                </Show>
            </div>
        )
    }
    
}