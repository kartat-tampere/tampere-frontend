import React from "react";
import PropTypes from "prop-types";

export const FileDisplay = ({ file, onRemove }) => {
  return (
    <div>
      <span>{file.name}</span>
      <button type="button" onClick={() => onRemove(file)}>
        Poista
      </button>
    </div>
  );
};

FileDisplay.propTypes = {
  file: PropTypes.any,
  onRemove: PropTypes.func
};
