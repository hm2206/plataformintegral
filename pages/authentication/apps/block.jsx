import React, { useState, useEffect } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Form, Button, Select, Checkbox, List } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Show from '../../../components/show';
import BoardSimple from '../../../components/boardSimple';
import { Confirm } from '../../../services/utils'

const ItemMethod = ({ current_app, block, current_loading, method }) => {

    const [is_render, setIsRender] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleAction = async (is_delete = false) => {
        let answer = await Confirm(`warning`, `¿Estas seguro?`, 'Estoy seguro');
        if (!answer) return false;
        setLoading(true);
        let payload = {
            app_id: current_app.id,
            method_id: method.id
        }
        // generar ruta
        let path = is_delete ? `block_method_app/${method.id}?_method=DELETE` : 'block_method_app';
        // request
        await authentication.post(path, payload)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setIsRender(false);
        }).catch(err => {
            try {
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message || err.message);
                Swal.fire({ icon: 'warning', text: data.message || err.message });
            } catch (error) {
                Swal.fire({ icon: 'error', text: error.message })
            }
        });
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
                        disabled={current_loading || loading}
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
                        disabled={current_loading || loading}
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

const BlockApp = ({ pathname, query, success, current_app }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [block, setBlock] = useState(false);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [query_search, setQuerySearch] = useState("");
    const [is_search, setIsSearch] = useState();

    // obtener metodos
    const getMethodApp = async (add = false) => {
        setCurrentLoading(true);
        await authentication.get(`app/${current_app.id}/block?block=${block ? 1 : 0}&page=${current_page}&query_search=${query_search}`)
        .then(res => {
            let { methods } = res.data;
            setDatos(add ? [...datos, ...methods.data] : methods.data);
            setCurrentTotal(methods.total || 0);
            setCurrentLastPage(methods.lastPage || 0);
        }).catch(err => console.log(err.message))
        setCurrentLoading(false);
    }
    
    // cambio de block
    useEffect(() => {
        getMethodApp();
    }, [block]);
    
    // cargar por búsqueda
    useEffect(() => {
        if (is_search) {
            getMethodApp();
            setIsSearch(false);
        }
    }, [is_search]);

    // seguiente página
    useEffect(() => {
        if (current_page > 1) getMethodApp(true);
    }, [current_page]);

    // render
    return (
        <div className="col-md-12">
            <BoardSimple
                options={[]}
                bg="light"
                prefix={<BtnBack/>}
                title={<span>Aplicación: {current_app && current_app.name || ""}</span>}
                info={['Restricciones de la Aplicación']}
            >
                <div className="card-body">
                    <Form className="row justify-content-center">
                        <div className="col-md-9">
                            <div className="row justify-content-end">
                                <div className="col-md-12">
                                    <h4><i className="fas fa-box"></i> Datos de la App</h4>
                                    <hr/>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Nombre</label>
                                        <input type="text" 
                                            name="name"
                                            placeholder="Ingrese un nombre"
                                            value={current_app.name || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Cliente</label>
                                        <Select
                                            placeholder="Select. Tip. Cliente"
                                            name="client_device"
                                            value={current_app.client_device || ""}
                                            disabled
                                            options={[
                                                { key: 'android', value: 'ANDROID', text: 'Android' },
                                                { key: 'ios', value: 'IOS', text: 'IOS' },
                                                { key: 'app_desktop', value: 'APP_DESKTOP', text: 'Desktop' },
                                                { key: 'app_web', value: 'APP_WEB', text: 'App Web' },
                                                { key: 'otro', value: 'OTRO', text: 'Otro' },
                                            ]}
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
                                                    setQuerySearch("");
                                                    setBlock(obj.checked ? 0 : 1);
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
                                                        current_app={current_app}
                                                        method={obj}
                                                        current_loading={current_loading}
                                                        block={block}
                                                    />
                                                )}
                                            </List>    
                                        </div>

                                        <div className="col-md-12 mt-4">
                                            <hr/>
                                            <Show condicion={!current_loading}>
                                                <Button fluid
                                                    disabled={!(current_last_page >= (current_page + 1))}
                                                    onClick={(e) => setCurrentPage(current_page + 1)}
                                                >
                                                    <Show condicion={current_last_page >= (current_page + 1)}
                                                        predeterminado={<span><i className="fas fa-ban"></i> No hay más registros</span>}
                                                    >
                                                        <i className="fas fa-arrow-down"></i> Obtener más registros
                                                    </Show>
                                                </Button>
                                            </Show>
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
BlockApp.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let id = atob(query.id) || '_error';
    // request
    let { success, app } = await authentication.get(`app/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, app: {} }));
    // render
    return { pathname, query, success, current_app: app };
}

// exportar
export default BlockApp;