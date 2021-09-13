import React, { useState } from 'react';
import Modal from '../../../modal';
import currencyFormatter from 'currency-formatter';
import { Form, Accordion, Button } from 'semantic-ui-react';
import AddDetalle from '../../addDetalle';
import ListDetalle from '../../listDetalle';
import { Confirm } from '../../../../services/utils';
import { handleErrorRequest, projectTracking } from '../../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../show';

const VerifyFinanciera = ({ gasto, isClose = null, onVerifycationFinanciera = null }) => {

    // estados
    const [current_index, setCurrentIndex] = useState(undefined);
    const [current_loading, setCurrentLoading] = useState(false);

    const handleIndex = (e, obj) => {
        setCurrentIndex(obj.index == current_index ? undefined : obj.index);
    }

    const handleVerifyFinanciera = async () => {
        let answer = await Confirm('info', '¿Deseas realizar la verificación Financiera?', 'Verificar');
        if (!answer) return false;
        setCurrentLoading(true);
        await projectTracking.post(`gasto/${gasto.id}/execute_verify?_method=PUT&verify=${gasto.verify_financiera ? 0 : 1}`)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            if (typeof onVerifycationFinanciera == 'function') onVerifycationFinanciera(gasto);
        }).catch(err => handleErrorRequest(err));
        setCurrentLoading(false);
    }

    // render
    return (
        <Modal titulo={<span><i className="fas fa-info-circle mr-1"></i> Detalles de gasto</span>}
            show={true}
            isClose={isClose}
        >
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Partida Presupuestal</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${gasto?.presupuesto} - ${gasto?.ext_pptto}`}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Descripción de gasto programado</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${gasto?.description}`}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Medida de gasto programado</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${gasto?.medida}`}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Saldo disponible</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${currencyFormatter.format(gasto?.saldo || 0, { code: 'PEN' })}`}
                            />
                        </Form.Field>
                    </div>
                </div>

                {/* menus */}
                <div className="col-12">
                    <Accordion
                        className="w-100"
                        styled
                    >
                        {/* crear comprobantes */}
                        <Show condicion={!gasto?.execute_verify}>
                            <Accordion.Title 
                                active={current_index == 0}
                                index={0}
                                onClick={handleIndex}
                            >
                                <i className="fas fa-plus"></i> Agregar Comprobantes
                            </Accordion.Title>
                            <Show condicion={current_index == 0}>
                                <Accordion.Content active={true}>
                                    <AddDetalle gasto={gasto}
                                        onSave={() => setCurrentIndex(1)}
                                    />
                                </Accordion.Content>
                            </Show>
                        </Show>
                        {/* listar comprobantes */}
                        <Accordion.Title 
                            active={gasto?.execute_verify ? true : current_index == 1}
                            index={1}
                            onClick={handleIndex}
                        >
                            <i className="fas fa-list"></i> Listar Comprobantes
                        </Accordion.Title>
                        <Show condicion={current_index == 1}>
                            <Accordion.Content active={true}>
                                <ListDetalle gasto={gasto}/>
                            </Accordion.Content>
                        </Show>
                    </Accordion>
                </div>

                <Show condicion={!gasto?.execute_verify}>
                    <div className="col-12 mt-3 text-right">
                        <Button color="teal" 
                            onClick={handleVerifyFinanciera}
                            disabled={current_loading}
                            loading={current_loading}
                        >
                            <i className="fas fa-check mr-1"></i>
                            Verificación Financiera
                        </Button>
                    </div>
                </Show>
            </Form>
        </Modal>
    )
}

export default VerifyFinanciera;