import React , { useState } from 'react';
import BoardSimple from '../../../components/boardSimple';
import { BtnBack, DropZone } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { signature } from '../../../services/apis';
import { GroupProvider } from '../../../contexts/SignatureContext';
import AddTeam from '../../../components/signature/addTeam';
import AddValidation from '../../../components/signature/addValidation';
import ListValidation from '../../../components/signature/listValidation';
import ListTeam from '../../../components/signature/listTeam';


const SlugGroup = ({ pathname, query, success, group }) => {

    // estados
    const [option, setOption] = useState("");

    const handleOption = (e, index, obj) => {
        switch (obj.key) {
            case 'ADD_TEAM':
            case 'ADD_VALIDATION':
                setOption(obj.key);
                break;
            default:
                break;
        }
    }

    if (!success) return 'Not found'

    // render
    return (
        <div className="col-md-12">
            <GroupProvider value={{ group }}>
                <BoardSimple
                    bg="light"
                    title={group.title || ""}
                    info={[group.description || '']}
                    prefix={<BtnBack className="mr-2"/>}
                    onOption={handleOption}
                    options={[
                        { key: 'ADD_TEAM', title: 'Agregar al equipo de firma', icon: 'fas fa-user-plus' },
                        { key: 'ADD_VALIDATION', title: 'Agregar las validaciones', icon: 'fas fa-user-cog' },
                    ]}
                >
                    <div className="row">
                        <div className="col-md-8">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-12 mt-4">
                                        <DropZone
                                            id={`file-upload-signer`}
                                            name="files"
                                            multiple
                                            accept="application/pdf"
                                            title="Seleccionar PDF"
                                        />
                                        <hr/>
                                    </div>

                                    <div className="col-md-12">
                                        {/* listar validaciones */}
                                        <ListValidation/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            {/* listar team */}
                            <ListTeam/>
                        </div>
                    </div>
                </BoardSimple>
                {/* agregar equipo */}
                <AddTeam 
                    show={option == 'ADD_TEAM'}
                    onClose={(e) => setOption('')}
                />
                {/* agregar configuraciones */}
                <AddValidation
                    show={option == 'ADD_VALIDATION'}
                    onClose={(e) => setOption('')}
                />
            </GroupProvider>
        </div>
    )
}

// server
SlugGroup.getInitialProps = async (ctx) => {
    AUTHENTICATE(ctx);
    let { pathname, query } = ctx;
    let options = {
        headers: { 
            DependenciaId: query.dependencia_id,
            GroupId: query.slug || ''
        },
    }
    // request
    let { success, group } = await signature.get(`auth/group/${query.slug || '__error'}?type=slug`, options, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, group: {} }));
    // response
    return { pathname, query, success, group };
}

// exportar
export default SlugGroup;