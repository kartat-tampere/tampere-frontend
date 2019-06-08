import React from "react";
import { storiesOf } from "@storybook/react";
import { FileUploadPanel } from "./FileUploadPanel";

const layer = {
  id: 1,
  name: "Tason nimi"
};

function onSubmit(daa) {
  alert("moi");
  daa.preventDefault();
}
storiesOf("FileUploadPanel", module).add("basic", () => (
  <FileUploadPanel layer={layer} onSubmit={onSubmit} />
));
