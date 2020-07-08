import React, { Component } from 'react';
import Modal from '../modal';
import atob from 'atob';
import { unujobs } from '../../services/apis';
import { Form, Button, Select, List, Icon, Image, Label } from 'semantic-ui-react';
import Show from '../show';
import Swal from 'sweetalert2';

export default class Add extends Component
{

    state = {
        id: "",
        loading: false,
        infos: [],
        query_search: "",
        select_id: 0,
        payload: [],
        preparate: false,
        index: [],
        selects: [
            { key: "all", value: 0, text: "Seleccionar a todos" },
            { key: "customizar", value: 1, text: "Selección personalizada" }
        ],
        page: 1,
        total: 0
    }

    componentDidUpdate = async (prevProps, prevState) => {
        let { state } = this;
        if (prevState.select_id != state.select_id && state.select_id == 0) {
            let newInfo = await state.infos.concat(state.payload);
            this.setState({ infos: newInfo, index: [], payload: [] });
        }
    }

    componentDidMount = async () => {
        let { add }  = this.props.query;
        await this.setState({ id: add ? atob(add) : '' });
        this.getInfos();
    }

    getInfos = async () => {
        this.setState({ loading: true });
        await unujobs.get(`cronograma/${this.state.id}/add?query_search=${this.state.query_search}&except=${this.state.index}`)
        .then(res => {
            let { data, total } = res.data.infos;
            this.setState({ infos: data, total });
        })
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    handleInput = ({name, value}) => {
        this.setState({ [name] : value })
    }

    addPayload = async (obj, index) => {
        this.setState(state => {
            if (state.index.indexOf(obj.id) == -1) {
                state.index.push(obj.id);
                state.payload.push(obj);
                
            } 
            // quitar 
            state.infos.splice(index, 1);
            // response
            return {
                payload: state.payload,
                infos: state.infos
            }
        });
    }


    leavePayload = async (obj, index) => {
        let answer = confirm(`¿Estas seguro en quitar a ${obj.person.fullname}?`);
        if (answer) {
            this.setState(state => {
                state.index.splice(index, 1);
                state.payload.splice(index, 1);
                state.infos.unshift(obj);
                // response
                return {
                    payload: state.payload,
                    index: state.index,
                    infos: state.infos
                }
            });
        }
    }

    send = async () => {
        this.setState({ loading: true });
        let form = new FormData();
        form.append('info_id', this.state.index); 
        await unujobs.post(`cronograma/${this.state.id}/add_all`, form, { headers: { CronogramaID: this.state.id } })
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            this.setState({ index: [], payload: [] });
            await this.getInfos();
        })
        .catch(err => console.log(err.message));
        this.setState({ loading: false, preparate: false });
    }

    render() {
        return (
            <Modal
                { ...this.props }
                md="11"
                titulo={<span><i className="fas fa-user-plus"></i> Agregar trabajadores al cronograma: {this.state.id}</span>}
                show={true}
                disabled={this.state.loading}
            >
                <div className="card-body h-100">
                    <Form loading={this.state.loading}>
                        <div className="row">
                            <Show condicion={!this.state.preparate}>
                                <div className="col-md-4 mb-1">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Buscar trabajador por apellidos y nombres"
                                            name="query_search"
                                            value={this.state.query_search}
                                            onChange={({ target }) => this.setState({ query_search: target.value })}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <Select
                                        fluid
                                        value={this.state.select_id}
                                        name="select_id"
                                        options={this.state.selects}
                                        placeholder="Seleccionar modo de selección"
                                        onChange={(e, obj) => this.handleInput(obj)}
                                    />
                                </div>
                                
                                <div className="col-md-2 mb-1 col-6">
                                    <Button color="teal" fluid
                                        onClick={(e) => this.getInfos()}
                                    >
                                        <i className="fas fa-search"></i> Buscar
                                    </Button>
                                </div>

                                <div className="col-md-2 col-6 mb-1">
                                    <Button color="black" fluid
                                        onClick={(e) => this.setState({ preparate: true })}
                                        floated="right"
                                        disabled={this.state.select_id == 0 ? false : this.state.select_id == 1 && this.state.index.length == 0 }
                                    >
                                        <i className="fas fa-check"></i> Preparar envio
                                    </Button>
                                </div>
                            </Show>

                            <Show condicion={this.state.preparate}>
                                <div className="col-md-2 col-6 mb-1">
                                    <Button color="blue" fluid
                                        onClick={this.send}
                                    >
                                        <i className="fas fa-paper-plane"></i> Enviar
                                    </Button>
                                </div>

                                <div className="col-md-2 col-6 mb-1">
                                    <Button color="red" fluid
                                        onClick={(e) => {
                                            this.setState({ preparate: false, index: [], payload: [] });
                                            this.getInfos();
                                        }}
                                    >
                                        <i className="fas fa-times"></i> Cancelar
                                    </Button>
                                </div>
                            </Show>

                            <div className="col-md-12">
                                <hr/>
                            </div>

                            <Show condicion={this.state.index.length > 0}>
                                <div className="col-md-12 mb-2">
                                    <i className="fas fa-users"></i> Trabajadores seleccionados: {this.state.index.length} de {this.state.total}
                                </div>
                            </Show>

                            <div className="col-md-12 mb-4">
                                <Label.Group color='blue'>
                                    {this.state.payload.map((obj, iter )=> 
                                        <Label as='a'
                                            onClick={(e) => this.leavePayload(obj, iter)}
                                        >
                                            {obj.person.fullname}
                                            <Icon name='close' color="red"/>
                                        </Label>    
                                    )}
                                </Label.Group>
                            </div>

                            <Show condicion={!this.state.preparate}>
                                <div className="col-md-12 mb-2">
                                    <List divided verticalAlign='middle'>
                                        {this.state.infos.map((obj, index) => 
                                            <List.Item>
                                                <List.Content floated='right'>
                                                    <Show condicion={this.state.select_id}>
                                                        <Button color="blue" size="mini"
                                                            onClick={(e) => this.addPayload(obj, index)}
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                        </Button>
                                                    </Show>
                                                </List.Content>
                                                {/* <Image avatar src='https://react.semantic-ui.com/images/avatar/small/lena.png'/> */}
                                                <List.Content>
                                                    {obj.person.fullname}
                                                    {/* <Label className="ml-2 visible-lg" color="grey">{obj.cargo}</Label> */}
                                                    <Label className="ml-1" color="red">{obj.categoria}</Label>
                                                </List.Content>
                                            </List.Item>    
                                        )}
                                    </List>
                                </div>

                                <Show condicion={!this.state.loading && this.state.infos.length == 0}>
                                    <div className="col-md-12 mb-2 text-center">
                                        No hay registros disponibles!
                                    </div>
                                </Show>
                            </Show>
                            
                            <Show condicion={this.state.preparate && this.state.select_id == 0}>
                                <div className="col-md-12 text-center">
                                    <h4><i className="fas fa-check"></i> Selección Masiva de trabajadores: {this.state.total}</h4>
                                </div>
                            </Show>

                        </div>
                    </Form>
                </div>
            </Modal>
        )
    }

}