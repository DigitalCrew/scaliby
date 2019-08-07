/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Provides multi-option select menus.
 *
 * @author Fernando Viegas
 */
class Multiselect {
    /** Element of component. */
    _elem;

    /** Container of elements. */
    _container;

    /** Label of component. */
    _label;

    /** Element with message error. */
    _errorElement;

    /** Box with selected options. */
    _divBox;

    /** The line. */
    _divLine;

    /** Main element. */
    _div;


    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;
        let div = this._div;
        let divLine = this._divLine;
        let label = this._label;
        let multiselect = this;

        //When area is clicked, open options
        div.addEventListener("click", function () {
            if (elem.disabled) {
                return;
            }
            label.classList.add("mdc-floating-label--float-above");
            elem.style.left = "0px";
            elem.focus();
        });

        //Focus on Select
        elem.addEventListener("focus", function () {
            Base.addMandatoryIcon(elem, elem.required, true, label, elem.dataset.label);
            divLine.classList.add("multiselect-line-focus");
            div.classList.add("input-bg-focus");
        });

        //Select loses focus
        elem.addEventListener("blur", function () {
            elem.style.left = "-8000px";
            Base.addMandatoryIcon(elem, elem.required, false, label, elem.dataset.label);
            label.classList.remove("mdc-floating-label--float-above");
            divLine.classList.remove("multiselect-line-focus");
            div.classList.remove("input-bg-focus");
        });

        //Click on option
        elem.addEventListener("click", function (event) {
            if (event.target.tagName !== "OPTGROUP" && event.target !== elem) {
                multiselect._clickEventOfSelected(event.target);
            }
        });

        //Prevent keys
        elem.addEventListener("keydown", function (event) {
            if (event.which !== 9) {
                event.preventDefault();
                return false;
            }
        });

        //Options selected by click and drag

        elem.addEventListener("change", function (e) {
            for (let i = 0; i < elem.options.length; i++) {
                if (elem.options[i].selected) {
                    multiselect._clickEventOfSelected(elem.options[i]);
                }
            }
        });
    }

    /**
     * Treats the click event on selected option (multi select).
     *
     * @param option Clicked option
     *
     * @private
     */
    _clickEventOfSelected(option) {
        this._selectOption(option);
        this._elem.blur();
        this._elem.focus();
    }

    /**
     * Selects an available option (multi select).
     *
     * @param option Clicked option
     *
     * @private
     */
    _selectOption(option) {
        let elem = this._elem;
        let divBox = this._divBox;

        if (option.style.display === "none") {
            return;
        }
        option.style.display = "none";

        let divAux = Base.createElement({
            tag: "div",
            classes: ["multiselect-option-selected"],
            content: option.innerHTML,
            parent: this._divBox
        });
        divAux.option = option;

        divAux.addEventListener("mousedown", function (event) {
            if (elem.disabled === false) {
                divAux.option.style.display = "block";
                this.parentNode.removeChild(this);
                divAux.option.selected = false;
                elem.focus();
                event.preventDefault();
                return false;
            }
        });

        let selectedOptions = $(divBox).find("div");
        for (let i = 0; i < selectedOptions.length; i++) {
            selectedOptions[i].option.selected = true;
        }

        for (let i = 0; i < elem.options.length; i++) {
            if (elem.options[i].disabled === false && elem.options[i].style.display !== "none") {
                return;
            }
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
        this._div = Base.createElement({
            tag: "div",
            classes: ["mdc-text-field", "multiselect-div", "input-bg", "input-fullwidth"],
            styles: ["overflow", "visible"],
            parent: this._container
        });

        //Configure the element
        Base.configElement(this._elem, {
            generateId: true,
            classes: ["multiselect", "mdc-select__native-control"],
            parent: this._div
        });

        //Create the label
        this._label = Base.createElement({
            tag: "label",
            id: this._elem.id + "_label",
            classes: ["mdc-floating-label"],
            attrs: ["for", this._elem.id],
            styles: ["cursor", "pointer", "position", "absolute", "top", "10px", "bottom", "12px"],
            parent: this._div
        });

        //Create the line
        this._divLine = Base.createElement({
            tag: "div",
            id: this._elem.id + "_line",
            classes: ["mdc-text-field__input"],
            styles: ["cursor", "pointer", "margin-right", "-26px"],
            parent: this._div
        });

        //Create the arrow drop down
        Base.createElement({
            tag: "i",
            id: this._elem.id + "_icon",
            classes: ["material-icons", "multiselect-arrow"],
            content: "arrow_drop_down",
            parent: this._div
        });

        //Box with selected options
        this._divBox = Base.createElement({
            tag: "div",
            id: this._elem.id + "_box",
            classes: ["multiselect-div-box"],
            parent: this._container
        });

        //Create the error message
        this._errorElement = Base.createElement({
            tag: "p",
            classes: ["input-msg-error"],
            parent: this._container
        });

        //Mark selected options
        for (let i = 0; i < this._elem.options.length; i++) {
            if (this._elem.options[i].selected === true) {
                $(this._elem.options[i]).click();
            }
        }

        //Final settings
        this._createEvents();
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
        Base.addMandatoryIcon(this._elem, this._elem.required, document.activeElement === this._elem, this._label,
            this._elem.dataset.label);
        Base.showInputMessageError(this._elem);
        Base.showInputComponent(this._elem);

        if (this._elem.disabled) {
            this._elem.parentNode.classList.add("multiselect-disabled");
            this._elem.parentNode.classList.add("mdc-text-field--disabled");
            this._divBox.classList.add("multiselect-option-selected-disabled");
        } else {
            this._elem.parentNode.classList.remove("multiselect-disabled");
            this._elem.parentNode.classList.remove("mdc-text-field--disabled");
            this._divBox.classList.remove("multiselect-option-selected-disabled");
        }

        //Build the options
        this._divBox.innerHTML = "";
        for (let i = 0; i < this._elem.options.length; i++) {
            this._elem.options[i].style.display = "block";
            if (this._elem.options[i].selected) {
                this._selectOption(this._elem.options[i]);
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