import React, { Component, Fragment } from 'react';
import { BtnBack, Body, BtnFloat } from '../../../components/Utils';
import { Form, Button, Select } from 'semantic-ui-react';
import DataTable from '../../../components/datatable';
import { removeHistorialCronograma } from '../../../storage/actions/cronogramaActions';
import { unujobs } from '../../../services/apis';
import { parseOptions, Confirm, backUrl } from '../../../services/utils';
import Router from 'next/router';
import Show from '../../../components/show';
import Swal from 'sweetalert2';

export default class RemoveCronograma extends Component
{

    static getInitialProps = async (ctx) => {
        let { query, pathname, store } = ctx;
        query.page = 1;
        query.query_search = query.query_search ? query.query_search : "";
        query.cargo_id = query.cargo_id ? query.cargo_id : "";
        query.type_categoria_id = query.type_categoria_id ? query.type_categoria_id : "";
        await store.dispatch(removeHistorialCronograma(ctx));
        let { remove } = await store.getState().cronograma;
        return { query, pathname, remove };
    }

    state = {
        loading: true,
        rows: [],
        cronograma: {},
        historial: [],
        cargos: [],
        type_categorias: [],
        query_search: "",
        cargo_id: "",
        type_categoria_id: "",
        page: 2,
        total: 0,
        stop: false,
        block: false,
        send: false
    };

    componentDidMount = async () => {
        await this.setting(this.props);
        await this.getCargo();
    }

    componentWillUpdate = async (nextProps, nextState) => {
        let { cargo_id } = this.state;
        if (cargo_id != nextState.cargo_id) await this.getTypeCategoria(nextState);
    }

    componentWillReceiveProps = (nextProps) => {
        this.setting(nextProps);
    }

    handleBack = (e) => {
        this.setState({ loading: true });
        let { pathname, push } = Router;
        push({ pathname: backUrl(pathname) });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { push, pathname, query } = Router;
        query.cargo_id = this.state.cargo_id;
        query.type_categoria_id = this.state.type_categoria_id;
        query.query_search = this.state.query_search;
        push({ pathname, query });
    }

    handleRow = (rows) => {
        if (rows.length == 0) {
            this.setState({ block: false, rows });
        } else {
            this.setState({ block: true, rows });
        }
    }

    handleAllSelect = (rows) => {
        this.setState({ stop: true, rows: [], send: true });
    }

    setting = (props) => {
        let { cronograma, historial } = props.remove;
        let { cargo_id, type_categoria_id, query_search  } = props.query;
        // set state
        this.setState({
            loading: false,
            stop: false,
            block: false,
            cronograma: cronograma,
            historial: historial.data,
            total: historial.total,
            cargo_id: cargo_id ? parseInt(cargo_id) : "",
            type_categoria_id: type_categoria_id ? parseInt(type_categoria_id) : "",
            query_search: query_search ? query_search : ""
        });
    }

    handleScroll = async (e, body) => {
        await this.getHistorial();
        body.style.overflow = 'auto';
    }

    getHistorial = async () => {
        this.setState({ loading: true });
        let { cronograma, cargo_id, type_categoria_id, query_search, page } = this.state;
        let params = `page=${page}&cargo_id=${cargo_id}&type_categoria_id=${type_categoria_id}&query_search=${query_search}`;
        await unujobs.get(`cronograma/${cronograma.id}/remove?${params}`)
        .then(res => {
            let { cronograma, historial } = res.data;
            let { data, total, next_page_url } = historial;
            if (next_page_url) {
                this.setState(state => ({ 
                    historial: [...state.historial, ...data], 
                    page: state.page + 1, 
                    total, 
                    stop: false 
                }));
            } else {
                this.setState({ stop: true });
            }
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

    getTypeCategoria = async (nextState) => {
        this.setState({ loading: true });
        await unujobs.get(`cargo/${nextState.cargo_id}`)
        .then(res => this.setState({ type_categorias: res.data.type_categorias }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false, type_categoria_id: "" });
    }

    delete = async () => {
        let value = await Confirm("info", "¿Desea confirmar al eliminación de los trabajadores?", "Continuar");
        if (value) {
            this.setState({ loading: true });
            let payload = [];
            await this.state.rows.filter(obj => payload.push(obj.id));
            // request
            await unujobs.post(`cronograma/${this.state.cronograma.id}/remove`, { 
                _method: 'DELETE' ,
                cargo_id: this.state.cargo_id,
                type_categoria_id: this.state.type_categoria_id,
                historial: JSON.stringify(payload)
            })
            .then(async res => {
                let { success, message } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                if (success) {
                    this.setState({ historial: [], rows: [] });
                    await this.handleSearch();
                }
            })
            .catch(err => Swal.fire({ icon: "error", text: "Algo salió mal al eliminar a los trabajadores" }));
            this.setState({ loading: false });
        }
    }

    render() {

        let { remove } = this.props;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <BtnBack onClick={this.handleBack}/> 
                        <span className="ml-2">Eliminar Trabajador del Cronograma <b>#{remove && remove.cronograma && remove.cronograma.id}</b></span>
                        <hr/>
                    </Body>
                </div>

                <div className="col-md-12">
                    <Body>
                        <Form loading={this.state.loading}>
                            <div className="row">
                                <div className="col-md-4 mb-1">
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

                                <div className="col-md-3 mb-1">
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

                                <div className="col-md-12 mt-4">
                                    <h4>Resultados: {this.state.total}</h4>
                                </div>

                                <div className="col-md-12">
                                    <DataTable
                                        selectRow={this.handleRow}
                                        isCheck={true}
                                        headers={["#ID", "Apellidos y Nombres", "Cargo", "Tip. Categoría"]}
                                        index={[
                                            { key: "id", type: "text" },
                                            { key: "person.fullname", type: "text"},
                                            { key: "cargo.alias", type: "icon"},
                                            { key: "type_categoria.descripcion", type: "icon", bg: "dark" }
                                        ]}
                                        data={this.state.historial}
                                        onScroll={this.handleScroll}
                                        onStop={this.state.stop}
                                        newRows={this.state.rows}
                                        onAllSelect={this.handleAllSelect}
                                    />
                                </div>
                            </div>
                        </Form>
                    </Body>
                </div>

                <Show condicion={this.state.rows.length || this.state.send}>
                    <BtnFloat theme="btn-red"
                        onClick={this.delete}    
                    >
                        <i className="fas fa-trash-alt"></i>
                    </BtnFloat>
                </Show>
            </Fragment>
        )
    }

}