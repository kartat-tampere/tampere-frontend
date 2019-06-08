import React from "react";
import PropTypes from "prop-types";

import { LayerDetails } from "./LayerDetails";
import { FileInput } from "./FileInput";

function handleFiles(fileList) {
  if (!fileList) {
    return false;
  }
  fileList.forEach(element => {
    console.log(element);
  });
}

export const FileUploadPanel = ({ layer, onSubmit, ...other }) => {
  return (
    <div>
      <LayerDetails {...layer} />
      <form onSubmit={onSubmit}>
        <FileInput onFiles={handleFiles} />
        <input type="submit" />
      </form>
    </div>
  );
};

FileUploadPanel.propTypes = {
  layer: PropTypes.any,
  onSubmit: PropTypes.func
};
