/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Object that treats the communication between client and server.
 *
 * @author Fernando Viegas
 */
class Comm {
    /** Function to be called before replace content from asynchronous response. */
    static _funcBeforeReplace;


    /**
     * Performs an asynchronous request for the application domain.
     *
     * @param {object} attrs Structure of request. See {@link Comm.send} method
     *
     * @private
     */
    static _sendAsync(attrs) {
        if (!attrs.path) {
            console.error("Path of request is empty!");
            return;
        }

        //Build serialized data from the list
        let data = Comm._serializeValues(attrs.fields);
        if (attrs.form) {
            let form = typeof attrs.form === "string" ? document.getElementById(attrs.form) : attrs.form;
            data += Comm._serializeForm(form);
        }

        //Adjust the list of elements that will be locked
        let lockedList = null;
        if (!attrs.lockedList) {
            lockedList = attrs.id ? [attrs.id] : null;
        } else {
            lockedList = attrs.lockedList;
        }

        if (Scaliby.isDebug() === true) {
            console.log("REQUEST: path=" + attrs.path + " / type=" + attrs.type + " / target=" + attrs.id +
                " / lockedList=" + lockedList + " / params=" + data);
        }

        //System of lock and unlock elements
        let lockedElementList = LoadingSpinner.createAndlockElements(lockedList);

        function removeLoadingElements() {
            LoadingSpinner.unlockElements(lockedElementList);
        }

        //Make the request and treat the answer
        $.ajax(attrs.path,
            {
                async: true,
                type: attrs.type,
                dataType: attrs.dataType,
                timeout: 60000 * 100,
                data: data,
                success: function (data, status, xhr) {
                    if (attrs.id) {
                        let target = document.getElementById(attrs.id);
                        let hasLayer = target.dataset.layers === "true";

                        if (xhr.getResponseHeader("append") === "true") {
                            if (Scaliby.isDebug() === true) {
                                console.log("APPEND(" + target.id + " / layer=" + hasLayer + "): " + data);
                            }
                            if (hasLayer) {
                                Layer.appendInCurrentLayer(target.id, data);
                            } else {
                                $(target).append(data);
                            }
                        } else {
                            let preData = Comm._executeFunctionBeforeReplace(attrs.path, target.id);
                            if (Scaliby.isDebug() === true) {
                                console.log("REPLACE(" + target.id + " / layer=" + hasLayer + "): " + preData + data);
                            }
                            if (hasLayer) {
                                Layer.show(target.id, preData + data);
                            } else {
                                $(target).html(preData + data);
                            }
                        }

                        Scaliby.createComponents(target.id);
                    }

                    removeLoadingElements();
                    if (attrs.callback) {
                        try {
                            attrs.callback(data);
                        } catch (error) {
                            Dialog.showOk(Scaliby.getConfiguration().messages.comm.communicationError,
                                Scaliby.getConfiguration().messages.comm.communicationProblem, null);
                            console.error(error);
                        }
                    }
                    Hint.remove(false);
                    Scaliby.executeListenerAfterLoaded();
                },
                error: function (error) {
                    console.error(error.responseJSON);
                    removeLoadingElements();
                    if (error.responseJSON.code) {
                        $("body").append(error.responseJSON.code);
                    } else {
                        let message = error.responseJSON.message;
                        if (!message) {
                            message = Scaliby.getConfiguration().messages.comm.communicationProblem;
                        }
                        Dialog.showOk(Scaliby.getConfiguration().messages.comm.communicationError, message, null);
                    }
                }
            }
        );
    }

    /**
     * Makes the serialization of fields and values of form.
     *
     * @param {Object} form Form element
     *
     * @return {String} the fields and their serialized values to be sent via request. The first character is "&".
     *         If no fields, returns "".
     *
     * @private
     */
    static _serializeForm(form) {
        let list = Form.getFields(form);
        let result = "";

        for (let i = 0; i < list.length; i++) {
            let elem = list[i];
            let value = Form.getValueByElement(elem);
            if (value instanceof Array) {
                if (value.length > 0) {
                    for (let j = 0; j < value.length; j++) {
                        result += Comm._serializeValue(elem.name, value[j]);
                    }
                } else {
                    result += Comm._serializeValue(elem.name, "");
                }
            } else {
                result += Comm._serializeValue(elem.name, value);
            }
        }

        return result;
    }

    /**
     * Builds serialized data from the list of fields.
     *
     * @param {string[]} fields List of field names and their respective values. The names of fields can be repeated
     *
     * @return {string} the serialized data. The first character is "&". If no fields, returns "".
     *
     * @private
     */
    static _serializeValues(fields) {
        let data = "";

        if (fields) {
            for (let i = 0; i < fields.length; i += 2) {
                data += Comm._serializeValue(fields[i], fields[i + 1]);
            }
        }

        return data;
    }

    /**
     * Makes the serialization of value.
     *
     * @param {string} name  Field name
     * @param {string} value Field value
     *
     * @return {string} the serialized value started with "&".
     *
     * @private
     */
    static _serializeValue(name, value) {
        value = value.replace(/(\r)?\n/g, "\r\n");
        value = encodeURIComponent(value);
        value = value.replace(/%20/g, "+");
        return "&" + name + "=" + value;
    }

    /**
     * Gets the data before replace content from asynchronous response.
     *
     * @param path     Path of request
     * @param targetId ID element that receive the data
     *
     * @return {string} data to be placed.
     *
     * @private
     */
    static _executeFunctionBeforeReplace(path, targetId) {
        return Comm._funcBeforeReplace ? Comm._funcBeforeReplace(path, targetId) : "";
    }


    /**
     * Configures the communication.
     *
     * @param {object} attrs funcBeforeReplace: Function to be called before replace content from asynchronous response.
     *                                          The first parameter is the path of request and the second parameter is
     *                                          the element id that receive the content {function}
     */
    static config(attrs) {
        if (attrs.funcBeforeReplace) {
            Comm._funcBeforeReplace = attrs.funcBeforeReplace
        }
    }

    /**
     * Performs a synchronous request for the application domain.
     *
     * @param {string} path Request path
     */
    static request(path) {
        LoadingSpinner.createAndlockElements(null);
        window.location.href = path;
    }

    /**
     * Performs an asynchronous GET for the application domain.
     *
     * @param {string} path    Request path
     * @param {object} target  ID or object of the element with layers. If element hasn't layer, consider it a child and
     *                         look for a parent with layers
     * @param {object=} locked ID or object of the element that will be locked during the request. If null or not
     *                         informed, locks the target element
     */
    static get(path, target, locked) {
        let id = Layer.getElementWithLayers(target).id;

        if (Scaliby.isDebug() === true) {
            console.log("locked=" + locked + " / id=" + id);
        }
        Comm._sendAsync({
            path: path,
            id: id,
            lockedList: locked ? [locked] : [id],
            type: "GET"
        });
    }

    /**
     * Performs an asynchronous POST for the application domain.
     *
     * @param {string} path     Request path
     * @param {string[]} fields List of field names and their respective values. The names of fields can be repeated
     * @param {object} target   ID or object of the element with layers. If element hasn't layer, consider it a child
     *                          and look for a parent with layers
     * @param {object=} locked  ID or object of the element that will be locked during the request. If null or not
     *                          informed, locks the target element
     */
    static post(path, fields, target, locked) {
        let id = Layer.getElementWithLayers(target).id;

        if (Scaliby.isDebug() === true) {
            console.log("locked=" + locked + " / id=" + id);
        }
        Comm._sendAsync({
            path: path,
            id: id,
            lockedList: locked ? [locked] : [id],
            fields: fields,
            type: "POST"
        });
    }

    /**
     * Sends the form fields via asynchronous POST for the application domain.
     * <br>
     * Notes:
     * <ul>
     *   <li>Adds in the fields the "_form" field with the name of form;</li>
     *   <li>By default, the response will be placed on the layer of form and the form will be locked.</li>
     * </ul>
     *
     * @param {object} source Element(ID or object) that do the request. It should stays inside a form
     * @param {string=} id    Element ID that receive the response. Use it only if the form isn't within a layer or the
     *                        response needs to be displayed in a different element. Optional
     */
    static submit(source, id) {
        //Get form and remove the error messages
        source = typeof source === "string" ? document.getElementById(source) : source;
        let form = Base.getClosest(source, "form");
        let formId = form.getAttribute("id");
        let path = form.getAttribute("action");
        Form.removeAllErrors(form);

        //Send the form via Ajax
        Comm._sendAsync({
            path: path,
            fields: ["_form", formId],
            form: form,
            id: id ? id : Layer.getElementWithLayers(form).id,
            lockedList: [formId],
            type: "POST"
        });
    }

    /**
     * Sends an asynchronous request.
     * <br>
     * Uses this method only for specific requests. The "get", "post" and "submit" methods are more appropriate.
     * <br>
     * Notes:
     * <ul>
     *   <li>Informs only one of "id" or "layer" attributes, never both;.</li>
     *   <li>If both "formId" and "fields" are informed, fields are concatenated and sent.</li>
     * </ul>
     *
     * The structure of "attrs" parameter is:
     * <ul>
     *   <li>path - Request path (string);</li>
     *   <li>form - Form(ID or object) of the fields will be collected and will send. Optional (object);</li>
     *   <li>fields - List of field names and their respective values. The names of fields can be repeated.
     *                Optional (string[]);</li>
     *   <li>id - Element ID that will receive the response. If the element has layers, the response will be shown on
     *            the new layer (string);</li>
     *   <li>lockedList - List of elements(ID or object) that will be locked during the request. If empty, without
     *                    locks. If null or not informed, locks the element from "id" attribute (Object[]);</li>
     *   <li>callback - Function to be called after the server responds. Optional (function);</li>
     *   <li>dataType - Type of response(e.g. "json", "html"). Optional, default is "html" (string);</li>
     *   <li>type - Type of request: "GET" or "POST" (string).</li>
     * </ul>
     *
     * @param {object} attrs Structure of request
     */
    static send(attrs) {
        Comm._sendAsync(attrs);
    }

}
