import React, { Component, Fragment } from "react";
import Loader from "../components/loader";
import { CheckList, CheckBox } from "../components/Utils";
import Show from "./show";
import moment from 'moment';


export default class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query_search: "",
      rows: [],
      datatable: []
    };

    this.getCurrent = this.getCurrent.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.send = this.send.bind(this);
    this.optionAction = this.optionAction.bind(this);
    this.selectRow = this.selectRow.bind(this);
  }

  async componentDidMount() {
    await this.listenerScroll();
    await this.checkDefault();
    await this.setDataTable(this.props);
  }

  async componentWillReceiveProps(newProps) {
  
    if (newProps.newRows != this.props.newRows) {
      this.setState({ rows: newProps.newRows });
    }

    if (newProps != this.props) {
      await this.setDataTable(newProps);
    }

    if(newProps.onStop == true && newProps.onStop != this.props.onStop) {
      this.removeScroll();
    }
    
    if (newProps.onStop == false && newProps.onStop != this.props.onStop) {
      this.listenerScroll();
    }

  }

  componentWillUnmount = () => {
    this.removeScroll();
  }

  checkDefault = async () => {
    let { newRows } = this.props;
    if (newRows) {
      let tmp = newRows ? newRows : this.state.rows;
      this.verifyIsCheck(tmp);
      // update state
      await this.setState(state => ({ rows: tmp }));
    }
  }

  async setDataTable(newProps) {
    let { isCheck, data } = newProps;
    let newData =  data;
    if (isCheck && typeof newData != "undefined") {
      // actualizamos los checked
      await newData.map((obj, iter) => {
        obj.__id = iter + 1;
        obj.check = this.rowCheck(obj.__id);
        return obj;
      });
    }

    await this.setState({ datatable: newData });
  }

  rowCheck(id) {
    let rows = this.state.rows;
    let isTrue = rows.filter(obj => obj.__id == id && obj.check == true).length;
    return isTrue ? true : false;
  }

  verifyObjects(obj, index) {
    try {
      let newParts = index.key.split(".");
      let response = obj;
      for (let part of newParts) {
        if (typeof response[part] != undefined) {
          response = response[part];
        }
      }
      return response;
    } catch (error) {
      return "";
    }
  }

  async handleInput(e) {
    let { name, value } = e.target;
    await this.setState({ [name]: value });
    if (value.length > 2) {
      await this.send(value);
    } else if (value == 0) {
      await this.send(value);
    }
  }

  send(value) {
    if (typeof this.props.search == "function") {
      this.props.search(value);
    }
  }

  optionAction(obj, key, index, e) {
    e.preventDefault();
    if (typeof this.props.getOption == "function") {
      this.props.getOption(obj, key, index);
    }
    return false;
  }

  getCurrent(e) {
    this.props.getCurrent(e);
  }

  async selectRow(obj, index) {
    obj.check = !obj.check;
    let newDatatable = this.state.datatable;
    newDatatable[index] = obj;
    await this.setState({ datatable: newDatatable });
    this.verifyIsCheck(newDatatable);
  }

  async verifyIsCheck(data) {
    let newRows = await data.filter(obj => obj.check == true);
    await this.setState({ rows: newRows });
    if (typeof this.props.selectRow == "function") {
      this.props.selectRow(this.state.rows);
    }
  }

  handleScroll = async (evt) => {
    let body = document.getElementsByTagName('body')[0];
    let posicion = Math.round(window.scrollY + window.innerHeight);
    let limite = document.body.scrollHeight;
    if (!this.state.loading && posicion >= limite) {
      body.style.overflow = 'hidden';
      window.scrollTo(window.scrollX, posicion);
      await this.props.onScroll(evt, body);
    }
  }

  listenerScroll = async () => {
    if (typeof this.props.onScroll == 'function') {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  removeScroll = async () => {
    if (typeof this.props.onScroll == 'function') {
      window.removeEventListener('scroll', this.handleScroll);
      if (typeof this.props.onRemoveScroll == 'function') {
        this.props.onRemoveScroll();
      }
    }
  }

  handleAllSelect = async () => {
    await this.setState(async state => {
      await this.state.datatable.map(obj => obj.check = true);
      return { datatable: state.datatable }
    })
    // rows
    this.setState({ rows: this.state.datatable });
    // emitir evento
    if (typeof this.props.onAllSelect == 'function') {
      this.props.onAllSelect(this.state.rows);
    }
  }

  handleAllUnSelect = async () => {
    await this.setState(async state => {
      await this.state.datatable.map(obj => obj.check = false);
      return { datatable: state.datatable }
    })
    // rows
    this.setState({ rows: [] });
    // emitir evento
    if (typeof this.props.onAllUnSelect == 'function') {
      this.props.onAllUnSelect(this.state.rows);
    }
  }

  render() {
    let {
      loading,
      options,
      optionAlign,
      headers,
      index,
      filters,
      isCheck,
      titulo,
      children,
      base
    } = this.props;

    let { datatable } = this.state;

    return (
      <div className="car card-fluid" style={{ position: "relative" }}>
        <Show condicion={titulo}>
          <div className="card-header">
            {titulo}
          </div>
        </Show>
        <div className="card-body">
          {children}
          {filters && filters.length > 0 
            ? <div className="form-group">
                <div className="input-group input-group-alt">
                  <div className="input-group-prepend">
                    <select id="filterBy" className="custom-select">
                      <option value="">Filtro:</option>
                      {filters && filters.length > 0 && filters.map(obj => 
                        <option key={`filter-${obj.id}`} value={obj.id}>{obj.name}</option>  
                      )}
                    </select>
                  </div>
                  <div className="input-group has-clearable">
                    <input
                      style={{ minWidth: "300px" }}
                      placeholder="Buscar algo..."
                      type="text"
                      value={this.state.query_search}
                      className="form-control"
                      onChange={this.handleInput}
                      name="query_search"
                    />
                  </div>
                </div>
            </div>
              : null
            }
          <div
            className="dataTables_wrapper dt-bootstrap4 no-footer"
            id="myTable_wrapper"
          >
            <div className="text-muted">
              <div
                className="dataTables_info"
                id="myTable_info"
                role="status"
                aria-live="polite"
              >
                
              </div>
            </div>
            <div className="table-responsive">
              <table
                aria-describedby="DataTables_Table_2_info"
                className="table dataTable no-footer"
                aria-describedby="myTable_info"
                id="myTable"
                role="grid"
              >
                <thead>
                  <tr role="row">
                    {isCheck ? (
                      <th>
                        <CheckList onAllSelect={this.handleAllSelect} onAllUnSelect={this.handleAllUnSelect}/>
                      </th>
                    ) : null}
                    {headers && headers.length > 0
                      ? headers.map((head, iter) => (
                          <th
                            aria-controls="DataTables_Table_2"
                            aria-label="First Name: activate to sort column descending"
                            aria-sort="ascending"
                            className="sorting_asc"
                            colSpan="1"
                            rowSpan="1"
                            tabIndex="0"
                            key={`${head}-${iter}`}
                          >
                            {head}
                          </th>
                        ))
                      : null}

                    {options && options.length > 0 ? (
                      <th
                        aria-label="Opciones"
                        className="align-middle text-center sorting_disabled"
                        colSpan="1"
                        rowSpan="1"
                        style={{ width: "150px" }}
                      >
                        Opciones
                      </th>
                    ) : null}
                    <th
                      aria-label=""
                      className="control sorting_disabled"
                      colSpan="1"
                      rowSpan="1"
                      style={{ display: "none" }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {datatable && datatable.length > 0 ? (
                    datatable.map((obj, item) => (
                      <tr className="odd" key={JSON.stringify(obj)}>
                        {isCheck ? (
                          <td className="col-checker align-middle">
                            <CheckBox
                              id={`iter-datatable-${JSON.stringify(obj)}`}
                              checked={obj.check}
                              onClick={this.selectRow.bind(this, obj, item)}
                            />
                          </td>
                        ) : null}
                        <Fragment>
                          {index && index.length > 0
                            ? index.map((attr, i) => (
                                <td key={`column-datatable-${attr}-${i}-${index}`}>
                                  <div className={`row justify-content-${attr.justify}`}>
                                    {attr.type == 'json' ? <span>{JSON.stringify(obj)}</span> : null}
                                    {attr.type == 'cover' ? <img style={{ width: "45px", height: "45px", objectFit: 'cover', borderRadius: '1em' }} src={this.verifyObjects(obj, attr)} alt="cover"/> : null}
                                    {attr.type == "icon" ? <span className={`badge badge-${attr.bg ? attr.bg : 'primary'} ${obj.className}`}>{this.verifyObjects(obj, attr)}</span> : null}
                                    {attr.type == "text" ? <span className={`${attr.className}`}>{this.verifyObjects(obj, attr)}</span> : null}
                                    {attr.type == "switch" ? <span className={`${attr.className} badge badge-${this.verifyObjects(obj, attr) ? `${attr.bg_true ? attr.bg_true : 'success'}` : `${attr.bg_false ? attr.bg_false : 'danger'}`}`}>{this.verifyObjects(obj, attr) ? attr.is_true : attr.is_false}</span> : null}
                                    {attr.type == "timestamp" ? moment(this.verifyObjects(obj, attr)).format('DD/MM/YYYY') : null}
                                    {attr.type == "date" ? moment(this.verifyObjects(obj, attr)).format('DD/MM/YYYY') : null}
                                    <Show condicion={attr.type == 'option'}>
                                      {attr.data && attr.data.map(da => {
                                        return this.verifyObjects(obj, attr) == da.key 
                                        ? <span className={`badge ${da.className}`}>
                                            {da.text || this.verifyObjects(obj, attr)}
                                          </span> 
                                          : null
                                      })}
                                    </Show>
                                    {attr.children && attr.children.length > 0 && attr.children.map(chi => 
                                        <span className="row align-items-center" key={`children-${chi}`}>
                                          {this.verifyObjects(obj, chi) ? 
                                            <Fragment>
                                              <i className="fas fa-arrow-right ml-3 mr-1"></i>  
                                              {chi.type == "icon" ? <span className={`badge badge-${chi.bg ? chi.bg : 'primary'}`}>{this.verifyObjects(obj, chi)}</span> : null}
                                              {chi.type == "text" ? this.verifyObjects(obj, chi) : null}
                                              {chi.type == "check" ? 
                                                <CheckBox
                                                  id={`iter-datatable-type-${JSON.stringify(chi)}`}
                                                  checked={true}
                                                  disabled={true}
                                                />
                                                : null}
                                              <b className="ml-1">{chi.prefix}</b>
                                            </Fragment>
                                            : null }
                                        </span>
                                    )}
                                  </div>
                                </td>
                              ))
                            : null}
                          {options && options.length > 0 ? (
                            <td className={`align-middle text-right`}>
                              <div className="row justify-content-center">
                              {options.map((option, iter) => {

                                  let { rules } = option;
                                  let response;

                                  if (rules){
                                    if (typeof rules.value != 'undefined' && typeof rules.key != 'undefined') {
                                      response = rules.value == obj[rules.key];
                                      if (rules.or) {
                                        let response_or = rules.or;
                                        if (!response || !(response_or.value == obj[response_or.key])) return null;
                                      } else if (rules.and) {
                                        let response_and = rules.and;
                                        if (!response && !(response_and.value == obj[response_and.key])) return null;
                                      } else {
                                        if (!response) return null; 
                                      }
                                      
                                    }
                                  }

                                  return (
                                    <a
                                      className={`mr-1 btn btn-sm btn-icon btn-secondary ${option.className}`}
                                      href="#598"
                                      title={option.title}
                                      key={`${option.key}-${iter}-${obj.__id}`}
                                      onClick={this.optionAction.bind(
                                        this,
                                        obj,
                                        option.key,
                                        item
                                      )}
                                    >
                                      <i className={option.icon}></i>
                                      {option.text} {response}
                                    </a>
                                  )
                                  })}
                              </div>
                            </td>
                          ) : null}
                          <td
                            className=" control"
                            style={{ display: "none" }}
                            tabIndex="0"
                          ></td>
                        </Fragment>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <th
                        colSpan={headers && headers.length + 2}
                        className="text-center"
                      >
                        No hay registros disponibles
                      </th>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          {loading ? (
            <div
              style={{
                position: "absolute",
                top: "15%",
                left: "0px",
                background: "rgba(255, 255, 255, 0.6)",
                width: "100%",
                height: "100%"
              }}
            >
              <Loader />
            </div>
          ) : null}
      </div>
    );
  }
}