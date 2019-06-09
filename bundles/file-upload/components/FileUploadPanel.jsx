import React, { useState } from "react";
import PropTypes from "prop-types";

import { FileUploadForm } from "./FileUploadForm";
import { ProgressBar } from "./ProgressBar";
import { LayerDetails } from "./LayerDetails";

export class FileUploadPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      layerAttribute: ""
    };
  }
  addFile(file) {
    this.setState((state, props) => {
      return { ...state, files: state.files.concat([file]) };
    });
  }
  removeFile(file) {
    this.setState((state, props) => {
      let files = state.files.filter(f => f !== file);
      return { ...state, files };
    });
  }
  changeLayerAttribute(newAttr) {
    this.setState((state, props) => {
      return { ...state, layerAttribute: newAttr };
    });
  }
  onSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state);
  }
  hasContent() {
    return this.state.files.length || !!this.state.layerAttribute;
  }
  render() {
    return (
      <>
        <ProgressBar value={this.state.files.length} />
        <LayerDetails
          {...this.props.layer}
          onPropertyChange={value => this.changeLayerAttribute(value)}
        />
        <FileUploadForm
          layer={this.props.layer}
          files={this.state.files}
          onSubmit={e => this.onSubmit(e)}
          onRemoveFile={file => this.removeFile(file)}
          onAddFile={file => this.addFile(file)}
        >
          <input type="submit" disabled={!this.hasContent()} value="Tallenna" />
        </FileUploadForm>
      </>
    );
  }
}

FileUploadPanel.propTypes = {
  layer: PropTypes.any,
  onSubmit: PropTypes.func
};
