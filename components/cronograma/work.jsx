import React, { useEffect, Fragment, useContext } from 'react';
import { Form, Select } from 'semantic-ui-react';
import { parseOptions } from '../../services/utils';
import Show from '../show';
import Swal from 'sweetalert2';
import moment from 'moment';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import Skeleton from 'react-loading-skeleton';

const PlaceholderInput = () => <Skeleton height="37px"/> 

const Work = () => {

    const { historial, setBlock, loading, setIsEditable } = useContext(CronogramaContext);
    const isHistorial = Object.keys(historial).length;

    useEffect(() => {
        setIsEditable(false);
        if (historial.id) setBlock(false);
    }, [historial.id]);

    return <Fragment>
            <div className="row">
                <div className="col-md-3 mb-3">
                    <Show condicion={isHistorial && !loading}
                        predeterminado={<PlaceholderInput/>}
                    >
                        <Form.Field>
                            <label>Apellido Paterno</label>
                            <input type="text" 
                                name="ape_pat"
                                className="uppercase"
                                value={historial && historial.person && historial.person.ape_pat}
                                readOnly
                            />
                        </Form.Field>
                    </Show>
                </div>

                <div className="col-md-3 mb-3">
                    <Form.Field>
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <label>Apellido Materno</label>
                            <input type="text" 
                                className="uppercase"
                                name="ape_mat"
                                value={historial && historial.person && historial.person.ape_mat}
                                readOnly
                            />
                        </Show>
                    </Form.Field>
                </div>

                <div className="col-md-3 mb-3">
                    <Show condicion={isHistorial && !loading}
                        predeterminado={<PlaceholderInput/>}
                    >
                        <Form.Field>
                            <label>Nombres</label>
                            <input type="text" 
                                className="uppercase"
                                name="name"
                                value={historial && historial.person && historial.person.name}
                                readOnly
                            />
                        </Form.Field>
                    </Show>
                </div>

                <div className="col-md-3 mb-3">
                    <Form.Field>
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <label>Género</label>
                            <Select placeholder="Select. Género"
                                options={[
                                    {key: "t", value: "", text: "Select. Género"},
                                    {key: "m", value: "M", text: "Masculino"},
                                    {key: "f", value: "F", text: "Femenino"},
                                    {key: "i", value: "I", text: "No Binario"}
                                ]}
                                name="gender"
                                value={historial && historial.person && historial.person.gender}
                                disabled
                            />
                        </Show>
                    </Form.Field>
                </div>

                <div className="col-md-3 mb-3">
                    <Form.Field>
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <label>Tipo Documento</label>
                            <input
                                type="text"
                                readOnly
                                value={historial && historial.person && historial.person.document_type}
                            />
                        </Show>
                    </Form.Field>
                </div>

                <div className="col-md-3 mb-3">
                    <Show condicion={isHistorial && !loading}
                        predeterminado={<PlaceholderInput/>}
                    >
                        <Form.Field>
                            <label>N° Documento</label>
                            <input type="text" 
                                name="document_number"
                                value={historial && historial.person && historial.person.document_number}
                                readOnly
                            />
                        </Form.Field>
                    </Show>
                </div>

                <div className="col-md-3 mb-3">
                    <Show condicion={isHistorial && !loading}
                        predeterminado={<PlaceholderInput/>}
                    >
                        <Form.Field>
                            <label>Fecha de Nacimiento</label>
                            <input type="date" 
                                name="date_of_birth"
                                value={historial && historial.person && historial.person.date_of_birth || ''}
                                readOnly
                            />
                        </Form.Field>
                    </Show>
                </div>

                <div className="col-md-3 mb-3">
                    <Show condicion={isHistorial && !loading}
                        predeterminado={<PlaceholderInput/>}
                    >
                        <Form.Field>
                            <label>Edad</label>
                            <input type="text" 
                                name="age"
                                value={`${historial && historial.person && historial.person.edad || ""}`}
                                readOnly
                            />
                        </Form.Field> 
                    </Show>
                </div>

                <div className="col-md-3 mb-3">
                    <Show condicion={isHistorial && !loading}
                        predeterminado={<PlaceholderInput/>}
                    >
                        <Form.Field>
                            <label>Profesión Abrev.</label>
                            <input type="text"
                                className="uppercase"
                                name="profession"
                                value={historial && historial.person && historial.person.profession || ''}
                                readOnly
                            />
                        </Form.Field>
                    </Show>
                </div>

                    <div className="col-md-3 mb-3">
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <Form.Field>
                                <label>Departamento</label>
                                <input type="text"
                                    name="cod_dep"
                                    className="uppercase"
                                    readOnly
                                    value={historial && historial.person && historial.person.departamento || ""}
                                />
                            </Form.Field>
                        </Show>
                    </div>

                    <div className="col-md-3 mb-3">
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <Form.Field>
                                <label>Provincia</label>
                                <input type="text"
                                    className="uppercase"
                                    name="cod_pro"
                                    readOnly
                                    value={historial && historial.person && historial.person.provincia || ""}
                                />
                            </Form.Field>
                        </Show>
                    </div>

                    <div className="col-md-3 mb-3">
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <Form.Field>
                                <label>Distrito</label>
                                <input type="text" 
                                    name="cod_dis"
                                    className="uppercase"
                                    readOnly
                                    value={historial && historial.person && historial.person.distrito || ""}
                                />
                            </Form.Field>
                        </Show>
                    </div>

                    <div className="col-md-3 mb-3">
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <Form.Field>
                                <label>Dirección</label>
                                <input type="text" 
                                    name="address"
                                    className="uppercase"
                                    value={historial && historial.person && historial.person.address || ''}
                                    readOnly
                                />
                            </Form.Field>      
                        </Show>    
                    </div>
                        
                    <div className="col-md-3 mb-3">
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <Form.Field>
                                <label>Correo Electrónico</label>
                                <input type="text" 
                                    name="email_contact"
                                    value={historial && historial.person && historial.person.email_contact || ''}
                                    readOnly
                                />
                            </Form.Field> 
                        </Show>
                    </div>
                        
                    <div className="col-md-3 mb-3">
                        <Show condicion={isHistorial && !loading}
                            predeterminado={<PlaceholderInput/>}
                        >
                            <Form.Field>
                                <label>N° Teléfono</label>
                                <input type="text"  
                                    name="phone"
                                    value={historial && historial.person && historial.person.phone || ""}
                                    readOnly
                                />
                            </Form.Field> 
                        </Show> 
                    </div>
            </div>
    </Fragment>
}


export default Work;