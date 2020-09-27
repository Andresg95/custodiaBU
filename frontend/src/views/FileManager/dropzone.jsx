import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

//self-made.

import FileIcon from "@material-ui/icons/NoteAddTwoTone";

const styles = theme => ({
  root: { marginBottom: 10 },
  paper: {
    padding: theme.spacing.unit * 1,
    textAlign: "center",
    backgroundColor: "#F0F0F0"
  },
  dropzone: {
    borderStyle: "dashed",
    borderColor: "#D3D3D3",
    borderRadius: 8,
    borderWidth: 2,
    padding: 30,
    margin: 20,
    marginTop: 10
  },
  dropzoneText: {
    fontSize: 15,
    fontWeight: 600
  },
  extensionText: {
    fontSize: 12,
    fontWeight: 400
  },
  fileContainer: {
    maxHeight: 150,
    overflowY: "auto",
    margin: 15,
    textAlign: "initial",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#D3D3D3",
    backgroundColor: "#F6F6F6"
  },
  fileText: {
    fontSize: 16,
    fontWeight: 400,
    verticalAlign: "middle",
    display: "inline-block"
  },
  fileIcon: {
    fontSize: 36,
    verticalAlign: "middle",
    display: "inline-block"
  },
  file: {
    marginBottom: 5
  }
});

function Basic(props) {
  const onDrop = useCallback(acceptedFiles => {
    if (props.type == "multiple") {
      acceptedFiles.length >= 5001
        ? returnEmptyFiles()
        : props.returnFiles(acceptedFiles);
    } else {
      props.returnFiles(acceptedFiles);
    }
  }, []);

  const returnEmptyFiles = () => {
    props.openNotification(
      "Solo se pueden subir grupos de 5000 ficheros",
      "error"
    );

    props.returnFiles([]);
  };
  const multiple = () => {
    return props.type != "single";
  };

  const { classes } = props;
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: multiple(),
    accept: [
      "application/doc",
      "application/ms-doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/pdf",
      "image/png",
      "image/jpeg"
    ]
  });

  const files = acceptedFiles.map(file => (
    <li className={classes.file} key={file.path}>
      <FileIcon className={classes.fileIcon} />{" "}
      <Typography variant="caption" className={classes.fileText}>
        {" "}
        {file.path}
      </Typography>
    </li>
  ));

  return (
    <section className={classes.root}>
      <Paper className={classes.paper}>
        <aside className={classes.fileContainer}>
          <ul style={{ paddingLeft: 0, listStyleType: "none", margin: 5 }}>
            {files}
          </ul>
        </aside>
        <div
          {...getRootProps({
            className: classes.dropzone
          })}
        >
          <input {...getInputProps()} />
          <Typography variant="button" className={classes.dropzoneText}>
            {props.text}
          </Typography>
          <Typography variant="button" className={classes.extensionText}>
            [pdf, doc/docx, png, jpg/jpeg]
          </Typography>
        </div>
      </Paper>
    </section>
  );
}

export default withStyles(styles)(Basic);
