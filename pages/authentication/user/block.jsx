import React, { useEffect, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select, Checkbox, List, Image } from 'semantic-ui-react'
import { authentication, handleErrorRequest } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Show from '../../../components/show';
import BoardSimple from '../../../components/boardSimple'

const ItemMethod = ({ user, block, disabled, method, onAction = null }) => {

    const [is_render, setIsRender] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleAction = async (is_delete = false) => {
        let answer = await Confirm(`warning`, `¿Estas seguro?`, 'Estoy seguro');
        if (!answer) return false;
        setLoading(true);
        let payload = {
            user_id: user.id,
            method_id: method.id
        }
        // generar ruta
        let path = is_delete ? `block_method_user/${method.id}?_method=DELETE` : 'block_method_user';
        // request
        await authentication.post(path, payload)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setIsRender(false);
            if (typeof onAction == 'function') onAction(method);
        }).catch(err => handleErrorRequest(err));
        setLoading(false);
    }

    if (!is_render) return null;

    // render
    return (
        <List.Item>
            <List.Content floated='right'>
                <Show condicion={block}>
                    <Button color={'green'}
                        className="mt-1"
                        title={'Permitir'}
                        disabled={disabled || loading}
                        loading={loading}
                        onClick={(e) => handleAction(true)}
                    >
                        <i className="fas fa-check"></i>
                    </Button>
                </Show>

                <Show condicion={!block}>
                    <Button color={'red'}
                        className="mt-1"
                        title={'Bloquear'}
                        disabled={disabled || loading}
                        loading={loading}
                        onClick={(e) => handleAction(false)}
                    >
                        <i className="fas fa-ban"></i>
                    </Button>
                </Show>
            </List.Content>
            
            <List.Content>
                <span className="uppercase mt-1">{method.system}</span>
                <br/>
                <span className="badge badge-dark mt-1 mb-2">
                    {method.name} - {method.action_type}
                </span>
                <br/>
                <span className="badge badge-warning ml-1 mt-1 mb-2">
                    {method.url}
                </span>
                <br/>
                {method.description}
            </List.Content>
        </List.Item>
    )
}

const BlockUser = ({ pathname, query, success, user }) => {

    const [block, setBlock] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [query_search, setQuerySearch] = useState("");
    const [is_search, setIsSearch] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);

    // obtener métodos del usuario
    const getMethodApp = async (add = false) => {
        setCurrentLoading(true);
        let query_string = `block=${block ? 1 : 0}&page=${current_page}&query_search=${query_search}`;
        await authentication.get(`user/${user.id}/block?${query_string}`)
        .then(res => {
            let { methods } = res.data;
            setCurrentLastPage(methods.lastPage || 0);
            setCurrentTotal(methods.total || 0);
            setDatos(add ? [...datos, ...methods.data] : methods.data);
        }).catch(err => console.log(err.message))
        setCurrentLoading(false);
    }

    // eliminar item
    const handleDeleteItem = (index) => {
        let newDatos = JSON.parse(JSON.stringify(datos));
        newDatos.splice(index, 1);
        setDatos(newDatos);
    }

    // primera carga
    useEffect(() => {
        getMethodApp();
    }, []);

    // realizar busqueda
    useEffect(() => {
        if (is_search) {
            getMethodApp();
            setIsSearch(false);
        }
    }, [is_search]);

    // next page
    useEffect(() => {
        if (current_page > 1) getMethodApp(true);
    }, [current_page]);

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                options={[]}
                title={<span>Usuario: <b className="capitalize">{user.username}</b></span>}
                info={["Restricciones del Usuario"]}
                prefix={<BtnBack/>}
                bg="light"
            >
                <div className="card-body">
                    <Form className="row justify-content-center">
                        <div className="col-md-9">
                            <div className="row justify-content-end">
                                <div className="col-md-12">
                                    <h4><i className="fas fa-user"></i> Datos de Usuario</h4>
                                    <hr/>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Username</label>
                                        <input type="text" 
                                            name="name"
                                            placeholder="Ingrese un nombre"
                                            value={user.username || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Email</label>
                                        <input type="text" 
                                            value={user.email || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-12 mt-4">
                                    <hr/>
                                    <div className="row">
                                        <div className="col-md-10 col-10">
                                            <i className={`fas ${!block ? 'fa-shield-alt text-success' : 'fa-ban text-red'}`}></i> Metodos {!block ? 'Permitidos' : 'Bloqueados'}
                                        </div>
                                        
                                        <div className="col-md-2 col-2">
                                            <Checkbox 
                                                toggle 
                                                name="block" 
                                                checked={block ? false : true}
                                                onChange={(e, obj) => {
                                                    setBlock(obj.checked ? false : true)
                                                    setCurrentPage(1);
                                                    setIsSearch(true);
                                                }}
                                                disabled={current_loading}
                                            />
                                        </div>

                                        <div className="col-md-10 col-10">
                                            <Form.Field>
                                                <input type="text"
                                                    placeholder="Buscar Método por: Nombre, URL y Sistema"
                                                    name="query_search"
                                                    value={query_search || ""}
                                                    onChange={({ target }) => setQuerySearch(target.value)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-2 col-2">
                                            <Button fluid
                                                disabled={current_loading}
                                                onClick={(e) => {
                                                    setCurrentPage(1);
                                                    setIsSearch(true)
                                                }}
                                            >
                                                <i className="fas fa-search"></i>
                                            </Button>
                                        </div>

                                        <div className="col-md-12">
                                            <hr/>
                                        </div>

                                        <div className="col-md-12">
                                            <List divided verticalAlign='middle'>
                                                {datos.map((obj, index) => 
                                                    <ItemMethod key={`list-people-${obj.id}`}
                                                        user={user}
                                                        method={obj}
                                                        disabled={current_loading}
                                                        block={block}
                                                        onAction={handleDeleteItem}
                                                    />
                                                )}
                                                {/* no hay datos */}
                                                <Show condicion={!current_loading && !datos.length}>
                                                    <List.Item>
                                                        <List.Content>
                                                            <div className="text-center text-muted">No hay datos disponibles</div>
                                                        </List.Content>
                                                    </List.Item>
                                                </Show>
                                            </List>    
                                        </div>

                                        <div className="col-md-12 mt-4">
                                            <hr/>
                                            <Button fluid
                                                disabled={current_loading || !(current_last_page >= (current_page + 1))}
                                                onClick={(e) => setCurrentPage(current_page + 1)}
                                            >
                                                <i className="fas fa-arrow-down"></i> Obtener más registros
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
            </BoardSimple>
        </div>
    )
}

// server 
BlockUser.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // obtener usuario
    let id = query.id ? atob(query.id) : "__error";
    const { success, user } = await authentication.get(`user/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, user: {} }));
    // response
    return { query, pathname, success, user };
}

// exportar
export default BlockUser;