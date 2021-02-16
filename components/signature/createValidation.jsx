import React, { useContext, useState } from 'react';
import Modal from '../modal';
import { Form, Button } from 'semantic-ui-react';
import { DropZone } from '../Utils';
import Show from '../show';
import { Confirm } from '../../services/utils';
import { signature } from '../../services/apis';
import Swal from 'sweetalert2';
import { GroupContext } from '../../contexts/SignatureContext';

const CreateValidation = ({ person = {}, onClose = null }) => {

    // group
    const group_context = useContext(GroupContext);

    // estados
    const [current_file, setCurrentFile] = useState(null);
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_error, setCurrentError] = useState({}); 

    // crear
    const create = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en crear la validación?`, 'estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        let options = {
            headers: { 
                DependenciaId: group_context.group.dependencia_id,
                GroupId: group_context.group.id,
            }
        };
        // send
        let datos = new FormData;
        datos.append('person_id', person.id);
        datos.append('files', current_file);
        await signature.post(`auth/validation`, datos, options)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
        })
        .catch(err => {
            try {
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message || err.message);
                Swal.fire({ icon: 'warning', text: data.message || err.message });
                setCurrentError(data.errors || {});
            } catch (error) {
                Swal.fire({ icon: 'error', text: error.message });
            }
        });
        setTimeout(() => setCurrentLoading(false), 1000);
    }

    // render
    return (
        <Modal show={true}
            titulo={<span><i className="fas fa-plus"></i> Crear validación</span>}
            isClose={onClose}
        >
            <Form className="card-body">
                <Form.Field className="mb-3">
                    <label>Tipo Documento</label>
                    <input type="text"
                        readOnly
                        value={person.document_type || ""}
                    />
                </Form.Field>

                <Form.Field className="mb-3">
                    <label>N° Documento</label>
                    <input type="text"
                        readOnly
                        value={person.document_number || ""}
                    />
                </Form.Field>

                <Form.Field className="mb-3">
                    <label>Apellidos y Nombres</label>
                    <input type="text"
                        readOnly
                        className="capitalize"
                        value={person.fullname || ""}
                    />
                </Form.Field>

                <Form.Field className="mb-3">
                    <label>Páginas</label>
                    <input type="text"
                        readOnly
                        className="capitalize"
                        value={group_context.group && group_context.group.pages || ""}
                    />
                </Form.Field>

                <Form.Field className="mb-3">
                    <label>Dimensiones</label>
                    <div className="row">
                        <div className="col-5">
                            <input type="text"
                                readOnly
                                className="text-center"
                                value={group_context.group.width}
                            />
                        </div>
                        
                        <div className="col-2">
                            <input type="text"
                                className="text-center"
                                readOnly
                                value="X"
                            />
                        </div>

                        <div className="col-5">
                            <input type="text"
                                readOnly
                                className="text-center"
                                value={group_context.group.height}
                            />  
                        </div>
                    </div>
                </Form.Field>

                <Form.Field className="mb-3" error={current_error.files && current_error.files[0] ? true : false}>
                    <label>Archivo <b className="text-red">*</b></label>
                    <Show condicion={!current_file}
                        predeterminado={
                        <div className="card card-body">
                            {current_file && current_file.name || ""}
                            <i className="fas fa-times cursor-pointer" 
                                style={{ position: 'absolute', top: 'calc(50% - 5px)', right: '10px' }}
                                onClick={(e) => setCurrentFile(null)}
                            />
                        </div>}
                    >
                        <DropZone
                            id="file-upload-validation-create"
                            multiple={false}
                            accept="application/pdf"
                            title="Seleccionar archivo PDF"
                            onChange={({ files }) => setCurrentFile(files[0] || null)}
                        />
                    </Show>
                </Form.Field>

                <hr/>

                <div className="text-right">
                    <Button color="teal"
                        onClick={create}
                    >
                        <i className="fas fa-save"></i> Guardar
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default CreateValidation;