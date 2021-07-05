import React, { useContext, useEffect, useState } from 'react';
import BoardSimple from '../../components/boardSimple';
import ListConfigDependencia from '../../components/tramite/listConfigDependencia';
import { SelectDependencia } from '../../components/select/authentication';
import { AuthContext } from '../../contexts/AuthContext';
import { EntityContext } from '../../contexts/EntityContext';
import CreateConfigDependencia from '../../components/tramite/createConfigDependencia';
import { AUTHENTICATE } from '../../services/auth';
import Show from '../../components/show';
import { Message } from 'semantic-ui-react'

const ConfigDependencia = () => {

    // auth
    const { auth } = useContext(AuthContext);

    // entity
    const { entity_id, fireEntity } = useContext(EntityContext);

    // estados
    const [dependencia_id, setDependenciaId] = useState("");
    const [is_create, setIsCreate] = useState(false);

    // effect
    useEffect(() => {
        fireEntity({ render: true });
        return () => fireEntity({ render: false });
    }, []);

    // reset entity
    useEffect(() => {
        setDependenciaId("");
    }, [entity_id]);

    // render
    return (
        <div className="col-12">
            <BoardSimple
                prefix="R"
                bg="danger"
                options={[]}
                title="Configurar Dependencia"
                info={["Control de configuración de Dependencia"]}
            >
                <div className="card-body mt-4">
                    <div className="row">
                        <div className="col-md-6">
                            <SelectDependencia
                                value={dependencia_id}
                                onChange={(e, obj) => setDependenciaId(obj.value)}
                                disabled={!entity_id}
                            />
                        </div>

                        <div className="col-12">
                            <hr/>
                        </div>

                        <Show condicion={dependencia_id}
                            predeterminado={
                                <div className="col-12">
                                    <Message color="yellow">
                                        Porfavor seleccione una dependencia!
                                    </Message>
                                </div>
                            }
                        >
                            <div className="col-md-7 col-12">
                                <ListConfigDependencia dependencia_id={dependencia_id}
                                    is_create={is_create}
                                    setIsCreate={setIsCreate}
                                />
                            </div>

                            <div className="col-12 col-md-5">
                                <CreateConfigDependencia dependencia_id={dependencia_id}
                                    setIsCreate={setIsCreate}
                                />
                            </div>
                        </Show>
                    </div>
                </div>
            </BoardSimple>
        </div>
    )
}

ConfigDependencia.getInitialProps = (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

export default ConfigDependencia;