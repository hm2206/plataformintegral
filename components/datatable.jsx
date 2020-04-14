import React, { Component, Fragment } from "react";
import Loader from "../components/loader";
import { CheckList, CheckBox } from "../components/Utils";


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

  componentWillReceiveProps(newProps) {
    if (newProps != this.props) {
      this.setDataTable(newProps);
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
    let { isCheck, data, newRows } = newProps;
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
    } = this.props;

    let { datatable } = this.state;

    return (
      <div className="car card-fluid" style={{ position: "relative" }}>
        <div className="card-header">
          {titulo}
        </div>
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
                        <CheckList />
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
                                    {attr.type == "icon" ? <span className={`badge badge-${attr.bg ? attr.bg : 'primary'}`}>{this.verifyObjects(obj, attr)}</span> : null}
                                    {attr.type == "text" ? this.verifyObjects(obj, attr) : null}
                                    {attr.type == "switch" ? <span className={`badge badge-${this.verifyObjects(obj, attr) ? `${attr.bg_true ? attr.bg_true : 'success'}` : `${attr.bg_false ? attr.bg_false : 'danger'}`}`}>{this.verifyObjects(obj, attr) ? attr.is_true : attr.is_false}</span> : null}
                                    {attr.type == "timestamp" ? new Date(this.verifyObjects(obj, attr)).toDateString() : null}
                                    {attr.type == "date" ? new Date(this.verifyObjects(obj, attr)).toLocaleDateString() : null}
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
                                      if (!response) return null; 
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
          {loading ? (
            <div
              style={{
                position: "absolute",
                top: "0px",
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
      </div>
    );
  }
}