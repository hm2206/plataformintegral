import React, { useEffect, useState, useMemo } from 'react'
import FileSimple from '../../fileSimple'
import { escalafon } from '../../../services/apis'
import Show from '../../show'
import Skeleton from 'react-loading-skeleton'
import Modal from '../../modal'
import CreateFile from './createFile'
import { Button } from 'semantic-ui-react'
import Visualizador from '../../visualizador'

const PlaceholderFile = () => {
    const datos = [1, 2, 3]
    return datos?.map((d, indexD) => 
        <div className="col-md-4" key={`item-file-preloader-${indexD}`}>
            <Skeleton height="200px"/>
        </div>
    )
}

const ListFile = ({ objectType, objectId, onClose = null }) => {

    const [current_loading, setCurrentLoading] = useState(false)
    const [is_error, setIsError] = useState(false)
    const [current_file, setCurrentFile] = useState({})
    const [datos, setDatos] = useState([])
    const [page, setPage] = useState(1)
    const [last_page, setLastPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [is_refresh, setIsRefresh] = useState(true)

    const nextPage = useMemo(() => {
        return (page + 1) <= last_page ? true : false
    }, [datos])

    const isVisualizador = useMemo(() => {
        return Object.keys(current_file || {}).length
    }, [current_file])

    const getFiles = async (add = false) => {
        setCurrentLoading(true)
        await escalafon.get(`files/${objectId}/object_type?type=${objectType}`)
        .then(res => {
            let { files } = res.data 
            setIsError(false)
            setLastPage(files?.lastPage || 0)
            setDatos(add ? [...datos, ...files.data] : files.data)
        }).catch(() => {
            setIsError(true)
            setPage(prev => prev <= 1 ? 1 : prev - 1)
        })
        setCurrentLoading(false)
    }

    const handleRefresh = () => {
        setDatos([])
        setPage(1)
        setIsRefresh(true)
    }

    useEffect(() => {
        if (is_refresh) getFiles()
    }, [is_refresh])

    useEffect(() => {
        if (page > 1) getFiles(true)
    }, [page])

    useEffect(() => {
        if (is_refresh) setIsRefresh(false)
    }, [is_refresh])

    return (
        <Modal titulo={<span><i className="fas fa-file-alt"></i> Listado de Archivos</span>}
            show={true}
            isClose={onClose}
        >
            <div className="card-body">
                <div className="row">
                    <div className="col-12">
                        <CreateFile objectId={objectId}
                            objectType={objectType}
                            onSave={handleRefresh}
                        />
                    </div>

                    <Show condicion={!current_loading && datos.length}>
                        <div className="col-12 mb-3 text-right">
                            <hr />
                            <Button onClick={handleRefresh}>
                                <i className="fas fa-sync"></i>
                            </Button>
                        </div>
                    </Show>

                    {datos?.map((d, indexD) =>
                        <div className="col-md-4" key={`list-item-${indexD}`}>
                            <FileSimple
                                name={d?.name}
                                size={d?.size}
                                extname={d?.extname}
                                url={d?.url}
                                onClick={() => setCurrentFile(d)}
                            />    
                        </div>     
                    )}  
                    {/* preloading */}
                    <Show condicion={current_loading}>
                        <PlaceholderFile/>
                    </Show>
                    {/* no hay datos */}
                    <Show condicion={!current_loading && !datos.length}>
                        <div className="card div card-body text-center">
                            <b className="cursor-pointer" onClick={handleRefresh}>
                                No hay regístros disponibles, click aquí para refrescar  <i className="fas fa-sync"></i>
                            </b> 
                        </div>
                    </Show>
                    {/* obtener más regístros */}
                    <Show condicion={nextPage}>
                        <Button basic fluid onClick={() => setPage(prev => prev + 1)}>
                            <i className="fas fa-arrow-down"></i> Obtener más regístros
                        </Button>
                    </Show>
                </div>
            </div>
            {/* visualizador */}
            <Show condicion={isVisualizador}>
                <Visualizador 
                    id="item-visual-file-escalafon"
                    name={current_file?.name}
                    extname={current_file?.extname}
                    url={current_file?.url}
                    onClose={() => setCurrentFile({})}
                    is_observation={false}
                />
            </Show>
        </Modal>
    )
}

export default ListFile