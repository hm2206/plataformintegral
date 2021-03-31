import React, { useState } from 'react';
import { Body, BtnBack, SimpleList, SimpleListContent } from '../../../components/Utils';
import { Form } from 'semantic-ui-react'
import { authentication } from '../../../services/apis';
import { AUTHENTICATE } from '../../../services/auth';
import atob from 'atob';
import Show from '../../../components/show';
import ConfigEntity from '../../../components/authentication/user/configEntity';
import ConfigPermission from '../../../components/authentication/user/configPermission';
import ConfigEntityDependencia from '../../../components/authentication/user/configEntityDependencia';
import BoardSimple from '../../../components/boardSimple';

const actions = {
    ADD_ENTITY: "ADD_ENTITY",
    ADD_DEPENDENCIA: "ADD_DEPENDENCIA",
    ADD_PERMISOS: "ADD_PERMISOS",
};

 const ConfigUser = ({ pathname, query, success, user }) => {

    // estados
    const [option, setOption] = useState();

    // render
    return (
        <div className="col-md-12">
                <BoardSimple
                    prefix={<BtnBack/>}
                    title="Configuraciones de Usuario"
                    info={[user.username || ""]}
                    options={[]}
                    classNameInfo="capitalize"
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
                                            <label htmlFor="">Apellidos y Nombres</label>
                                            <input type="text" 
                                                className="uppercase"
                                                placeholder="Ingrese un nombre"
                                                value={user.person && user.person.fullname || ""}
                                                readOnly
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">N° Documento</label>
                                            <input type="text"
                                                placeholder="Ingrese un nombre"
                                                value={user.person && user.person.document_number || ""}
                                                readOnly
                                            />
                                        </Form.Field>
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
                                        <h4 className="pb-2"><i className="fas fa-cog"></i> Configuraciones</h4>
                                        <hr/>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <SimpleListContent>
                                                    <SimpleList
                                                        icon="fas fa-briefcase"
                                                        bg="primary"
                                                        title="Entidades"
                                                        onClick={(e) => setOption(actions.ADD_ENTITY)}
                                                    />
                                                    <SimpleList
                                                        icon="fas fa-building"
                                                        bg="orange"
                                                        title="Dependencias"
                                                        onClick={(e) => setOption(actions.ADD_DEPENDENCIA)}
                                                    />
                                                </SimpleListContent>
                                            </div>

                                            <div className="col-md-4">
                                                <SimpleListContent>
                                                    <SimpleList
                                                        icon="fas fa-user-tag"
                                                        bg="warning"
                                                        title="Permisos"
                                                        onClick={(e) => setOption(actions.ADD_PERMISOS)}
                                                    />
                                                </SimpleListContent>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </BoardSimple>
                {/* agregar entity */}
                <Show condicion={option == actions.ADD_ENTITY}>
                    <ConfigEntity user={user} isClose={(e) => setOption("")}/>
                </Show>
                {/* agregar dependencia */}
                <Show condicion={option == actions.ADD_DEPENDENCIA}>
                    <ConfigEntityDependencia user={user} isClose={(e) => setOption("")}/>
                </Show>
                {/* agregar permisos */}
                <Show condicion={option == actions.ADD_PERMISOS}>
                    <ConfigPermission user={user} isClose={(e) => setOption("")}/>
                </Show>
        </div>
    )
}

// server
ConfigUser.getInitialProps = async (ctx) => {
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
export default ConfigUser;