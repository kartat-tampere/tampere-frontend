import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const StyledRootEl = styled("div")`
  margin: 10px;
  padding: 10px;
  border: 1px solid black;
`;
function handleFiles(fileList) {
  if (!fileList) {
    return false;
  }
  fileList.forEach(element => {
    console.log(element);
  });
}
function onChange(event) {
  handleFiles(event.target.files);
}

function onDrop(event) {
  event.preventDefault();
  handleFiles(event.dataTransfer.files);
}

function onDragOver(event) {
  event.preventDefault();
  console.log("Drag over", event);
}
function onDragLeave(event) {
  event.preventDefault();
  console.log("Drag leave", event);
}
function onDragEnter(event) {
  event.preventDefault();
  console.log("Drag enter", event);
}

export const FileInput = () => {
  return (
    <StyledRootEl
      class="dropzone"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      <input type="file" multiple onChange={onChange} />
    </StyledRootEl>
  );
};

FileInput.propTypes = {};
