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

    /** Container of elements. */
    _container;

    /** Label of component. */
    _label;

    /** Element with message error. */
    _errorElement;

    /* Main element. */
    _main;

    /** Left icon. */
    _leftIcon;

    /** Right icon. */
    _rightIcon;


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
     * Create the icon of input.
     *
     * @param {object} div   Main element
     * @param {string} name  Icon name
     * @param {boolean} left If true, the icon is in the left position, otherwise the icon is in the right position
     *
     * @private
     */
    _createIcon(div, name, left) {
        //Name of icon
        let iconName;
        let styles = ["cursor", "pointer", "pointer-events", "inherit"];
        if (name === "DATE") {
            iconName = "date_range";
        } else if (name === "TIME") {
            iconName = "access_time";
        } else {
            iconName = name;
            styles = [];
        }

        //Create icon
        let icon = Scaliby.createIcon(iconName);
        Base.configElement(icon, {
            id: iconName === "date_range" || iconName === "access_time" ? this._elem.id + "_icon" : null,
            classes: ["material-icons", "mdc-text-field__icon"],
            styles: styles,
            attrs: ["tab-index", "0", "role", "button"]
        });

        if (left === true) {
            this._leftIcon = icon;
            div.classList.add("mdc-text-field--with-leading-icon");
            Base.insertElementAt(icon, div, 0);
        } else {
            this._rightIcon = icon;
            div.classList.add("mdc-text-field--with-trailing-icon");
            div.appendChild(icon);
        }
    }

    /**
     * Create date picker component.
     *
     * @param {object} icon Icon of date
     *
     * @private
     */
    _createDatePicker(icon) {
        let elem = this._elem;
        let mdc = this._elem._mdc;
        elem.dataset.mask = "Textfield.getDefaultDateMask";

        $(icon).duDatepicker({
            format: "dd/mm/yyyy",
            cancelBtn: true
        }).on("datechanged", function(event) {
            if (mdc !== undefined) {
                mdc.value = event.date;
            }
        });

        $(elem).on("change", function() {
            $(icon).duDatepicker("setValue", elem.value);
        });
        $(elem).trigger("change");
    }

    /**
     * Create time picker component.
     *
     * @param {object} icon Icon of time
     *
     * @private
     */
    _createTimePicker(icon) {
        let elem = this._elem;
        let mdc = this._elem._mdc;
        elem.dataset.mask = "Textfield.getDefaultTimeMask";

        $(icon).mdtimepicker({timeFormat: "hh:mm"}).on("timechanged", function (event) {
            if (mdc !== undefined) {
                mdc.value = event.time;
            }
        });

        $(elem).on("change", function () {
            if (elem.value) {
                try {
                    $(icon).mdtimepicker("setValue", elem.value);
                } catch (ex) {
                }
            }
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
        this._main = Base.createElement({
            tag: "div",
            classes: ["mdc-text-field"],
            parent: this._container
        });

        //Configure the element
        $(this._elem).appendTo(this._main);
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
            parent: this._main
        });

        //Create the icons
        if (this._elem.dataset.leftIcon) {
            this._createIcon(this._main, this._elem.dataset.leftIcon, true);
        }
        if (this._elem.dataset.rightIcon) {
            this._createIcon(this._main, this._elem.dataset.rightIcon, false);
        }

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
        this._createMDC();

        if (elem.dataset.leftIcon === "DATE") {
            this._createDatePicker(this._leftIcon);
        } else if (elem.dataset.leftIcon === "TIME") {
            this._createTimePicker(this._leftIcon);
        }

        if (elem.dataset.rightIcon === "DATE") {
            this._createDatePicker(this._rightIcon);
        } else if (elem.dataset.rightIcon === "TIME") {
            this._createTimePicker(this._rightIcon);
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
        this._elem._mdc.value = this._elem.value;
        this._elem._mdc.disabled = this._elem.disabled;
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

    /**
     * Gets the mask of date input.
     *
     * @return {string} the mask.
     */
    static getDefaultDateMask() {
        return {
          type: "date"
        }
    }

    /**
     * Gets the mask of time input.
     *
     * @return {string} the mask.
     */
    static getDefaultTimeMask() {
        return {
            type: "string",
            definition: "00:00"
        }
    }
}