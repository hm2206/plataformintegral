import React, { useEffect, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import { Form, Button, List, Select } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import atob from 'atob'

const ItemList = ({ system, obj }) => {

    const copyLink = async (e) => {
        e.preventDefault();
        let input = document.createElement('input');
        let copy = `${system.path}/${obj.url}`
        input.setAttribute('value', copy);
        document.body.appendChild(input);
        input.select();
        let result = document.execCommand('copy');
        document.body.removeChild(input);
        await Swal.fire({ icon: 'success', text: `Se acaba de copiar: ${copy}` });
        return result;
    }

    // render
    return (
        <List.Item>
            <List.Content>
                <div className="row">
                    <div className="col-md-12 capitalize mb-2">
                        <input type="text"
                            name="name"
                            className="bg-dark text-white"
                            value={obj.name || ""}
                            placeholder="ingrese el nombre"
                            readOnly
                        />
                    </div>
                                                            
                    <div className="col-md-10 capitalize mb-2">
                        <textarea type="text"
                            value={`${obj.url || ""}`}
                            placeholder="ingrese la url"
                            id={`url-${obj.id}`}
                            readOnly
                        />
                    </div>

                    <div className="col-md-2">
                        <Button fluid
                            onClick={copyLink}
                        >
                            <i className="fas fa-copy"></i>
                        </Button>
                    </div>

                    <div className="col-md-12 capitalize mb-2">
                        <input type="text"
                            value={obj.action_type || ""}
                            placeholder="ingrese la url"
                            readOnly
                        />
                    </div>

                    <div className="col-md-12 mb-5">
                        <textarea type="text"
                            value={obj.description || ""}
                            placeholder="Sin descripción"
                            readOnly
                        />
                    </div>
                </div>
            </List.Content>
        </List.Item>
    )
}

const SystemMethod = ({ pathname, query, success, system }) => {

    // estados
    const [form, setForm] = useState({});
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [query_search, setQuerySearch] = useState("");
    const [action_type, setActionType] = useState("");
    const [is_search, setIsSearch] = useState(false);

    const getMethod = async (add = false) => {
        let query_string = `page=${current_page}&query_search=${query_search}&action_type=${action_type}`;
        await authentication.get(`system/${system.id}/method?${query_string}`)
        .then(res => {
            let { methods } = res.data;
            setDatos(add ? [...datos, ...methods.data] : methods.data);
            setCurrentLastPage(methods.lastPage || 0);
            setCurrentTotal(methods.total || 0);
        })
        .catch(err => console.log(err.message));
    }

    // primera carga
    useEffect(() => {
        getMethod();
    }, []);

    // next page
    useEffect(() => {
        if (current_page > 1) getMethod(true);
    }, [current_page]);

    // buscar
    useEffect(() => {
        if (is_search) {
            getMethod();
            setIsSearch(false);
        }
    }, [is_search]);

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                title={<span>Sistema: {system && system.name || ""}</span>}
                info={[`Listar metodos`]}
                prefix={<BtnBack/>}
                bg="light"
                options={[]}
            >
                <Form className="card-body">
                    <div className="row justify-content-center">
                        <div className="col-md-9">
                            <div className="row justify-content-end">
                                <div className="col-md-12">
                                    <h4><i className="fas fa-box"></i> Datos de Sistema</h4>
                                    <hr/>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Nombre</label>
                                        <input type="text" 
                                            name="client-id"
                                            placeholder="Ingrese un nombre"
                                            value={system.name || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Field>
                                        <label htmlFor="">Ruta</label>
                                        <input type="text" 
                                            name="name"
                                            placeholder="Ingrese la ruta"
                                            value={system.path || ""}
                                            readOnly
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-12 mb-3 mt-5">
                                    <hr/>
                                    <label><i className="fas fa-list"></i> Métodos de <b>"{system.name || ""}"</b></label>
                                    <hr/>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <input type="text"
                                        placeholder="Buscar Método"
                                        name="query_search"
                                        value={query_search || ""}
                                        onChange={({ target }) => setQuerySearch(target.value)}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <Select fluid
                                        options={[
                                            { key: 'ALL', value: "ALL", text: "TODOS" },
                                            { key: 'CREATE', value: "CREATE", text: "CREAR" },
                                            { key: 'UPDATE', value: "UPDATE", text: "ACTUALIZAR" },
                                            { key: 'DELETE', value: "DELETE", text: "ELIMINAR" },
                                            { key: 'UPLOAD', value: "UPLOAD", text: "SUBIR FILE" },
                                            { key: 'DOWNLOAD', value: "DOWNLOAD", text: "DESCARGAR FILE" },
                                            { key: 'OTRO', value: "OTRO", text: "OTRA ACCIÓN" }
                                        ]}
                                        name="action_type"
                                        value={action_type || "ALL"}
                                        onChange={(e, obj) => setActionType(obj.value)}
                                    />
                                </div>

                                <div className="col-md-2 mb-3">
                                    <Button fluid 
                                        color="blue"
                                        onClick={(e) => {
                                            setCurrentPage(1);
                                            setIsSearch(true);
                                        }}
                                    >
                                        <i className="fas fa-search"></i>
                                    </Button>
                                </div>

                                <div className="col-md-12">
                                    {datos.map((d, indexD) => 
                                        <ItemList
                                            key={`list-system-method-${indexD}`}
                                            system={system}
                                            obj={d}
                                        />
                                    )}
                                </div>

                                <div className="col-md-12">
                                    <Button fluid
                                        disabled={!(current_last_page > (current_page + 1))}
                                        onClick={(e) => setCurrentPage(current_page + 1)}
                                    >
                                        <i className="fas fa-arrow-down"></i> Obtener más datos
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </BoardSimple>
        </div>
    )
    
}

// server
SystemMethod.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx
    let id = atob(query.id) || '__error';
    let { success, system } = await authentication.get(`system/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false, system: {} }))
    // response
    return { pathname, query, success, system };
}

// exportar
export default SystemMethod;