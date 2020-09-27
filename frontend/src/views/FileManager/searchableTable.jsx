import * as React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import ViewIcon from "@material-ui/icons/Visibility";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import DownloadIcon from "@material-ui/icons/GetApp";
import Paper from "@material-ui/core/Paper";
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Notification from "../../components/notification";


import ApiConfig from "../../api/config";
import ApiFiles from "../../api/files";
import { saveAs } from "file-saver";

import DeleteTwoToneIcon from "@material-ui/icons/DeleteForeverTwoTone";
import DownloadTwoToneIcon from "@material-ui/icons/GetAppTwoTone";
import CSVIcon from "@material-ui/icons/TableChartTwoTone";

import { ColorConsumer } from "../../context/colorContext";
import GridAlign from "@material-ui/core/Grid";
import { FillSpinner } from "react-spinners-kit";
import DeleteModal from "./deleteModal";

import DeleteSingleModal from "./deleteModalSingle";
import {
  SelectionState,
  PagingState,
  IntegratedSelection,
  SortingState,
  IntegratedSorting,
  EditingState,
  FilteringState,
  IntegratedFiltering,
  CustomPaging
} from "@devexpress/dx-react-grid";
import {
  Grid,
  VirtualTable,
  TableHeaderRow,
  TableSelection,
  PagingPanel,
  TableEditRow,
  TableEditColumn,
  TableFilterRow
} from "@devexpress/dx-react-grid-material-ui";
import { Typography } from "@material-ui/core";

var JSZip = require("jszip");
var mime = require("mime-types");

const getRowId = row => row.id;

const openFile = async (id, extension) => {
  await ApiFiles.download({
    id
  })
    .then(response => {
      const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);

        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);

          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
      }


      switch (extension.toLowerCase()) {
        case "pdf":
          let pdfResult = response;
          console.log("inside pdf case", pdfResult);

          const blob = b64toBlob(pdfResult, 'application/pdf');
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl);

          //for IE
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blobUrl);
            return;
          }
          break;

        case "jpeg":

          var imgResult = response;
          const blob1 = b64toBlob(imgResult, 'image/jpeg');
          const blobUrl1 = URL.createObjectURL(blob1);
          window.open(blobUrl1);
          break;

        case "png":
          var imgResult = response;
          const blob2 = b64toBlob(imgResult, 'image/png');
          const blobUrl2 = URL.createObjectURL(blob2);
          window.open(blobUrl2);
        default:
          break;
      }

    })
    .catch(e => {
      throw new Error(
        "Hubo un problema con la visualizacion del archivo: " + e
      );
    });
};

const ViewButton = props => {
  return (
    <ColorConsumer>
      {({ color }) => (
        <Tooltip title="Ver" placement="top">
          <IconButton
            aria-label="View"
            style={{
              color:
                props.row.id == props.selectedId && props.isViewOpen === true
                  ? color
                  : "#757575",
              display:
                props.row.extension.toLowerCase() !== "jpg" &&
                  props.row.extension.toLowerCase() !== "jpeg" &&
                  props.row.extension.toLowerCase() !== "png" &&
                  props.row.extension.toLowerCase() !== "pdf"
                  ? "none"
                  : "inline-flex"
            }}
            onClick={() => {
              openFile(props.row.id, props.row.extension)
              // props.onView("loading", props.row.id);
              // let newPage = 1;
              // ApiFiles.preview({ id: props.row.id, page: newPage })
              //   .then(response => {
              //     props.onView(
              //       response.data,
              //       props.row.id,
              //       response.totalCount,
              //       props.row.extension
              //     );
              //     if (newPage == 1) {
              //       props.onPreviewPage(1);
              //     }
              //   })
              //   .catch(e => {
              //     console.log(e);
              //   });
            }}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
      )}
    </ColorConsumer>
  );
};

const DownloadButton = props => (
  <Tooltip title="Descargar" placement="top">
    <IconButton
      aria-label="Download"
      color="default"
      disabled={false}
      onClick={() => {
        ApiFiles.download({
          id: props.row.id
        })
          .then(response => {
            const mimeType = mime.lookup(props.row.extension);

            require("downloadjs")(
              "data:" + mimeType + ";base64," + response,
              props.row.name + "." + props.row.extension
            );
          })
          .catch(e => {
            throw new Error(
              "Hubo un problema con la descarga del archivo: " + e
            );
          });
      }}
    >
      <DownloadIcon />
    </IconButton>
  </Tooltip>
);

const DeleteButton = props => (
  <Tooltip title="Eliminar" placement="top">
    <IconButton
      aria-label="Delete"
      color="default"
      disabled={false}
      onClick={() => {
        props.openModal();
        props.returnId(props.row.id);
      }}
    >
      <DeleteIcon />
    </IconButton>
  </Tooltip>
);

const Actions = props => {
  return (
    <div style={{ borderBottom: "1px solid", borderBottomColor: "#e5e5e5" }}>
      <ViewButton
        {...props}
        onView={props.onView}
        onPreviewPage={props.onPreviewPage}
        selectedId={props.selectedViewId}
      />
      <DownloadButton {...props} />
      {props.role[0] == "admin" && (
        <DeleteButton
          {...props}
          onDelete={props.onDelete}
          returnId={props.returnId}
          openModal={props.openModal}
        />
      )}
    </div>
  );
};

class searchableTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isViewModalOpen: false,
      isViewSingleModalOpen: false,
      isNotificationOpen: false,
      columns: this.props.columns,

      buttonColumns: ["actions"],
      rows: this.props.data,
      selection: [],
      sorting: [{ columnName: "name", direction: "asc" }],
      filters: [],
      loading: false,
      selectedViewId: null,

      columnWidths: [],
      userSession: {
        role: "",
        id: null
      },
      currentPage: 0,
      pageSize: 10,
      totalItems: parseInt(this.props.totalItems),

      macroActionsDisabled: false,
      fileToDelete: null
    };
    this.changeSelection = selection => this.setState({ selection });
    this.changeSorting = async sorting => {
      await this.setState({ sorting, loading: true });
      this.handleSort();
    };
    this.changePage = async currentPage => {
      await this.setState({ currentPage: currentPage, loading: true });
      this.handleSort();
    };
    this.changeColumnWidths = columnWidths => {
      this.setState({ columnWidths });
    };
  }

  componentWillMount = async () => {
    this.setState({
      userSession: {
        role: await ApiConfig.getUser(),
        id: await ApiConfig.getId()
      }
    });

    this.generateColumnWidth();
  };

  componentDidMount = async () => {
    this.generateColumnWidth();
  };

  generateColumnWidth = async () => {
    let columnWidths = await this.state.columns.map(column => {
      const widthObject = { columnName: column.name, width: 180 };
      return widthObject;
    });

    await this.setState({
      columnWidths
    });
  };
  componentWillReceiveProps(nextProps) {
    if (this.state.columns != nextProps.columns) {
      this.setState({
        currentPage: 0,
        columns: nextProps.columns,
        rows: nextProps.data,
        totalItems: parseInt(nextProps.totalItems)
      });
    } else {
      this.setState({
        rows: nextProps.data,
        totalItems: parseInt(nextProps.totalItems)
      });
    }
  }

  closeNotification = () => {
    this.setState({
      isNotificationOpen: false
    });
  };

  /**
   * Open snackbar notification
   * @param {string} text: Message showed in the snackbar
   * @param {string} type: Error, success, warning, etc-
   */
  openNotification = (text, type) => {
    this.setState({
      isNotificationOpen: true,
      notificationText: text,
      notificationType: type
    });
  };

  deleteRow = () => {
    this.setState({
      loading: true
    });
    this.closeSingleModal();
    ApiFiles.delete(this.state.fileToDelete)
      .then(response => {
        this.closeNotification();
        let auxArray = [...this.state.rows];

        auxArray.forEach(element => {
          if (element.id === this.state.fileToDelete) {
            auxArray.splice(auxArray.indexOf(element), 1);

            this.setState({
              rows: auxArray
            });
          }
        });

        this.openNotification("Fichero borrado exitosamente", "success");

        this.setState({
          fileToDelete: null,
          loading: false
        });
        this.handleSort();
      })
      .catch(e => {
        this.openNotification(
          "Ha habido un error eliminando este archivo",
          "error"
        );
      });
  };

  viewFile = (response, id, totalPages, extension) => {
    this.setState({
      selectedViewId: id
    });

    this.props.view(response, id, totalPages, extension);
  };

  previewPage = previewPageNumber => {
    this.props.onPreviewPage(previewPageNumber);
  };

  handleSort = () => {
    const sortObject = {
      orderBy: this.state.sorting[0].columnName,
      sort: this.state.sorting[0].direction,
      pageNumber: this.state.currentPage + 1,
      pageSize: parseInt(this.state.pageSize)
    };

    this.props.returnSort(sortObject);

    this.setState({
      loading: false
    });
  };

  ///////////////////////////////////////////////////////////////
  // DOWNLOAD CSV
  ///////////////////////////////////////////////////////////////

  //Convert table data to .csv
  prepareDataForCsv = data => {
    const csvRows = [];

    let selectedArray = [];

    data.forEach(response => {
      let selectedRow = this.state.rows.find(x => x.id === response);
      selectedArray = [...selectedArray, selectedRow];
    });

    let auxArray = selectedArray;

    auxArray.map(object => {
      //remove unwanted fields in CSV
      delete object.id;
      delete object.etag;
      delete object.department_id;
      delete object.url;
    });

    const headers = Object.keys(auxArray[0]);

    csvRows.push(headers.join(","));

    for (const row of auxArray) {
      const values = headers.map(header => {
        const escaped = ("" + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  //Download .csv file
  downloadData = data => {
    try {
      let csv = this.prepareDataForCsv(data);
      const blob = new Blob([csv], { type: "text/csv" });
      var csvURL = window.URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = csvURL;
      tempLink.setAttribute("download", "resultados.csv");
      tempLink.click();
    } catch (e) {
      throw new Error("Hubo un problema con la descarga del csv: " + e);
    }
  };

  exitFilterMode = async () => {
    await this.setFilters([]);
    this.changePage(this.state.currentPage);

    await this.props.returnFilters(this.state.filters);
  };

  returnFilters = async () => {
    await this.props.returnFilters(this.state.filters);
    await this.setFilters([]);
    this.changePage(0);
  };

  setFilters = filters => {
    this.setState({
      filters: filters
    });
  };

  openModal = () => {
    this.setState({
      isViewModalOpen: true
    });
  };

  closeModal = () => {
    this.setState({
      isViewModalOpen: false
    });
  };

  openSingleModal = () => {
    this.setState({
      isViewSingleModalOpen: true,
      fileToDelete: null
    });
  };

  closeSingleModal = () => {
    this.setState({
      isViewSingleModalOpen: false,
      fileToDelete: null
    });
  };

  deleteMultipleFiles = () => {
    let auxSelection = [...this.state.selection];
    this.openNotification("Eliminando los ficheros seleccionados", "info");

    let count = auxSelection.length;
    this.setState({
      macroActionsDisabled: true,
      loading: true
    });
    auxSelection.forEach(element => {
      ApiFiles.delete(element)
        .then(async response => {
          let auxData = [...this.state.rows];
          auxData = auxData.filter(ele => ele.id !== element);

          if (count == 1) {
            this.openNotification(
              "Los ficheros se eliminaron con éxito",
              "success"
            );

            this.handleSort();
            this.setState({
              macroActionsDisabled: false,
              loading: false,
              selection: []
            });
          } else {
            count--;
          }
          await this.setState({
            rows: auxData
          });
        })
        .catch(e => {
          this.openNotification(
            "Hubo un problema con la eliminación masiva de archivos: " + e
          );
        });
    });

    this.closeModal();
  };

  setIdToDelete = id => {
    this.setState({
      fileToDelete: id
    });
  };

  render() {
    const { rows, columns, selection, sorting, columnWidths } = this.state;

    return (
      <div>
        <Notification
          message={this.state.notificationText}
          type={this.state.notificationType}
          handleNotificationOpen={this.state.isNotificationOpen}
          handleNotificationClose={this.closeNotification}
        />
        <DeleteModal
          handleModalOpen={this.state.isViewModalOpen}
          handleModalNo={this.closeModal}
          handleModalYes={this.deleteMultipleFiles}
        />

        <DeleteSingleModal
          handleModalOpen={this.state.isViewSingleModalOpen}
          handleModalNo={this.closeSingleModal}
          handleModalYes={this.deleteRow}
        />
        <Paper>
          {this.state.loading && (
            <ColorConsumer>
              {({ color }) => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 30
                  }}
                >
                  {" "}
                  <FillSpinner size={30} color={color} loading={true} />
                </div>
              )}
            </ColorConsumer>
          )}
          {!this.state.loading && (
            <Grid rows={rows} columns={columns} getRowId={getRowId}>
              <FilteringState
                onFiltersChange={this.setFilters}
                filters={this.state.filters}
              />

              <SortingState
                sorting={sorting}
                onSortingChange={this.changeSorting}
              />
              <SelectionState
                selection={selection}
                onSelectionChange={this.changeSelection}
              />

              <EditingState />
              <PagingState
                currentPage={this.state.currentPage}
                onCurrentPageChange={this.changePage}
                pageSize={this.state.pageSize}
              />
              <CustomPaging totalCount={this.state.totalItems} />

              <IntegratedFiltering />

              <IntegratedSorting />

              <IntegratedSelection />

              <VirtualTable
                messages={{
                  noData: "No hay archivos que coincidan con esta busqueda."
                }}
              />

              <TableHeaderRow
                showSortingControls
                messages={{ sortingHint: "Ordenar" }}
              />
              <TableFilterRow
                showFilterSelector={false}
                messages={{ filterPlaceholder: "Filtrar..." }}
              />
              <TableEditRow />
              <TableEditColumn
                cellComponent={props => (
                  <Actions
                    {...props}
                    role={this.state.userSession.role}
                    onDelete={this.deleteRow}
                    onView={this.viewFile}
                    onPreviewPage={this.previewPage}
                    isViewOpen={this.props.isViewOpen}
                    selectedViewId={this.state.selectedViewId}
                    returnId={this.setIdToDelete}
                    openModal={this.openSingleModal}
                  />
                )}
              />

              <TableSelection showSelectAll />
              <PagingPanel
                messages={{
                  info: `${parseInt(
                    this.state.currentPage * this.state.pageSize
                  )}-${parseInt(this.state.currentPage * this.state.pageSize) +
                  parseInt(this.state.pageSize)} de ${this.state.totalItems}`
                }}
              />
            </Grid>
          )}
        </Paper>

        <br />

        <GridAlign container spacing={24}>
          <GridAlign item xs={9} style={{ marginTop: 12 }}>
            <Paper
              style={{
                textAlign: "center"
              }}
            >
              <Tooltip title="Descargar seleccionados">
                <IconButton
                  disabled={
                    selection == "" || this.state.macroActionsDisabled == true
                  }
                  aria-label="Descargar seleccionados"
                  onClick={() => {
                    let zip = new JSZip();
                    let aux = selection;
                    let itemsProcessed = 0;

                    this.openNotification(
                      "Descargando los ficheros seleccionados",
                      "info"
                    );

                    let count = aux.length;
                    this.setState({
                      macroActionsDisabled: true,
                      loading: true
                    });

                    aux.forEach(element => {
                      let selectedData = this.state.rows.find(function (data) {
                        return data.id === element;
                      });

                      ApiFiles.download({
                        id: selectedData.id
                      })
                        .then(response => {
                          let filePromise = new Promise((resolve, reject) => {
                            resolve(response);
                          });

                          filePromise.then(binaryFile => {
                            zip.file(
                              selectedData.name + "." + selectedData.extension,
                              binaryFile,
                              {
                                base64: true
                              }
                            );

                            itemsProcessed++;
                            if (itemsProcessed == aux.length) {
                              zip
                                .generateAsync({ type: "blob" })
                                .then(async function (content) {
                                  saveAs(content, "archivos.zip");
                                });
                            }

                            if (count == 1) {
                              this.setState({
                                macroActionsDisabled: false,
                                loading: false,
                                selection: []
                              });
                            } else {
                              count--;
                            }
                          });
                        })
                        .catch(e => {
                          throw new Error(
                            "Hubo un problema con la descarga masiva de archivos: " +
                            e
                          );
                        });
                    });
                  }}
                >
                  <DownloadTwoToneIcon style={{ fontSize: "40px" }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Descargar csv">
                <IconButton
                  disabled={
                    selection == "" || this.state.macroActionsDisabled == true
                  }
                  aria-label="Descargar csv"
                  onClick={() => {
                    this.downloadData(this.state.selection);
                  }}
                >
                  <CSVIcon style={{ fontSize: "40px" }} />
                </IconButton>
              </Tooltip>

              {this.state.userSession.role !== null &&
                this.state.userSession.role == "admin" && (
                  <Tooltip title="Eliminar seleccionados">
                    <IconButton
                      disabled={
                        this.state.selection == "" ||
                        this.state.macroActionsDisabled == true
                      }
                      aria-label="Eliminar seleccionados"
                      onClick={() => {
                        this.openModal();
                      }}
                    >
                      <DeleteTwoToneIcon style={{ fontSize: "40px" }} />
                    </IconButton>
                  </Tooltip>
                )}
            </Paper>
          </GridAlign>
          <GridAlign item xs={3} style={{ marginTop: 12 }}>
            <Paper
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Typography variant="subheading" style={{ fontSize: 14 }}>
                Ficheros por página:
              </Typography>

              <FormControl style={{ minWidth: 120, marginBottom:10 }}>
              <InputLabel id="standard-number">{this.state.pageSize}</InputLabel>
                <Select
                  id="standard-number"
                  label="Ficheros por página:"
                  onChange={async event => {
                    if (event.target.value <= this.state.totalItems) {
                      await this.setState({ pageSize: event.target.value });
                      this.handleSort();
                    }else{
                      await this.setState({ pageSize: event.target.value, currentPage: 0 });
                      this.handleSort();
                    }

                  }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>

              </FormControl>
            </Paper>
          </GridAlign>
        </GridAlign>
      </div>
    );
  }
}

export default searchableTable;
