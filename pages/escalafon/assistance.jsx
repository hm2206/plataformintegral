import React, { useContext, useState, useEffect } from 'react';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
import { BtnFloat } from '../../components/Utils';
import ListAssistance from '../../components/escalafon/listAssistance';
import CreateAssistance from '../../components/escalafon/createAssistance';
import SyncAssistanceToClock from '../../components/escalafon/syncAssistanceToClock';
import { EntityContext } from '../../contexts/EntityContext';
import Show from '../../components/show';
import { AssistanceContext, AssistanceProvider } from '../../contexts/escalafon/AssistanceContext';
import { Message } from 'semantic-ui-react';

const WrapperSyncClock = () => {

    const { year, month, setOption } = useContext(AssistanceContext)

    return (
        <SyncAssistanceToClock 
            year={year}
            month={month}
            onClose={() => setOption("")}
        />
    )
}

const Assistance = ({ pathname, query }) =>  {

    // entity
    const { entity_id, fireEntity } = useContext(EntityContext);

    // estados
    const [option, setOption] = useState("");

    const handleOption = (e, index, obj) => {
        switch (obj.key) {
            case 'sync-assistance':
            case 'report-pdf':
                setOption(`${obj.key}`.toUpperCase());
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        fireEntity({ render: true });
        return () => fireEntity({ render: false });
    }, []);

    // render
    return (
        <AssistanceProvider value={{ setOption, option }}>
            <div className="col-12">
                <BoardSimple
                    title="Asistencia"
                    info={["Control de asistencia diaria"]}
                    bg="danger"
                    options={[
                        { key: "sync-assistance", title: "Sincronizar asistencia con el reloj biométrico", icon: "fas fa-user-clock" },
                        { key: "report-pdf", title: "Generar reporte PDF", icon: "fas fa-file-export" }
                    ]}
                    onOption={handleOption}
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
                            <ListAssistance/>
                        </Show>
                    </div>
                </BoardSimple>
                {/* btn para crear asistencia */}
                <BtnFloat onClick={() => setOption("CREATE")}>
                    <i className="fas fa-plus"></i>
                </BtnFloat>
                {/* show asistencia */}
                <Show condicion={option == 'CREATE'}>
                    <CreateAssistance onClose={() => setOption("")}/>
                </Show>
                {/* sincronizar asistencia */}
                <Show condicion={option == 'SYNC-ASSISTANCE'}>
                    <WrapperSyncClock/>
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