import React, { Component, Fragment } from 'react';
import { BtnBack, Body, BtnFloat } from '../../../components/Utils';
import { Form, Button, Select, List, Image } from 'semantic-ui-react';
import { unujobs } from '../../../services/apis';
import { parseOptions, Confirm, backUrl } from '../../../services/utils';
import Router from 'next/router';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import atob from 'atob';

export default class RemoveCronograma extends Component
{

    static getInitialProps = async (ctx) => {
        let { query, pathname } = ctx;
        query.query_search = query.query_search ? query.query_search : "";
        query.cargo_id = query.cargo_id ? query.cargo_id : "";
        query.type_categoria_id = query.type_categoria_id ? query.type_categoria_id : "";
        return { query, pathname };
    }

    state = {
        loading: false,
        rows: [],
        cronograma: {},
        historial: [],
        cargos: [],
        type_categorias: [],
        query_search: "",
        cargo_id: "",
        type_categoria_id: "",
        page: 1,
        total: 0,
        condicion: 0,
        block: false,
        last_page: 0
    };

    componentDidMount = async () => {
        await this.setting(this.props);
        await this.getHistorial(false);
        await this.getCargo();
    }

    componentDidUpdate = async (nextProps, nextState) => {
        let { cargo_id } = this.state;
        if (cargo_id != nextState.cargo_id) await this.getTypeCategoria(cargo_id);
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.query != this.props.query) {
            await this.setting(nextProps);
            await this.getHistorial(false);
        }
    }

    handleBack = (e) => {
        this.setState({ loading: true });
        let { cronograma } = this.state;
        let { pathname, push } = Router;
        push({ pathname: backUrl(pathname), query: { mes: cronograma.mes, year: cronograma.year } });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    handleSearch = async () => {
        let { rows } = this.state;
        if (rows.length) {
            if (!await Confirm("warning", `Existen trabajadores seleccionados, al filtrar se perderá la selección`, 'Continuar')) return false;
        }
        // search
        await this.setState({ loading: true, page: 1 });
        let { push, pathname, query } = Router;
        query.cargo_id = this.state.cargo_id;
        query.type_categoria_id = this.state.type_categoria_id;
        query.query_search = this.state.query_search;
        push({ pathname, query }); 
    }

    handlePage = async (nextPage = 1) => {
        await this.setState({ page: nextPage });
        this.getHistorial(true);
    }

    handleRows = async () => {
        let newRows = await this.state.historial.filter(his => his.check == true);
        this.setState({ rows: newRows });
    }

    handleCheck = async (obj, index) => {
        // check
        await this.setState(state => {
            obj.check = obj.check ? false : true;
            state.historial[index] = obj;
            // store
            return { historial: state.historial, send: true };
        });
        // add check
        this.handleRows();
    }

    setting = (props) => {
        let { cargo_id, type_categoria_id, query_search  } = props.query;
        // set state
        this.setState({
            loading: false,
            stop: false,
            block: false,
            cargo_id: cargo_id ? parseInt(cargo_id) : "",
            type_categoria_id: type_categoria_id ? parseInt(type_categoria_id) : "",
            query_search: query_search ? query_search : ""
        });
    }

    getHistorial = async (changed = true) => {
        this.props.fireLoading(true);
        this.setState({ loading: true });
        let { query } = this.props;
        let id = query.id ? atob(query.id) : "__error";
        let { cargo_id, type_categoria_id, query_search, page } = this.state;
        let params = `page=${page}&cargo_id=${cargo_id}&type_categoria_id=${type_categoria_id}&query_search=${query_search}`;
        await unujobs.get(`cronograma/${id}/remove?${params}`)
        .then(async res => {
            let { historial, cronograma } = res.data;
            // add entity
            this.props.fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
            // datos
            let { data, total, last_page } = historial;
            await this.setState(state => ({ 
                cronograma,
                historial: changed ? [...this.state.historial, ...data] : data,
                total, 
                page: state.page + 1,
                stop: false,
                last_page
            }));
        })
        .catch(err => console.log(err.message));
        await this.setState({ loading: false });
        this.props.fireLoading(false);
    }

    getCargo = async () => {
        this.setState({ loading: true });
        let { cronograma } = this.state;
        await unujobs.get(`cronograma/${cronograma.id}/cargo`)
        .then(res => this.setState({ cargos: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    getTypeCategoria = async (cargo_id) => {
        this.setState({ loading: true });
        await unujobs.get(`cargo/${cargo_id}`)
        .then(res => this.setState({ type_categorias: res.data.type_categorias }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false, type_categoria_id: "" });
    }

    delete = async () => {
        let { cronograma, rows } = this.state;
        let condicion = 0;
        let value = await Confirm("info", `¿Desea confirmar al eliminación de los trabajadores(${rows.length})?`, "Continuar");
        if (value) {
            condicion = await Confirm("info", `¿Desea terminar contrato de los trabajadores(${rows.length})?`, "Terminar") ? 1 : 0;
            if (!await Confirm("warning", `Se está eliminado a los trabajadores(${rows.length}) del cronograma ${condicion? ', y se está quitando el contrato. El sistema no agregará a estos trabajadores en los proximos cronogramas' : ''}`, "Estoy de acuerdo")) return false;
            // eliminar
            this.props.fireLoading(true);
            this.setState({ loading: true });
            let payload = [];
            await rows.filter(obj => payload.push(obj.id));
            let datos = JSON.stringify(payload);
            // request
            await unujobs.post(`cronograma/${cronograma.id}/remove`, { 
                _method: 'DELETE' ,
                cargo_id: this.state.cargo_id,
                condicion: condicion,
                type_categoria_id: this.state.type_categoria_id,
                historial: datos
            }, { headers: { CronogramaID: cronograma.id } })
            .then(async res => {
                this.props.fireLoading(false);
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                if (success) {
                    await this.setState({ rows: [], page: 1 });
                    await this.getHistorial(false);
                }
            })
            .catch(err => {
                this.props.fireLoading(false);
                Swal.fire({ icon: "error", text: "Algo salió mal al eliminar a los trabajadores" })
            });
            this.setState({ loading: false });
            this.props.fireLoading(false);
        }
    }

    render() {

        let { historial, cronograma, rows } = this.state;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <BtnBack onClick={this.handleBack}/> 
                        <span className="ml-2">Eliminar Trabajador del Cronograma <b>#{cronograma && cronograma.id}</b></span>
                        <hr/>
                    </Body>
                </div>

                <div className="col-md-12">
                    <Body>
                        <Form>
                            <div className="row">
                                <div className="col-md-3 mb-1">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Buscar por: Apellidos y Nombres"
                                            name="query_search"
                                            value={this.state.query_search}
                                            onChange={(e) => this.handleInput(e.target)}
                                            disabled={this.state.block}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <Form.Field>
                                        <Select
                                            options={parseOptions(this.state.cargos, ["selec-cargo", "", "Select. Cargo"], ["id", "id", "alias"])}
                                            placeholder="Select. Cargo"
                                            name="cargo_id"
                                            onChange={(e, obj) => this.handleInput(obj)}
                                            value={this.state.cargo_id}
                                            disabled={this.state.block}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-2 mb-1">
                                    <Form.Field>
                                        <Select
                                            options={parseOptions(this.state.type_categorias, ["selec-cat", "", "Select. Tip. Categoría"], ["id", "id", "descripcion"])}
                                            placeholder="Select. Tip. Categoría"
                                            name="type_categoria_id"
                                            onChange={(e, obj) => this.handleInput(obj)}
                                            value={this.state.type_categoria_id}
                                            disabled={this.state.block}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-2 col-12">
                                    <Button color="blue"
                                        fluid
                                        onClick={this.handleSearch}
                                        disabled={this.state.block}
                                    >
                                        <i className="fas fa-search"></i> Buscar
                                    </Button>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                </div>

                                <div className="col-md-12 mt-3">
                                    <List divided verticalAlign='middle'>
                                        {historial.map((obj, index) => 
                                            <List.Item key={`list-people-${obj.id}`}>
                                                <List.Content floated='right'>
                                                    <Button color={'red'}
                                                        basic={obj.check ? false : true}
                                                        className="mt-1"
                                                        onClick={(e) => this.handleCheck(obj, index)}
                                                    >
                                                        <i className={`fas fa-${obj.check ? 'trash-alt' : 'times'}`}></i>
                                                    </Button>
                                                </List.Content>
                                                <Image avatar src={obj.person && obj.person.image_images && obj.person.image_images.image_50x50 || '/img/base.png'} 
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <List.Content>
                                                    <span className="uppercase mt-1">{obj.person && obj.person.fullname}</span>
                                                    <br/>
                                                    <span className="badge badge-dark mt-1 mb-2">
                                                        {obj.cargo} - {obj.type_categoria}
                                                    </span>
                                                </List.Content>
                                            </List.Item>
                                        )}
                                    </List>    
                                </div>

                                <Show condicion={!historial.length && !this.state.loading}>
                                    <div className="col-md-12 text-center pt-5 pb-5">
                                        <h4 className="text-muted">No se encontraron regístros</h4>
                                    </div>
                                </Show>

                                <div className="col-md-12 mt-3">
                                    <Button fluid
                                        onClick={(e) => this.handlePage(this.state.page)}
                                        disabled={this.state.last_page == (this.state.page - 1) || this.state.last_page == 1}
                                    >
                                        Obtener más registros
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Body>
                </div>

                <Show condicion={rows.length}>
                    <BtnFloat theme="btn-red"
                        style={{ right: "40px" }}
                        onClick={this.delete}    
                    >
                        <i className="fas fa-trash-alt"></i> 
                    </BtnFloat>
                </Show>
            </Fragment>
        )
    }

}