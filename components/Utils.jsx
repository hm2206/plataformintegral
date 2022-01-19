import React, { Fragment, useState, useEffect, useContext } from "react";
import Show from "./show";
import { Dropdown, Button, Icon, Form, Header, Progress, Select } from 'semantic-ui-react';
import Swal from "sweetalert2";
import Modal from './modal';
import Skeleton from 'react-loading-skeleton';
import PdfView from './pdfView';
import { Confirm, backUrl } from '../services/utils';
import { PDFDocument } from 'pdf-lib'
import { formatBytes } from '../services/utils';
import Router from 'next/router';
import atob from 'atob';
import { ScreenContext } from '../contexts/ScreenContext'
import moment from 'moment';

const InputFile = ({ id, name, onChange, error = false, children = null, title = "Select", accept = "*", icon = 'image', label = null }) => {

  const [file, setFile] = useState(null);

  return <Form.Field error={error || false}>
    <label htmlFor={id}>{label}</label>
    <label className="btn btn-outline-file" htmlFor={id} style={{ overflow: 'hidden' }}>
        <i className={`fas fa-${icon}`}></i> {file ? file.name : title}
        <input type="file"
            id={id} 
            accept={accept}
            name={name}
            onChange={(e) => {
              let { files, name } = e.target;
              let tmp = files[0] || null; 
              setFile(tmp);
              if (typeof onChange == 'function') onChange({ name, file: tmp });
            }}
            hidden
        />
    </label>
    <label>{error || ""}</label>
  </Form.Field>
}


const DropZone = ({ 
  id = 'dropzone', name, onChange, error = false, 
  multiple = true, children = null, 
  title = "Select", accept = "*", 
  icon = 'image', label = null, 
  result = [], onDelete = null ,
  onSigned = null, size = 100, 
  signerTypes = ['application/pdf'],
  basic = false, onRaw = null,
  linkCodeQr = null,
}) => {

  // estados
  const [pdf_url, setPdfUrl] = useState("");
  const [pdf_doc, setPdfDoc] = useState(undefined);
  const [pdf_blob, setPdfBlob] = useState(undefined);
  const [show_signed, setShowSigned] = useState(false);

  const metaDatos = (name) => {
    let items = {
      pdf: { color: '#d32f2f', icon: 'fas fa-file-pdf' },
      docx: { color: '#1976d2', icon: 'fas fa-file-word' }
    };
    // get key
    let keyName = `${name}`.split('.').pop();
    // response 
    return items[keyName] || { color: '#37474f', icon: 'fas fa-file-alt' };
  };
  
  const handleChange = async ({ name, files }) => {
    if (typeof onSigned == 'function') {
      let file = files[0];
      let size_limit = size * 1024;
      if (size_limit >= (file.size / 1024)) {
        if (signerTypes.includes(file.type)) {
          let reader = new FileReader();
          await reader.readAsArrayBuffer(file);
          reader.onload = async () => {
            let pdfDoc = await PDFDocument.load(reader.result, { ignoreEncryption: true });
            let url = URL.createObjectURL(file);
            setPdfDoc(pdfDoc);
            setPdfBlob(file);
            setPdfUrl(url);
            let answer = await Confirm("info", `¿Desea añadir firma digital al archivo "${file.name}"?`, 'Firmar');
            if (answer) {
              setShowSigned(true);
            } else typeof onChange == 'function' ? await onChange({ name, files: [file] }) : null;
          }
        } else typeof onChange == 'function' ? await onChange({ name, files }) : null;
      } else typeof onChange == 'function' ? await onChange({ name, files }) : null;
    } else typeof onChange == 'function' ? await onChange({ name, files }) : null;
    let inputChange = document.getElementById(id);
    if (inputChange) inputChange.value = null;
  }

  const handleSelect = (target) => {
    typeof onRaw == 'function' ? onRaw(target) : handleChange(target)
  }

  const handleSigner = async (obj, blob) => {
    blob.lastModifiedDate = new Date();
    let file = new File([blob], obj.pdfBlob.name);
    typeof onSigned == 'function' ? onSigned({ name, file, obj }) : null;
    setShowSigned(false);
  }

  if (basic) {
    return (<Fragment>
        <label className='mr-1 btn btn-sm btn-icon btn-secondary mt-2' htmlFor={id} style={{ cursor: 'pointer' }}>
          <i className={icon}></i>
          <input type="file"
            id={id} 
            accept={accept}
            name={name}
            multiple={multiple}
            onChange={({ target }) => handleSelect(target)}
            hidden
          />
        </label>

        <Show condicion={show_signed}>
          <PdfView
            linkCodeQr={linkCodeQr}
            pdfUrl={pdf_url} 
            pdfDoc={pdf_doc}
            pdfBlob={pdf_blob}
            onSigned={handleSigner}
            onClose={(e) => setShowSigned(false)}
          />
        </Show>  
      </Fragment>);
  }

  return (<Form.Field error={error || false}>
    <label htmlFor={id}>{label}</label>
    <label className='dropzone' htmlFor={id} style={{ overflow: 'hidden' }}>
      <div className="text-center dropzone-color pt-3 pb-3" style={{ fontSize: '4em' }}>
        <i className={`fas fa-cloud-upload-alt`}></i>
        <div style={{ fontSize: '13px', color: '#455a64' }}>
          {title}
        </div>
      </div>
      
        <input type="file"
            id={id} 
            accept={accept}
            name={name}
            multiple={multiple}
            onChange={({ target }) => handleSelect(target)}
            hidden
        />
    </label>
    <label>{error || ""}</label>
    
      <div className="row">
        {result.map((f, indexF) => 
          <div className="col-md-3" key={`${id}-files-${f.name}`}>
            <div className="card">
              <div className="card-body" style={{ overflow: 'hidden' }}>
                <div className="dropzone-text">
                  <i className={metaDatos(f.name).icon} style={{ color: metaDatos(f.name).color }}></i> {f.name}
                </div>
                <span className="dropzone-item-delete" onClick={(e) => typeof onDelete == 'function' ? onDelete({ e, index: indexF, file: f }) : null}>
                  <i className="fas fa-times"></i>
                </span>
                <hr/>
                <b>{formatBytes(f.size)}</b>
              </div>
            </div>
          </div>  
        )}
      </div>
    
    <Show condicion={show_signed}>
      <PdfView
        linkCodeQr={linkCodeQr}
        pdfUrl={pdf_url} 
        pdfDoc={pdf_doc}
        pdfBlob={pdf_blob}
        onSigned={handleSigner}
        onClose={(e) => setShowSigned(false)}
      />
    </Show>
  </Form.Field>);
}


const Content = ({ children }) => {
  
  // screen
  const { fullscreen } = useContext(ScreenContext)

  // render
  return (
    <Fragment>
      <div className={fullscreen ? 'app-main-extend' : 'app-main'}>
        <div className="wrapper">
          <div className="page mb-5">
            <div className={`page-inner- row`}>{children}</div>
          </div>
        </div>
      </div>
    </Fragment>
  )
};

const Body = props => (
  <Fragment>
    {/* <div className="page-header page-header-light"></div> */}
    <div className="content mt-4 ml-3 mr-3">{props.children}</div>
  </Fragment>
);

const BtnSelect = ({ onClick, disabled = false, options = [], refresh = "" }) => {

  // estados
  const [color, setColor] = useState("black");
  const [text, setText] = useState("Seleccionar");
  const [object, setObject] = useState({});
  const [isPermission, setIsPermission] = useState(false);

  // actualizar cada vez que se cambia el refresh
  useEffect(() => {
    setObject({});
    setText("Seleccionar");
    setColor("black");
  }, [refresh])

  // disparar al hacer click 
  const handleClick = (e) => {
    if (typeof onClick == 'function') {
      if (Object.keys(object).length > 0)  onClick(e, object)
      else Swal.fire({ icon: "info", text: "Porfavor seleccioné una opción" });
    }
  }

  // disparar al cambio del selector
  const handleChange = async (e, obj) => {
    let newObj = {};
    await obj.options.filter(opt => opt.value == obj.value ? newObj = opt : null);
    setObject(newObj);
  }

  // render
    return (
      <Button.Group fluid  
        color={object.color ? object.color : color} 
        style={{ position: 'relative' }}
      >
        <Button disabled={disabled}
          onClick={handleClick}
        >
        <Icon name={object.icon ? object.icon : ""}/>  {object.text ? object.text : text}
        </Button>
        <Dropdown
          value={object}
          disabled={disabled}
          onChange={handleChange}
          className="button icon"
          floating
          labeled
          options={options}
          trigger={<Fragment/>}
        />
      </Button.Group>
    )
}

const DropdownSimple = props => (
  <div className="breadcrumb-elements-item dropdown p-0">
    <a
      href="http://demo.interface.club/limitless/demo/bs4/Template/layout_1/LTR/default/full/index.html#"
      className="breadcrumb-elements-item dropdown-toggle"
      data-toggle="dropdown"
    >
      <i className={`icon-${props.icon} mr-2`}></i>
      {props.titulo}
    </a>

    <div className="dropdown-menu dropdown-menu-right">
      <a
        href="http://demo.interface.club/limitless/demo/bs4/Template/layout_1/LTR/default/full/index.html#"
        className="dropdown-item"
      >
        <i className="icon-user-lock"></i> Account security
      </a>
      <a
        href="http://demo.interface.club/limitless/demo/bs4/Template/layout_1/LTR/default/full/index.html#"
        className="dropdown-item"
      >
        <i className="icon-statistics"></i> Analytics
      </a>
      <a
        href="http://demo.interface.club/limitless/demo/bs4/Template/layout_1/LTR/default/full/index.html#"
        className="dropdown-item"
      >
        <i className="icon-accessibility"></i> Accessibility
      </a>
      <div className="dropdown-divider"></div>
      <a
        href="http://demo.interface.club/limitless/demo/bs4/Template/layout_1/LTR/default/full/index.html#"
        className="dropdown-item"
      >
        <i className="icon-gear"></i> All settings
      </a>
    </div>
  </div>
);

const BreadCrumb = () => (
  <nav aria-label="breadcrumb">
    <ol className="breadcrumb">
      <li className="breadcrumb-item active">
        <a href="#">
          <i className="breadcrumb-icon fa fa-angle-left mr-2"></i>Tables
        </a>
      </li>
    </ol>
  </nav>
);

const BtnToolBasic = props => (
  <div className="dt-buttons btn-group">
    <button
      className="btn btn-secondary buttons-copy buttons-html5"
      tabIndex="0"
      aria-controls="myTable"
      type="button"
      onClick={props.copy}
    >
      <span>Copiar</span>
    </button>
    <button
      className="btn btn-secondary buttons-print"
      tabIndex="0"
      aria-controls="myTable"
      type="button"
      onClick={props.print}
    >
      <span>Imprimir</span>
    </button>
  </div>
);

const BtnFloat = ({ theme, children, onClick, disabled = false, size = 'lg', style = {}, loading = false }) => {
  
  style.overflow = 'hidden';

  if (loading) return <Skeleton className="btn-floated" 
      circle height={style.height || "50px"} width={style.width || "50px"}
      style={style}
    />
  
  return (<button
    type="button"
    style={style}
    onClick={onClick}
    className={`btn ${theme ? theme : "btn-success"} btn-${size} btn-floated`}
    disabled={disabled}
  >
    <Show condicion={children}>
      {children}
    </Show>
  </button>);
};

const funcBack = () => {
  let { pathname, query } = Router;
  let href = query.href ? atob(query.href) : backUrl(pathname);
  return href;
}

const BtnBack = ({ title = 'Ir atrás', theme, children, onClick = null, disabled }) =>  {

  // render
  return (
    <button style={{ 
        borderRadius: '50%', 
        border: '2px solid #6f42c1', 
        width: '2.4em', 
        height: '2.4em',
        color: '#6f42c1',
        background: '#fff'
      }}
      title={title}
      onClick={(e) => {
        e.preventDefault();
        if (typeof onClick == 'function') onClick(e);
        else {
          let { push, pathname, query } = Router;
          let href = query.href ? atob(query.href) : null;
          push(href ? href : backUrl(pathname));
        }
      }}
      disabled={disabled}
    >
      {children ? children : <i className="fas fa-arrow-left"></i>}
    </button>
  )
};


const CheckList = ({ id, onAllSelect, onAllUnSelect }) => {
  
  let [check, setCheck] = useState(false);

  return (
  <div className="thead-dd dropdown">
    <CheckBox
      id={`checklist-id-${id}`}
      checked={check}
      onClick={(e) => {
        if (check) {
          setCheck(false);
          onAllUnSelect(e);
        } else {
          setCheck(true);
          onAllSelect(e);
        }
      }}
    />
    <div
      className="thead-btn"
      role="button"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <span className="fa fa-caret-down"></span>
    </div>
    <div className="dropdown-menu">
      <div className="dropdown-arrow"></div>
      <a className="dropdown-item" href="#" onClick={(e) => {
        e.preventDefault(); 
        setCheck(true);
        onAllSelect(e)
      }}>
        Seleccionar Todo
      </a>{" "}
      <a className="dropdown-item" href="#" onClick={(e) =>{
        e.preventDefault();
        setCheck(false);
         onAllUnSelect(e)
      }}>
        Deseleccionar Todo
      </a>
      {/* <div className="dropdown-divider"></div>
      <a className="dropdown-item" href="#">
        Bulk remove
      </a>{" "}
      <a className="dropdown-item" href="#">
        Bulk edit
      </a>{" "} */}
      {/* <a className="dropdown-item" href="#">
        Separate actions
      </a> */}
    </div>
  </div>
)};

const CheckBox = ({ id, checked = false, onClick, disabled = false }) => (
  <div className="custom-control custom-control-nolabel custom-checkbox" id={`checkbox-${id}`}>
    <label
      style={{
        width: "17px",
        height: "17px",
        background: "linear-gradient(180deg,#fff,#f6f7f9)",
        borderRadius: "0.2em",
        border: `1px solid ${checked ? "#346cb0" : "#c6c9d5"}`,
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#346cb0",
        fontWeight: 1000
      }}
      onClick={typeof onClick == "function" ? onClick : ""}
    >
      {checked ? <b className="fas fa-check fa-xs"></b> : null}
    </label>
  </div>
);

const BtnCircle = ({
  position = "relative",
  top,
  bottom,
  left,
  right,
  children,
  onClick,
  disabled = false
}) => (
  <button
    onClick={onClick}
    className="btn btn-floated btn-primary"
    disabled={disabled}
    style={{ position, top, bottom, left, right }}
  >
    {children}
  </button>
);

const Skull = ({ height, radius, padding, top, width = 'auto' }) => (
  <div
    style={{
      padding: padding ? padding : "1em",
      paddingTop: top ? top : "0.2em",
      paddingBottom: "0"
    }}
  >
    <div
      className="elemento__image_left"
      style={{
        borderRadius: radius ? radius : "5em",
        width: width,
        paddingBottom: height ? height : "1.5em"
      }}
    ></div>
  </div>
);


const Tab = ({ navs = [], onClick }) => (
  <ul className="nav nav-tabs">
    {navs.map((obj, index) => 
      <li className="nav-item" 
        key={`nav-${obj.id}`}
      >
        <a href="#" 
          className={`nav-link text-sm ${obj.active ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (typeof onClick == 'function') onClick(e, obj, index);
          }}
        >
          {obj.name}
        </a>
      </li>
    )}
  </ul>
);  


const BtnEditar = ({ onClick, edit = false }) => (
  <Fragment>
    <b>¿Desea {edit ? 'cancelar ' : 'activar'} la edición?</b>
    <a href="#" 
      className={`btn btn-${edit ? 'danger' : 'warning'} btn-block`} 
      onClick={(e) => {
        e.preventDefault();
        if (typeof onClick == 'function') onClick(e);
      }}
    >
      <i className={`fas fa-${edit ? 'times' : 'pencil-alt'}`}></i> { edit ? 'Cancelar' : 'Editar' }
     </a>
  </Fragment>
);


const DrownSelect = ({ button, icon, text, direction, disabled, options = [], onSelect, labeled = false }) =>  {

  return (
    <Dropdown disabled={disabled} 
      text={text} 
      direction={direction ? direction : 'left'}
      icon={icon ? icon : ''}
      button={button ? button : false}
      floating
      labeled={labeled}
      className={icon ? 'icon': ''}
    >
      <Dropdown.Menu direction={direction ? direction : 'left'}>
        {options && options.map(obj => 
            <Fragment key={`drownselect-${obj.key}`}>
              <Dropdown.Item text={obj.text} description={obj.description} icon={obj.icon}
                onClick={(e, data) => typeof onSelect == 'function' ? onSelect(e, data) : null}
                name={obj.key}
              />
              {obj.divider ? <Dropdown.Divider/> : null}
            </Fragment>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}


const LoadFile = ({ id = 'select-file', defaultImg = '/img/base.png', disabled = false, accept = '*/*', info = 'No documents are listed for this customer.', isClose, onSave, upload = false, porcentaje = 0 }) => {

  const [file, setFile] = useState();

  const handleFile = ({ files }) => {
    if (files && files.length) {
      setFile(files[0]);
      let reader = new FileReader();
      let render_img = document.getElementById(`render-${id}`);
      reader.readAsDataURL(files[0]);
      reader.onloadend = () => {
        render_img.src = reader.result;
      }
    }
  }

  return (
      <Modal show={true}  isClose={isClose}
        disabled={disabled}
      >
        <div className="text-center" style={{ paddingTop: '3em' }}>

          <div>
            <div className="user-avatar user-avatar-xl mb-3" style={{ height: '200px', width: '200px', border: "2px solid #fff", boxShadow: '0px 0px 2px 2px rgba(0,0,0,.2)' }}>
              <img src={defaultImg} alt="render-img" id={`render-${id}`} style={{ objectFit: 'contain', height: '100%', width: '100%', objectPosition: 'center' }}/>
            </div>
          </div>

          <Header icon>
            {info}
          </Header>
          <div className="text-center pb-3">
            <label htmlFor={id} className="ui primary button" style={{ background: 'transparent', border: '2px solid #2185D0', color: '#2185D0' }}>
              <input type="file" id={id} accept={accept} disabled={upload || disabled} hidden onChange={(e) => handleFile(e.target)}/> <i className="fas fa-folder-open"></i> Seleccionar Archivo
            </label>
            <Button primary 
              onClick={(e) => typeof onSave == 'function' ? onSave(file) : null}
              style={{ border: '2px solid #2185D0' }} 
              disabled={!file || upload || disabled}>
                Guardar Archivo
            </Button>
          </div>

          <div className="py-3 ml-3 mr-3 load-none">
            <Show condicion={porcentaje}>
              <Progress inverted percent={porcentaje} active progress success={porcentaje == 100}>
                Subiendo archivo...
              </Progress>
            </Show>
          </div>
        </div>
      </Modal>
  )
}


const Cardinfo = ({ titulo, count, icon = 'fas fa-file-alt', description, onClick, style = {} }) => (
  <div className="card" style={style}
    onClick={(e) => typeof onClick == 'function'? onClick(e) : null}
  >
    <div className="card-body">
      <div className="row">
        <div className="col-md-4 col-4">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2.5em' }}>
            <i className={icon}></i>
          </div>
        </div>
        <div className="col-md-8 col-8">
          <b>{titulo}</b>
          <div className="mt-2 mb-2" style={{ fontSize: '2em', fontWeight: 'bold' }}>{count || 0}</div>
          <div className="pt-2 mt-3" style={{ width: "100%", borderTop: `2px solid ${style.color || '#000'}` }}>
            <b style={{ fontSize: '0.85em' }}>{description}</b>
          </div>
        </div>
      </div>
    </div>
  </div>
);


const SimpleListContent = ({ children = null }) => {
  return <div className="list-group list-group-bordered">
    {children}
  </div>
}


const SimpleList = ({ title, count, icon = "oi oi-chat", bg = "success", onClick = null, obj = {}, bgIcon = "red", active = false, loading = false }) => {

  if (loading) return <Skeleton height="47px"/>

  return (
    <div className={`list-group-item ${active ? 'list-group-item-active' : null}`} style={{ cursor: 'pointer' }} onClick={(e) => typeof onClick == 'function' ? onClick({ e, obj}) : null}>
      <div className="list-group-item-figure">
        <a href="#" className={`tile tile-circle bg-${bg}`}><i className={icon}></i></a>
      </div>
      <div className="list-group-item-body"><h5>{title}</h5></div>
      <div className="list-group-item-figure">
        {count ? <b className={`badge badge-${bgIcon}`}>{count}</b> : null}
      </div>
    </div>
  )
}

const SelectMonth = ({ name, value, onChange = null, disabled = false }) => {
  const [datos, setDatos] = useState([]);

  const handleMonths = () => {
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const newDatos = [];
    months.forEach(m => {
      const text = moment().month(m).format('MMMM');
      newDatos.push({
        key: `month-iter-${m}`,
        text,
        value: m + 1
      })
    });
    // setting
    setDatos([
      { key: 'initial-month', text: 'Seleccionar', value: '' },
      ...newDatos
    ]);
  }

  const handleOnChange = ({ value }) => {
    if (typeof onChange == 'function') {
      onChange({ name, value });
    }
  }

  useEffect(() => {
    handleMonths();
  }, [])

  return (
    <Select options={datos}
      onChange={(e, obj) => handleOnChange(obj)}
      className="capitalize"
      name={name}
      value={value || ''}
      placeholder="Seleccionar Mes"
      disabled={disabled}
    />
  )
}

export {
  Content,
  Body,
  DropdownSimple,
  BreadCrumb,
  BtnToolBasic,
  BtnFloat,
  CheckList,
  CheckBox,
  BtnCircle,
  Skull,
  Tab,
  BtnEditar,
  BtnBack,
  DrownSelect,
  BtnSelect,
  InputFile,
  LoadFile,
  Cardinfo,
  DropZone,
  SimpleListContent,
  SimpleList,
  funcBack,
  SelectMonth,
};