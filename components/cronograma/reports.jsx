import React, { Component, Fragment } from 'react';
import Modal from '../modal';
import { Card, Row } from 'react-bootstrap';
import { unujobs } from '../../services/apis';
import base64url from 'base64-url';
import Swal from 'sweetalert2';
import { parseOptions } from '../../services/utils';
import Show from '../../components/show';
import { Form, Button, Input, Select, Icon } from 'semantic-ui-react';
import ReportType from './report_type.json';


const options = [
    { key: 'edit', icon: 'edit', text: 'Edit Post', value: 'edit' },
    { key: 'delete', icon: 'delete', text: 'Remove Post', value: 'delete' },
    { key: 'hide', icon: 'hide', text: 'Hide Post', value: 'hide' },
];

export default class Reports extends Component {

    constructor(props) {
        super(props);
        this.state = {
            type_reports: [],
            type_report_id: "",
            loading: true,
            cronograma: {},
            cronograma_id: '',
            afps: [],
            afp_id: "",
            cargos: [],
            cargo_id: "",
            categorias: [],
            type_remuneraciones: [],
            type_remuneracion_id: "",
            type_descuentos: [],
            type_descuento_id: "",
            type_categorias: [],
            type_categoria_id: "",
            type_detalles: [],
            type_detalle_id: "",
            type_aportaciones: [],
            type_aportacion_id: "",
            bancos: [],
            banco_id: "",
            metas: [],
            meta_id: "",
            block: false,
            loading_filters: false,
            buttons: [],
            filters: [],
            pagos: [
                { key: "pay", value: 1, text: "Pago por Cuenta" }
            ],
            pago_id: "",
            negativos: [
                { key: "1", value: "1", text: "Select. Valores negativos" },
                { key: "0", value: "0", text: "Select. Valores positivos" }
            ],
            negativo: "0",
            netos: [
                { key: "0", value: "0", text: "Select. Monto brutos" },
                { key: "1", value: "1", text: "Select. Monto netos" }
            ],
            neto: "0",
            params: {},
            imagen: ""
        };
    }

    async componentDidMount() {
        let { query } = this.props;
        let id = query.report ?  base64url.decode(query.report) : "";
        await this.setState({ cronograma_id: id, type_reports:  ReportType });
        await this.getCronograma(this.props, this.state);
        // obtener configuración basica
        this.setState({ loading_filters: true });
        this.getMetas();
        this.getBancos();
        this.getAFPs();
        await this.getCategorias();
        await this.getCargos();
        await this.getTypeRemuneraciones();
        this.getTypeDescuentos();
        this.getTypeDetalles();
        await this.getTypeAportacion();
        this.setState({ loading_filters: false });
    }

    componentWillUpdate = (nextProps, nextState) => {
        let { state, props } = this;
        if (nextState.type_report_id != state.type_report_id) this.clear()
    }

    clear = () => {
        this.setState({ 
            meta_id: "",
            cargo_id: "",
            type_categoria_id: "",
            afp_id: "",
            pago: "",
        });
    }

    handleSelect = async (e, { name, value }) => {
        this.setState({ filters: [], buttons: [] });
        this.setState({ [name]: value });
        await this.config(value);
    }

    handleInput = async ({ name, value }) => {
        await this.setState({ [name]: value });
        if (name == 'cargo_id') await this.getTypeCategorias();
    }

    config = async (key) => {
        let obj = {};
        await this.state.type_reports.data.filter(type => {
            if (key == type.key) obj = type;
        });
        let { filters } = this.state.type_reports;
        let newFilters = obj.filters || [];
        let tmpFilters = [];
        for(let fil of newFilters) {
            await filters.filter(newFil => {
                if (fil == newFil.key) tmpFilters.push(newFil);
            });
        }
        // update
        this.setState({ filters: tmpFilters || [], buttons: obj.buttons  || [], imagen: obj.icon});
    }

    getMetas = async () => {
        await unujobs.get(`cronograma/${this.state.cronograma_id}/meta`)
        .then(res => this.setState({ metas: res.data || [] }))
        .catch(err => console.log(err.message));
    }

    getAFPs = () => {
        unujobs.get(`cronograma/${this.state.cronograma_id}/afp`)
        .then(res => this.setState({ afps: res.data }))
        .catch(err => console.log(err.message));
    }

    getBancos = () => {
        unujobs.get(`banco`)
        .then(res => this.setState({ bancos: res.data }))
        .catch(err => console.log(err.message));
    }

    getCronograma = async (nextProps, nextState) => {
        this.setState({ loading: true });
        await unujobs.get(`cronograma/${nextState.cronograma_id}`)
        .then(res => {
            let { cronograma } = res.data;
            this.setState({ cronograma: cronograma ? cronograma : {} });
        }).catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getCargos = async () => {
        let { cronograma } = this.state;
        await unujobs.get(`cronograma/${cronograma.id}/cargo`)
        .then(async res => {
            this.setState({ cargos: res.data });
        }).catch(err =>  console.log(err.message));
    }

    getCategorias = async () => {
        this.setState({ loading_filters: true });
        await unujobs.get(`cronograma/${this.state.cronograma_id}/type_categoria`)
        .then(res => this.setState({ categorias: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading_filters: false });
    }

    getTypeCategorias = async () => {
        this.setState({ loading_filters: true });
        let { cargo_id } = this.state;
        await unujobs.get(`cargo/${cargo_id}`)
        .then(async res => {
            let { type_categorias } = res.data;
            this.setState({ type_categorias: type_categorias ? type_categorias : [] });
        }).catch(err =>  console.log(err.message));
        this.setState({ loading_filters: false });
    }

    getTypeRemuneraciones = async () => {
        await unujobs.get('type_remuneracion?paginate=0')
        .then(res => this.setState({ type_remuneraciones: res.data }))
        .catch(err => console.log(err.message));
    }

    getTypeDescuentos = async () => {
        await unujobs.get(`cronograma/${this.state.cronograma_id}/type_descuento`)
        .then(res => this.setState({ type_descuentos: res.data }))
        .catch(err => console.log(err.message));
    }

    getTypeDetalles = async () => {
        await unujobs.get(`cronograma/${this.state.cronograma_id}/type_detalle`)
        .then(res => this.setState({ type_detalles: res.data }))
        .catch(err => console.log(err.message));
    }

    getTypeAportacion = async () => {
        await unujobs.get(`cronograma/${this.state.cronograma_id}/type_aportacion`)
        .then(res => this.setState({ type_aportaciones: res.data }))
        .catch(err => console.log(err.message));
    }

    typeAction = (obj, data, type = "link", options = { type: "text/plain" }) => {
        let link = document.createElement('a');
        let path = "";
        if (type == "link") {
            path = data;
        } else if(type == "blob" || type == 'download') {
            console.log(options);
            let blob = new Blob([data], options);
            path = URL.createObjectURL(blob);
        } 
        // verificar si se puede descargar
        if (type == 'download') link.download = obj.filename;
        // ejecutar
        link.target = "_blank";
        link.href = path;
        link.click();
    }

    getStringQuery = () => {
        let { meta_id, neto } = this.state;
        return `meta_id=${meta_id}&neto=${neto}`;
    }

    setParams = async () => {
        await this.setState(state => {
            let payload = {
                meta_id: this.state.meta_id,
                cargo_id: this.state.cargo_id,
                type_categoria_id: this.state.type_categoria_id,
                pago_id: this.state.pago_id,
                afp_id: this.state.afp_id,
                type_remuneracion_id: this.state.type_remuneracion_id,
                type_descuento_id: this.state.type_descuento_id,
                type_detalle_id: this.state.type_detalle_id,
                type_aportacion_id: this.state.type_aportacion_id,
                negativo: this.state.negativo
            };
            // response
            return { params: payload };
        });
    }

    handleAction = async (obj, e) => {
        let url = await this.handleUrl(obj.url, obj.params || []);
        let query = await this.getStringQuery();
        await this.setParams();
        await this.handleBody(obj.body);
        if (obj.key == "view") {
            await this.typeAction(obj, `${unujobs.path}/${url}?${query}`, obj.action);
        } else {
            this.setState({ loading: true, block: true });
            await unujobs.post(`${url}`, this.state.params)
            .then(async res => {
                let headers = res.headers['content-type'].split(';');
                obj.filename = headers[headers.length - 1];
                let { message } = res.data;
                if (!message) await this.typeAction(obj, res.data, obj.action, obj.head);
                if (message) Swal.fire({ icon: 'error', text: message });
            })
            .catch(err => Swal.fire({ icon: 'error', text: "No se pudo obtener el reporte, vuelva más tarde!" }));
            this.setState({ loading: false, block: false });
        }
    }

    handleUrl = async (url, params) => {
        let newUrl = "";
        for(let param of params) {
            newUrl = await url.replace(`{${param}}`, this.state[param]);
        }

        return newUrl;
    }

    handleBody = async (bodies) => {
        if (bodies && bodies.length) {
            let payload = {};
            for(let body of bodies) {
                if (typeof body.key == 'string') {
                    payload[body.key] = body.value || "";
                }
            }
            // add
            await this.setState(state => {
                let newParams = Object.assign({}, state.params);
                for(let pay in payload) {
                    newParams[pay] = payload[pay];
                }
                // add
                return { params : newParams }
            });
        }
    }

    render() {

        let { show } = this.props;
        let { 
            cronograma,
            afps, cargos, 
            type_categorias, loading, 
            cargo_id, type_categoria_id, 
            afp_id , meta_id,
            type_report_id
        } = this.state;

        
        return (
            <Modal show={show}
                isClose={this.props.isClose}
                disabled={this.state.loading || this.state.block}
                md="11"
                titulo={<span><i className="fas fa-file-alt"></i> REPORTES POR CRONOGRAMA: {this.state.cronograma_id}</span>}
            >
                <Form loading={this.state.loading} className="h-100">
                    <Card.Body style={{ height: "100%", overflowY: "auto" }}>
                        <div>
                            <Row>
                                <div className="col-md-5 mb-1">
                                    <Select placeholder='Seleccionar Tipo de Reporte' 
                                        options={this.state.type_reports.data} 
                                        disabled={loading || this.state.edit || this.state.block}
                                        value={type_report_id}
                                        fluid={true}
                                        name="type_report_id"
                                        onChange={this.handleSelect}
                                    />
                                </div>

                                <div className="col-md-12 mb-2">
                                    <hr/>

                                    <h5><Icon name="configure"/> Filtros: {this.state.filters.length ? '' : 'No hay filtros disponibles'}</h5>
                                </div>
                            
                                <Show condicion={!this.state.loading_filters}>
                                    {this.state.filters.map(filter => 
                                        <div className="col-md-3 mb-1" key={`sel-${filter.key}`}>
                                            <Select placeholder={filter.placeholder} 
                                                options={parseOptions(this.state[filter.resource], ["", "", filter.placeholder], filter.index)} 
                                                disabled={this.state.loading_filters}
                                                value={this.state[filter.name]}
                                                fluid={true}
                                                name={filter.name}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </div>
                                    )}
                                </Show>

                                <Show condicion={this.state.loading_filters}>
                                    <div className="col-md-12">
                                        <h5 className="text-center">Cargando filtros avanzados...</h5>
                                    </div>
                                </Show>
                                
                                {/*  body reports */}
                                {/* <div className="col-md-12 text-center mt-2">
                                    <div className="row justify-content-center">
                                        <div className="col-md-5 col-7">
                                            <img src={this.state.imagen} width="100%"/>
                                        </div>
                                    </div>
                                </div> */}
                                
                                <Show condicion={!this.state.loading && !this.state.cronograma}>
                                    <div className="w-100 text-center">
                                        <h4 className="mt-5">No se encontró el cronograma</h4>
                                    </div>
                                </Show>                    
                            </Row>
                        </div>
                    </Card.Body>
                    <Card.Footer style={{ 
                            position: "absolute", background: "#fff", 
                            bottom: "0px", width: "100%", left: "0px"
                        }}
                    >
                        <Card.Body>
                            <div loading={loading}>
                                <Row className="justify-content-between"> 
                                    <div className="col md-8">
                                        <div className="row">
                                            <div className="col-md-2 mb-1 col-6">
                                                <Form.Field>
                                                    <input type="number"  
                                                        placeholder="Año"
                                                        defaultValue={cronograma.year}
                                                        disabled={true}
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-2 mb-1 col-6">
                                                <Form.Field>
                                                    <input type="number" 
                                                        placeholder="Mes"
                                                        defaultValue={cronograma.mes}
                                                        disabled={true}
                                                    />
                                                </Form.Field>
                                            </div>

                                            <div className="col-md-3 mb-1 col-12">
                                                <Form.Field>
                                                    <input type="text" disabled={true} 
                                                        value={cronograma.planilla ? cronograma.planilla.nombre : ''}
                                                    />
                                                </Form.Field>
                                            </div>

                                            <Show condicion={cronograma.adicional}>
                                                <div className="col-md-2 mb-1">
                                                    <Form.Field>
                                                        <input type="text" 
                                                            value={`Adicional ${cronograma.adicional}`}
                                                            disabled={true}
                                                        />
                                                    </Form.Field>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-12 text-right">
                                        <div className="row justify-content-end">
                                            {this.state.buttons.map(btn => 
                                                <div className="col-md-3 col-6"
                                                    key={`btn-${btn.key}`}
                                                >
                                                    <Button color={btn.color}
                                                        fluid
                                                        key={btn.key}
                                                        className="mb-1"
                                                        onClick={this.handleAction.bind(this, btn)}
                                                        disabled={this.state.block}
                                                    >
                                                        <i className={btn.icon}></i> {btn.text}
                                                    </Button> 
                                                </div> 
                                            )}
                                        </div>
                                    </div>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card.Footer>
                </Form>
            </Modal>    
        )
        
    }

}