import React, { Component } from 'react';
import Modal from '../modal';
import atob from 'atob';
import { Form, Button, Loader, List } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Show from '../show';
import Swal from 'sweetalert2';

export default class SendEmail extends Component
{

    state = {
        id: "",
        loading: false,
        cronograma: {},
        total: 0,
        enviados: 0,
        proggress: 0,
        send: false,
        new_enviados: 0,
        new_fallidos: 0,
        new_sincorreos: 0
    };

    componentDidMount = async () => {
        let { send_email } = this.props.query;
        await this.setState({ id: send_email ? atob(send_email) : "" });
        await this.getCronograma();
    }

    getCronograma = async () => {
        this.setState({ loading: true });
        await unujobs.get(`cronograma/${this.state.id}/sent_email`)
        .then(res => {
            let { total, cronograma, enviados } = res.data;
            this.setState({ total, cronograma, enviados });
        })
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }
    
    sendEmail = async () => {
        this.setState({ send: true });
        await unujobs.post(`cronograma/${this.state.id}/send_email`, {}, { headers: { CronogramaID: this.state.id } })
        .then(async res => {
            let { errors, send, no_send, success, message } = res.data;
            if (success == false) {
                await Swal.fire({ icon: 'error', text: message });
            } else {
                this.setState(state => ({
                    new_enviados: send,
                    new_fallidos: errors,
                    enviados: state.enviados + send,
                    new_sincorreos: no_send
                }));
            }
        }).catch( err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ send: false });
    }

    render() {

        let { loading, enviados, total } = this.state;

        return (
            <Modal show={true}
                {...this.props}
                titulo={<span><i className="fas fa-paper-plane"></i> Enviar email del cronograma: {this.state.id}</span>}
                disabled={this.state.loading || this.state.send}
            >
                <div className="card-body">
                    <Form loading={this.state.send}>
                        <div className="row justify-content-center">
                            <div className="col-md-6">
                                <Button
                                    fluid
                                    color="black"
                                    loading={loading}
                                >
                                    <i className="fas fa-users"></i> Total: { total }
                                </Button>
                            </div>

                            <div className="col-md-6">
                                <Button
                                    fluid
                                    color="green"
                                    loading={loading}
                                >
                                    <i className="fas fa-check"></i> Enviados: { enviados }
                                </Button>
                            </div>

                            <div className="col-md-12">
                                <hr/>
                            </div>

                            <Show condicion={!this.state.loading}>
                                <div className="col-md-12 mb-5">
                                    <List divided relaxed>
                                        <List.Item>
                                            <List.Icon name='send' size='large' verticalAlign='middle' />
                                            <List.Content>
                                                <List.Header as='a'>Correos enviados</List.Header>
                                                <List.Description as='a'>Actualizados: <b>{this.state.new_enviados}</b> trabajadores</List.Description>
                                            </List.Content>
                                        </List.Item>
                                        <List.Item>
                                            <List.Icon name='user times' size='large' verticalAlign='middle' />
                                            <List.Content>
                                                <List.Header as='a'>Correos fallidos</List.Header>
                                                <List.Description as='a'>Envios fallados: <b>{this.state.new_fallidos}</b> correos</List.Description>
                                            </List.Content>
                                        </List.Item>
                                        <List.Item>
                                            <List.Icon name='mail' size='large' verticalAlign='middle' />
                                            <List.Content>
                                                <List.Header as='a'>Sin correo</List.Header>
                                                <List.Description as='a'>Sin correos: <b>{this.state.new_sincorreos}</b> trabajadores</List.Description>
                                            </List.Content>
                                        </List.Item>
                                    </List>
                                </div>
                            </Show>

                            <div className="col-md-3 mt-5">
                                <Button fluid
                                    color="blue"
                                    disabled={this.state.send || loading}
                                    onClick={this.sendEmail}
                                >
                                    <i className="fas fa-paper-plane"></i> Enviar
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </Modal>
        )
    }

}