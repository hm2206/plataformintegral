import React, { Component, Fragment } from 'react';
import { BtnBack, Body, BtnFloat } from '../../../components/Utils';
import { Form, Button, Select, List, Image } from 'semantic-ui-react';
import { unujobs } from '../../../services/apis';
import { parseOptions, Confirm, backUrl } from '../../../services/utils';
import Router from 'next/router';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import atob from 'atob';
import { parse } from 'native-url';

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
        infos: [],
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
        await this.getinfos(false);
        await this.getCargo();
    }

    componentDidUpdate = async (nextProps, nextState) => {
        let { cargo_id } = this.state;
        if (cargo_id != nextState.cargo_id) await this.getTypeCategoria(cargo_id);
    }

    componentWillReceiveProps = async (nextProps) => {
        if (nextProps.query != this.props.query) {
            await this.setting(nextProps);
            await this.getinfos(false);
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
        this.getinfos(true);
    }

    handleRows = async () => {
        let newRows = await this.state.infos.filter(his => his.check == true);
        this.setState({ rows: newRows });
    }

    handleCheck = async (obj, index) => {
        // check
        await this.setState(state => {
            obj.check = obj.check ? false : true;
            state.infos[index] = obj;
            // store
            return { infos: state.infos, send: true };
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

    getinfos = async (changed = true) => {
        this.setState({ loading: true });
        let { query } = this.props;
        let id = query.id ? atob(query.id) : "__error";
        let { cargo_id, type_categoria_id, query_search, page } = this.state;
        let params = `page=${page}&cargo_id=${cargo_id}&type_categoria_id=${type_categoria_id}&query_search=${query_search}`;
        await unujobs.get(`cronograma/${id}/add?${params}`)
        .then(async res => {
            let { infos, cronograma } = res.data;
            // add entity
            this.props.fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
            // datos
            let { data, total, last_page } = infos;
            await this.setState(state => ({ 
                cronograma,
                infos: changed ? [...this.state.infos, ...data] : data,
                total, 
                page: state.page + 1,
                stop: false,
                last_page
            }));
        })
        .catch(err => console.log(err.message));
        await this.setState({ loading: false });
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

    add = async () => {
        let { cronograma, rows } = this.state;
        let answer = await Confirm("warning", `¿Está seguro en agregar a los trabajadores(${rows.length}) al cronograma #${cronograma.id}?`);
        if (answer) {
            this.setState({ loading: true });
            let form = new FormData();
            let payload = [];
            // preparar envio
            await rows.filter(r => payload.push(r.id));
            // send
            form.append('info_id', payload.join(',')); 
            await unujobs.post(`cronograma/${cronograma.id}/add_all`, form, { headers: { CronogramaID: cronograma.id } })
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.setState({ rows: [], page: 1 });
                await this.getinfos(false);
            })
            .catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ loading: false });
        }
    }

    render() {

        let { infos, cronograma, rows } = this.state;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <BtnBack onClick={this.handleBack}/> 
                        <span className="ml-2">Agregar Trabajador al Cronograma <b>#{cronograma && cronograma.id}</b></span>
                        <hr/>
                    </Body>
                </div>

                <div className="col-md-12">
                    <Body>
                        <Form loading={this.state.loading}>
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
                                        {infos.map((obj, index) => 
                                            <List.Item key={`list-people-${obj.id}`}>
                                                <List.Content floated='right'>
                                                    <Button color={'olive'}
                                                        basic={obj.check ? false : true}
                                                        className="mt-1"
                                                        onClick={(e) => this.handleCheck(obj, index)}
                                                    >
                                                        <i className={`fas fa-${obj.check ? 'check' : 'plus'}`}></i>
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

                                <Show condicion={!infos.length && !this.state.loading}>
                                    <div className="col-md-12 text-center pt-5 pb-5">
                                        <h4 className="text-muted">No se encontraron regístros</h4>
                                    </div>
                                </Show>

                                <div className="col-md-12 mt-3">
                                    <Button fluid
                                        onClick={(e) => this.handlePage(this.state.page)}
                                        disabled={this.state.last_page == (this.state.page - 1)  || this.state.last_page == 1}
                                    >
                                        Obtener más registros
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Body>
                </div>

                <Show condicion={rows.length}>
                    <BtnFloat theme="btn-success"
                        style={{ right: "40px" }}
                        onClick={this.add}    
                    >
                        <i className="fas fa-plus"></i> 
                    </BtnFloat>
                </Show>
            </Fragment>
        )
    }

}