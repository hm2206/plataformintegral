import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Swal from 'sweetalert2';
import Router from 'next/router';

export default class Close extends Component
{

    state = {
        id: "",
        loader: false,
        token_verify: ""
    }

    componentDidMount = () => {
        this.setState((state, props) => ({ id: props.query.close ? atob(props.query.close) : "" }));
    }

    close = async () => {
        this.setState({ loader: true });
        await unujobs.post(`cronograma/${this.state.id}/close`, { token_verify: this.state.token_verify })
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) Router.push({ pathname: Router.pathname, query: { close: "" } });
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ loader: false });
    }

    render() {
        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-lock"></i> Cerrar cronograma: {this.state.id}</span>}
            >
                <Form className="card-body" loading={this.state.loader}>
                    <h1 className="text-center mt-5">
                        <i className="fas fa-lock"></i>
                        <br/>
                        Cerrar Cronograma
                    </h1>

                    <div className="row justify-content-center mt-5">
                        <div className="col-md-8">
                            <Form.Field>
                                <label htmlFor="">Contraseña de cierre de cronograma</label>
                                <input type="password"
                                    max="8"
                                    placeholder="Ingrese la contraseña de cierre"
                                    value={this.state.token_verify}
                                    onChange={({ target }) => this.setState({ token_verify: target.value })}
                                />
                            </Form.Field>
                        </div>
                    </div>

                    <div className="row justify-content-center mt-3">
                        <div className="col-md-8 text-right mr-4">
                            <Button color="red"
                                onClick={this.close}
                            >
                                <i className="fas fa-times"></i> Cerrar
                            </Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        );
    }

}