import React, { useEffect, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import Router from 'next/router';
import { Form, Select, Button } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple';
import atob from 'atob';
import UpdateMenu from '../../../components/authentication/updateMenu';
import CreateConfigModule from '../../../components/authentication/createConfigModule';

const options = {
    CREATE: 'CREATE'
}

const MenuApp = ({ current_app }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [option, setOption] = useState("");

    // obtener módulos
    const getConfigModules = async (add = false) => {
        setCurrentLoading(true);
        await authentication.get(`app/${current_app.id}/config_module?page=${current_page}`)
        .then(res => {
            let { menus } = res.data;
            setDatos(add ? [...datos, ...menus.data] : menus.data);
            setCurrentLastPage(menus.lastPage || 0);
            setCurrentTotal(menus.total || 0);
        })
        .catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // obtener menus
    useEffect(() => {
        getConfigModules();
    }, []);

    // siguiente página
    useEffect(() => {
        if (current_page > 1) getConfigModules(true);
    }, [current_page]);

    // renderizar
    return (
        <div className="col-md-12">
            <BoardSimple
                options={[]}
                bg="light"
                prefix={<BtnBack/>}
                title={<span>Aplicación: {current_app && current_app.name || ""}</span>}
                info={['Lista de módulos de la Aplicación']}
            >
                <Form className="card-body">
                    <div className="row justify-content-center">
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

                                <div className="col-md-12">
                                    <hr/>
                                    <div className="row">
                                        <div className="col-md-10">
                                            <i className="fas fa-list"></i> Lista de módulos
                                        </div>

                                        <div className="col-md-2 text-right">
                                            <button className="btn btn-success"
                                                onClick={(e) => setOption(options.CREATE)}
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <hr/>
                                </div>

                                <div className="col-md-12">
                                    {datos.map((d, indexD) => 
                                        <UpdateMenu 
                                            key={`list-module-app-${indexD}`}
                                            menu={d}
                                        />
                                    )}
                                </div>

                                {/* obtener más datos */}
                                <Show condicion={!current_loading}>
                                    <div className="col-md-12">
                                        <Button fluid
                                            disabled={!(current_last_page >= (current_page + 1))}
                                            onClick={(e) => setCurrentPage(current_page + 1)}
                                        >
                                            <Show condicion={current_last_page >= (current_page + 1)}
                                                predeterminado={<span><i className="fas fa-ban"></i> No hay más regístros</span>}
                                            >
                                                <i className="fas fa-arrow-down"></i> Obtener más datos
                                            </Show>
                                        </Button>
                                    </div>
                                </Show>
                            </div>
                        </div>
                    </div>
                </Form>
            </BoardSimple>
            {/* modals */}
            <Show condicion={option == options.CREATE}>
                <CreateConfigModule 
                    current_app={current_app}
                    onClose={(e) => setOption("")}
                />
            </Show>
        </div>
    )
}
// server 
MenuApp.getInitialProps = async (ctx) => {
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
export default MenuApp;