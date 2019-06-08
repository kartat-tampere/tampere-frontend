import React from "react";
import PropTypes from "prop-types";

export const LayerDetails = props => {
  return (
    <div>
      <h3>{props.name || "Layer not selected"}</h3>
    </div>
  );
};

LayerDetails.propTypes = {
  name: PropTypes.string
};
