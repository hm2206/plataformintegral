import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AUTHENTICATE } from '../../services/auth';
import BoardSimple from '../../components/boardSimple';
import Show from '../../components/show';
import { Message, Form, Select, Button } from 'semantic-ui-react';
import { EntityContext } from '../../contexts/EntityContext';
import DiscountProvider from '../../providers/escalafon/DiscountProvider';
import TableContentDiscount from '../../components/escalafon/discount/tableContentDiscount';
import Skeleton from 'react-loading-skeleton';
import ItemDiscount from '../../components/escalafon/discount/itemDiscount';
import { SelectTypeCategoria } from '../../components/select/cronograma'
import { Confirm } from '../../services/utils';
import moment from 'moment';
import Swal from 'sweetalert2';
import { AppContext } from '../../contexts';


// providers
const discountProvider = new DiscountProvider();

const PlaceholderTable = ({ column = 1 }) => {

    const arrayColumns = useMemo(() => {
        let columns = [];
        for(let index = 0; index < column; index++) {
            columns.push(index + 1);
        }

        return columns;
    }, [column]);

    const datos = [1, 2, 3, 4, 5, 6, 7, 8];

    return datos.map(d => 
        <tr key={`iter-table-${d}`}>
            {arrayColumns.map(col =>
                <td key={`item-table-${d}-column-${col}`}><Skeleton/></td>
            )}
        </tr>
    )
}

const MonthHeaders = ({ year, month }) => {
    
    const [months, setMonths] = useState([]);

    const generateMonths = () => {
        let date = `${year}-${month}-01`;
        let lastMonth = moment(date, 'YYYY-MM-DD').add(1, 'months').subtract(1, 'days').format('D');
        let indexDays = {
            0: "D",
            1: "L",
            2: "M",
            3: "M",
            4: "J",
            5: "V",
            6: "S"
        }
        let payload = [];
        for (let index = 1; index <= lastMonth; index++) {
            let current_date = moment(`${year}-${month}-${index}`);
            payload.push({
                text: current_date.format('D'),
                index: indexDays[current_date.days()] || ""
            });
        }
        setMonths(payload);
    }

    useEffect(() => {
        if (year && month) generateMonths()
    }, [year, month]);

    return months.map((m, indexM) => 
        <th className="text-center no-wrap" key={`item-header-${indexM}`}>
            <div>{m.text}</div>
            <div style={{ borderTop: "1px solid #000" }}>{m.index}</div>
        </th>
    );
}

const Discount = ({ pathname, query }) => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const { entity_id, fireEntity } = useContext(EntityContext);

    // estados
    const [year, setYear] = useState();
    const [month, setMonth] = useState();
    const [type_categoria_id, setTypeCategoriaId] = useState("")
    const [current_loading, setCurrentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [datos, setDatos] = useState([]);
    const [is_error, setIsError] = useState(false);
    const [is_fetch, setIsFetch] = useState(false);

    const dateIsValid = useMemo(() => {
        let validate = moment(`${year}-${month}`, 'YYYY-MM').isValid();
        return validate ? true : false;
    }, [year, month]);

    const countDays = useMemo(() => {
        let daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
        return daysInMonth || 0;
    }, [year, month]);

    const countColumns = useMemo(() => {
        return countDays + 8;
    }, [countDays]);

    const isNextPage = useMemo(() => {
        return (page + 1) <= last_page;
    }, [datos]);

    const getDiscounts = async (add = false) => {
        setCurrentLoading(true);
        await discountProvider.preView(year, month, { page, type_categoria_id })
        .then(res => {
            let { discounts } = res.data;
            setIsError(false);
            setLastPage(discounts.lastPage || 0);
            setTotal(discounts.total || 0);
            setDatos(add ? [...datos, ...discounts.data] : discounts.data);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    const defaultDate = () => {
        let current_date = moment().subtract(1, 'month');
        setYear(current_date.year());
        setMonth(current_date.month() + 1);
    }

    const defaultRefresh = () => {
        setPage(1);
        setDatos([]);
        setIsFetch(true);
    }

    const handleOption = async (e, index, obj) => {
        switch (obj.key) {
            case 'generate-discount':
                await generateDiscount();
            default:
                return;
        }
    }

    const generateDiscount = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en generar el descuento?`);
        if (!answer) return;
        app_context.setCurrentLoading(true);
        discountProvider.process(year, month)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            Swal.fire({ icon: 'successs', text: message });
        }).catch(err => {
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'warning', text: err.message });
        });
    }

    useEffect(() => {
        fireEntity({ render: true });
        return () => fireEntity({ render: false });
    }, []);

    useEffect(() => {
        defaultDate();
    }, []);

    // cambio de fecha y que sea valida
    useEffect(() => {
        if (dateIsValid) defaultRefresh();
    }, [year, month, type_categoria_id]);

    useEffect(() => {
        if (is_fetch) getDiscounts(page > 1 ? true : false);
    }, [is_fetch]);

    useEffect(() => {
        if (is_fetch) setIsFetch(false);
    }, [is_fetch]);

    // render
    return (
        <div className="col-12">
            <BoardSimple
                title="Descuentos"
                info={["Control de descuentos de faltas y tardanzas"]}
                bg="danger"
                onOption={handleOption}
                options={[
                    { key: "generate-discount", icon: "fas fa-download", title: "Generar descuentos" }
                ]}
            >
                <div className="card-body">
                    <Show condicion={entity_id}
                        predeterminado={
                            <div className="mt-4">
                                <Message color="yellow">
                                    Porfavor seleccione una Entidad
                                </Message>
                            </div>
                        }
                    >
                        <div className="card" style={{ minHeight: '400px' }}>
                            <Form className="card-header">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <i className="fas fa-clock"></i> Fecha de Búsqueda
                                    </div>

                                    <div className="col-md-3 col-6 mb-2">
                                        <input type="number"
                                            step="any"
                                            placeholder="Año"
                                            onChange={({ target }) => setYear(target.value)}
                                            value={year || ""}
                                        />
                                    </div>

                                    <div className="col-6 col-md-2 mb-2">
                                        <Select
                                            placeholder="Seleccionar Mes"
                                            value={month || ""}
                                            onChange={(e, obj) => setMonth(obj.value)}
                                            options={[
                                                { key: "Ene", value: 1, text: "Enero" },
                                                { key: "Feb", value: 2, text: "Febrero" },
                                                { key: "Mar", value: 3, text: "Marzo" },
                                                { key: "Abr", value: 4, text: "Abril" },
                                                { key: "May", value: 5, text: "Mayo" },
                                                { key: "Jun", value: 6, text: "Junio" },
                                                { key: "Jul", value: 7, text: "Julio" },
                                                { key: "Ago", value: 8, text: "Agosto" },
                                                { key: "Sep", value: 9, text: "Septiembre" },
                                                { key: "Oct", value: 10, text: "Octubre" },
                                                { key: "Nov", value: 11, text: "Noviembre" },
                                                { key: "Dic", value: 12, text: "Diciembre" }
                                            ]}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <SelectTypeCategoria
                                            value={type_categoria_id}
                                            onChange={(e, obj) => setTypeCategoriaId(obj.value)}
                                        />
                                    </div>

                                    <div className="col-2">
                                        <Button color="blue"
                                            onClick={defaultRefresh}
                                        >
                                            <i className="fas fa-search"></i>
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                            <div className="card-body h-100">
                                <div className="table-responsive" style={{ minHeight: "50vh" }}>
                                    <table className="table-excel font-10">
                                        <thead>
                                            <tr>
                                                <th className="text-center" witdh="30px">N° <br/> TRAB</th>
                                                <th className="text-center no-wrap" witdh="300px">APELLIDOS  Y  NOMBRES</th>
                                                <th className="text-center no-wrap" witdh="300px">N° DOCUMENTO</th>
                                                <th className="text-center no-wrap" width="50px">CAT. NIV.</th>
                                                <MonthHeaders year={year} month={month}/>
                                                <th className="text-center no-wrap">TOT <br /> MIN</th>
                                                <th className="text-center no-wrap">(*) <br /> TOTAL <br /> DESC.</th>
                                                <th className="text-center no-wrap">DCTO <br /> X <br /> MIN</th>
                                                <th className="text-center no-wrap">BASE DE <br /> CALCULO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* listar datos */}
                                            {datos.map((d, indexD) => 
                                                <ItemDiscount key={`list-discount-${indexD}`}
                                                    index={indexD}
                                                    discount={d}
                                                />  
                                            )}
                                            {/* no hay registros */}
                                            <Show condicion={!current_loading && !datos.length}>
                                                <tr>
                                                    <th colSpan={countColumns} className="text-center font-14">
                                                        No hay regístros disponibles
                                                    </th>
                                                </tr>
                                            </Show>
                                            {/* cargar datos */}
                                            <Show condicion={current_loading}>
                                                <PlaceholderTable column={countColumns}/>
                                            </Show>
                                            {/* paginados */}
                                            <Show condicion={!current_loading && isNextPage}> 
                                                <tr>
                                                    <th className="font-12" colSpan={countColumns}>
                                                        <Button fluid 
                                                            basic
                                                            color="black"
                                                            onClick={() => {
                                                                setPage(pre => pre + 1)
                                                                setIsFetch(true);
                                                            }}
                                                        >
                                                            <i className="fas fa-arrow-down"></i> Obtener más regístros
                                                        </Button>
                                                    </th>
                                                </tr>
                                            </Show>
                                        </tbody>
                                    </table>
                                    {/* info */}
                                    <div className="row">
                                        <div className="col-5">
                                            <TableContentDiscount
                                                year={year}
                                                month={month}
                                                type_categoria_id={type_categoria_id}
                                                is_fetch={is_fetch}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Show>
                </div>
            </BoardSimple>
        </div>
    );
}

// server
Discount.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    return { query, pathname }
}


// exportar
export default Discount;