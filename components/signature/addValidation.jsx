import React, { Fragment, useContext, useEffect, useState } from 'react';
import { signature, onProgress } from '../../services/apis';
import ModalRightPerson from '../authentication/modalRightPerson';
import { Confirm } from '../../services/utils';
import xlsx from 'node-xlsx';
import { Progress } from 'semantic-ui-react'
import { GroupContext } from '../../contexts/SignatureContext';
import Show from '../show';
import Swal from 'sweetalert2';
import CreateValidation from './createValidation';

const actions = {
    ADD: 'add',
    CREATE: 'create',
}

const AddTeam = ({ show, onClose, checked = [] }) => {

    // group
    const group_context = useContext(GroupContext);

    // estados
    const [current_person, setCurrentPerson] = useState({});
    const [option, setOption] = useState("");
    const [current_import, setCurrentImport] = useState(false);
    const [percent, setPercent] = useState(0);

    // agregemos al equipo
    const create = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en agregar al equipo?`, 'Estoy seguro');
        if (!answer) return false;
        let payload = {
            user_id: current_user
        };
        // enviar datos
        await signature.post(`post`, `auth/team`, )
    }

    // importar xlsx
    const handleImport = async ({ name, files }) => {
        let f = files[0];
        let input = document.getElementById('file_upload');
        if (input) input.value = null;
        let answer = await Confirm('warning', `¿Estas seguro en importar "${f.name}"?`);
        if (!answer) return false;
        setCurrentImport(true);
        let datos = new FormData;
        datos.append('file', f);
        let options = {
            onUploadProgress: (evt) => onProgress(evt, setPercent),
            headers: { 
                DependenciaId: group_context.group.dependencia_id, 
                GroupId: group_context.group.id
            },
        }
        // enviar
        await signature.post(`auth/validation/import`, datos, options)
        .then(res => {
            let { success, message } = res.data;
            Swal.fire({ icon: 'success', text: message });
        }).catch(err => {
            
        });
        // finalizar carga
        setTimeout(() => {
            setCurrentImport(false);
        }, 1000);
    }   

    // generar formato
    const handleFormato = async (e) => {
        e.preventDefault();
        const data = [["document_number", "ruler"], ["N° de documento", "nombre del archivo", "Borrar esta fila para empezar"]];
        let buffer = xlsx.build([{name: "formato", data: data}])
        let blob = new Blob([new Uint8Array(buffer)], { type: 'application/xslx' });
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `formato_import.xlsx`;
        a.target = '_blank';
        a.click();
    }

    // render
    return (
        <Fragment>
            <ModalRightPerson
                show={show}
                title="Agregar Validaciones"
                onClose={onClose}
                onCheck={(e, person) => {
                    setCurrentPerson(person);
                    setOption(actions.CREATE);
                }}
            >
                <Show condicion={!current_import}
                    predeterminado={<Progress percent={percent} color="blue" active/>}
                >
                    <label htmlFor="file_upload" className="btn btn-outline-success btn-block cursor-pointer">
                        <input type="file"
                            hidden
                            id="file_upload"
                            accept="application/xlsx"
                            onChange={({target}) => handleImport(target)}
                        />
                        <i className="fas fa-upload"></i>
                    </label>
                </Show>

                <div className="text-right mt-3">
                    <a href="#" onClick={handleFormato}>
                        <u><i className="fas fa-file-excel"></i> Formato</u>
                    </a>
                </div>
                <hr/>
            </ModalRightPerson>
            {/* ventanas */}
            <Show condicion={option == actions.CREATE}>
                <CreateValidation 
                    onClose={(e) => setOption("")}
                    person={current_person}
                />
            </Show>
        </Fragment>
    );
}

export default AddTeam;