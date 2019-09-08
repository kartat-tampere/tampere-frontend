import React from "react";
import ReactDOM from "react-dom";
import { FileUploadPanel } from "./components/FileUploadPanel";

const BasicBundle = Oskari.clazz.get("Oskari.BasicBundle");

Oskari.clazz.defineES(
  "Oskari.file-upload.BundleInstance",
  class FileUploadBundle extends BasicBundle {
    constructor() {
      super();
      this.__name = "file-upload";
    }
    _startImpl() {
      const root = document.getElementById("loginbar");
      if (!root) {
        alert("prob");
      }

      var flyout = Oskari.clazz.create(
        "Oskari.userinterface.extension.ExtraFlyout",
        "File upload"
      );
      flyout.show();
      flyout.move(170, 0, true);
      flyout.makeDraggable();

      var mainUI = jQuery("<div></div>");
      ReactDOM.render(
        <>
          <FileUploadPanel onSubmit={submitFiles} />
        </>,
        mainUI[0]
      );
      flyout.setContent(mainUI);
    }
  }
);

function submitFiles(data) {
  /*
  alert(
    `Attr: ${data.layerAttribute} \nTiedostot: ${data.files
      .map(f => f.name)
      .join(", ")}`
  );*/
  uploadFile(data.files); //.forEach(uploadFile);
}

function updateProgress(file, progress) {
  console.log("Progress on " + file.name + ": " + progress);
}

function uploadFile(files) {
  var url = Oskari.urls.getRoute("WFSAttachments");
  var xhr = new XMLHttpRequest();
  var formData = new FormData();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-XSRF-TOKEN", Oskari.app.getXSRFToken());

  // Add following event listener
  xhr.upload.addEventListener("progress", function(e) {
    updateProgress(files, (e.loaded * 100.0) / e.total || 100);
  });

  xhr.addEventListener("readystatechange", function(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // Done. Inform the user
    } else if (xhr.readyState == 4 && xhr.status != 200) {
      // Error. Inform the user
    }
  });

  formData.append("layerId", "1");
  files.forEach(f => {
    formData.append("file", f);
    formData.append("locale_" + f.name, f.locale);
    
  });
  xhr.send(formData);
}
