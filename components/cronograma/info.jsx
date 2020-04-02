import React, { Component, Fragment } from 'react';
import Modal from '../modal';
import { Card, Row } from 'react-bootstrap';
import { unujobs, authentication } from '../../services/apis';
import base64url from 'base64-url';
import Swal from 'sweetalert2';
import { CSVLink } from "react-csv";
import { parseOptions } from '../../services/utils';
import Show from '../../components/show';
import TabCronograma from './TabCronograma';
import { Form, Button, Input, Select, Icon } from 'semantic-ui-react';
import Head from 'next/head';


export default class Info extends Component {

    constructor(props) {
        super(props);
        this.state = {
            total: 0,
            like: "",
            page: 1,
            cronograma_id: '',
            ubigeos: [],
            last_page: 1,
            edit: false,
            loading: true,
            cronograma: {
                year: 2019,
                mes: 9,
                adicional: 0,
                planilla_id: "",
            },
            historial: {},
            cargo_id: "",
            type_categoria_id: "",
            planillas: [],
            cargos: [],
            type_categorias: [],
            bancos: [],
            send: false,
            block: false,
            cancel: false,
            type_documents: []
        };
    }

    async componentDidMount() {
        let { query } = this.props;
        let id = query.info ?  base64url.decode(query.info) : "";
        await this.setState({ cronograma_id: id });
        if (this.props.show && !Object.keys(this.state.historial).length) {
            this.getCronograma(this.props, this.state);
        }
        // obtener configuración basica
        this.getDocumentType();
        this.getBancos();
        this.getPlanillas();
        this.getUbigeo();
    }

    componentWillUpdate = (nextProps, nextState) => {
        if (nextState.cronograma.planilla_id != this.state.cronograma.planilla_id) this.getCargos(nextState);
        if (nextState.cargo_id != "" && nextState.cargo_id != this.state.cargo_id) this.gettype_categorias(nextState);
        if (nextState.cargo_id == "" && nextState.cargo_id != this.state.cargo_id) this.setState({ type_categoria_id: "", type_categorias: [] });
        if (nextProps.show != this.props.show && nextProps.show && !Object.keys(nextState.historial).length) this.getCronograma(nextProps, nextState);
    }

    getDocumentType = async () => {
        await authentication.get('get_document_type')
        .then(res => this.setState({ type_documents: res.data }))
        .catch(err => console.log(err.message));
    }

    getPlanillas = async () => {
        this.setState({ loading: true });
        await unujobs.get(`planilla`)
        .then(res => {
            let planillas = res.data ? res.data : []
            this.setState({ planillas });
        }).catch(err => console.log(err.message));
        this.setState({ loading: false });
    }


    getBancos = () => {
        unujobs.get(`banco`)
        .then(res => this.setState({ bancos: res.data }))
        .catch(err => console.log(err.message));
    }

    getUbigeo = async () => {
        await unujobs.get('ubigeo')
        .then(res => this.setState({ ubigeos: res.data }))
        .catch(err => console.log(err.message));
    }

    handleInput = e => {
        let { name, value } = e.target;
        this.setState({ [name]: value });
    }

    handleSelect = (e, { name, value }) => {
        this.setState({ [name]: value });
    }

    readCronograma = async (e) => {
        if (!this.state.edit) {
            await this.setState({ page: 1 });
            this.getCronograma(this.props, this.state);
        } else {
            this.getAlert();
        }
    }



    clearSearch = async () => {
        await this.setState({ 
            afp_id: "",
            cargo_id: "",
            like: "",
            page: 1
        });
        // filtrar
        await this.readCronograma();
    }

    getAlert = () => {
        Swal.fire({ icon: "warning", text: "La edición está activa!. Actualize o Cancele la edición" });
    }

    getCronograma = async (props, state) => {
        this.setState({ loading: true });
        try {
            let { query } = props;
            let { page, cargo_id, type_categoria_id, afp_id, like } = state;
            let id = query.info ? atob(query.info) : "";
            let params = `page=${page}&cargo_id=${cargo_id}&type_categoria_id=${type_categoria_id}&afp_id=${afp_id}&like=${like}`;
            await unujobs.get(`cronograma/${id}?${params}`)
            .then(async res => {
                let { cronograma, historial, remuneraciones, descuentos, aportaciones } = res.data;
                // setting
                this.setState({ 
                    cronograma: cronograma, 
                    historial: historial.data, 
                    total: historial.total, 
                    last_page: historial.last_page,
                    remuneraciones,
                    descuentos,
                    aportaciones 
                });
            }).catch(err => console.log(err));
        } catch(ex) {
            console.log(ex);
        }

        this.setState({ loading: false });
    }

    sendEmail = async () => {
        let  { historial } = this.state;
        this.setState({ block: true });
        await unujobs.post(`historial/${historial.id}/send_boleta`)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
        }).catch(err => {
            Swal.fire({ icon: 'error', text: "Algo salió mal, vuelva más tarde!" });
        });
        this.setState({ block: false });
    }

    getCargos = (state) => {
        let { cronograma } = state;
        unujobs.get(`cronograma/${cronograma.id}/cargo`)
        .then(async res => {
            this.setState({ cargos: res.data });
        }).catch(err =>  console.log(err.message));
    }

    gettype_categorias = (state) => {
        let { cargo_id } = state;
        unujobs.get(`cargo/${cargo_id}`)
        .then(async res => {
            let { type_categorias } = res.data;
            this.setState({ type_categorias: type_categorias ? type_categorias : [] });
        }).catch(err =>  console.log(err.message));
    }

    next = async (e) => {
        let { page, last_page, edit } = this.state;
        if (!edit) {
            if (page < last_page) {
                await this.setState(state => ({ page: state.page + 1 }));
                await this.getCronograma(this.props, this.state);
            }else {
                Swal.fire({ icon: "warning", text: "No hay más registros" });
            }
        } else {
            this.getAlert();
        }
    }

    previus = async (e) => {
        let { page, edit } = this.state;
        if (!edit) {
            if (page > 1) {
                await this.setState(state => ({ page: state.page - 1 }));
                this.getCronograma(this.props, this.state);
            }else {
                Swal.fire({ icon: "warning", text: "No hay más registros" });
            }
        } else {
            this.getAlert();
        }
    }

    setLoading = async (value) => {
        await this.setState({ loading : value })
    }

    setEdit = async (value) => {
        await this.setState({ edit: value });
    }

    setSend = async (value) => {
        await this.setState({ send: value });
    }

    setCancel = async (value) => {
        await this.setState({ cancel: value })
    }

    updatingHistorial = async () => {
        await this.getCronograma(this.props, this.state);
        this.setState({ edit: false, block: false, send: false });
    }

    handleConfirm = async (e) => {
        let { value } = await Swal.fire({ 
            icon: 'warning',
            text: "¿Deseas guardar los cambios?",
            confirmButtonText: "Continuar",
            showCancelButton: true
        });
        if (value) await this.setState({ loading: true, send: true });
    }

    render() {

        let { show } = this.props;
        let { 
            cronograma, 
            historial, planillas, 
            cargos, 
            type_categorias, loading, 
            cargo_id, type_categoria_id,
        } = this.state;

        

        return (
            <React.Fragment>

                <Modal show={show}
                    isClose={this.props.isClose}
                    disabled={this.state.edit || this.state.block}
                    md="12"
                    titulo={`INFORMACIÓN DE "${historial && historial.person ? historial.person.fullname : 'NO HAY TRABAJADOR DISPONIBLE'}"`}
                >
                    <Card.Body style={{ height: "85%", overflowY: "auto" }}>
                        <Form loading={loading}>
                            <Row>
                                <div className="col-md-4">
                                    <Form.Field> 
                                        <input type="search" 
                                            className={`${this.state.like ? 'border-dark text-dark' : ''}`}
                                            disabled={loading || this.state.edit || this.state.block}
                                            value={this.state.like}
                                            onChange={this.handleInput}
                                            name="like"
                                            placeholder="Buscar por Apellidos y Nombres"
                                        />  
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <Select placeholder='Select. Cargo' 
                                        options={parseOptions(cargos, ['sel-car', '', 'Select. Cargo'], ['id', 'id', 'descripcion'])} 
                                        disabled={loading || this.state.edit || this.state.block}
                                        value={cargo_id}
                                        name="cargo_id"
                                        onChange={this.handleSelect}
                                        wrapSelection={false}
                                        fluid
                                    />
                                </div>
                                
                                <div className="col-md-2 mb-1">
                                    <Select placeholder='Select. Categoría' 
                                        fluid
                                        options={parseOptions(type_categorias, ['sel-cat', '', 'Select. Categoría'], ['id', 'id', 'descripcion'])}
                                        disabled={loading || this.state.edit || this.state.block}
                                        value={type_categoria_id}
                                        name="type_categoria_id"
                                        onChange={this.handleSelect}
                                    />
                                </div>
                                
                                <div className="col-md-2 mb-1">
                                    <Button color="black"
                                        fluid
                                        onClick={this.readCronograma}
                                        title="Realizar Búsqueda"
                                        disabled={loading || this.state.edit || this.state.block}
                                    >
                                        <Icon name="filter"/> Filtrar
                                    </Button>
                                </div>
                                
                                <Show condicion={this.state.total}>
                                    <TabCronograma
                                        type_documents={this.state.type_documents}
                                        historial={historial}
                                        remuneraciones={this.state.remuneraciones}
                                        descuentos={this.state.descuentos}
                                        aportaciones={this.state.aportaciones}
                                        bancos={this.state.bancos}
                                        ubigeos={this.state.ubigeos}
                                        edit={this.state.edit}
                                        loading={this.state.loading}
                                        send={this.state.send}
                                        total={this.state.total}
                                        setSend={this.setSend}
                                        setEdit={this.setEdit}
                                        setLoading={this.setLoading}
                                        updatingHistorial={this.updatingHistorial}
                                        menu={{ secondary: true, pointing: true }}
                                    />  
                                </Show>          
                                
                                <Show condicion={!this.state.loading && !this.state.total}>
                                    <div className="w-100 text-center">
                                        <h4 className="mt-5">No se encontró trabajadores</h4>
                                    </div>
                                </Show>                    
                            </Row>
                        </Form>
                    </Card.Body>
                    <Card.Footer style={{ position: "absolute", background: "#fff", bottom: "0px", width: "100%", left: "0px" }}>
                        <Card.Body>
                            <Form>
                                <Row className="justify-content-between"> 
                                    <div className="col md-8">
                                        <div className="row">
                                            <div className="col-md-2 mb-1">
                                                <Form.Field>
                                                    <input type="number"  
                                                        placeholder="Año"
                                                        value={cronograma.year}
                                                        disabled={true}
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-2 mb-1">
                                                <Form.Field>
                                                    <input type="number" 
                                                        placeholder="Mes"
                                                        value={cronograma.mes}
                                                        disabled={true}
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-3 mb-1">
                                                <Select placeholder='Select. Planilla' 
                                                    options={parseOptions(planillas, ['sel-afp', '', 'Select. Planilla'], ['id', 'id', 'nombre'])} 
                                                    value={cronograma.planilla_id}
                                                    disabled={true}
                                                />
                                            </div>

                                            <Show condicion={cronograma.adicional}>
                                                <div className="col-md-2 mb-1">
                                                    <Form.Field>
                                                        <input type="text" 
                                                            value={`Adicional ${cronograma.adicional}`}
                                                            readOnly
                                                        />
                                                    </Form.Field>
                                                </div>
                                            </Show>

                                            <div className="col-md-2 mb-1">
                                                <Show condicion={this.state.total}>
                                                    <Button color="black"
                                                        fluid
                                                    >
                                                        {this.state.page} de {this.state.total}
                                                    </Button>
                                                </Show>
                                                <Show condicion={!this.state.total}>
                                                    <Button color="red"
                                                        disabled={loading}
                                                        onClick={this.clearSearch}
                                                        fluid
                                                    >
                                                        <i className="fas fa-trash"></i> Limpiar
                                                    </Button>
                                                </Show>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-4 text-right">
                                        <Show condicion={this.state.total && cronograma.estado}>
                                            <Button color={this.state.edit ? 'red' : 'teal'}
                                                disabled={loading || this.state.block || this.state.send}
                                                onClick={(e) => this.setState(state => ({ edit: !state.edit }))}
                                            >
                                                <Icon name={this.state.edit ? 'cancel' : 'pencil'}/> { this.state.edit ? 'Cancelar' : 'Editar' }
                                            </Button>
                                        </Show>

                                        <Show condicion={this.state.total && !cronograma.estado}>
                                            <Button
                                                color="orange"
                                                disabled={loading || this.state.block}
                                                onClick={this.sendEmail}
                                            >
                                                <Icon name="send"/> { this.state.send ? 'Enviando...' : 'Enviar Email' }
                                            </Button>
                                        </Show>

                                        <Show condicion={!this.state.edit && this.state.total}>
                                            <Button
                                                color="black"
                                                disabled={loading || this.state.edit || this.state.block}
                                                onClick={this.readCronograma}
                                            >
                                                Pág N° 1
                                            </Button>   
                                        </Show>

                                        <Show condicion={!this.state.edit && this.state.total}>
                                            <Button  
                                                color="black"
                                                disabled={loading || this.state.edit || this.state.block}
                                                onClick={this.previus}
                                            >
                                                <Icon name="triangle left"/>
                                            </Button>
                                        </Show>

                                        <Show condicion={!this.state.edit && this.state.total}>
                                            <Button 
                                                color="black"
                                                disabled={loading || this.state.edit || this.state.block}
                                                onClick={this.next}
                                            >
                                                <Icon name="triangle right"/>
                                            </Button>
                                        </Show>

                                        <Show condicion={this.state.edit}>
                                            <Button
                                                color="blue"
                                                loading={this.state.send}
                                                disabled={loading || !this.state.edit || this.state.block}
                                                onClick={this.handleConfirm}
                                            >
                                                <Icon name="save"/> Guardar
                                            </Button>
                                        </Show>
                                    </div>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card.Footer>
                </Modal>    
            </React.Fragment>
        )
        
    }

}