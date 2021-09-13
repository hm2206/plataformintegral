import React, { useState } from 'react';
import moment from 'moment';
import currentFormatter from 'currency-formatter';
import ExecutePlanTrabajo from './project/plan_trabajo/executePlanTrabajo';
import AnualPlanTrabajo from './anualPlanTrabajo';
import Anexos from './anexos';
import ReportPlanTrabajo from './reportPlanTrabajo';
import PreviewPlanTrabajo from './project/plan_trabajo/previewPlanTrabajo'
import { Button } from 'semantic-ui-react';
import Show from '../show';

const ItemPlanTrabajo = ({ plan_trabajo }) => {

    // estados
    const [option, setOption] = useState("");

    // response
    return (
        <tr>
            <td className="text-center">{plan_trabajo?.duration}</td>    
            <td className="text-center">{plan_trabajo?.year}</td>  
            <td className="text-center">{plan_trabajo?.resolucion}</td>
            <td className="text-center">{moment(plan_trabajo?.date_resolucion).format('DD/MM/YYYY')}</td> 
            <th className="text-center">{currentFormatter.format(plan_trabajo?.monto, { code: 'PEN' })}</th> 
            <td>
                <div className="text-center">
                    <div>
                        <Button.Group size="mini">
                            <Button className="btn btn-sm btn-outline-primary"
                                onClick={(e) => setOption('info')}
                                title="Ver más"
                                icon="search"
                                color="blue"
                            />

                            <Button className="btn btn-sm btn-outline-dark"
                                title="Ejecutar plan de trabajo"
                                onClick={(e) => setOption('execute')}
                                icon="check"
                                color="yellow"
                            />

                            <Button className="btn btn-sm btn-outline-danger"
                                title="reporte"
                                onClick={(e) => setOption('anual')}
                                icon="file pdf"
                                color="red"
                            />

                            <Button className="btn btn-sm btn-warning"
                                title="Anexos del plan de trabajo"
                                onClick={(e) => setOption('anexos')}
                                icon="upload"
                                color="violet"
                            />
                        </Button.Group>
                    </div>
                </div>
                {/* dialogos */}
                <Show condicion={option == 'info'}>
                    <PreviewPlanTrabajo 
                        plan_trabajo={plan_trabajo} 
                        onClose={() => setOption("")}
                    />
                </Show>

                <Show condicion={option == 'execute'}>
                    <ExecutePlanTrabajo
                        plan_trabajo={plan_trabajo}
                        onClose={(e) => setOption("")}
                    />
                </Show>

                <Show condicion={option == 'anual'}>
                    <ReportPlanTrabajo
                        plan_trabajo={plan_trabajo}
                        isClose={(e) => setOption("")}
                    />
                </Show>

                <Show condicion={option == 'anexos'}>
                    <Anexos
                        object_id={plan_trabajo.id}
                        object_type={'App/Models/PlanTrabajo'}
                        isClose={(e) => setOption("")}
                    />
                </Show>
            </td> 
        </tr>
    )
}

export default ItemPlanTrabajo;