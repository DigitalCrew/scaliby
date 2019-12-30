/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Provides single-option select menus from dynamic search.
 *
 * @author Fernando Viegas
 */
class Searchselect {
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

    /** If true, doesn't update the input. */
    _doesNotUpdateInput = false;

    /* Last value. */
    _lastValue = null;

    /* Input element. */
    _input;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();
        this._elem._mdcInput = new mdc.textField.MDCTextField(this._main);
    }

    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;
        let input = this._input;
        let divIcon = this._divIcon;
        let divSpinner = this._divSpinner;
        let component = this;

        //Propagate the focus to "select" element
        this._input.addEventListener("focus", function() {
            if (component._elem.classList.contains("hide-element")) {
                Scaliby.dispatchEvent(elem, "focus");
            }
        });

        //Redirect the focus event to the component
        elem.focus = function () {
            component._input.focus();
        };

        //Propagate the blur to "select" element
        this._input.addEventListener("blur", function() {
            setTimeout(function() {
                if (!Base.hasElement(component._main, Scaliby.getCurrentFocusedElement())) {
                    component._markSelectedOptionOfSearchSelect();
                    Scaliby.dispatchEvent(component._elem, "blur");
                }
            }, 100);
        });

        //Click on select
        elem.addEventListener("mousedown", function (event) {
            if (event.target.tagName !== "OPTION") {
                return;
            }

            for (let i = 0; i < elem.options.length; i++) {
                if (elem.options[i].value === event.target.value) {
                    elem.selectedIndex = i;
                    break;
                }
            }
            component._markSelectedOptionOfSearchSelect();
            setTimeout(function () {
                input.focus();
            }, 50);
        });

        //Click on input
        input.addEventListener("click", function () {
            Scaliby.dispatchEvent(component._elem, "click");
        });

        //Key down on input
        input.addEventListener("keydown", function (event) {
            if (elem.classList.contains("hide-element") || elem.options.length === 0) {
                return;
            }

            component._doesNotUpdateInput = true;
            let index = elem.selectedIndex;
            let newIndex = index;
            if (event.keyCode === 38) { //UP
                while (index > 0) {
                    if (!elem.options[--index].disabled) {
                        newIndex = index;
                        break;
                    }
                }
                elem.selectedIndex = newIndex;
                event.preventDefault();
            } else if (event.keyCode === 40) { //DOWN
                while (index < elem.options.length - 1) {
                    if (!elem.options[++index].disabled) {
                        newIndex = index;
                        break;
                    }
                }
                elem.selectedIndex = newIndex;
                event.preventDefault();
            } else if (event.keyCode === 13) { //ENTER
                component._markSelectedOptionOfSearchSelect();
                event.preventDefault();
                input.focus();
            }
            component._doesNotUpdateInput = false;
        });

        //Selected index changed
        elem.oldSelectedIndex = -1;
        Object.defineProperty(elem, "selectedIndex", {
            get: function () {
                return this.oldSelectedIndex;
            },
            set: function (index) {
                this.oldSelectedIndex = index;
                if (component._doesNotUpdateInput === false) {
                    if (index === -1) {
                        input.value = "";
                    } else {
                        input.value = this.options[index].text;
                    }
                }

                for (let i = 0; i < this.options.length; i++) {
                    this.options[i].selected = i === index;
                }
            }
        });


        /////////////////
        // Keyup Event //
        /////////////////
        let searching = false;
        let lastText = "";
        input.addEventListener("keyup", function (event) {
            //Verify the typed text to start a search
            elem.dataset.value = $(input).val();
            let text = input.value;

            if (searching || text === lastText || !elem.dataset.search || event.keyCode === 13) {
                lastText = text;
                return;
            }

            if (text.length < elem.dataset.minLetters) {
                component._deselectAll();
                lastText = text;
                input.value = text;
                elem.classList.add("hide-element");
                return;
            }
            lastText = text;
            searching = true;

            //Show option box without options
            elem.classList.remove("hide-element");
            elem.style.width = input.offsetWidth + "px";
            elem.innerHTML = "";
            divIcon.style.display = "none";
            divSpinner.style.display = "block";

            if (elem.dataset.search.indexOf("javascript:") === 0) {
                //Build options from local data
                component._setSearchSelectOptions(eval(elem.dataset.search.substring(11)));
                searching = false;
                divIcon.style.display = "inherit";
                divSpinner.style.display = "none";
            } else {
                //Build options from server data
                $.ajax({
                    "url": elem.dataset.search,
                    "data": "text=" + text,
                    "method": "GET",
                    "dataType": "json",
                    "success": function (data) {
                        component._setSearchSelectOptions(data);
                        searching = false;
                        divIcon.style.display = "inherit";
                        divSpinner.style.display = "none";
                        if (text !== input.value) {
                            $(input).trigger("keyup"); //While searching, text has changed. Make new search
                        }
                    },
                    "error": function () {
                        searching = false;
                        divIcon.style.display = "inherit";
                        divSpinner.style.display = "none";
                    }
                });
            }
        });
    }

    /**
     *
     * @private
     */
    _deselectAll() {
        this._elem.selectedIndex = -1;
        for (let i = 0; i < this._elem.options.length; i++) {
            this._elem.options[i].selected = false;
        }
    }

    /**
     * Marks the selected option, removes the other options, closes the options box and copies the text to input.
     *
     * @private
     */
    _markSelectedOptionOfSearchSelect() {
        this._elem.classList.add("hide-element");

        let event;
        event = document.createEvent('HTMLEvents');
        event.initEvent("change", true, true);

        if (this._input.value === "" || this._elem.options.length === 0 || this._elem.selectedIndex === -1) {
            this._input.value = "";
            this._elem.selectedIndex = -1;

            if (this._lastValue !== null) {
                this._lastValue = null;
                Scaliby.dispatchEvent(this._elem, "change");
            }
            return;
        }

        //Remove all options except selected
        let value = this._elem.options[this._elem.selectedIndex].value;
        let index = 0;
        while (index < this._elem.options.length) {
            if (this._elem.options[index].value !== value) {
                this._elem.remove(index);
            } else {
                index++;
            }
        }

        //Select the unique option
        this._elem.selectedIndex = 0;
        this._input.value = this._elem.options[0].text;

        //Execute the change event
        if (this._lastValue !== this._elem.options[0].value) {
            this._lastValue = this._elem.options[0].value;
            Scaliby.dispatchEvent(this._elem, "change");
        }
    }

    /**
     * Builds the options of search select component.
     * <br>
     * Each option is an array with syntax:
     * <ul>
     *    <li>[0] - Value;</li>
     *    <li>[1] - Text;</li>
     *    <li>[2] - If "D", is disabled;</li>
     * </li>
     *
     * @param {Object[][]} options Array of options
     *
     * @private
     */
    _setSearchSelectOptions(options) {
        for (let i = 0; i < options.length; i++) {
            let opt = Base.createElement({
                tag: "option",
                classes: ["searchselect-option"]
            });
            opt.value = options[i][0];
            opt.text = options[i][1];

            if (options[i].length === 3 && options[i][2] === "D") {
                opt.disabled = true;
            }
            this._elem.add(opt);
        }

        //Select the first option
        this._elem.oldSelectedIndex = -1;
        for (let i = 0; i < this._elem.options.length; i++) {
            if (!this._elem.options[i].disabled) {
                this._elem.oldSelectedIndex = i;
                this._elem.options[i].selected = true;
                break;
            }
        }

        if (options.length === 0) {
            this._elem.classList.add("hide-element");
        }

        //Total of rows to show
        let size = this._elem.options.length;

        if (this._elem.dataset.maxRows && this._elem.options.length > this._elem.dataset.maxRows) {
            size = this._elem.dataset.maxRows;
        }
        if (size <= 1) {
            size = 2;
        }

        this._elem.size = size;
    }


    /**
     * Constructor.
     *
     * @param {Object} elem Input element of component
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
            classes: ["mdc-text-field", "mdc-text-field--with-trailing-icon"],
            parent: this._container
        });

        //Configure the element
        Base.configElement(elem, {
            generateId: true,
            classes: ["searchselect", "hide-element"],
            parent: this._container
        });
        if (this._elem.size < 2) {
            this._elem.size = 2;
        }

        //Create the input
        this._input = Base.createElement({
            tag: "input",
            id: elem.id + "_input",
            classes: ["mdc-text-field__input"],
            attrs: ["autocomplete", "off"],
            parent: this._main
        });

        //Create the label
        this._label = Base.createElement({
            tag: "label",
            id: elem.id + "_label",
            classes: ["mdc-floating-label"],
            attrs: ["for", this._input.id],
            parent: this._main
        });

        //Create the icon of search
        this._divIcon = Base.createElement({
            tag: "i",
            classes: ["material-icons", "mdc-text-field__icon"],
            content: "search",
            parent: this._main
        });

        //Create the line ripple
        Base.createElement({
            tag: "div",
            classes: ["mdc-line-ripple"],
            parent: this._main
        });

        //Create the loading spinner
        this._divSpinner = LoadingSpinner.create(1);
        Base.configElement(this._divSpinner, {
            classes: ["mdc-text-field__icon"],
            styles: ["display", "none", "top", "16px"],
            parent: this._main
        });

        //Create the error message
        this._errorElement = Base.createElement({
            tag: "p",
            classes: ["input-msg-error"],
            parent: this._container
        });

        //Treat auto focus
        let searchselect = this;
        if (this._elem.autofocus) {
            setTimeout(function () {
                searchselect._elem.focus();
            }, 100);
        }

        //Final settings
        this._createEvents();
        this._createMDC();
        this._elem.autofocus = false;

        this.update();
        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }

        //Show red when component starts empty and it is required
        setTimeout(function () {
            if (searchselect._elem.disabled === false && searchselect._input.value === "" &&
                searchselect._input.required) {
                searchselect._input.parentNode.classList.add("mdc-text-field--invalid");
            } else {
                searchselect._input.parentNode.classList.remove("mdc-text-field--invalid");
            }
        }, 100);
    }

    /**
     * Update the component.
     */
    update() {
        //Set the option
        if (this._elem.options.length === 1) {
            this._input.value = this._elem.options[0].value;
            this._elem._mdcInput.value = this._elem.options[0].innerHTML;
        }

        //Adjust the properties
        this._input.required = this._elem.required;
        this._elem._mdcInput.disabled = this._elem.disabled;
        this._label.innerHTML = this._elem.dataset.label;
        Base.showInputMessageError(this._elem);
        Base.showInputComponent(this._elem);

        //Adjust the tab index of input
        let component = this;
        setTimeout(function() {
            if (component._elem.tabIndex !== -2) {
                component._input.tabIndex = component._elem.tabIndex;
                component._elem.tabIndex = -2;
            }
        }, 100);
   }

    /**
     * Clean up the component and MDC Web component.
     */
    destroy() {
        if (this._elem._mdcInput) {
            try {
                this._elem._mdcInput.destroy();
                this._elem._mdcInput = null;
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
     * Defines the option of searchselect component. This component can be only one option.
     * <br>
     * This method is static, therefore it can be used before or after the component to be created.
     *
     * @param {string} formId    ID of form. If null, the "fieldName" parameter is the ID of element
     * @param {string} fieldName Name of field
     * @param {string} value     The value of option
     * @param {string} text      The text of value
     */
    static setOption(formId, fieldName, value, text) {
        //Remove the current options of select
        let elem = Form.getField(formId, fieldName);
        while (elem.options.length > 0) {
            elem.remove(0);
        }

        //Build the option
        let option = Base.createElement({
            tag: "option",
            attrs: ["value", value, "selected", true],
            content: text,
            parent: elem
        });
        option.selected = true;

        if (elem.component) {
            elem.component.update()
        }
    }

}