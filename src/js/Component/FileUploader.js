/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Uploads a file to server.
 *
 * @author Fernando Viegas
 */
class FileUploader {
    /** Element of component. */
    _elem;

    /** Container of elements. */
    _container;

    /** File input element. */
    _input;

    /** Button to choose the file. */
    _button;

    /** List of mime type allowed. */
    _mimeTypes;

    /** List of file extensions allowed. */
    _extensions;

    /** The maximum size of file (in KBytes). */
    _maxSize = 0;

    /** Text of maximum size. */
    _maxSizeText;

    /** Div that contains the files information. */
    _divFile;


    /**
     * Shows the information of chosen files.
     *
     * @private
     */
    _showSelectedFilesInfo() {
        //Build list with approved files
        let msg;
        let approvedFiles = [];
        let files = this._input.files;

        if (this._elem.dataset.maxFiles && files.length + this._divFile.children.length > this._elem.dataset.maxFiles) {
            msg = Scaliby.getConfiguration().messages.fileUploader.maxFiles;
            msg = msg.replace("$", this._elem.dataset.maxFiles);
            Alert.showError(msg, 5);
            return;
        }

        for (let i = 0; i < files.length; i++) {
            if (this._isAlreadyUploaded(files[i].name)) {
                msg = Scaliby.getConfiguration().messages.fileUploader.alreadyUploaded;
                msg = msg.replace("$", files[i].name);
                Alert.showError(msg, 5);
                continue;
            }

            if (this._extensions.length > 0 && this._extensions.indexOf(this._getExtension(files[i].name)) === -1) {
                msg = Scaliby.getConfiguration().messages.fileUploader.invalidType;
                msg = msg.replace("$", files[i].name);
                Alert.showError(msg, 5);
                if (Scaliby.isDebug() === true) {
                    console.log("Invalid type of file:" + files[i].type);
                }
                continue;
            }

            if (this._maxSize > 0 && files[i].size > this._maxSize * 1024) {
                msg = Scaliby.getConfiguration().messages.fileUploader.maxSize;
                msg = msg.replace("$", files[i].name).replace("$", this._maxSizeText);
                Alert.showError(msg, 5);
                continue;
            }

            approvedFiles[approvedFiles.length] = files[i];
        }

        //Show file names, icons, progress and send the files
        for (let i = 0; i < approvedFiles.length; i++) {
            let div = this._showFileInfo(approvedFiles[i].name);

            let icon = div.querySelector(".material-icons");
            let divProgress = div.querySelector(".s-progress");
            let fileUploader = this;
            setTimeout(function() {
                fileUploader._uploadFile(approvedFiles[i], icon, new Progress(divProgress), div);
            }, 1);
        }
    }

    /**
     * Shows the file name, delete icon and progress.
     *
     * @param {string} name Name of file
     *
     * @return {Element} div with the elements
     *
     * @private
     */
    _showFileInfo(name) {
        let div = Base.createElement({
            tag: "div",
            classes: ["file-uploader-div"],
            parent: this._divFile
        });

        let divNameIcon = Base.createElement({
            tag: "div",
            styles: ["display", "flex"],
            parent: div
        });

        Base.createElement({
            tag: "div",
            classes: ["file-uploader-name"],
            content: name,
            parent: divNameIcon
        });

        Base.createElement({
            tag: "i",
            classes: ["material-icons", "file-uploader-icon"],
            content: "cancel",
            parent: divNameIcon
        });

        Base.createElement({
            tag: "div",
            classes: ["s-progress"],
            parent: div
        });

        return div;
    }

    /**
     * Verifies if the file was uploaded.
     *
     * @param {string} name Name of file
     *
     * @return {boolean} true if file was uploaded.
     *
     * @private
     */
    _isAlreadyUploaded(name) {
        for (let i = 0; i < this._divFile.children.length; i++) {
            if (this._divFile.children[i].children[0].children[0].innerHTML === name) {
                return true;
            }
        }
        return false;
    }

    /**
     * Uploads the file.
     *
     * @param {Object} file     File data
     * @param {Element} icon    Icon of cancel
     * @param {Object} progress Progress component
     * @param {Element} div     Div with all elements of file
     *
     * @private
     */
    _uploadFile(file, icon, progress, div) {
        progress.setProgress(0);

        let uploadFile = this;
        let request = new XMLHttpRequest();
        let data = new FormData();
        data.append("file", file);

        //Event of progress
        request.upload.addEventListener('progress', function(event) {
            progress.setProgress(event.loaded / event.total);
        });

        //Event of state. Treat the success and error
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    //Success. Remove progress and allow download of the file
                    uploadFile._allowDownload(div, file.name);
                } else {
                    //Error. Remove file and show the message
                    let msg = Scaliby.getConfiguration().messages.fileUploader.sendError;
                    msg = msg.replace("$", file.name);
                    Alert.showError(msg, 10);
                    div.parentNode.removeChild(div);
                }
            }
        };

        //Event of aborted operation when icon is clicked
        icon.addEventListener("click", function() { uploadFile._abortUpload(request, div, file.name); });

        //Send POST request to the server
        if (this._elem.dataset.urlSend) {
            request.open("post", this._elem.dataset.urlSend + "?id=" + this._elem.id);
            request.send(data);
        } else {
            console.error("File not sent. URL not defined.")
        }
    }

    /**
     * Aborts the upload.
     *
     * @param {Object} request Instance of XMLHttpRequest
     * @param {Element} div    Div with all elements of file
     * @param {string} name    Name of file
     *
     * @private
     */
    _abortUpload(request, div, name) {
        request.onreadystatechange = null;
        request.abort();
        try {
            Comm.send({
                path: this._elem.dataset.urlCancel,
                fields: ["id", this._elem.id, "name", name],
                lockedList: [],
                type: "POST"
            });
            div.parentNode.removeChild(div);
        } catch (ex) {
            console.error(ex);
        }
    }

    /**
     * Adjusts the file to allow download.
     *
     * @param {Element} div  Div with all elements of file
     * @param {string}  name Name of file
     * @param {string=} code Code of file. Informs this code only if the file was added by method
     *
     * @private
     */
    _allowDownload(div, name, code) {
        let elem = this._elem;
        let divName = div.querySelector(".file-uploader-name");
        Base.configElement(divName, {
            styles: ["color", "#0000f0", "cursor", "pointer"],
            events: ["click", function() {
                let url = elem.dataset.urlDownload + "?id=" + elem.id + "&name=" + name;
                if (code) {
                    url += "&code=" + code;
                }
                Comm.request(url);
            }]
        });
        let progress = div.querySelector(".s-progress");
        if (progress) {
            progress.parentNode.removeChild(progress);
        }
    }

    /**
     * Gets the lower case extension of file.
     *
     * @param {string} name Name of file
     *
     * @return {string} extension of file.
     *
     * @private
     */
    _getExtension(name) {
        if (!name) {
            return "";
        }

        let index = name.lastIndexOf(".");
        return name.substring(index + 1).toLowerCase();
    }


    /**
     * Constructor.
     *
     * @param {object} elem Input element of component
     */
    constructor(elem) {
        if (elem.component) {
            return;
        }
        elem.component = this;
        this._elem = elem;

        //Configure the element
        Base.configElement(this._elem, {
            styles: ["display", "flex"]
        });

        //Div with button
        let divButton = Base.createElement({
            tag: "div",
            parent: this._elem
        });

        //Input
        this._input = Base.createElement({
            tag: "input",
            styles: ["display", "none"],
            attrs: ["type", "file"],
            parent: divButton,
            events: ["change", function() { fileUploader._showSelectedFilesInfo(); }]
        });
        let input = this._input;

        //Button
        let fileUploader = this;
        this._button = Base.createElement({
            tag: "button",
            classes: ["s-button"],
            content: "Anexar",
            parent: divButton,
            events: ["click", function() { input.value = ""; input.click(); }]
        });

        //Div with file
        this._divFile = Base.createElement({
            tag: "div",
            styles: ["padding-left", "5px"],
            parent: this._elem
        });

        //Final settings
        Scaliby.createComponent(this._button);
        this.update();
        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }
    }

    /**
     * Update the component.
     */
    update() {
        let button = Scaliby.getComponent(this._button);
        if (button) {
            button.update();
        }

        Base.configElement(this._input, {
            attrs: [
                "accept", this._elem.dataset.mimeTypes,
                "multiple", this._elem.dataset.multiple === "true" ? "true" : "false"
            ]
        });

        //File extensions allowed
        this._extensions = [];
        if (this._elem.dataset.extensions) {
            this._extensions = this._elem.dataset.extensions.split(",");
            for (let i = 0; i < this._extensions.length; i++) {
                this._extensions[i] = this._extensions[i].trim().toLowerCase();
            }
        }

        //Maximum size
        if (this._elem.dataset.maxSize) {
            this._maxSize = parseInt(this._elem.dataset.maxSize);
            let size = parseInt(this._elem.dataset.maxSize);
            if (size > 1024 * 1024) {
                this._maxSizeText = I18n.numberToString(size / (1024 * 1024), 2) + "GB";
            } else if (size > 1024) {
                this._maxSizeText = I18n.numberToString(size / 1024, 2) + "MB";
            } else {
                this._maxSizeText = size + "KB";
            }
        }

    }

    /**
     * Gets the container of elements.
     *
     * @return {Element} the container.
     */
    getContainer() {
        return this._elem;
    }

    /**
     * Adds a file and shows in the list of uploaded files.
     * <br>
     * An example of this feature is show all uploaded and existing files on a change form.
     *
     * @param {string} name Name of the file
     * @param {string} code Code of file for download and delete
     */
    addFile(name, code) {
        let div = this._showFileInfo(name);
        this._allowDownload(div, name, code);

        //Delete the file
        let icon = div.querySelector(".material-icons");
        let elem = this._elem;
        icon.addEventListener("click", function () {
            Comm.send({
                path: elem.dataset.urlCancel,
                fields: ["id", elem.id, "name", name, "code", code],
                lockedList: [],
                type: "POST"
            });
            div.parentNode.removeChild(div);
        });
    }

}