import React, { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';
import { BtnBack } from '../Utils';
import { Form, Select } from 'semantic-ui-react';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { backUrl } from '../../services/utils';
import Show from '../show';
import Router from 'next/router';


const HeaderCronograma = () => {

    const { cronograma, loading } = useContext(CronogramaContext);
    
    const handleBack = () => {
        let goBack = backUrl(Router.pathname);
        Router.push({ pathname: goBack, query: { year: cronograma.year, mes: cronograma.mes } });
    }

    return (
        <div className="row pl-2 pr-2">
            <div className="col-md-2 col-4">
                <BtnBack
                    onClick={handleBack}
                    disabled={loading}
                />
            </div>

            <div className="col-md-2 col-4 mb-1">
                <Form.Field>
                    <input type="number" 
                        placeholder="Año"
                        value={cronograma.year || ""}
                        readOnly
                    /> 
                </Form.Field>
            </div>

            <div className="col-md-2 col-4 mb-1">
                <Form.Field>
                    <input type="number" 
                        placeholder="Mes"
                        value={cronograma.mes || ""}
                        readOnly
                    />
                </Form.Field>
            </div>

            <div className="col-md-3 col-12 mb-1 col-sm-3">
                <Form.Field>
                    <input type="text"
                        placeholder="Planilla"
                        value={cronograma.planilla && cronograma.planilla.nombre || ""}
                        readOnly
                    />
                </Form.Field>
            </div>

            <Show condicion={cronograma.adicional}>
                <div className="col-md-3 col-12 mb-1">
                    <Form.Field>
                        <input type="text" 
                            value={`Adicional ${cronograma.adicional}`}
                            readOnly
                        />
                    </Form.Field>
                </div>
            </Show>
        </div>
    );
}

export default HeaderCronograma;