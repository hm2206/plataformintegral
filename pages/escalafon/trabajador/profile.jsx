import React,  { Component, Fragment } from 'react';
import Router from 'next/router';
import Cover from '../../../components/trabajador/cover';
import NavCover from '../../../components/trabajador/navCover';
import { AUTHENTICATE } from '../../../services/auth';
import { findWork } from '../../../storage/actions/workActions';
import { authentication } from '../../../services/apis';
import Show from '../../../components/show';
import General from '../../../components/trabajador/general';
import Swal from 'sweetalert2';
import { backUrl } from '../../../services/utils'


class TrabajadorID extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        await ctx.store.dispatch(findWork(ctx));
        let work = ctx.store.getState().work;
        ctx.query.method = ctx.query.method ? ctx.query.method : "general";
        return { pathname: ctx.pathname, query: ctx.query, work }
    }

    handleOption = (key) => {
        let { push, pathname, query } = Router;
        if (key == 'vacacion' || key == 'file') Swal.fire({ icon: "warning", text: "Está función aún no está dispónible" })
        if (key == 'general') push({ pathname, query: { id: query.id, method: "general" } })
        if (key == 'pay') push({ pathname, query: { id: query.id, method: "pay" } })
    }

    render() {

        let { query, pathname } = this.props;
        let { work } = this.props.work;

        return <Fragment>
            <div className="col-md-12">
                <Cover
                    back={backUrl(this.props.pathname)}
                    titulo={work && work.person && work.person.fullname}
                    email={work && work.person && work.person.email_contact}
                    image={work && work.person && work.person.image ? `${work.person.image && work.person.image_images && work.person.image_images.image_200x200}` : '/img/perfil.jpg'}
                />
                <NavCover
                    active={query.method}
                    options={[
                        { key: "general", text: "Información General" },
                        { key: "info", text: "Contratos" },
                        { key: "pay", text: "Resumenes de Pago" },
                        { key: "file", text: "Archivos" },
                        { key: "vacacion", text: "Vacaciónes" }
                    ]}
                    getOption={this.handleOption}
                />
                {/* Contenidos */}
                <Show condicion={typeof work == 'object' && Object.values(work).length}>
                    <div className="col-md-12 mt-5">
                        <Show condicion={query.method == 'general'}>
                            <General work={work} person={work.person}/>
                        </Show>
                    </div>
                </Show>
            </div>
        </Fragment>
    }

}



export default TrabajadorID;