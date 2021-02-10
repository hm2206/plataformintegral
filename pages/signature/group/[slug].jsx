import React , { useState } from 'react';
import BoardSimple from '../../../components/boardSimple';
import CardReflow from '../../../components/cardReflow';
import { BtnBack, DropZone } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { signature } from '../../../services/apis';
import AddTeam from '../../../components/signature/addTeam'

const SlugGroup = ({ pathname, query, success, group }) => {

    // estados
    const [option, setOption] = useState("");

    const handleOption = (e, index, obj) => {
        switch (obj.key) {
            case 'ADD_TEAM':
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
            <BoardSimple
                bg="light"
                title={group.title || ""}
                info={[group.description || '']}
                prefix={<BtnBack className="mr-2"/>}
                onOption={handleOption}
                options={[
                    { key: 'ADD_TEAM', title: 'Agregar usuarios', icon: 'fas fa-user-plus' },
                    { key: 'CONFIG', title: 'Configurar Firma', icon: 'fas fa-cog' },
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
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <CardReflow
                            items={[]}
                            start={0}
                            over={0}
                            title={`Firmantes`}
                            info={`Equipo`}
                        />
                    </div>
                </div>
            </BoardSimple>
            {/* agregar equipo */}
            <AddTeam 
                show={option == 'ADD_TEAM'}
                checked={[1, 2]}
                onClose={(e) => setOption('')}
            />
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