import React, { useContext, useEffect, useState } from 'react';
import BoardSimple from '../../components/boardSimple';
import { BtnFloat } from '../../components/Utils';
import ListRole from '../../components/tramite/listRole';
import { SelectAuthEntityDependencia } from '../../components/select/authentication';
import { AuthContext } from '../../contexts/AuthContext';
import { EntityContext } from '../../contexts/EntityContext';
import CreateRole from '../../components/tramite/createRole';
import { AUTHENTICATE } from '../../services/auth';

const RoleTramite = () => {

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

    // render
    return (
        <div className="col-12">
            <BoardSimple
                prefix="R"
                bg="danger"
                options={[]}
                title="Roles"
                info={["Agregar rol a usuario"]}
            >
                <div className="card-body mt-4">
                    <div className="row">
                        <div className="col-md-6">
                            <SelectAuthEntityDependencia
                                user_id={auth.id || ""}
                                entity_id={entity_id || ""} 
                                execute={false}
                                value={dependencia_id}
                                onChange={(e, obj) => setDependenciaId(obj.value)}
                            />
                        </div>

                        <div className="col-12">
                            <hr/>
                        </div>

                        <div className="col-7">
                            <ListRole dependencia_id={dependencia_id}
                                is_create={is_create}
                                setIsCreate={setIsCreate}
                            />
                        </div>

                        <div className="col-5">
                            <CreateRole dependencia_id={dependencia_id}
                                setIsCreate={setIsCreate}
                            />
                        </div>
                    </div>
                </div>
            </BoardSimple>
        </div>
    )
}

RoleTramite.getInitialProps = (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    // response
    return { pathname, query }
}

export default RoleTramite;