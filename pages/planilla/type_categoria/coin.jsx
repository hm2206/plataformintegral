import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, parseOptions, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select, List } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';


export default class CoinTypeCategoria extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        block: false,
        edit: false,
        type_categoria: {},
        form: {},
        categorias: [],
        type_categorias: [],
        current: {},
        errors: {}
    }

    componentDidMount = async () => {
        await this.findTypeCategoria();
        await this.getCategoria();
        await this.getTypeCategorias(1);
        await this.configTypeCategoria();
    }

    findTypeCategoria = async () => {
        this.setState({ loading: true });
        let { query } = this.props;
        let id = query.id ? atob(query.id) : '__error';
        await unujobs.get(`type_categoria/${id}`)
        .then(res => this.setState({ type_categoria: res.data }))
        .catch(err => this.setState({ type_categoria: {} }));
        this.setState({ loading: false });
    }

    getCategoria = async () => {
        let { type_categoria } = this.state;
        this.setState({ loading: true });
        await unujobs.get(`type_categoria/${type_categoria.id}/categoria`)
        .then(res => this.setState({ categorias: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loading: false, block: false });
    }

    getTypeCategorias = async (page) => {
        this.setState({ loading: true });
        await unujobs.get(`type_remuneracion?page=${page}`)
        .then(async res => {
            let { data, last_page, current_page } = res.data;
            await  this.setState(state => ({ type_categorias: [...state.type_categorias, ...data] }));
            if (last_page > current_page) {
                await this.getTypeCategorias(current_page + 1);
            }
        })
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    configTypeCategoria = async () => {
        let payload = [];
        let newTypeCategoria = [];
        let { categorias, type_categorias } = this.state;
        await categorias.filter(cat => payload.push(cat.type_remuneracion_id));
        for(let type of type_categorias) {
            let is_exists = await payload.indexOf(type.id);
            if (is_exists == -1) {
                await newTypeCategoria.push(type);
            }
        }
        // result
        this.setState({ type_categorias: newTypeCategoria });
    }

    handleSelect = ({ name, value }) => {
        this.setState(state => {
            state.form[name] = value;
            state.errors[name] = null;
            return { form: state.form, errors: state.errors };
        });
    }

    handleInput = ({ value }, obj, index) => {
        this.setState((state, props) => {
            obj.monto = value;
            // assign 
            state.categorias[index] = obj;
            return { categorias: state.categorias };
        });
    }

    handleEdit = (obj, index, cancel = false) => {
        this.setState(state => {
            obj.edit = obj.edit ? false : true;
            obj.monto = cancel ? state.current.monto : obj.monto;
            state.categorias[index] = obj;
            state.current = cancel ? {} : JSON.parse(JSON.stringify(obj));
            return { edit: obj.edit, categorias: state.categorias, current: state.current };
        });
    }

    save = async () => {
        this.setState({ loading: true });
        let { form, type_categoria } = this.state;
        form.type_categoria_id = type_categoria.id;
        await unujobs.post('categoria', form)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message });
            await this.setState({ form: {}, categorias: [] });
            await this.getCategoria();
            await this.configTypeCategoria();
        }).catch(err => {
            try {
                let { errors, message } = err.response.data;
                this.setState({ errors });
                Swal.fire({ icon: 'warning', text: 'Datos incorrectos!' });
            } catch (error) {
                Swal.fire({ icon: "error", text: err.message });
            }
        });
        this.setState({ loading: false });
    }

    delete = async (id) => {
        let answer = await Confirm("warning", `¿Estas seguro en eliminar la configuración?`, "Eliminar");
        if (answer) {
            this.setState({ block: true });
            await unujobs.post(`categoria/${id}`, { _method: 'DELETE' })
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                await this.getCategoria();
                await this.configTypeCategoria();
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            this.setState({ block: false });
        }
    }

    update = async (obj) => {
        this.setState({ loading: true });
        obj._method = 'PUT';
        await unujobs.post(`categoria/${obj.id}`, obj)
        .then(res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            Swal.fire({ icon: 'success', text: message });
            this.getCategoria();
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
        });
        this.setState({ loading: false });
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, categorias, type_categoria, type_categorias, edit, loading, block } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Configurar Pago de Tip. Categoría
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-start">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="descripcion"
                                                value={type_categoria.descripcion || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={true}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">Dedicación</label>
                                            <input type="text"
                                                placeholder="Ingrese la dedicación"
                                                name="dedicacion"
                                                value={type_categoria.dedicacion || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                disabled={true}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                        <i className="fas fa-plus"></i> Agregar Tip. Remuneración
                                        <hr/>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Select
                                            error={errors.type_remuneracion_id && errors.type_remuneracion_id[0] || false}
                                            options={parseOptions(type_categorias, ["select-type-cat", "", "Select. Clave"], ["id", "id", "key"])}
                                            fluid
                                            name="type_remuneracion_id"
                                            value={form.type_remuneracion_id || ""}
                                            placeholder="Select. Clave"
                                            onChange={(e, obj) => this.handleSelect(obj)}
                                            disabled={loading}
                                        />
                                        <label>{errors.type_remuneracion_id && errors.type_remuneracion_id[0]}</label>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                        <Select
                                            error={errors.type_remuneracion_id && errors.type_remuneracion_id[0] || false}
                                            options={parseOptions(type_categorias, ["select-type-cat", "", "Select. Clave"], ["id", "id", "alias"])}
                                            fluid
                                            name="type_remuneracion_id"
                                            value={form.type_remuneracion_id || ""}
                                            placeholder="Select. Tip. Remuneracion"
                                            onChange={(e, obj) => this.handleSelect(obj)}
                                            disabled={loading}
                                        />
                                        <label>{errors.type_remuneracion_id && errors.type_remuneracion_id[0]}</label>
                                    </div>

                                    <div className="col-md-4">
                                        <Form.Field error={errors.monto && errors.monto[0] || false}>
                                            <input type="number"
                                                name="monto"
                                                value={form.monto || ""}
                                                placeholder="Ingrese el monto"
                                                onChange={(e) => this.handleSelect(e.target)}
                                                disabled={loading}
                                            />
                                            <label>{errors.monto && errors.monto[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12 mt-3 text-right">
                                        <hr/>
                                        <Button color="teal"
                                            disabled={loading || !form.type_remuneracion_id}
                                            loading={form.type_remuneracion_id && loading}
                                            onClick={this.save}
                                        >
                                            <i className="fas fa-save"></i> Guardar
                                        </Button>
                                    </div>

                                    <div className="col-md-12 mt-4">
                                        <hr/>
                                        <i className="fas fa-coins"></i> Lista de Tip. Remuneraciones
                                        <hr/>
                                    </div>

                                    <div className="col-md-12">
                                        <List divided verticalAlign='middle'>
                                            {categorias.map((obj, index) => 
                                                <List.Item key={`list-categoria-${obj.id}`}>
                                                    <List.Content>
                                                        <div className="row">
                                                            <div className="col-md-5 uppercase mb-2">
                                                                <b>{obj.key} .- {obj.alias}</b>
                                                            </div>
                                                            <div className="col-md-3 mb-2">
                                                                <Show condicion={!obj.edit}>
                                                                    <span className="badge badge-dark">{obj.monto}</span>
                                                                </Show>
                                                                <Show condicion={obj.edit}>
                                                                    <input type="number"
                                                                        name="monto"
                                                                        value={obj.monto || ""}
                                                                        placeholder="ingrese un monto"
                                                                        onChange={(e) => this.handleInput(e.target, obj, index)}
                                                                    />
                                                                </Show>
                                                            </div>

                                                            <div className="col-md-4 text-right mb-2">
                                                                <Show condicion={!obj.edit}>
                                                                    <Button 
                                                                        className="mt-1"
                                                                        title="Editar"
                                                                        color='green'
                                                                        basic
                                                                        disabled={edit || block}
                                                                        onClick={(e) => this.handleEdit(obj, index)}
                                                                    >
                                                                        <i className={`fas fa-pencil-alt`}></i>
                                                                    </Button>

                                                                    <Button color={'red'}
                                                                        className="mt-1"
                                                                        basic
                                                                        title="Eliminar"
                                                                        disabled={edit || block}
                                                                        onClick={(e) => this.delete(obj.id)}
                                                                    >
                                                                        <i className={`fas fa-trash`}></i>
                                                                    </Button>
                                                                </Show>

                                                                <Show condicion={obj.edit}>
                                                                    <Button color={'green'}
                                                                        className="mt-1"
                                                                        title="Guardar"
                                                                        onClick={(e) => this.update(obj)}
                                                                    >
                                                                        <i className={`fas fa-save`}></i>
                                                                    </Button>

                                                                    <Button color={'red'}
                                                                        className="mt-1"
                                                                        title="Cancelar"
                                                                        onClick={(e) => this.handleEdit(obj, index, true)}
                                                                    >
                                                                        <i className={`fas fa-times`}></i>
                                                                    </Button>
                                                                </Show>
                                                            </div>
                                                        </div>
                                                    </List.Content>
                                                </List.Item>
                                            )}
                                        </List>    
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>
        )
    }
    
}