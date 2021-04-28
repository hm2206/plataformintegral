import React, { useContext, useEffect } from 'react';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
import ListConfigAssistance from '../../components/clock/listConfigAssistance';
import Show from '../../components/show';
import { Message } from 'semantic-ui-react';
import { EntityContext } from '../../contexts/EntityContext';
import { AssistanceProvider } from '../../contexts/clock/AssistanceContext';

const Assistance = ({ pathname, query }) => {

    // entity
    const { entity_id, fireEntity } = useContext(EntityContext);

    useEffect(() => {
        fireEntity({ render: true });
        return () => fireEntity({ render: false });
    }, []);

    // render
    return (
        <AssistanceProvider>
            <div className="col-12">
                <BoardSimple
                    title="Configuración de Asistencia"
                    info={["Control de configuracion de asistencia mensual"]}
                    bg="danger"
                    options={[]}
                >
                    <div className="card-body">
                        <Show condicion={entity_id}
                            predeterminado={
                                <div className="mt-4">
                                    <Message color="yellow">
                                        Porfavor seleccione una Entidad
                                    </Message>
                                </div>
                            }
                        >
                            <ListConfigAssistance/>
                        </Show>
                    </div>
                </BoardSimple>
            </div>
        </AssistanceProvider>
    );
}

// server
Assistance.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    return { query, pathname }
}


// exportar
export default Assistance;