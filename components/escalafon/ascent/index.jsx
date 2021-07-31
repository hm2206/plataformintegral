import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show';
import CreateAscent from './createAscent';
import { BtnFloat } from '../../Utils';
import ItemAscent from './itemAscent';
import InfoProvider from '../../../providers/escalafon/InfoProvider';
import { Button } from 'semantic-ui-react';
import ItemInfo from '../infos/itemInfo';
import collect from 'collect.js';
import { SelectWorkInfo } from '../../select/escalafon';

const infoProvider = new InfoProvider();

const Placeholder = () => {

    const datos = [1, 2, 3, 4];

    return datos.map((d, indexD) => 
        <div key={`placeholder-contrato-${indexD}`}>
            <Skeleton height="50px"/>
            <Skeleton height="150px"/>
        </div>
    )
}

const Ascent = ({ work }) => {

    const options = {
        CREATE: "create",
        EDIT: "edit"
    }

    const [option, setOption] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_data, setCurrentData] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [error, setError] = useState(false);
    const [is_refresh, setIsRefresh] = useState(true);
    const [current_info, setCurrentInfo] = useState({});

    const isNextPage = useMemo(() => {
        return (current_page + 1) <= current_last_page;
    }, [current_data]);

    // obtener permissions
    const getDatos = async (add = false) => {
        setCurrentLoading(true);
        await infoProvider.ascents(current_info.id, { page: current_page })
        .then(res => {
            let { success, message, ascents } = res.data;
            if (!success) throw new Error(message);
            setError(false);
            setCurrentTotal(ascents.total);
            setCurrentLastPage(ascents.lastPage);
            setCurrentData(add ? [...current_data, ...ascents.data] : ascents.data);
        })
        .catch(() => setError(true))
        setCurrentLoading(false);
    }

    const onSave = async () => {
        setOption("");
        getDatos();
    }

    const onUpdate = async (permission) => {
        let newDatos = [];
        await current_data?.filter(d => {
            if (d.id == permission.id) newDatos.push(permission);
            else newDatos.push(d);
            return d;
        });
        
        setCurrentData(newDatos);
    }

    const onDelete = async () => {
        setOption("");
        getDatos();
    }

    const handleInfo = (e, { value, options }) => {
        let plucked = collect(options).pluck('value').toArray();
        let index = plucked.indexOf(value);
        if (index < 0) return; 
        let obj = options[index];
        setCurrentInfo(obj?.obj || {});
    }

    useEffect(() => {
        if (current_info?.id) {
            setIsRefresh(true);
            setCurrentPage(1);
            setCurrentTotal(0);
        }
    }, [current_info?.id]);

    useEffect(() => {
        if (current_page > 1) getDatos(true);
    }, [current_page]);

    // primera carga
    useEffect(() => {
        if (is_refresh) getDatos();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    // render
    return <div className="row">
        <div className="col-md-12">
            <h5>
                Listado de Ascensos
                <Show condicion={current_info?.id && !current_loading}>
                    <span className="close cursor-pointer"
                        onClick={() => {
                            setCurrentPage(1);
                            setIsRefresh(true);
                        }}
                    >
                        <i className="fas fa-sync"></i>
                    </span>
                </Show>
            </h5>
            <hr/>
        </div>

        <div className="col-4">
            <SelectWorkInfo
                defaultValue={1}
                onDefaultValue={({obj}) => setCurrentInfo(obj)}
                principal={1}
                work_id={work?.id}
                name="info_id"
                value={current_info?.id}
                onChange={handleInfo}
            />
        </div>

        <div className="col-12 mb-3"></div>
        
        <Show condicion={current_info?.id}>
            <div className="col-md-4">
                <ItemInfo info={current_info}/>
            </div>

            <div className="col-md-8">
                {current_data.map((d, indexD) => 
                    <ItemAscent key={`grado-lista-${indexD}`}
                        ascent={d}
                        info={current_info}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                )}

                {/* no hay registros */}
                <Show condicion={!current_loading && !current_data?.length}>
                    <div className="card card-body text-center">
                        <b>No hay regístros disponibles</b>
                    </div>
                </Show>  

                <Show condicion={current_loading}>
                    <Placeholder/>
                </Show>
            
                <Show condicion={isNextPage}>
                    <div className="col-12">
                        <Button onClick={() => setCurrentPage(prev => prev + 1)} fluid>
                            <i className="fas fa-arrow-down"></i> Obtener más regístros
                        </Button>
                    </div>
                </Show>
            </div>   


            <BtnFloat onClick={() => setOption(options.CREATE)}>
                <i className="fas fa-plus"></i>
            </BtnFloat>

            <Show condicion={option == options.CREATE}>
                <CreateAscent
                    info={current_info}
                    onClose={() => setOption("")}
                    onSave={onSave}
                />
            </Show>
        </Show>
    </div>
}

// export 
export default Ascent;