/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Allows the user to select one option from a set while seeing all available options.
 *
 * @author Fernando Viegas
 */
class Radiobox {
    /** Element of component. */
    _elem;

    /** Container of elements. */
    _container;

    /** Div that contains the elements of component. */
    _divBox;

    /* Main element. */
    _main;

    /* Div of radio component. */
    _divRadio;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();
        this._elem._mdc = new mdc.radio.MDCRadio(this._divRadio);
    }

    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;
        let divBox = this._divBox;
        let container = this._container;

        elem.addEventListener("click", function (event) {
            if (event.ctrlKey) {
                elem.checked = false;
            }
            Base.addMandatoryIcon(elem, container.dataset.required === "true", true, container.label,
                container.dataset.label);
        });

        elem.addEventListener("focus", function () {
            divBox.classList.add("input-bg-focus");
            Base.addMandatoryIcon(elem, container.dataset.required === "true", true, container.label,
                container.dataset.label);
        });

        elem.addEventListener("blur", function () {
            divBox.classList.remove("input-bg-focus");
            Base.addMandatoryIcon(elem, container.dataset.required === "true", false, container.label,
                container.dataset.label);
        });

        divBox.addEventListener("mousedown", function (event) {
            elem.click();
            elem.focus();
            event.preventDefault();
            return false;
        });
    }

    /**
     * Configures the container that contains all radios.
     *
     * @private
     */
    _configureContainer() {
        let elem = this._elem;
        let divBox = this._divBox;
        let container = this._container;

        //Create the div with label
        let divLabel = Base.createElement({
            tag: "div",
            classes: ["input-bg", "input-box-main-label"],
            attrs: ["for", elem.id],
            parent: divBox.parentNode,
            insertAt: 0
        });

        //Mouse down event on the label
        divLabel.addEventListener("mousedown", function (event) {
            let elements = document.getElementsByName(elem.name);
            let index = 0;

            for (let i = 0; i < elements.length; i++) {
                if (elements[i].checked) {
                    index = i;
                    break;
                }
            }

            elements[index].click();
            elements[index].focus();
            event.preventDefault();
            return false;
        });

        //Create the label
        container.label = Base.createElement({
            tag: "label",
            classes: ["mdc-floating-label", "mdc-floating-label--float-above", "input-box-label"],
            parent: divLabel
        });

        //Create the error message
        container.errorElement = Base.createElement({
            tag: "p",
            classes: ["input-msg-error"],
            parent: divBox.parentNode
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

        //Create the div that contains the elements of component
        this._divBox = Base.createElement({
            tag: "div",
            classes: ["input-bg", "input-box-div"],
            parent: elem.parentNode,
            insertAt: Base.getIndexOfElement(elem)
        });

        //Create the main element
        this._main = Base.createElement({
            tag: "div",
            classes: ["mdc-form-field"],
            styles: ["align-items", "inherit"],
            parent: this._divBox
        });

        //Create the inner div
        this._divRadio = Base.createElement({
            tag: "div",
            classes: ["mdc-radio"],
            parent: this._main
        });

        //Configure the element
        this._container = this._divBox.parentNode;
        if (!this._container.counter) {
            this._container.counter = 1;
        }

        $(elem).appendTo(this._divRadio);
        Base.configElement(elem, {
            id: Form.get(elem).id + "_" + elem.name + "_" + this._container.counter++,
            classes: ["mdc-radio__native-control"]
        });

        //Create the background
        let divBg = Base.createElement({
            tag: "div",
            classes: ["mdc-radio__background"],
            parent: this._divRadio
        });

        //Create the outer circle
        Base.createElement({
            tag: "div",
            classes: ["mdc-radio__outer-circle"],
            parent: divBg
        });

        //Create the inner circle
        Base.createElement({
            tag: "div",
            classes: ["mdc-radio__inner-circle"],
            parent: divBg
        });

        //Create the ripple
        Base.createElement({
            tag: "div",
            classes: ["mdc-radio__ripple"],
            parent: this._divRadio
        });

        //Create the option label
        Base.createElement({
            tag: "label",
            styles: ["margin-top", "10px", "cursor", "pointer"],
            attrs: ["for", elem.id],
            parent: this._main
        });

        //If first radio, configure the container that contains all radios
        if (this._divBox.parentNode.children[this._divBox.parentNode.children.length - 1].tagName !== "P") {
            this._configureContainer();
        }

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
        this._container.label.innerHTML = this._container.dataset.label;
        Base.showInputMessageError(this._elem);
        Base.addMandatoryIcon(this._elem,
            this._container.dataset.required === "true",
            this._container.classList.contains("mdc-text-field--focused"),
            this._container.label, this._container.dataset.label);
        Base.showInputComponent(this._elem);

        this._elem._mdc.disabled = this._elem.disabled;
        if (this._elem.disabled) {
            this._divBox.classList.add("input-bg-disabled");
            this._container.label.parentNode.classList.add("input-bg-disabled");
            this._container.label.style.opacity = "0.70";
        } else {
            this._divBox.classList.remove("input-bg-disabled");
            this._container.label.parentNode.classList.remove("input-bg-disabled");
            this._container.label.style.opacity = "1";
        }

        let radios = document.getElementsByName(this._elem.name);
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].component) {
                let optionLabel = radios[i].parentNode.parentNode.querySelector("label");
                optionLabel.innerHTML = radios[i].dataset.text;
                optionLabel.style.opacity = this._elem.disabled ? "0.40" : "1";
            }
        }
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
        return this._container.errorElement;
    }

    /**
     * Get the container that contains all radios.
     *
     * @return {Object} the container.
     */
    getContainer() {
        return this._container;
    }
}