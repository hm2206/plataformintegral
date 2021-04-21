import React, { useContext, useState, useEffect } from 'react';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
import { BtnFloat } from '../../components/Utils';
import ListAssistance from '../../components/clock/listAssistance';
import CreateAssistance from '../../components/clock/createAssistance';
import { EntityContext } from '../../contexts/EntityContext';
import Show from '../../components/show';
import { AssistanceProvider } from '../../contexts/clock/AssistanceContext';

const Assistance = ({ pathname, query }) => {

    // entity
    const { entity_id, fireEntity } = useContext(EntityContext);

    // estados
    const [option, setOption] = useState("");

    useEffect(() => {
        fireEntity({ render: true });
        return () => fireEntity({ render: false });
    }, []);

    // render
    return (
        <AssistanceProvider>
            <div className="col-12">
                <BoardSimple
                    title="Asistencia"
                    info={["Control de asistencia diaria"]}
                    bg="danger"
                    options={[]}
                >
                    <div className="card-body">
                        <ListAssistance/>
                    </div>
                </BoardSimple>
                {/* btn para crear asistencia */}
                <BtnFloat onClick={() => setOption("CREATE")}>
                    <i className="fas fa-plus"></i>
                </BtnFloat>
                {/* show asistencia */}
                <Show condicion={option == 'CREATE'}>
                    <CreateAssistance
                        onClose={() => setOption("")}
                    />
                </Show>
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