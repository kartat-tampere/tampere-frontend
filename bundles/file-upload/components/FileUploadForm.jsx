import React from "react";
import PropTypes from "prop-types";

import { FileInput } from "./FileInput";
import { FileDisplay } from "./FileDisplay";

export const FileUploadForm = ({
  files,
  onSubmit,
  onAddFile,
  onRemoveFile
}) => {
  function handleFiles(fileList) {
    if (!fileList || typeof onAddFile !== "function") {
      return false;
    }
    fileList.forEach(element => {
      onAddFile(element);
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <FileInput onFiles={handleFiles} />
        <div>
          {files &&
            files.map(f => (
              <FileDisplay key={f.name} file={f} onRemove={onRemoveFile} />
            ))}
        </div>
        <input type="submit" disabled={!files.length} />
      </form>
    </div>
  );
};

FileUploadForm.propTypes = {
  files: PropTypes.any,
  onSubmit: PropTypes.func,
  onAddFile: PropTypes.func,
  onRemoveFile: PropTypes.func
};
