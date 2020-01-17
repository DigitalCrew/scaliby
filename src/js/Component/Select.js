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

    /** Container of elements. */
    _container;

    /** Main element. */
    _main;

    /** Label of component. */
    _label;

    /** Element with message error. */
    _errorElement;

    /** Menu element. */
    _menu;

    /** UL element of options. */
    _ul;

    /** Anchor element. */
    _anchor;

    /** The selected text area. */
    _selectedTextArea;

    /** If true, the component is totally created. */
    _created = false;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();

        this._elem._mdc = new mdc.select.MDCSelect(this._main);
        this._elem.component = this;

        this._main.elem = this._elem;
        this._elem._mdc.listen("MDCSelect:change", this._changeEvent);
    }

    /**
     * Disable or enable an item.
     * Observation: Workaround when item is disabled.
     *
     * @param {Object} li     Item element
     * @param {boolean} state If true, disable the element, otherwise enable it
     *
     * @private
     */
    _disableItem(li, state) {
        if (state === true) {
            li.classList.remove("mdc-list-item");
            li.classList.add("mdc-list-item--disabled");
            li.classList.add("list-item-disabled");
        } else {
            li.classList.remove("mdc-list-item--disabled");
            li.classList.remove("list-item-disabled");
            li.classList.add("mdc-list-item");
        }
    }

    /**
     * Component event listener of changed value.
     * Observation: this = main element.
     *
     * @private
     */
    _changeEvent() {
        let component = this.elem.component;
        let elem = component._elem;

        if (component._created && elem._mdc !== null && elem.value !== elem._mdc.value) {
            elem.value = elem._mdc.value;
            component._showSelectedOption();

            //The dispatch is asynchronous for the MDC event to end. Thus, if the listener calls for a component
            //update (which needs to rebuild the MDC), this process is done without error.
            setTimeout(function() {
                Scaliby.dispatchEvent(elem, "change");
            }, 100);
        }
    }

    /**
     * Show the text of selected option.
     *
     * @private
     */
    _showSelectedOption() {
        if (this._elem.value !== "") {
            for (let i = 0; i < this._elem.options.length; i++) {
                if (this._elem.options[i].selected === true) {
                    if (this._elem.options[i].dataset.text) {
                        this._selectedTextArea.innerHTML = this._elem.options[i].dataset.text;
                    } else {
                        this._selectedTextArea.innerHTML = this._elem.options[i].innerHTML;
                    }
                    break;
                }
            }
        }

        //Adjust the text and width of selected option
        let component = this;
        setTimeout(function() {
            if (component._elem.dataset.visible !== "false" && component._selectedTextArea.parentNode.offsetWidth > 0) {
                component._selectedTextArea.style.width = component._container.offsetWidth + "px";
            }
        }, 100);
    }

    /**
     * Creates the menu items (options).
     *
     * @param {json[]}  op    List of options. Each option is a Json. See Select.setOptions()
     * @param {boolean} empty If true, creates the first option that is empty
     */
    _createItems(op, empty) {
        //Create the elements of component
        this.destroy();
        this._createElements();

        //Build the empty option
        if (empty) {
            let li = Base.createElement({
                tag: "li",
                classes: ["mdc-list-item"],
                parent: this._ul
            });
            li.dataset.value = "";
        }

        //Build the new options
        let component = this;
        for (let i = 0; i < op.length; i++) {
            let li = Base.createElement({
                tag: "li",
                classes: ["mdc-list-item"],
                parent: this._ul
            });

            if (op[i].disabled === true) {
                li.classList.remove("mdc-list-item");
                this._disableItem(li);
            }

            if (op[i].selected === true) {
                li.classList.add("mdc-list-item--selected");
                this._elem.value = op[i].value;
            }

            li.dataset.value = op[i].value;

            if (op[i].separator === true) {
                //Separator
                Base.createElement({
                    tag: "hr",
                    classes: ["mdc-list-divider"],
                    styles: ["width", "100%"],
                    attrs: ["role", "separator"],
                    content: op[i].innerHTML,
                    parent: li
                });
                this._disableItem(li);
            } else {
                //Text
                li.innerHTML = op[i].text;
            }

            //Propagate the blur event to "select" element
            li.addEventListener("blur", function() {
                setTimeout(function() {
                    if (!Base.hasElement(component._main, Scaliby.getCurrentFocusedElement())) {
                        Scaliby.dispatchEvent(component._elem, "blur");
                    }
                }, 100);
            });
        }

        //Create the MDC
        this._createMDC();
    }

    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;
        let component = this;

        //Propagate the focus to "select" element
        this._selectedTextArea.addEventListener("focus", function() {
            if (component._main.classList.contains("mdc-select--activated") !== true) {
                Scaliby.dispatchEvent(elem, "focus");
            }
        });

        //Redirect the focus event to the component
        elem.focus = function () {
            component._selectedTextArea.focus();
        };

        //Propagate the blur to "select" element
        this._selectedTextArea.addEventListener("blur", function() {
            if (component._main.classList.contains("mdc-select--activated") !== true) {
                Scaliby.dispatchEvent(elem, "blur");
            }
        });
    }

    /**
     * Creates the elements of component.
     *
     * @private
     */
    _createElements() {
        this._container.innerHTML = "";

        //Create the main element
        this._main = Base.createElement({
            tag: "div",
            classes: ["mdc-select", "input-fullwidth"],
            parent: this._container
        });

        //Configure the element
        Base.configElement(this._elem, {
            generateId: true,
            styles: ["display", "none"],
            parent: this._main
        });

        //Create the anchor element
        this._anchor = Base.createElement({
            tag: "div",
            classes: ["mdc-select__anchor", "input-fullwidth"],
            parent: this._main
        });

        //Create the dropdown icon
        Base.createElement({
            tag: "i",
            classes: ["mdc-select__dropdown-icon"],
            parent: this._anchor
        });

        //Create the selected text area
        this._selectedTextArea = Base.createElement({
            tag: "div",
            classes: ["mdc-select__selected-text"],
            parent: this._anchor
        });

        //Create the label
        this._label = Base.createElement({
            tag: "span",
            classes: ["mdc-floating-label"],
            content: this._elem.dataset.label,
            parent: this._anchor
        });

        //Create the line ripple
        Base.createElement({
            tag: "div",
            classes: ["mdc-line-ripple"],
            parent: this._anchor
        });

        //Create the menu with items(options)
        this._menu = Base.createElement({
            tag: "div",
            classes: ["mdc-select__menu", "mdc-menu", "mdc-menu-surface", "input-fullwidth"],
            parent: this._main
        });

        //Create the "ul" of menu
        this._ul = Base.createElement({
            tag: "ul",
            classes: ["mdc-list"],
            parent: this._menu
        });
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

        //Create the elements of component
        this._createElements();

        //Create the error message
        this._errorElement = Base.createElement({
            tag: "p",
            classes: ["input-msg-error"],
            parent: this._container
        });

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
        //Create the options
        let list = [];
        for (let i = 0; i < this._elem.options.length; i++) {
            let op = {};
            op.value = this._elem.options[i].value;
            op.text = this._elem.options[i].dataset.text ?
                this._elem.options[i].dataset.text : this._elem.options[i].innerHTML;
            op.disabled = this._elem.options[i].disabled;
            op.selected = this._elem.options[i].selected;
            op.separator = this._elem.options[i].dataset.separator === "true";
            list[list.length] = op;
        }
        this._createItems(list, false);

        //Adjust the properties
        this._elem._mdc.value = this._elem.value;
        this._elem._mdc.disabled = this._elem.disabled;
        this._elem._mdc.required = this._elem.required;
        this._label.innerHTML = this._elem.dataset.label;
        Base.showInputMessageError(this._elem);
        Base.showInputComponent(this._elem);
        this._showSelectedOption();

        //Adjust the tab index of selected text area
        let component = this;
        setTimeout(function() {
            if (component._elem.tabIndex !== -2) {
                component._selectedTextArea.tabIndex = component._elem.tabIndex;
                component._elem.tabIndex = -2;
            }
        }, 100);

        this._created = true;
    }

    /**
     * Clean up the component and MDC Web component.
     */
    destroy() {
        if (this._elem._mdc) {
            try {
                this._elem._mdc.getDefaultFoundation().adapter_.closeMenu();
                this._elem._mdc.unlisten("MDCSelect:change", this._changeEvent);
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
     * Defines the options of select component.
     * <br>
     * This method is static, therefore it can be used before or after the component to be created.
     * <br>
     * Syntax of item JSON:
     * <ul>
     *   <li>value: The value of option. It can't be empty or null (string); </li>
     *   <li>text: The text of item (string);</li>
     *   <li>separator: if true, it is a separator. Only this attribute is necessary (boolean);</li>
     *   <li>disabled: if true, the option is disabled (boolean);</li>
     *   <li>selected: if true, the option is selected. Only one option can be selected (boolean).</li>
     * </ul>
     *
     * @param {string} formId    ID of form. If null, the "fieldName" parameter is the ID of element
     * @param {string} fieldName Name of field
     * @param {json[]} op        List of options. Each option is a Json
     * @param {boolean} empty    If true, creates the first option that is empty
     */
    static setOptions(formId, fieldName, op, empty) {
        //Remove the current options of select
        let elem = Form.getField(formId, fieldName);
        while (elem.options.length > 0) {
            elem.remove(0);
        }

        //Build the empty option
        if (empty) {
            let option = Base.createElement({
                tag: "option",
                attrs: ["value", ""],
                content: "",
                parent: elem
            });
            option.dataset.text = "";
        }

        //Build the new options
        for (let i = 0; i < op.length; i++) {
            let option = Base.createElement({
                tag: "option",
                attrs: ["value", op[i].value],
                content: op[i].text,
                parent: elem
            });
            option.selected = op[i].selected === true;
            option.disabled = op[i].disabled === true;
            option.dataset.separator = op[i].separator === true ? "true" : "false";
            option.dataset.text = op[i].text;
        }

        if (elem.component) {
            elem.component.update()
        }
    }

}