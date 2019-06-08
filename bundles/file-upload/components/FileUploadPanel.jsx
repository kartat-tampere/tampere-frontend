import React from "react";
import PropTypes from "prop-types";

import { LayerDetails } from "./LayerDetails";

export const FileUploadPanel = ({ layer, onSubmit, ...other }) => {
  return (
    <div>
      <LayerDetails {...layer} />
      <form onSubmit={onSubmit}>
        <input type="file" />
        <input type="submit" />
      </form>
    </div>
  );
};

FileUploadPanel.propTypes = {
  layer: PropTypes.any,
  onSubmit: PropTypes.func
};
