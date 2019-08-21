/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Allows users to input, edit and select text.
 *
 * @author Fernando Viegas
 */
class Textfield {
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
     * Create the icon of input.
     *
     * @private
     */
    _createIcon(div) {
        //Name of icon
        let iconName;
        let styles = ["bottom", "10px", "cursor", "pointer", "pointer-events", "inherit"];
        if (this._elem.dataset.icon === "DATE") {
            iconName = "date_range";
        } else if (this._elem.dataset.icon === "TIME") {
            iconName = "access_time";
        } else {
            iconName = this._elem.dataset.icon;
            styles = ["bottom", "10px"];
        }

        //Create icon
        this._icon = Scaliby.createIcon(iconName);
        Base.configElement(this._icon, {
            id: iconName === "date_range" || iconName === "access_time" ? this._elem.id + "_icon" : null,
            classes: ["mdc-text-field__icon"],
            styles: styles,
            attrs: ["tab-index", "0", "role", "button"],
            parent: div
        });
    }

    /**
     * Create date picker component.
     *
     * @private
     */
    _createDatePicker() {
        let elem = this._elem;
        let mdc = this._mdc;
        elem.dataset.mask = "Textfield.getDefaultDateMask";

        $(this._icon).duDatepicker({
            format: "dd/mm/yyyy",
            cancelBtn: true
        }).on("datechanged", function(event) {
            if (mdc !== undefined) {
                mdc.value = event.date;
            }
        });

        $(elem).on("change", function() {
            $(this._icon).duDatepicker("setValue", elem.value);
        });
        $(elem).trigger("change");
    }

    /**
     * Create time picker component.
     *
     * @private
     */
    _createTimePicker() {
        let elem = this._elem;
        let mdc = this._mdc;
        elem.dataset.mask = "Textfield.getDefaultTimeMask";

        $(this._icon).mdtimepicker({timeFormat: "hh:mm"}).on("timechanged", function (event) {
            if (mdc !== undefined) {
                mdc.value = event.time;
            }
        });

        $(elem).on("change", function () {
            $(this._icon).mdtimepicker("setValue", elem.value);
        });
        $(elem).trigger("change");
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
            classes: ["mdc-text-field", "mdc-text-field--with-trailing-icon", "input-fullwidth"],
            parent: this._container
        });

        //Configure the element
        $(this._elem).appendTo(div);
        Base.configElement(this._elem, {
            generateId: true,
            classes: ["mdc-text-field__input"]
        });

        //Create the label
        this._label = Base.createElement({
            tag: "label",
            id: this._elem.id + "_label",
            content: this._elem.dataset.label,
            classes: ["mdc-floating-label"],
            attrs: ["for", this._elem.id],
            parent: div
        });

        //Create the icon
        if (this._elem.dataset.icon) {
            this._createIcon(div);
        }

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
        this._mdc = new mdc.textField.MDCTextField(div);

        if (elem.dataset.icon === "DATE") {
            this._createDatePicker();
        } else if (elem.dataset.icon === "TIME") {
            this._createTimePicker();
        }

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

        //Define the mask
        if (this._elem.dataset.mask) {
            try {
                if (this._elem.dataset.icon === "DATE") {
                    Inmask.setMask(this._elem, {type: "string", definition: "00/00/0000"});
                } else if (this._elem.dataset.icon === "TIME") {
                    Inmask.setMask(this._elem, {type: "string", definition: "00:00"});
                } else {
                    Inmask.setMask(this._elem, Base.executeFunctionByName(this._elem.dataset.mask));
                }
            } catch (ex) {
                console.log("Mask '" + $(this._elem).attr("data-mask") + "' of element '" + this._elem.id +
                    "' is invalid.");
                console.error(ex);
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