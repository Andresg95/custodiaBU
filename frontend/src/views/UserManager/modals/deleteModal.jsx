import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

class deleteModal extends React.Component {
  state = {
    open: false,
    scroll: "paper",
    selected: this.props.selected
  };

  handleCancel = () => {
    this.setState({ open: false });
    this.props.handleModalNo();
  };

  handleYes = () => {
    this.setState({ open: false });

    //@params: id & isUser

    if(this.props.selected.status !== undefined){
      //Is user 
      this.props.handleModalYes(this.props.selected.id, true);
      
    }
    else{
      //Is client
      
      this.props.handleModalYes(this.props.selected.id, false );
      
    }
    

  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.handleModalOpen,
      selected: nextProps.selected
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
          <DialogTitle id="scroll-dialog-title">¿Seguro que quieres {(this.state.selected.status !== "pending") ? "eliminar" : "negar"} a {this.state.selected.name + " " + this.state.selected.last_names}?</DialogTitle>
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

export default deleteModal;
