import React, { useState } from "react";
import PropTypes from "prop-types";

import { FileUploadForm } from "./FileUploadForm";
import { ProgressBar } from "./ProgressBar";

export class FileUploadPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }
  addFile(file) {
    this.setState((state, props) => {
      console.log(state.files);
      return { files: state.files.concat([file]) };
    });
  }
  removeFile(file) {
    this.setState((state, props) => {
      console.log(state.files);
      let files = state.files.filter(f => f !== file);
      return { files };
    });
  }
  onSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.files);
  }
  render() {
    return (
      <>
        <ProgressBar value={this.state.files.length} />
        <FileUploadForm
          layer={this.props.layer}
          files={this.state.files}
          onSubmit={e => this.onSubmit(e)}
          onRemoveFile={file => this.removeFile(file)}
          onAddFile={file => this.addFile(file)}
        />
      </>
    );
  }
}

FileUploadPanel.propTypes = {
  layer: PropTypes.any,
  onSubmit: PropTypes.func
};
