import React, { Fragment,useState, useContext, useEffect } from 'react';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react';
import HeaderReport from '../../components/escalafon/report/headerReport'
import BodyReport from '../../components/escalafon/report/bodyReport'
import { AUTHENTICATE } from '../../services/auth';
import { Body, BtnBack } from '../../components/Utils';
import { EntityContext } from '../../contexts/EntityContext';

const Report = () => {

    const entityContext = useContext(EntityContext);

    const [currentReport, setCurrentReport] = useState({})
    const [file, setFile] = useState({})
    const [block, setBlock] = useState(false);

    const handleClick = (e, data) => {
        setCurrentReport(data);
    }

    useEffect(() => {
        entityContext.fireEntity({ render: true });
        return () => entityContext.fireEntity({ render: false });
    }, []);

    return (
        <Fragment>
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <span className="ml-3"><i className="far fa-file-alt"></i> Reportes</span>
                    </div>
                </Body>
            </div>

            <div className="col-md-12 mt-2">
                <Body>
                    <div className="card-body">
                        <Form onSubmit={(e) => e.preventDefault()}>

                            <div className="row justify-content-center">
                                <div className="col-md-8 mb-4">
                                    <HeaderReport onClick={handleClick}
                                        setBlock={setBlock}
                                        block={block}
                                        setFile={setFile}
                                        activeType={currentReport?.type}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <BodyReport reportType={currentReport}
                                        file={file} 
                                        setFile={setFile}
                                        setBlock={setBlock}
                                    />
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>
        </Fragment>
    )
}

export default Report;