import React, { useContext, useState } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { signature } from '../../../services/apis'; 
import { Body, BtnFloat } from '../../../components/Utils';
import DataTable from '../../../components/datatable';
import Router from 'next/router';
import { Form, Pagination, Button } from 'semantic-ui-react';
import btoa from 'btoa';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';
import { AppContext } from '../../../contexts/AppContext'

const IndexCertificate = ({ query, success, certificates }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});

    // cambio de form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value
        setForm(newForm);
    }

    // cambiar pagina
    const handlePage = async (e, { activePage }) => {
        let { pathname, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    // seleccionar opciones
    const handleOption = async (obj, key, index) => {
        let { pathname, push } = Router;
        let id = await btoa(obj.id);
        switch (key) {
            case 'download':
                await download(obj);
                break;
            case 'edit':
                let newQuery = { id };
                push({ pathname: `${pathname}/${key}`, query: newQuery });
                break;
            default:
                break;
        }
    }

    // descargar pfx
    const download = async (obj) => {
        let answer = await Confirm("warning", `¿Estás seguro en descargar el PFX?`, 'Descargar')
        if (answer) {
            app_context.setCurrentLoading(true);
            await signature.post(`certificate/${obj.id}/download`, {}, { responseType: 'blob' })
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { data } = res;
                    let a = document.createElement('a');
                    a.target = '__blank';
                    a.download = `${obj.person && obj.person.fullname}.pfx`.replace(/[\s]+/g, "_").toLowerCase();
                    a.href = URL.createObjectURL(data);
                    a.click();
                }).catch(err => {
                    app_context.setCurrentLoading(false);
                    Swal.fire({ icon: 'error', text: err.message })
                })
        }
    }

    // render
    return (
        <div className="col-md-12">
                <Body>
                    <Form>
                        <div className="col-md-12">
                            <DataTable titulo={<span>Lista de Certificados </span>}
                                headers={["#ID", "Foto", "Apellidos y Nombres", "N° Documento", "Serial N°", "Fecha de Nac."]}
                                data={certificates.data || []}
                                index={[
                                    { key: "id", type: "text" },
                                    { key: 'person.image_images.image_50x50', type: 'cover' },
                                    { key: "person.fullname", type: "text", className: "uppercase" },
                                    { key: "person.document_number", type: "icon" },
                                    { key: "serial_number", type: 'icon', bg: 'dark' },
                                    { key: "person.date_of_birth", type: "date", bg: 'dark' }
                                ]}
                                options={[
                                    { key: "edit", icon: "fas fa-pencil-alt" },
                                    { key: "download", icon: "fas fa-download" }
                                ]}
                                getOption={handleOption}
                            >
                                <div className="col-md-12 mt-2">
                                    <div className="row">
                                        <div className="col-md-7 mb-1 col-10">
                                            <Form.Field>
                                                <input type="text" 
                                                    placeholder="Buscar trabajador por: Apellidos y Nombres"
                                                    name="query_search"
                                                    value={form.query_search || ""}
                                                    onChange={(e) => handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-xs col-2">
                                            <Button color="blue"
                                                fluid
                                                onClick={ async (e) => Router.push({ pathname: Router.pathname, query: { query_search: form.query_search || "" } })}
                                            >
                                                <i className="fas fa-search"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body mt-4">
                                    <h4>Resultados: {certificates && certificates.total || 0}</h4>
                                </div>

                            </DataTable>
                            <div className="text-center">
                                <hr/>
                                <Pagination  
                                    activePage={query.page || 1} 
                                    totalPages={certificates.lastPage || 1}
                                    onPageChange={handlePage}
                                />
                            </div>
                        </div>

                        <BtnFloat
                            onClick={(e) => Router.push({ pathname: `${Router.pathname}/create` })}
                        >
                            <i className="fas fa-plus"></i>
                        </BtnFloat>
                    </Form>
                </Body>
            </div>
    )
}

// server redering
IndexCertificate.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query } = ctx;
    query.page = typeof query.page != 'undefined' ? query.page : 1;
    query.query_search = typeof query.query_search != 'undefined' ? query.query_search : "";
    // obtener certificados
    let { success, certificates } = await signature.get(`certificate?page=${query.page}&query_search=${query.query_search}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }));
    // response
    return { query, success, certificates };
}

export default IndexCertificate;