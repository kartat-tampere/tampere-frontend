import React from "react";
import PropTypes from "prop-types";

import { FileInput } from "./FileInput";
import { FileDisplay } from "./FileDisplay";
import { ProgressBar } from "./ProgressBar";

export const FileUploadForm = ({
  files,
  fileProgress = {},
  onSubmit,
  onAddFile,
  onRemoveFile,
  children,
  ...other
}) => {
  function handleFiles(fileList) {
    if (!fileList || typeof onAddFile !== "function") {
      return false;
    }
    // FileList returned is _not_ an array so...
    const files = [...fileList];
    files.forEach(element => {
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
              <>
                <FileDisplay key={f.name} file={f} onRemove={onRemoveFile} />
                <ProgressBar
                  key={f + fileProgress[f]}
                  value={fileProgress[f] || 0}
                />
              </>
            ))}
        </div>
        {children}
      </form>
    </div>
  );
};

FileUploadForm.propTypes = {
  files: PropTypes.any,
  fileProgress: PropTypes.any,
  onSubmit: PropTypes.func,
  onAddFile: PropTypes.func,
  onRemoveFile: PropTypes.func
};
