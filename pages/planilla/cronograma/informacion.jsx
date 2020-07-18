import React, { Component, Fragment } from 'react';
import { unujobs, authentication } from '../../../services/apis';
import { Form, Button, Select, Icon, Message } from 'semantic-ui-react';
import { Row } from 'react-bootstrap';
import { AUTHENTICATE } from '../../../services/auth';
import { findCronograma } from '../../../storage/actions/cronogramaActions';
import { parseOptions, parseUrl, Confirm, InputCredencias, InputAuth, InputEntity } from '../../../services/utils';
import Show from '../../../components/show';
import TabCronograma from '../../../components/cronograma/TabCronograma';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { responsive } from '../../../services/storage.json';
import { Body, BtnBack, DrownSelect, BtnFloat } from '../../../components/Utils';
import UpdateDesctMassive from '../../../components/cronograma/updateDesctMassive';
import ImpDescuento from '../../../components/cronograma/impDescuento';
import Open from '../../../components/cronograma/open';
import Cerrar from '../../../components/cronograma/close';
import { url } from '../../../env.json';
import SearchCronograma from '../../../components/cronograma/searchCronograma';

export default class CronogramaInformacion extends Component
{

    state = {
        loading: false,
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
        type_documents: [],
        export: true,
        active: 0,
        config_edad: {},
        situacion_laborals: []
    }

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { store, query, pathname } = ctx;
        await ctx.store.dispatch(findCronograma(ctx));
        let { cronograma } = store.getState().cronograma;
        query.active = query.active ? query.active : 0;
        query.page = query.page ? query.page : 1;
        return { pathname, query, cronograma }
    }

    async componentDidMount() {
        await this.setting(this.props);
        // obtener configuración basica
        this.getDocumentType();
        this.getBancos();
        this.getPlanillas();
        this.getUbigeo();
        this.getSituacionLaboral();
        // window
        if (typeof window == 'object') {
            this.setState({ screen: window.screen })
        }
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.cronograma != this.props.cronograma) await this.setting(nextProps);
    }

    componentWillUpdate = (nextProps, nextState) => {
        if (nextState.cronograma.planilla_id != this.state.cronograma.planilla_id) this.getCargos(nextState);
        if (nextState.cargo_id != "" && nextState.cargo_id != this.state.cargo_id) this.gettype_categorias(nextState);
        if (nextState.cargo_id == "" && nextState.cargo_id != this.state.cargo_id) this.setState({ type_categoria_id: "", type_categorias: [] });
        if (nextProps.show != this.props.show && nextProps.show && !Object.keys(nextState.historial).length) this.getCronograma(nextProps, nextState);
    }

    setting = (props) => {
        let { cronograma, historial, aportaciones, descuentos, remuneraciones, config_edad } = props.cronograma;
        let { query, fireLoading, fireEntity } = this.props;
        fireLoading(false);
        fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
        // set state
        this.setState({
            cronograma,
            historial: historial.data, 
            total: historial.total, 
            last_page: historial.last_page,
            remuneraciones,
            descuentos,
            aportaciones,
            page: query.page ? parseInt(query.page) : 1,
            like: query.like ? query.like : "",
            cargo_id: query.cargo_id ? parseInt(query.cargo_id) : "",
            type_categoria_id: query.type_categoria_id ? parseInt(query.type_categoria_id) : "",
            export: true,
            active: props.query.active,
            config_edad
        });
    }

    getDocumentType = async () => {
        await authentication.get('get_document_type')
        .then(res => this.setState({ type_documents: res.data }))
        .catch(err => console.log(err.message));
    }

    getUbigeo = async () => {
        await authentication.get('badge')
        .then(res => this.setState({ ubigeos: res.data }))
        .catch(err => console.log(err.message));
    }

    getPlanillas = async () => {
        this.props.fireLoading(true);
        await unujobs.get(`planilla`)
        .then(res => {
            let planillas = res.data ? res.data : []
            this.setState({ planillas });
        }).catch(err => console.log(err.message));
        this.props.fireLoading(false);
    }

    getSituacionLaboral = async (page = 1) => {
        await unujobs.get(`situacion_laboral?page=${page}`)
        .then(res => {
            let { last_page, data } = res.data;
            this.setState(state => ({ situacion_laborals: [...state.situacion_laborals, ...data] }));
            if (last_page > page + 1) this.getSituacionLaboral(page + 1);
        })
        .catch(err => console.log(err.message));
    }

    getBancos = () => {
        unujobs.get(`banco`)
        .then(res => this.setState({ bancos: res.data }))
        .catch(err => console.log(err.message));
    }

    handleInput = e => {
        let { name, value } = e.target;
        this.setState({ [name]: value, export: false });
    }

    handleSelect = (e, { name, value }) => {
        this.setState({ [name]: value, export: false });
    }

    readCronograma = async (e) => {
        if (!this.state.edit) {
            let { pathname, query } = Router;
            query.like = this.state.like;
            query.page = 1;
            query.cargo_id = this.state.cargo_id;
            query.type_categoria_id = this.state.type_categoria_id;
            Router.push({ pathname, query });
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
        let { last_page, edit } = this.state;
        let { page } = this.props.query;
        if (!edit) {
            if (parseInt(page) < last_page) {
                await this.setState((state, props) => ({ page: parseInt(page) + 1 }));
                let { push, pathname, query } = Router;
                query.page = this.state.page;
                query.active = this.state.active;
                push({ pathname, query });
            }else {
                Swal.fire({ icon: "warning", text: "No hay más registros" });
            }
        } else {
            this.getAlert();
        }
    }

    previus = async (e) => {
        let { edit } = this.state;
        let { page } = this.props.query;
        if (!edit) {
            if (parseInt(page) > 1) {
                await this.setState(state => ({ page: parseInt(page) - 1 }));
                let { push, pathname, query } = Router;
                query.page = this.state.page;
                query.active = this.state.active;
                push({ pathname, query });
            }else {
                Swal.fire({ icon: "warning", text: "No hay más registros" });
            }
        } else {
            this.getAlert();
        }
    }

    setLoading = async (value) => {
        await this.props.fireLoading(value);
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
        let { push, query, pathname } = Router;
        query.active = this.state.active;
        this.setState({ send: false, edit: false });
        await push({ pathname, query });
    }

    handleConfirm = async (e) => {
        let { value } = await Swal.fire({ 
            icon: 'warning',
            text: "¿Deseas guardar los cambios?",
            confirmButtonText: "Continuar",
            showCancelButton: true
        });
        if (value) {
            this.props.fireLoading(true);
            await this.setState({ send: true });
        }
    }

    handleClose = async () => {
        let { push, pathname } = Router;
        let options = { year: this.state.cronograma.year, mes: this.state.cronograma.mes };
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({  pathname: newPath.join('/'), query: options });
    }

    handleBack = () => {
        let { push, pathname, query } = Router;
        let { cronograma } = this.state;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({ pathname: newPath.join('/'), query: { year: cronograma.year, mes: cronograma.mes  }});
    }

    handleExport = async () => {
        let answer = await Confirm('warning', '¿Deseas exportar?', 'Exportar');
        if (answer) {
            this.props.fireLoading(true);
            let { cronograma, cargo_id, type_categoria_id, like } = this.state;
            let query = `cronograma_id=${cronograma.id}&cargo_id=${cargo_id}&type_categoria_id=${type_categoria_id}&query_search=${like}`;
            await unujobs.fetch(`exports/personal/${cronograma.year}/${cronograma.mes}?${query}`)
            .then(resData => resData.blob())
            .then(blob => {
                let a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.target = "_blank";
                a.click();
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }))
            this.props.fireLoading(false);
        }

    }

    handleActive = (e, data) => {
        this.setState({ active: data.activeIndex });
    }

    handleOnSelect = async (e, { name }) => {
        let { push, pathname, query } = Router;
        switch (name) {
            case 'desc-massive':
                query.desc_massive = 1;
                await push({ pathname, query });
                break;
            case 'report':
                query.href = pathname;
                await push({ pathname: parseUrl(pathname, 'report'), query });
                break;
            case 'sync-remuneracion':
                await this.syncRemuneracion();
                break;
            case 'sync-aportacion':
                await this.syncAportacion();
                break;
            case 'processing':
                await this.processing();
                break;
            case 'sync-config':
                await this.syncConfigs();
                break;
            case 'generate-token':
                await this.generateToken();
                break;
            case 'imp-descuento':
                query.imp_descuento = 1;
                await push({ pathname, query });
            default:
                break;
        }
    }

    getHeaders = (state) => {
        let { cronograma } = state;
        return {
            CronogramaID: cronograma.id
        }
    }

    syncRemuneracion = async () => {
        let response = await Confirm("warning", "¿Desea agregar las remuneraciones a los trabajadores?", "Confirmar");
        if (response) {
            this.props.fireLoading(true);
            let { cronograma } = this.state;
            await unujobs.post(`cronograma/${cronograma.id}/add_remuneracion`, {}, { headers: this.getHeaders(this.state) })
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.props.fireLoading(false);
        }
    }

    syncAportacion = async () => {
        let response = await Confirm("warning", "¿Desea agregar las aportaciones a los trabajadores?", "Confirmar");
        if (response) {
            this.props.fireLoading(true);
            let { cronograma } = this.state;
            await unujobs.post(`cronograma/${cronograma.id}/add_aportacion`, {}, { headers: this.getHeaders(this.state) })
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.props.fireLoading(false);
        }
    }

    processing = async () => {
        let response = await Confirm("warning", "¿Desea procesar el Cronograma?", "Confirmar");
        if (response) {
            this.props.fireLoading(true);
            await unujobs.post(`cronograma/${this.state.cronograma.id}/processing`, {}, { headers: this.getHeaders(this.state) })
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                // volver a obtener los datos
                if (success) {
                    await this.updatingHistorial();
                }
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.props.fireLoading(false);
        }
    }

    syncConfigs = async () => {
        let response = await Confirm("warning", "¿Desea Sincronizar las Configuraciones?", "Confirmar");
        if (response) {
            this.props.fireLoading(true);
            let { cronograma } = this.state;
            await unujobs.post(`cronograma/${cronograma.id}/sync_configs`, {}, { headers: this.getHeaders(this.state) })
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                // volver a obtener los datos
                if (success) {
                    await this.updatingHistorial();
                }
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.props.fireLoading(false);
        }
    }

    generateToken = async () => {
        let response = await Confirm("warning", "¿Desea Generar los tokens de las boletas?", "Confirmar");
        if (response) {
            this.props.fireLoading(true);
            await unujobs.post(`cronograma/${this.state.cronograma.id}/generate_token`, {}, { headers: this.getHeaders(this.state) })
            .then(async res => {
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                // volver a obtener los datos
                if (success) {
                    await this.updatingHistorial();
                }
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.props.fireLoading(false);
        }
    }

    verifyBoleta = async (e) => {
        e.preventDefault();
        let answer = await Confirm('warning', '¿Desea visualizar la boleta verificada del trabajador actual?', 'Ir');
        if (answer) {
            let { historial } = this.state;
            let token_verify = document.createElement('input');
            token_verify.name = 'token_verify';
            token_verify.value = historial && historial.token_verify || "";
            token_verify.hidden = true;
            let form = document.createElement('form');
            document.body.appendChild(form);
            // add credenciales
            InputCredencias().filter(i => form.appendChild(i));
            // add token_auth
            form.appendChild(token_verify);
            form.action = `${unujobs.path + `/my_boleta` || ""}`;
            form.method = 'POST';
            form.target = '_blank';
            form.submit();
            document.body.removeChild(form);
        }
    }

    linkRenta = async (e) => {
        e.preventDefault();
        let { historial, cronograma } = this.state;
        let form = document.createElement('form');
        document.body.appendChild(form);
        // add credenciales
        InputCredencias().filter(i => form.appendChild(i));
        // add entityID
        form.appendChild(InputEntity());
        // add auth_token
        form.appendChild(InputAuth());
        form.action = `${unujobs.path + '/pdf/renta/' + historial.work_id + '?year=' + cronograma.year || ""}`;
        form.method = 'POST';
        form.target = '_blank';
        form.submit();
        document.body.removeChild(form);
    }

    render() {

        let { cronograma, historial, planillas, cargos, type_categorias, loading, cargo_id, type_categoria_id, config_edad, situacion_laborals } = this.state;
        let { query, isLoading } = this.props;

        return (
            <Fragment>
                    <div className="col-md-12 form ui">
                        <Body>
                            <div className="row pl-2 pr-2">
                                <div className="col-md-2 col-4">
                                    <BtnBack onClick={this.handleBack}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="col-md-2 col-4 mb-1">
                                    <Form.Field>
                                        <input type="number"  
                                            placeholder="Año"
                                            value={cronograma.year}
                                            disabled={true}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-2 col-4 mb-1">
                                    <Form.Field>
                                        <input type="number" 
                                            placeholder="Mes"
                                            value={cronograma.mes}
                                            disabled={true}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 col-12 mb-1 col-sm-3">
                                    <Select placeholder='Select. Planilla' 
                                        fluid
                                        options={parseOptions(planillas, ['sel-afp', '', 'Select. Planilla'], ['id', 'id', 'nombre'])} 
                                        value={cronograma.planilla_id}
                                        disabled={true}
                                    />
                                </div>

                                <Show condicion={cronograma.adicional}>
                                    <div className="col-md-3 col-12 mb-1">
                                        <Form.Field>
                                            <input type="text" 
                                                value={`Adicional ${cronograma.adicional}`}
                                                disabled
                                            />
                                        </Form.Field>
                                    </div>
                                </Show>
                            </div>

                            <div className="col-md-12 mt-3">
                                <hr/>
                                <div className="card-" style={{ minHeight: "80vh" }}>
                                    <div className="card-header">
                                        {/* mensaje cuando el trabajador tiene saldo negativo o neutro */}
                                        <Show condicion={historial.total_neto < 0}>
                                            <Message color="red">
                                                El trabajador tiene saldo negativo de ({historial.total_neto})
                                            </Message>
                                        </Show>
                                        {/* mensaje cuando el trabajador superó el limite de edad */}
                                        <Show condicion={config_edad && config_edad.valido == 0}>
                                            <Message color="yellow">
                                                El trabajador ya superó el limite de edad({config_edad.limite_edad}) establecido en la partición presupuestal.
                                            </Message>
                                        </Show>
                                        {/* mensaje cuento el cronograma esta cerrado y el trabajador no tiene generado su token */}
                                        <Show condicion={historial && cronograma && historial.total && !cronograma.estado && !historial.token_verify}>
                                            <Message color="orange">
                                                Falta generar el token de verificación del trabajador
                                            </Message>
                                        </Show>
                                        <div className="row align-items-center">
                                            <div className="col-md-1 text-center mb-3">
                                                <img src={ historial.person && historial.person.image_images && historial.person.image_images.image_200x200 || '/img/perfil.jpg' } 
                                                    alt="imagen_persona"
                                                    style={{ 
                                                        width: "75px", 
                                                        height: "75px", 
                                                        border: "5px solid #fff", 
                                                        borderRadius: "50%",
                                                        boxShadow: "0px 0px 1px 2px rgba(0, 0, 0, 0.1)",
                                                        objectFit: 'cover'
                                                    }}    
                                                />
                                            </div>
                                            <div className="col-md-8 col-lg-8 mb-2">
                                                <Show condicion={historial.token_verify}>
                                                    <a href="#" title="Boleta verificada"
                                                        onClick={this.verifyBoleta}
                                                    >
                                                        <i className="fas fa-qrcode text-warning mr-2"></i>
                                                        <span className="text-dark">BOLETA DE "{historial.person ? historial.person.fullname : "NO HAY TRABAJADOR"}"</span>
                                                    </a>
                                                </Show>
                                                <Show condicion={!historial.token_verify}>
                                                    <i className="fas fa-info-circle"></i> INFORMACIÓN DE "{historial.person ? historial.person.fullname : "NO HAY TRABAJADOR"}"
                                                </Show> 
                                                
                                                {/* link temporarl del reporte de renta */}
                                                <Show condicion={historial.work_id}>
                                                    <a href="#" className="ml-3" title="Reporte de Renta"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={this.linkRenta}
                                                    >
                                                        <i className="fas fa-link"></i>
                                                    </a>
                                                </Show>
                                            </div>

                                            <div className="col-md-3 text-center">
                                                {/* cronograma abierta */}
                                                <Show condicion={cronograma.estado}>
                                                    <DrownSelect text="Opciones"
                                                        button
                                                        icon="options"
                                                        labeled
                                                        disabled={isLoading|| this.state.edit}
                                                        options={[
                                                            { key: "desc-massive", text: "Descuento Masivo", icon: "cart arrow down" },
                                                            { key: "sync-remuneracion", text: "Agregar Remuneraciones", icon: "arrow circle down" },
                                                            { key: "sync-aportacion", text: "Agregar Aportaciones", icon: "arrow circle down" },
                                                            { key: "sync-config", text: "Sync. Configuraciones", icon: "cloud download" },
                                                            { key: "imp-descuento", text: "Importar Descuentos", icon: "cloud upload" },
                                                            { key: "processing", text: "Procesar Cronograma", icon: "database" },
                                                            { key: "report", text: "Reportes", icon: "file text outline" },
                                                        ]}
                                                        onSelect={this.handleOnSelect}
                                                    />
                                                </Show>
                                                {/* cronograma cerrada */}
                                                <Show condicion={!cronograma.estado}>
                                                    <DrownSelect text="Opciones"
                                                        button
                                                        icon="options"
                                                        labeled
                                                        disabled={isLoading || this.state.edit}
                                                        options={[
                                                            { key: "generate-token", text: "Generar Token", icon: "cloud upload" },
                                                            { key: "report", text: "Reportes", icon: "file text outline" },
                                                        ]}
                                                        onSelect={this.handleOnSelect}
                                                    />
                                                </Show>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-body" style={{ marginBottom: "10em" }}>
                                                <Row>
                                                    <div className="col-md-6 col-lg-3 col-12 col-sm-6 mb-1">
                                                        <Form.Field> 
                                                            <input type="search" 
                                                                className={`${this.state.like ? 'border-dark text-dark' : ''}`}
                                                                disabled={isLoading || this.state.edit || this.state.block}
                                                                value={this.state.like}
                                                                onChange={this.handleInput}
                                                                name="like"
                                                                placeholder="Buscar por Apellidos y Nombres"
                                                            />  
                                                        </Form.Field>
                                                    </div>

                                                    <div className="col-md-6 col-12 mb-1 col-sm-6 col-lg-3">
                                                        <Form.Field>
                                                            <Select placeholder='Select. Cargo'
                                                                fluid 
                                                                options={parseOptions(cargos, ['sel-car', '', 'Select. Cargo'], ['id', 'id', 'descripcion'])} 
                                                                disabled={isLoading || this.state.edit || this.state.block}
                                                                value={cargo_id}
                                                                name="cargo_id"
                                                                onChange={this.handleSelect}
                                                            />
                                                        </Form.Field>
                                                    </div>
                                                    
                                                    <div className="col-md-6 col-sm-6 col-lg-2 mb-1 col-12">
                                                        <Select placeholder='Select. Categoría' 
                                                            fluid
                                                            options={parseOptions(type_categorias, ['sel-cat', '', 'Select. Categoría'], ['id', 'id', 'descripcion'])}
                                                            disabled={isLoading || this.state.edit || this.state.block}
                                                            value={type_categoria_id}
                                                            name="type_categoria_id"
                                                            onChange={this.handleSelect}
                                                        />
                                                    </div>
                                                    
                                                    <div className="col-md-3 col-lg-2 col-6 mb-1">
                                                        <Button color="black"
                                                            fluid
                                                            onClick={this.readCronograma}
                                                            title="Realizar Búsqueda"
                                                            disabled={isLoading || this.state.edit || this.state.block || this.state.export}
                                                        >
                                                            <Icon name="filter"/> Filtrar
                                                        </Button>
                                                    </div>

                                                    <div className="col-md-3 col-lg-2 col-6 mb-1">
                                                        <Button color="olive"
                                                            fluid
                                                            onClick={this.handleExport}
                                                            title="Realizar Búsqueda"
                                                            disabled={isLoading || this.state.edit || this.state.block || !this.state.export}
                                                        >
                                                            <Icon name="share"/> Export
                                                        </Button>
                                                    </div>
                                                    
                                                    <Show condicion={this.state.total}>
                                                        <TabCronograma
                                                            type_documents={this.state.type_documents}
                                                            situacion_laborals={situacion_laborals}
                                                            historial={historial}
                                                            remuneraciones={this.state.remuneraciones}
                                                            descuentos={this.state.descuentos}
                                                            aportaciones={this.state.aportaciones}
                                                            bancos={this.state.bancos}
                                                            ubigeos={this.state.ubigeos}
                                                            edit={this.state.edit}
                                                            loading={isLoading}
                                                            send={this.state.send}
                                                            total={this.state.total}
                                                            setSend={this.setSend}
                                                            setEdit={this.setEdit}
                                                            setLoading={this.setLoading}
                                                            updatingHistorial={this.updatingHistorial}
                                                            menu={{ attached: true, tabular: true }}
                                                            screenX={this.props.screenX}
                                                            activeIndex={this.state.active}
                                                            onTabChange={this.handleActive}
                                                        />  
                                                    </Show>          
                                                    
                                                    <Show condicion={!isLoading && !this.state.total}>
                                                        <div className="w-100 text-center">
                                                            <h4 className="mt-5">No se encontró trabajadores</h4>
                                                        </div>
                                                    </Show>                    
                                                </Row>
                                        </div>
                                    </div>
                                </div>
                        </Body>
                    </div>

                    <div className="nav-bottom">
                        <div className="row justify-content-end">
                            <div className="col-md-4 col-lg-3 col-sm-2 col-12"></div>

                            <div className="col-md-5 col-lg-5 col-sm-5 col-12">
                                <div className="row">
                                    <Show condicion={!this.state.total}>
                                        <div className="col-md-4 mb-1">   
                                            <Button color="red"
                                                disabled={isLoading}
                                                onClick={this.clearSearch}
                                                fluid
                                            >
                                                <i className="fas fa-trash"></i> Limpiar
                                            </Button>
                                        </div>
                                    </Show>

                                    <Show condicion={!this.state.edit && this.state.total}>
                                        <div className="col-md-12 mb-1 col-sm-12 col-12">
                                            <div className="row">
                                                <div className="col-md-4 col-ms-4 col-4">
                                                    <Button  
                                                        color="black"
                                                        disabled={isLoading || this.state.edit || this.state.block}
                                                        onClick={this.previus}
                                                        fluid
                                                    >
                                                        <Icon name="triangle left"/>
                                                    </Button>
                                                </div>

                                                <Show condicion={this.state.total}>
                                                    <div className="col-md-4 col-4 mb-1">
                                                        <Button color="black"
                                                            fluid
                                                            disabled={isLoading}
                                                        >
                                                            {this.props.query && this.props.query.page} de {this.state.total}
                                                        </Button>
                                                    </div>
                                                </Show>

                                                <div className="col-md-4 col-4 col-sm-4">
                                                    <Button 
                                                        fluid
                                                        color="black"
                                                        disabled={isLoading || this.state.edit || this.state.block}
                                                        onClick={this.next}
                                                    >
                                                        <Icon name="triangle right"/>
                                                    </Button>    
                                                </div>      
                                            </div>    
                                        </div>
                                    </Show>
                                </div>
                            </div>

                            <Show condicion={cronograma.estado}>                     
                                <div className="col-md-3 col-lg-4 col-sm-5 col-12">
                                    <div className="row justify-content-end">
                                        <Show condicion={this.state.edit}>
                                            <div className="col-md-6 mb-1 col-6">
                                                <Button
                                                    fluid
                                                    color="blue"
                                                    loading={this.state.send}
                                                    disabled={isLoading || !this.state.edit || this.state.block}
                                                    onClick={this.handleConfirm}
                                                >
                                                    <i className="fas fa-save mr-1"></i>
                                                    <Show condicion={this.props.screenX > responsive.md}>
                                                        Guardar
                                                    </Show>
                                                </Button>    
                                            </div>                
                                        </Show>

                                        <Show condicion={!this.state.edit}>
                                            <div className="col-md-6 mb-1 col-6">
                                                <Button
                                                    color="red"
                                                    basic
                                                    fluid
                                                    disabled={isLoading}
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        let { push, pathname, query } = Router;
                                                        query.cerrar = true;
                                                        push({ pathname, query });
                                                    }}
                                                >
                                                    <i className="fas fa-lock mr-1"></i>
                                                    <Show condicion={this.props.screenX > responsive.md}>
                                                        Cerrar
                                                    </Show>
                                                </Button>    
                                            </div>                
                                        </Show>

                                        <Show condicion={this.state.total && cronograma.estado}>
                                            <div className={`col-md-6 ${this.state.edit ? 'col-6' : 'col-6 col-sm-12'}`}>
                                                <Button color={this.state.edit ? 'red' : 'teal'}
                                                    disabled={isLoading || this.state.block || this.state.send}
                                                    onClick={(e) => this.setState(state => ({ edit: !state.edit }))}
                                                    fluid
                                                >
                                                    <i className={this.state.edit ? 'fas fa-times mr-1' : 'fas fa-pencil-alt mr-1'}></i> 
                                                    <Show condicion={this.props.screenX > responsive.md}>
                                                        {this.state.edit ? 'Cancelar' : 'Editar'}
                                                    </Show>
                                                </Button>
                                            </div>
                                        </Show>
                                    </div>
                                </div>
                            </Show>

                            <Show condicion={this.state.total && !cronograma.estado}>
                                <div className="col-md-2 mb-1 col-6">
                                    <Button
                                        fluid
                                        disabled={isLoading || this.state.block || cronograma.year != new Date().getFullYear() || cronograma.mes != (new Date().getMonth() + 1)}
                                        onClick={e => {
                                            e.preventDefault();
                                            let { push, pathname, query } = Router;
                                            query.open = true;
                                            push({ pathname, query });
                                        }}
                                    >
                                        <Icon name="unlock"/> Abrir
                                    </Button>
                                </div>
                            </Show>
                        
                            <Show condicion={this.state.total && !cronograma.estado}>
                                <div className="col-md-2 mb-1 col-6">
                                    <Button
                                        fluid
                                        color="orange"
                                        disabled={isLoading || this.state.block || !historial.is_email}
                                        onClick={this.sendEmail}
                                    >
                                        <Icon name="send"/> { this.state.send ? 'Enviando...' : 'Enviar Email' }
                                    </Button>
                                </div>
                            </Show>
                        </div>              
                    </div>
               

                <BtnFloat style={{ bottom: '120px', background: "#cecece" }}
                    size="md"
                    onClick={(e) => {
                        let { push, pathname, query } = Router;
                        query.search_cronograma = true;
                        push({ pathname, query })
                    }}
                >
                    <i className="fas fa-search"></i>
                </BtnFloat>

                <Show condicion={query.desc_massive}>
                    <UpdateDesctMassive isClose={(e) => {
                        let { push, pathname, query } = Router;
                        query.desc_massive = null;
                        push({ pathname, query });
                    }}/>
                </Show>

                <Show condicion={query.imp_descuento}>
                    <ImpDescuento isClose={(e) => {
                        let { push, pathname, query } = Router;
                        query.imp_descuento = null;
                        push({ pathname, query });
                    }}/>
                </Show>

                <Show condicion={query.open}>
                    <Open cronograma={this.state.cronograma}
                        isClose={e => {
                            let { push, pathname, query } = Router;
                            query.open = null;
                            push({ pathname, query });
                        }}
                    />
                </Show>

                <Show condicion={query.cerrar}>
                    <Cerrar cronograma={this.state.cronograma}
                        isClose={e => {
                            let { push, pathname, query } = Router;
                            query.cerrar = null;
                            push({ pathname, query });
                        }}
                    />
                </Show>

                <Show condicion={query.search_cronograma}>
                    <SearchCronograma cronograma={this.state.cronograma}
                        isClose={e => {
                            let { push, pathname, query } = Router;
                            query.search_cronograma = null;
                            push({ pathname, query });
                        }}
                    />
                </Show>
            </Fragment>
        )
    }

}


                                                
                                        

                                            