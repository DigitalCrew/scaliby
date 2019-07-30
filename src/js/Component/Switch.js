/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 *  Toggles the state of a single setting on or off.
 *
 * @author Fernando Viegas
 */
class Switch {
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

    /** Div that contains the elements of component. */
    _divBox;


    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;
        let label = this._label;
        let divBox = this._divBox;

        elem.addEventListener("focus", function () {
            divBox.classList.add("input-bg-focus");
            Base.addMandatoryIcon(elem, false, true, label, elem.dataset.label);
        });

        elem.addEventListener("blur", function () {
            divBox.classList.remove("input-bg-focus");
            Base.addMandatoryIcon(elem, false, false, label, elem.dataset.label);
        });

        //Click on box
        divBox.addEventListener("mousedown", function (event) {
            elem.focus();
            event.preventDefault();
            return false;
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

        //Configure the element
        Base.configElement(elem, {
            generateId: true,
            classes: ["mdc-switch__native-control"],
            attrs: ["role", "switch", "value", "true"]
        });

        //Create the container of component
        this._container = Base.createElement({
            tag: "div",
            classes: ["div-container"],
            parent: elem.parentNode,
            insertAt: Base.getIndexOfElement(elem)
        });

        //Create the div with elements
        this._divBox = Base.createElement({
            tag: "div",
            id: elem.id + "_box",
            classes: ["switch-box", "input-bg", "mdc-text-field"],
            parent: this._container
        });

        //Create the label
        this._label = Base.createElement({
            tag: "label",
            id: elem.id + "_label",
            classes: ["switch-label", "mdc-floating-label", "mdc-floating-label--float-above"],
            parent: this._divBox
        });

        //Create the main element
        let divMain = Base.createElement({
            tag: "div",
            classes: ["mdc-switch"],
            parent: this._divBox
        });

        //Create the track
        Base.createElement({
            tag: "div",
            classes: ["mdc-switch__track"],
            parent: divMain
        });

        //Create the underlay
        let divUnderlay = Base.createElement({
            tag: "div",
            classes: ["mdc-switch__thumb-underlay"],
            parent: divMain
        });

        //Create the thumb
        let divThumb = Base.createElement({
            tag: "div",
            classes: ["mdc-switch__thumb"],
            parent: divUnderlay
        });
        divThumb.appendChild(elem);

        //Create the text
        this._text = Base.createElement({
            tag: "label",
            id: elem.id + "_text",
            classes: ["switch-text"],
            attrs: ["for", elem.id],
            parent: this._divBox
        });

        //Create the error message
        this._errorElement = Base.createElement({
            tag: "p",
            classes: ["input-msg-error"],
            parent: this._container
        });

        //Final settings
        this._createEvents();
        this._mdc = new mdc.switchControl.MDCSwitch(divMain);
        this.update();
        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }
    }

    /**
     * Update the component.
     */
    update() {
        this._text.innerHTML = this._elem.dataset.text;
        this._label.innerHTML = this._elem.dataset.label;
        this._mdc.checked = this._elem.checked;
        Base.showInputMessageError(this._elem);
        Base.addMandatoryIcon(this._elem, true, this._elem.classList.contains("input-bg-focus"), this._label,
            this._elem.dataset.label);
        Base.showInputComponent(this._elem);

        this._mdc.disabled = this._elem.disabled;
        if (this._elem.disabled) {
            this._divBox.classList.add("input-bg-disabled");
            this._label.style.opacity = "0.70";
            this._text.style.opacity = "0.38";
        } else {
            this._divBox.classList.remove("input-bg-disabled");
            this._label.style.opacity = "1";
            this._text.style.opacity = "1";
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
