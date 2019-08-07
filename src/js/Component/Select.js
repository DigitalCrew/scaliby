/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Provides single-option select menus.
 *
 * @author Fernando Viegas
 */
class Select {
    /** Element of component. */
    _elem;

    /** MDC framework. */
    _mdc;

    /** Container of elements. */
    _container;

    /** Main element. */
    _main;

    /** Label of component. */
    _label;

    /** Element with message error. */
    _errorElement;


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

        //Create the container of component
        this._container = Base.createElement({
            tag: "div",
            classes: ["div-container"],
            parent: this._elem.parentNode,
            insertAt: Base.getIndexOfElement(this._elem)
        });

        //Create the main element
        this._main = Base.createElement({
            tag: "div",
            classes: ["mdc-select", "input-fullwidth"],
            parent: this._container
        });

        //Create the drop down icon
        Base.createElement({
            tag: "i",
            classes: ["mdc-select__dropdown-icon"],
            styles: ["height", "10px"],
            parent: this._main
        });

        //Configure the element
        Base.configElement(this._elem, {
            generateId: true,
            classes: ["mdc-select__native-control"],
            styles: ["height", "40px", "padding-top", "13px", "padding-bottom", "0px"],
            parent: this._main
        });

        //Create the label
        this._label = Base.createElement({
            tag: "label",
            id: this._elem.id + "_label",
            content: this._elem.dataset.label,
            classes: ["mdc-floating-label"],
            attrs: ["for", this._elem.id],
            parent: this._main
        });

        //Create the line ripple
        Base.createElement({
            tag: "div",
            classes: ["mdc-line-ripple"],
            parent: this._main
        });

        //Create the error message
        this._errorElement = Base.createElement({
            tag: "p",
            classes: ["input-msg-error"],
            parent: this._container
        });

        //Final settings
        this._mdc = new mdc.select.MDCSelect(this._main);
        this.update();
        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }
    }

    /**
     * Update the component.
     */
    update() {
        this._label.innerHTML = this._elem.dataset.label;
        this._mdc.value = this._elem.value;
        Base.showInputMessageError(this._elem);
        Base.showInputComponent(this._elem);
        this._mdc.disabled = this._elem.disabled;
    }

    /**
     * Gets the error message element.
     *
     * @return {Object} the element.
     */
    getErrorElement() {
        return this._errorElement;
    }

    /**
     * Gets the container of elements.
     *
     * @return {Object} the container.
     */
    getContainer() {
        return this._container;
    }

    /**
     * Creates the options of select component.
     *
     * @param {string} formId      ID of form. If null, the "fieldName" parameter is the ID of element
     * @param {string} fieldName   Name of field
     * @param {Object[][]} options Array of options. Each list item is an option that is represented by the array with
     *                             two positions: the first is a value and the second is the text
     * @param {boolean} empty      If true, creates the first option that is empty
     */
    static createOptions(formId, fieldName, options, empty) {
        let elem = Form.getField(formId, fieldName);
        if (!elem) {
            console.log("[Select.createOptions] '" + fieldName + "' component doesn't exist.");
            return;
        }

        let option;
        if (empty) {
            option = document.createElement("option");
            option.value = "";
            option.text = "";
            elem.appendChild(option);

        }

        for (let i = 0; i < options.length; i++) {
            option = document.createElement("option");
            option.value = options[i][0];
            option.text = options[i][1];
            elem.appendChild(option);
        }
    }

}