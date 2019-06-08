import React, { useState, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { FileUploadPanel } from "./FileUploadPanel";

const layer = {
  id: 1,
  name: "Tason nimi"
};
function onSubmit(files) {
  alert("tiedostot: " + files.map(f => f.name).join(", "));
}
storiesOf("FileUploadPanel", module).add("basic", () => (
  <FileUploadPanel layer={layer} onSubmit={onSubmit} />
));
