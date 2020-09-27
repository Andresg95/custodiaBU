import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

class deleteFileModal extends React.Component {
  state = {
    open: false,
    scroll: "paper"
  };

  handleCancel = () => {
    this.setState({ open: false });
    this.props.handleModalNo();
  };

  handleYes = () => {
    this.setState({ open: false });

    this.props.handleModalYes();
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.handleModalOpen
    });
  }

  render() {
    return (
      <div>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          scroll={this.state.scroll}
          aria-labelledby="scroll-dialog-title"
        >
          <DialogTitle id="scroll-dialog-title">
            ¿Seguro que quieres eliminar estos ficheros?
          </DialogTitle>
          <DialogActions>
            <Button onClick={this.handleYes} color="secondary">
              Sí
            </Button>
            <Button onClick={this.handleCancel} color="secondary">
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default deleteFileModal;
