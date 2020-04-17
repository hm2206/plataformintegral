import React, { Fragment, useState, Component } from "react";
import Show from "./show";
import { Dropdown, Button, Icon } from 'semantic-ui-react';
import Swal from "sweetalert2";

const Content = props => (
  <Fragment>
    <div className="app-main">
      <div className="wrapper">
        <div className="page mb-5">
          <div className={`page-inner- row`}>{props.children}</div>
        </div>
      </div>
    </div>
  </Fragment>
);

const Body = props => (
  <Fragment>
    {/* <div className="page-header page-header-light"></div> */}
    <div className="content mt-4 ml-3 mr-3">{props.children}</div>
  </Fragment>
);

class BtnSelect extends Component {

  state = {
    color: "black",
    text: "Seleccionar",
    object: {},
    isPermission: false
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.options != this.props.options) {
      this.setState({ 
        object: {}
      });
    }
  }

  handleClick = (e) => {
    if (typeof this.props.onClick == 'function') {
      if (Object.keys(this.state.object).length > 0) {
        this.props.onClick(e, this.state.object);
      } else {
        Swal.fire({ icon: "info", text: "Porfavor seleccioné una opción" });
      }
    }
  }

  handleChange = async (e, obj) => {
    let newObj = {};
    await obj.options.filter(opt => opt.value == obj.value ? newObj = opt : null);
    this.setState({ object: newObj });
  }

  render () {

    let { color, text, object } = this.state;

    return (
      <Button.Group fluid  color={object.color ? object.color : color}>
        <Button disabled={this.props.disabled}
          onClick={this.handleClick}
        >
        <Icon name={object.icon ? object.icon : ""}/>  {object.text ? object.text : text}
        </Button>
        <Dropdown
          disabled={this.props.disabled}
          onChange={this.handleChange}
          className="button icon"
          floating
          options={this.props.options}
          trigger={<Fragment/>}
        />
      </Button.Group>
    )
  }
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

const BtnFloat = ({ theme, children, onClick, disabled = false }) => (
  <button
    type="button"
    style={{ overflow: 'hidden' }}
    onClick={onClick}
    className={`btn ${theme ? theme : "btn-success"} btn-lg btn-floated`}
    disabled={disabled}
  >
    <Show condicion={children}>
      {children}
    </Show>
  </button>
);

const BtnBack = ({ title = 'Ir atrás', theme, children, onClick, disabled }) =>  (
  <button style={{ 
      borderRadius: '50%', 
      border: '2px solid #346cb0', 
      width: '2.4em', 
      height: '2.4em',
      color: '#346cb0',
      background: '#fff'
    }}
    title={title}
    onClick={(e) => onClick(e)}
    disabled={disabled}
  >
    <i className="fas fa-arrow-left"></i>
  </button>
);


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

const Skull = ({ height, radius, padding, top }) => (
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
  BtnSelect
};