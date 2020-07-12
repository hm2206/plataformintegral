import React, { Component } from 'react';
import { Body, BtnBack, BtnSelect, BtnFloat } from '../../../components/Utils';
import { findCronograma } from '../../../storage/actions/cronogramaActions';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { backUrl, parseOptions, InputCredencias } from '../../../services/utils';
import Router from 'next/dist/client/router';
import { Form, Select } from 'semantic-ui-react';
import Show from '../../../components/show';
import ContentControl from '../../../components/contentControl';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import SearchCronograma from '../../../components/cronograma/searchCronograma';

export default class Report extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query, store } = ctx;
        await store.dispatch(findCronograma(ctx));
        let { cronograma } = await store.getState().cronograma;
        let auth_token = await AUTH(ctx);
        return { pathname, query, cronograma, auth_token };
    }

    state = {
        id: "",
        loading: false,
        text: "Seleccionar",
        options: [
            {key: 'text', icon: 'file pdf', text: 'Visualizar', name: "visualizar", value: 'Visualizar'},
            {key: 'text', icon: 'file text', text: 'Generar txt', name: "text", value: 'Generar txt'},
            {key: 'text', icon: 'file csv', text: 'Generar cvs', name: "text", value: 'Generar csv'}
        ],
        reports: [
            {key: "general", value: "general", text: "Reporte General", icon: "file text outline", filtros: ['meta'], buttons: ['general']},
            {key: "planilla", value: "planilla", text: "Reporte de Planilla", icon: "file text outline", filtros: ['meta', 'cargo'], buttons: ['planilla']},
            {key: "boleta", value: "boleta", text: "Reporte de Boleta", icon: "file text outline", filtros: ['meta', 'cargo'], buttons: ['boleta']},
            {key: "pago", value: "pago", text: "Reporte Medio de Pago", icon: "file text outline", filtros: ['pay', 'type_categoria'], buttons: ['pay', 'pay-txt', 'pay-csv']},
            {key: "afp", value: "afp", text: "Reporte de AFP y ONP", icon: "file text outline", filtros: ['afp'], buttons: ['afp', 'afp-net']},
            {key: "remuneracion", value: "remuneracion", text: "Reporte de Remuneraciones", icon: "file text outline", filtros: ['type_remuneracion'], buttons: ['remuneracion']},
            {key: "descuento", value: "descuento", text: "Reporte de Descuentos", icon: "file text outline", filtros: ['type_descuento'], buttons: ['descuento']},
            {key: "obligacion", value: "obligacion", text: "Reporte de Obligaciones Judiciales", icon: "file text outline", filtros: ['pay', 'type_categoria'], buttons: ['judicial', 'judicial-pay', 'judicial-pay-txt']},
            {key: "detallado", value: "detallado", text: "Reporte de Descuentos Detallados", icon: "file text outline", filtros: ['type_detalle'], buttons: ['detalle']},
            {key: "aportacion", value: "aportacion", text: "Reporte de Aportacion al Empleador", icon: "file text outline", filtros: ['type_aportacion'], buttons: ['aportacion']},
            {key: "personal", value: "personal", text: "Reporte de Personal", icon: "file text outline", filtros: ['negativo', 'cargo', 'type_categoria'], buttons: ['personal']},
            {key: "ejecucion", value: "ejecucion", text: "Reporte de Ejecucion de Planilla", icon: "file text outline", filtros: ['neto'], buttons: ['ejecucion', 'ejecucion-pay', 'ejecucion-total']}
        ],
        filtros: [
            {key: "meta", name: "meta_id", placeholder: "Select. Meta", options: "metas", index: ["id", "id", "metaID"]},
            {key: "cargo", name: "cargo_id", placeholder: "Select. Cargo", options: "cargos", index: ["id", "id", "descripcion"]},
            {key: "type_categoria", name: "type_categoria_id", placeholder: "Select. Tip. Categoría", options: "type_categorias", index: ["id", "id", "descripcion"]},
            {key: "pay", name: "pago_id", placeholder: "Select. Medio de Pago", options: "pagos", index: ["key", "value", "text"]},
            {key: "afp", name: "afp_id", placeholder: "Select. Ley Social", options: "afps", index: ["afp_id", "afp_id", "afp"]},
            {key: "type_remuneracion", name: "type_remuneracion_id", placeholder: "Select. Tip. Remuneración", options: "type_remuneraciones", index: ["id", "id", "alias"]},
            {key: "type_descuento", name: "type_descuento_id", placeholder: "Select. Tip. Descuento", options: "type_descuentos", index: ["id", "id", "descripcion"]},
            {key: "type_detalle", name: "type_detalle_id", placeholder: "Select. Tip. Detalle", options: "type_detalles", index: ["id", "id", "descripcion"], buttons: ['detalle']},
            {key: "type_aportacion", name: "type_aportacion_id", placeholder: "Select. Aportación", options: "type_aportaciones", index: ["id", "id", "descripcion"]},
            {key: "neto", name: "neto", placeholder: "Select. Condición", options: "netos", index: ["key", "value", "text"]},
            {key: "negativo", name: "negativo", placeholder: "Select. Valores", options: "negativos", index: ["key", "value", "text"]},
        ],
        buttons: [
            {value: "general", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/general/{id}", params: ["id"], action: "link"},
            {value: "planilla", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/planilla/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "boleta", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/boleta/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "pay", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/pago/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "pay-txt", text: "Descargar txt", color: "gray", icon: "download", url: "pdf/pago/{id}?format=txt", params: ["id"], action: "blob", type: "text/plain", download: true},
            {value: "pay-csv", text: "Descargar csv", color: "olive", icon: "download", url: "pdf/pago/{id}?format=csv", params: ["id"], action: "blob", type: "text/csv", download: true},
            {value: "afp", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/afp/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "afp-net", text: "Descargar AFP NET", color: "olive", icon: "download", url: "pdf/afp_net/{id}", params: ["id"], action: "link"},
            {value: "remuneracion", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/remuneracion/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "descuento", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/descuento/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "judicial", text: "Lista Beneficiarios", color: "red", icon: "file text outline", url: "pdf/judicial/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "judicial-pay", text: "Generar Pagos", color: "red", icon: "file text outline", url: "pdf/judicial/{id}/pago", params: ["id"], action: "blob", type: "text/html"},
            {value: "judicial-pay-txt", text: "Generar txt Pagos", color: "gray", icon: "download", url: "pdf/judicial/{id}/pago?format=txt", params: ["id"], action: "blob", type: "text/plain", download: true},
            {value: "detalle", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/detalle/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "aportacion", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/aportacion/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "personal", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/personal/{id}", params: ["id"], action: "blob", type: "text/html"},
            {value: "ejecucion", text: "Generar PDF", color: "red", icon: "file text outline", url: "pdf/ejecucion/{id}", params: ["id"], action: "link"},
            {value: "ejecucion-pay", text: "Generar pago PDF", color: "red", icon: "file text outline", url: "pdf/ejecucion/{id}/pago", params: ["id"], action: "link"},
            {value: "ejecucion-total", text: "Generar eje. Total PDF", color: "red", icon: "file text outline", url: "pdf/ejecucion/{id}/total", params: ["id"], action: "link"},
        ],
        type_report_id: "",
        metas: [],
        meta_id: "",
        cargos: [],
        cargo_id: "",
        type_categorias: [],
        type_categoria_id: "",
        pagos: [
            {key: "pay-0", value: 0, text: "Pago por Cheque"},
            {key: "pay-1", value: 1, text: "Pago por Cuenta"}
        ],
        pago_id: 0,
        afps: [],
        afp_id: "",
        type_remuneraciones: [],
        type_remuneracion_id: "",
        type_descuentos: [],
        type_descuento_id: "",
        type_aportaciones: [],
        type_aportacion_id: "",
        type_detalles: [],
        type_detalle_id: "",
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
        select: {
            filtros: [],
            options: []
        }
    }

    componentDidMount = async () => {
        this.setState((state, props) => {
            let { cronograma } = props.cronograma;
            return { id: cronograma.id };
        });
        // settings
        this.getMetas();
        this.getCargos();
        this.getTypeCategorias();
        this.getTypeRemuneraciones();
        this.getTypeDescuentos();
        this.getTypeAportacion();
        this.getAfps();
        await this.getTypeDetalles();
    }

    componentWillUpdate = (nextProps, nextState) => {
        if (nextState.type_report_id != this.state.type_report_id) {
            this.setState({
                meta_id: "",
                cargo_id: "",
                type_categoria_id: "",
                type_remuneracion_id: "",
                type_descuento_id: "",
                type_aportacion_id: "",
                type_detalle_id: "",
                afp_id: "",
                pago_id: "",
                neto: "",
                negativo: ""
            });
        }
    }

    handleBack = (e) => {
        let { cronograma } = this.props.cronograma;
        let { pathname, push, query } = Router; 
        if (query.href) {
            push({ pathname: query.href, query });
        } else {
            let newQuery = { year: cronograma && cronograma.year, mes: cronograma && cronograma.mes };
            push({ pathname: backUrl(pathname), query: newQuery });
        }
    }

    handleFiltros = ({ name, value }, obj) => {
        this.setState({ [name]: value });
        let results = this.state.reports.filter(rep => rep.key == value);
        let newObj = results.length == 1 ? results[0] : {};
        let newFiltros = [];
        let newButtons = [];
        // obtener filtros
        newObj.filtros && newObj.filtros.filter(f => {
            this.state.filtros.filter(fil =>  fil.key == f ? newFiltros.push(fil) : null);
        });
        // obtener buttons
        newObj.buttons && newObj.buttons.filter(b => {
            this.state.buttons.filter(but => b == but.value ? newButtons.push(but) : null);
        });
        // agregar setstate
        this.setState(state => {
            state.select.filtros = newFiltros;
            state.select.options = newButtons;
            return { select: state.select }
        });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    handleClick = async (e, obj) => {
        this.props.fireLoading(true);
        if (obj.action == 'link') {
            let query = await this.genetateQuery();
            let link = await this.handleUrl(obj.url, obj.params);
            let form = document.createElement('form');
            let input = document.createElement('input');
            form.appendChild(input);
            // add credenciales
            InputCredencias().filter(i => form.appendChild(i));
            input.name = 'auth_token';
            input.value = this.props.auth_token;
            document.body.appendChild(form);
            form.action = `${unujobs.path}/${link}?${query}`;
            form.method = 'POST';
            form.target = '_blank';
            form.submit();
        } else if (obj.action == 'blob') {
            let params = await this.genetateQuery(false);
            let link = await this.handleUrl(obj.url, obj.params);
            await unujobs.post(link, params)
            .then(res => {
                let { message } = res.data;
                if (message) throw new Error(message);
                let array = res.headers['content-type'].split(';');
                let filename = array.length == 0 ? null : array[array.length == 1 ? 0 : array.length - 1];
                let a = document.createElement('a');
                let type = obj.type;
                let blob = new Blob([res.data], { type });
                a.href = URL.createObjectURL(blob);
                obj.download ? a.download = filename : null;
                a.target = '_blank';
                a.click();
            })
            .catch(err => Swal.fire({ icon: 'error', text:  err.message }));
        }   
        this.props.fireLoading(false);
    }

    handleUrl = async (url, params) => {
        let newUrl = "";
        for(let param of params) {
            newUrl = await url.replace(`{${param}}`, this.state[param]);
        }
        return newUrl;
    }

    genetateQuery = (_string = true) => {
        let query = ``;
        let regex = /_id$/;
        let index = 0;
        let payload = {};
        for(let obj in this.state) {
            if (regex.test(obj)) {
                query += index == 0 ? `${obj}=${this.state[obj]}` : `&${obj}=${this.state[obj]}`;
                payload[obj] = this.state[obj];
            }
            index++;
        }
        // except
        query += index == 0 ? `neto=${this.state.neto}` : `&neto=${this.state.neto}`;
        query += index == 0 ? `negativo=${this.state.negativo}` : `&negativo=${this.state.negativo}`;
        payload.neto = this.state.neto;
        payload.negativo = this.state.negativo;
        // response
        return _string ? query : payload;
    }

    getMetas = async () => {
        this.props.fireLoading(true);
        let { cronograma } = this.props.cronograma;
        await unujobs.get(`cronograma/${cronograma.id}/meta`)
        .then(res => this.setState({ metas: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getCargos = async () => {
        this.props.fireLoading(true);
        let { cronograma } = this.props.cronograma;
        await unujobs.get(`cronograma/${cronograma.id}/cargo`)
        .then(res => this.setState({ cargos: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getTypeCategorias = async () => {
        this.props.fireLoading(true);
        let { cronograma } = this.props.cronograma;
        await unujobs.get(`cronograma/${cronograma.id}/type_categoria`)
        .then(res => this.setState({ type_categorias: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getAfps = async () => {
        this.props.fireLoading(true);
        let { cronograma } = this.props.cronograma;
        await unujobs.get(`cronograma/${cronograma.id}/afp`)
        .then(res => this.setState({ afps: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getTypeRemuneraciones = async () => {
        this.props.fireLoading(true);
        let { cronograma } = this.props.cronograma;
        await unujobs.get(`cronograma/${cronograma.id}/afp`)
        .then(res => this.setState({ afps: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getTypeRemuneraciones = async () => {
        this.props.fireLoading(true);
        await unujobs.get('type_remuneracion?paginate=0')
        .then(res => this.setState({ type_remuneraciones: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getTypeDescuentos = async () => {
        this.props.fireLoading(true);
        let { cronograma } = this.props.cronograma;
        await unujobs.get(`cronograma/${cronograma.id}/type_descuento`)
        .then(res => this.setState({ type_descuentos: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getTypeDetalles = async () => {
        this.props.fireLoading(true);
        let { cronograma } = this.props.cronograma;
        await unujobs.get(`cronograma/${cronograma.id}/type_detalle`)
        .then(res => this.setState({ type_detalles: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getTypeAportacion = async () => {
        this.props.fireLoading(true);
        let { cronograma } = this.props.cronograma;
        await unujobs.get(`cronograma/${cronograma.id}/type_aportacion`)
        .then(res => this.setState({ type_aportaciones: res.data }))
        .catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    render() {

        let { cronograma } = this.props.cronograma;
        let { query } = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Form>
                        <div className="row">
                            <div className="col-md-3 mb-2">
                                <BtnBack onClick={this.handleBack}/> 
                            </div>

                            <div className="col-md-2 mb-1 col-6">
                                <Form.Field>
                                    <input type="text" 
                                        placeholder="Año" 
                                        disabled
                                        value={cronograma.year}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mb-1 col-6">
                                <Form.Field>
                                    <input type="text" 
                                        placeholder="Mes" 
                                        disabled
                                        value={cronograma.mes}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-3 mb-1">
                                <Form.Field>
                                    <input type="text" 
                                        placeholder="Planilla" 
                                        disabled
                                        value={cronograma.planilla && cronograma.planilla.nombre}
                                    />
                                </Form.Field>
                            </div>

                            <Show condicion={cronograma.adicional}>
                                <div className="col-md-2 mb-1">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Adicional" 
                                            disabled
                                            value={`Adicional ${cronograma.adicional}`}
                                        />
                                    </Form.Field>
                                </div>
                            </Show>
                        </div>
                    </Form>
                    <hr/>
                </Body>

                <div className="col-md-12">
                    <Body>
                        <Form loading={this.state.loading}>
                            <div className="row">
                                <div className="col-md-3 col-lg-3 mb-1">
                                    <Form.Field>
                                        <Select
                                            fluid
                                            placeholder="Select. Reporte"
                                            name="type_report_id"
                                            value={this.state.type_report_id || ""}
                                            options={this.state.reports}
                                            onChange={(e, obj, index) => this.handleFiltros(obj, obj)}
                                        />
                                    </Form.Field>
                                </div>

                                {this.state.select.filtros && this.state.select.filtros.map(obj => 
                                    <div className="col-md-3 mb-1" key={`filtro-${obj.key}`}>
                                        <Form.Field>
                                            <Select
                                                fluid
                                                disabled={!this.state.type_report_id}
                                                placeholder={obj.placeholder}
                                                name={obj.name}
                                                value={this.state[obj.name]}
                                                options={parseOptions(this.state[obj.options], [`sel-${obj.key}`, '', obj.placeholder], obj.index)}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </div>    
                                )}

                                <div className="col-md-12 text-center mt-5">
                                    <h1 className="mt-4" style={{ color: "#eee" }}>
                                        <i className="fas fa-file-alt" style={{ fontSize: "3em" }}></i>
                                        <br/>
                                        Reportes <br/> 
                                        del Cronograma <br/> 
                                        #{cronograma && cronograma.id}
                                    </h1>
                                </div>
                            </div>
                        </Form>
                    </Body>
                </div>

                <ContentControl>
                    <div className="col-md-3">
                        <BtnSelect
                            color="black"
                            fluid
                            options={this.state.select.options}
                            onClick={this.handleClick}
                            disabled={this.state.loading || !this.state.type_report_id}
                        />
                    </div>
                </ContentControl>

                <BtnFloat style={{ top: '60vh', background: "#cecece" }}
                    size="md"
                    onClick={(e) => {
                        let { push, pathname, query } = Router;
                        query.search_cronograma = true;
                        push({ pathname, query })
                    }}
                >
                    <i className="fas fa-search"></i>
                </BtnFloat>

                <Show condicion={query.search_cronograma}>
                    <SearchCronograma cronograma={cronograma}
                        isClose={e => {
                            let { push, pathname, query } = Router;
                            query.search_cronograma = null;
                            push({ pathname, query });
                        }}
                    />
                </Show>
            </div>
        )
    }

}