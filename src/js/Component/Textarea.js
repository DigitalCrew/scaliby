/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Allows users to input, edit and select big text.
 *
 * @author Fernando Viegas
 */
class Textarea {
    /** Element of component. */
    _elem;

    /** Container of elements. */
    _container;

    /** Label of component. */
    _label;

    /** Element with message error. */
    _errorElement;

    /* Main element. */
    _main;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();
        this._elem._mdc = new mdc.textField.MDCTextField(this._main);
    }

    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;
        let component = this;

        elem.addEventListener("change", function() {
            component._showLine();
        });

        elem.addEventListener("focus", function () {
            elem.parentNode.classList.add("textarea-line-focus");
            elem.parentNode.classList.add("input-bg-focus");
        });

        elem.addEventListener("blur", function () {
            elem.parentNode.classList.remove("textarea-line-focus");
            elem.parentNode.classList.remove("input-bg-focus");
        });

        elem.addEventListener("mouseover", function () {
            if (elem.value === "" && elem.required === true) {
                elem.parentNode.classList.add("textarea-line_error-hover");
            } else {
                elem.parentNode.classList.add("textarea-line-hover");
            }
            elem.parentNode.classList.add("input-bg");
        });

        elem.addEventListener("mouseout", function () {
            elem.parentNode.classList.remove("textarea-line-hover");
            elem.parentNode.classList.remove("textarea-line_error-hover");
            elem.parentNode.classList.add("input-bg");
        });
    }

    /**
     * Shows the bottom line of component.
     *
     * @private
     */
    _showLine() {
        this._elem.parentNode.classList.remove("textarea-line");
        this._elem.parentNode.classList.remove("textarea-line_error");
        if (this._elem.value === "" && this._elem.required === true) {
            this._elem.parentNode.classList.add("textarea-line_error");
        } else {
            this._elem.parentNode.classList.add("textarea-line");
        }
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
            classes: ["mdc-text-field", "mdc-text-field--textarea", "textarea-line"],
            styles: ["height", "auto"],
            parent: this._container
        });

        //Configure the element
        $(this._elem).appendTo(this._main);
        Base.configElement(this._elem, {
            generateId: true,
            classes: ["mdc-text-field__input"],
            styles: ["margin-top", "14px"]
        });

        //Create the label
        this._label = Base.createElement({
            tag: "label",
            id: this._elem.id + "_label",
            content: this._elem.dataset.label,
            classes: ["mdc-floating-label"],
            styles: ["margin-left", "12px", "top", "12px"],
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
        this._createEvents();
        this._createMDC();
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
        Base.showInputMessageError(this._elem);
        this._elem._mdc.value = this._elem.value;
        this._elem._mdc.disabled = this._elem.disabled;
        Base.showInputComponent(this._elem);
        this._showLine();
    }

    /**
     * Clean up the component and MDC Web component.
     */
    destroy() {
        if (this._elem._mdc) {
            try {
                this._elem._mdc.destroy();
                this._elem._mdc = null;
            } catch (ex) {
            }
        }
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

}