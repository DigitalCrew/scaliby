/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Allows the user to select one or more items from a set.
 *
 * @author Fernando Viegas
 */
class Checkbox {
    /** Element of component. */
    _elem;

    /** MDC framework. */
    _mdc;

    /** Container of elements. */
    _container;

    /** Div that contains the elements of component. */
    _divBox;


    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;
        let divBox = this._divBox;
        let container = this._container;

        elem.addEventListener("click", function () {
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

        //Create the main element
        this._divBox = Base.createElement({
            tag: "div",
            classes: ["input-bg", "input-box-div"],
            parent: elem.parentNode,
            insertAt: Base.getIndexOfElement(elem)
        });

        //Create the main element
        let divMain = Base.createElement({
            tag: "div",
            classes: ["mdc-form-field"],
            styles: ["align-items", "inherit"],
            parent: this._divBox
        });

        //Create the inner div
        let divInner = Base.createElement({
            tag: "div",
            classes: ["mdc-checkbox"],
            parent: divMain
        });

        //Configure the element
        this._container = this._divBox.parentNode;
        if (!this._container.counter) {
            this._container.counter = 1;
        }

        $(elem).appendTo(divInner);
        Base.configElement(elem, {
            id: Form.get(elem).id + "_" + elem.name + "_" + this._container.counter++,
            classes: ["mdc-checkbox__native-control"]
        });

        //Create the background
        let divBg = Base.createElement({
            tag: "div",
            classes: ["mdc-checkbox__background"],
            parent: divInner
        });

        //Create the checkmark and path
        divBg.insertAdjacentHTML("beforeend",
            "<svg class='mdc-checkbox__checkmark' viewBox='0 0 24 24'>" +
            "<path class='mdc-checkbox__checkmark-path' d='M1.73,12.91 8.1,19.28 22.79,4.59' fill='none' " +
            "stroke='white'></path></svg>");

        //Create the mixedmark
        Base.createElement({
            tag: "div",
            classes: ["mdc-checkbox__mixedmark"],
            parent: divBg
        });

        //Create the option label
        Base.createElement({
            tag: "label",
            styles: ["margin-top", "10px", "cursor", "pointer", "will-change", "transform"],
            attrs: ["for", elem.id],
            parent: divMain
        });

        //If first check, configure the container that contains all checks
        if (this._divBox.parentNode.children[this._divBox.parentNode.children.length - 1].tagName !== "P") {
            this._configureContainer();
        }

        //Final settings
        this._createEvents();
        this._mdc = new mdc.checkbox.MDCCheckbox(this._divBox);
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

        this._mdc.disabled = this._elem.disabled;
        if (this._elem.disabled) {
            this._divBox.classList.add("input-bg-disabled");
            this._container.label.parentNode.classList.add("input-bg-disabled");
            this._container.label.style.opacity = "0.70";
        } else {
            this._divBox.classList.remove("input-bg-disabled");
            this._container.label.parentNode.classList.remove("input-bg-disabled");
            this._container.label.style.opacity = "1";
        }

        let checks = document.getElementsByName(this._elem.name);
        for (let i = 0; i < checks.length; i++) {
            if (checks[i].component) {
                let optionLabel = checks[i].parentNode.parentNode.querySelector("label");
                optionLabel.innerHTML = checks[i].dataset.text;
                optionLabel.style.opacity = this._elem.disabled ? "0.40" : "1";
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