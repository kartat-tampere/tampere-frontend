import React from "react";
import PropTypes from "prop-types";

export const LayerDetails = props => {
  return (
    <div>
      <h3>{props.name || "Layer not selected"}</h3>
      <label>
        Ominaisuustieto jolla tiedostot liitetään:
        <input
          type="text"
          onChange={e => props.onPropertyChange(e.target.value)}
        />
      </label>
    </div>
  );
};

LayerDetails.propTypes = {
  name: PropTypes.string,
  onPropertyChange: PropTypes.func
};
