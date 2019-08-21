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

    /** MDC framework. */
    _mdc;

    /** Container of elements. */
    _container;

    /** Label of component. */
    _label;

    /** Element with message error. */
    _errorElement;


    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;

        elem.addEventListener("focus", function () {
            elem.parentNode.classList.add("text-field-textarea-focus");
        });

        elem.addEventListener("blur", function () {
            elem.parentNode.classList.remove("text-field-textarea-focus");
        });

        elem.addEventListener("mouseover", function () {
            if (Base.currentElementFocused === elem) {
                elem.parentNode.classList.remove("text-field-textarea-hover");
            } else {
                elem.parentNode.classList.add("text-field-textarea-hover");
            }
        });

        elem.addEventListener("mouseout", function () {
            elem.parentNode.classList.remove("text-field-textarea-hover");
        });
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
        let div = Base.createElement({
            tag: "div",
            classes: ["mdc-text-field", "mdc-text-field--textarea", "input-fullwidth"],
            styles: ["height", "auto"],
            parent: this._container
        });

        //Configure the element
        $(this._elem).appendTo(div);
        Base.configElement(this._elem, {
            generateId: true,
            classes: ["mdc-text-field__input"],
            styles: ["border-bottom", "1px solid", "opacity", "0.7"]
        });

        //Create the label
        this._label = Base.createElement({
            tag: "label",
            id: this._elem.id + "_label",
            content: this._elem.dataset.label,
            classes: ["mdc-floating-label"],
            styles: ["top", "20x"],
            attrs: ["for", this._elem.id],
            parent: div
        });

        //Create the line ripple
        Base.createElement({
            tag: "div",
            classes: ["mdc-line-ripple"],
            parent: div
        });

        //Create the error message
        this._errorElement = Base.createElement({
            tag: "p",
            classes: ["input-msg-error"],
            parent: this._container
        });

        //Final settings
        this._createEvents();
        this._mdc = new mdc.textField.MDCTextField(div);
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
        this._mdc.value = this._elem.value;
        this._mdc.disabled = this._elem.disabled;
        Base.showInputComponent(this._elem);
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