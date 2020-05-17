import React, { Component, Fragment } from 'react';
import { unujobs, authentication } from '../../../services/apis';
import { Form, Button, Select, Icon } from 'semantic-ui-react';
import { Row } from 'react-bootstrap';
import { AUTHENTICATE } from '../../../services/auth';
import { findCronograma } from '../../../storage/actions/cronogramaActions';
import { parseOptions, parseUrl, Confirm } from '../../../services/utils';
import Show from '../../../components/show';
import TabCronograma from '../../../components/cronograma/TabCronograma';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { responsive } from '../../../services/storage.json';
import { Body, BtnBack, DrownSelect } from '../../../components/Utils';
import UpdateDesctMassive from '../../../components/cronograma/updateDesctMassive';
import ImpDescuento from '../../../components/cronograma/impDescuento';
import Open from '../../../components/cronograma/open';
import Cerrar from '../../../components/cronograma/close';

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
        active: 0
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
        // window
        if (typeof window == 'object') {
            this.setState({ screen: window.screen })
        }
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps != this.props) await this.setting(nextProps);
    }

    componentWillUpdate = (nextProps, nextState) => {
        if (nextState.cronograma.planilla_id != this.state.cronograma.planilla_id) this.getCargos(nextState);
        if (nextState.cargo_id != "" && nextState.cargo_id != this.state.cargo_id) this.gettype_categorias(nextState);
        if (nextState.cargo_id == "" && nextState.cargo_id != this.state.cargo_id) this.setState({ type_categoria_id: "", type_categorias: [] });
        if (nextProps.show != this.props.show && nextProps.show && !Object.keys(nextState.historial).length) this.getCronograma(nextProps, nextState);
    }

    setting = (props) => {
        let { cronograma, historial, aportaciones, descuentos, remuneraciones } = props.cronograma;
        let { query } = this.props;
        this.setState({
            cronograma: cronograma, 
            historial: historial.data, 
            total: historial.total, 
            last_page: historial.last_page,
            remuneraciones,
            descuentos,
            aportaciones,
            loading: false,
            page: query.page ? parseInt(query.page) : 1,
            like: query.like ? query.like : "",
            cargo_id: query.cargo_id ? parseInt(query.cargo_id) : "",
            type_categoria_id: query.type_categoria_id ? parseInt(query.type_categoria_id) : "",
            export: true,
            active: props.query.active
        });
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

    handleInput = e => {
        let { name, value } = e.target;
        this.setState({ [name]: value, export: false });
    }

    handleSelect = (e, { name, value }) => {
        this.setState({ [name]: value, export: false });
    }

    readCronograma = async (e) => {
        if (!this.state.edit) {
            await this.setState({ loading: true });
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
                await this.setState((state, props) => ({ page: parseInt(page) + 1, loading: true }));
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
                await this.setState(state => ({ page: parseInt(page) - 1, loading: true }));
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
        let { push, query, pathname } = Router;
        query.active = this.state.active;
        await push({ pathname, query });
        this.setState({ send: false, edit: false });
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

    handleClose = async () => {
        let { push, pathname } = Router;
        let options = { year: this.state.cronograma.year, mes: this.state.cronograma.mes };
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({  pathname: newPath.join('/'), query: options });
    }

    handleBack = () => {
        this.setState({ loading: true });
        let { push, pathname, query } = Router;
        let { cronograma } = this.state;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({ pathname: newPath.join('/'), query: { year: cronograma.year, mes: cronograma.mes  }});
    }

    handleExport = async () => {
        this.setState({ loading: true });
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
        this.setState({ loading: false });
    }

    handleActive = (e, data) => {
        this.setState({ active: data.activeIndex });
    }

    handleOnSelect = async (e, { name }) => {
        this.setState({ loading: true });
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
            case 'sync-afp':
                await this.syncAfp();
                break;
            case 'imp-descuento':
                query.imp_descuento = 1;
                await push({ pathname, query });
            default:
                break;
        }
        // end loading
        this.setState({ loading: false });
    }

    syncRemuneracion = async () => {
        let response = await Confirm("warning", "¿Desea agregar las remuneraciones a los trabajadores?", "Confirmar");
        if (response) {
            this.setState({ loading: true });
            await unujobs.post(`cronograma/${this.state.cronograma.id}/add_remuneracion`)
            .then(async res => {
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.setState({ loading: false });
        }
    }

    syncAportacion = async () => {
        let response = await Confirm("warning", "¿Desea agregar las aportaciones a los trabajadores?", "Confirmar");
        if (response) {
            this.setState({ loading: true });
            await unujobs.post(`cronograma/${this.state.cronograma.id}/add_aportacion`)
            .then(async res => {
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.setState({ loading: false });
        }
    }

    processing = async () => {
        let response = await Confirm("warning", "¿Desea procesar el Cronograma?", "Confirmar");
        if (response) {
            this.setState({ loading: true });
            await unujobs.post(`cronograma/${this.state.cronograma.id}/processing`)
            .then(async res => {
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                // volver a obtener los datos
                if (success) {
                    await this.updatingHistorial();
                }
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.setState({ loading: false });
        }
    }

    syncAfp = async () => {
        let response = await Confirm("warning", "¿Desea Sincronizar las Leyes Sociales?", "Confirmar");
        if (response) {
            this.setState({ loading: true });
            await unujobs.post(`config_afp/sync/${this.state.cronograma.id}`)
            .then(async res => {
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                // volver a obtener los datos
                if (success) {
                    await this.updatingHistorial();
                }
            }).catch(err => Swal.fire({ icon: 'error', text: 'Algo salió mal' }))
            this.setState({ loading: false });
        }
    }

    render() {

        let { cronograma, historial, planillas, cargos, type_categorias, loading, cargo_id, type_categoria_id } = this.state;
        let { pathname, query } = this.props;

        return (
            <Fragment>
                <Form className="col-md-12" disabled={loading} onSubmit={(e) => e.preventDefault()}>
                    <Body>
                        <div className="row pl-2 pr-2">
                            <div className="col-md-2 col-4">
                                <BtnBack onClick={this.handleBack}
                                    disabled={this.state.loading}
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
                            <div className="card-" style={{ minHeight: "80vh" }}>
                                <div className="card-header">
                                    <div className="row align-items-center">
                                        <div className="col-md-9 mb-2">
                                            <i className="fas fa-info-circle"></i> INFORMACIÓN DE "{historial.person ? historial.person.fullname : "NO HAY TRABAJADOR"}"
                                        </div>

                                        <div className="col-md-3 text-center">
                                            <DrownSelect text="Opciones"
                                                button
                                                icon="options"
                                                labeled
                                                disabled={this.state.loading || this.state.edit}
                                                options={[
                                                    { key: "desc-massive", text: "Descuento Masivo", icon: "cart arrow down" },
                                                    { key: "sync-remuneracion", text: "Agregar Remuneraciones", icon: "arrow circle down" },
                                                    { key: "sync-aportacion", text: "Agregar Aportaciones", icon: "arrow circle down" },
                                                    { key: "sync-afp", text: "Sync Leyes Sociales", icon: "cloud download" },
                                                    { key: "imp-descuento", text: "Importar Descuentos", icon: "cloud upload" },
                                                    { key: "processing", text: "Procesar Cronograma", icon: "database" },
                                                    { key: "report", text: "Reportes", icon: "file text outline" },
                                                ]}
                                                onSelect={this.handleOnSelect}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body" style={{ marginBottom: "10em" }}>
                                        <Form loading={loading}>
                                            <Row>
                                                <div className="col-md-6 col-lg-3 col-12 col-sm-6 mb-1">
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

                                                <div className="col-md-6 col-12 mb-1 col-sm-6 col-lg-3">
                                                    <Form.Field>
                                                        <Select placeholder='Select. Cargo'
                                                            fluid 
                                                            options={parseOptions(cargos, ['sel-car', '', 'Select. Cargo'], ['id', 'id', 'descripcion'])} 
                                                            disabled={loading || this.state.edit || this.state.block}
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
                                                        disabled={loading || this.state.edit || this.state.block}
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
                                                        disabled={loading || this.state.edit || this.state.block || this.state.export}
                                                    >
                                                        <Icon name="filter"/> Filtrar
                                                    </Button>
                                                </div>

                                                <div className="col-md-3 col-lg-2 col-6 mb-1">
                                                    <Button color="olive"
                                                        fluid
                                                        onClick={this.handleExport}
                                                        title="Realizar Búsqueda"
                                                        disabled={loading || this.state.edit || this.state.block || !this.state.export}
                                                    >
                                                        <Icon name="share"/> Export
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
                                                        menu={{ attached: true, tabular: true }}
                                                        screenX={this.props.screenX}
                                                        activeIndex={this.state.active}
                                                        onTabChange={this.handleActive}
                                                    />  
                                                </Show>          
                                                
                                                <Show condicion={!this.state.loading && !this.state.total}>
                                                    <div className="w-100 text-center">
                                                        <h4 className="mt-5">No se encontró trabajadores</h4>
                                                    </div>
                                                </Show>                    
                                            </Row>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                    </Body>
                </Form>

                <div className="nav-bottom">
                    <div className="row justify-content-end">
                        <div className="col-md-4 col-lg-3 col-sm-2 col-12"></div>

                        <div className="col-md-5 col-lg-5 col-sm-5 col-12">
                            <div className="row">
                                <Show condicion={!this.state.total}>
                                    <div className="col-md-4 mb-1">   
                                        <Button color="red"
                                            disabled={loading}
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
                                                    disabled={loading || this.state.edit || this.state.block}
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
                                                        disabled={this.state.loading}
                                                    >
                                                        {this.props.query && this.props.query.page} de {this.state.total}
                                                    </Button>
                                                </div>
                                            </Show>

                                            <div className="col-md-4 col-4 col-sm-4">
                                                <Button 
                                                    fluid
                                                    color="black"
                                                    disabled={loading || this.state.edit || this.state.block}
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
                                                disabled={loading || !this.state.edit || this.state.block}
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
                                                disabled={loading}
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
                                                disabled={loading || this.state.block || this.state.send}
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
                                    disabled={loading || this.state.block}
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
                                    disabled={loading || this.state.block}
                                    onClick={this.sendEmail}
                                >
                                    <Icon name="send"/> { this.state.send ? 'Enviando...' : 'Enviar Email' }
                                </Button>
                            </div>
                        </Show>
                    </div>              
                </div>

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
            </Fragment>
        )
    }

}


                                                
                                        

                                            