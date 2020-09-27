import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@material-ui/icons/CancelOutlined";
import NextPageIcon from "@material-ui/icons/NavigateNextOutlined";
import PreviousPageIcon from "@material-ui/icons/NavigateBeforeOutlined";
import ApiFiles from "../../api/files";

//Context
import { ColorConsumer } from "../../context/colorContext";

import { MagicSpinner } from "react-spinners-kit";

const styles = theme => ({
  root: {
    height: "auto",
    maxHeight: 690
  }
});

class FilePreview extends React.Component {
  state = {
    totalPages: this.props.totalPages,
    currentPage: this.props.currentPage,
    extension: this.props.extension
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      totalPages: nextProps.totalPages,
      currentPage: nextProps.currentPage,
      extension: nextProps.extension
    });
  }

  openFile = () => {
    ApiFiles.download({
      id: this.props.id
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


        switch (this.state.extension.toLowerCase()) {
          case "pdf":
            let pdfResult = response;

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
              const blobUrl2= URL.createObjectURL(blob2);
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

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {this.props.file !== "loading" ? (
          <div>
            <img
              style={{ width: "100%", objectFit: "contain", cursor: "pointer" }}
              src={`data:image/png;base64,${this.props.file}`}
              onClick={this.openFile}
            />

            <br />
            {this.state.currentPage != this.props.previewPageNumber && (
              <IconButton
                aria-label="Cerrar"
                onClick={() => {
                  this.props.previous();
                }}
                style={{ padding: "15px" }}
              >
                <PreviousPageIcon />
              </IconButton>
            )}
            <IconButton
              aria-label="Cerrar"
              onClick={() => {
                this.props.close();
              }}
              style={{ padding: "15px" }}
            >
              <CancelIcon />
            </IconButton>

            {this.state.currentPage != this.state.totalPages && (
              <IconButton
                aria-label="Cerrar"
                onClick={() => {
                  this.props.next();
                }}
                style={{ padding: "15px" }}
              >
                <NextPageIcon />
              </IconButton>
            )}
          </div>
        ) : (
            <ColorConsumer>
              {({ color }) => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: 15
                  }}
                >
                  {" "}
                  <MagicSpinner size={50} color={color} loading={true} />
                </div>
              )}
            </ColorConsumer>
          )}
      </div>
    );
  }
}

FilePreview.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FilePreview);
