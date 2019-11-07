/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Object that treats forms.
 * <br>
 * Pay attention: this class is static.
 *
 * @author Fernando Viegas
 */
class Form {
    /**
     * Converts a number or date value to string.
     *
     * @param {Object} value Value to be converted
     *
     * @return {string} text value.
     *
     * @private
     */
    static _valueToString(value) {
        if (typeof value == "number") {
            return I18n.numberToString(value);
        } else if (value instanceof Date) {
            return I18n.dateToString(value);
        } else {
            return value;
        }
    }


    /**
     * Gets the form that contains the input component element.
     *
     * @param {Object} elem Input component element inside a form
     *
     * @return {Object} the form element or null if not exist.
     */
    static get(elem) {
        while ((elem = elem.parentNode) !== null) {
            if (elem.tagName === "FORM") {
                return elem;
            }
        }

        return null;
    }

    /**
     * Gets the input component element from form.
     *
     * @param {string} formId    ID of form. If null, the "fieldName" parameter is the ID of element
     * @param {string} fieldName Name of field
     *
     * @return {Object} the input component element.
     */
    static getField(formId, fieldName) {
        let elem;

        if (formId) {
            elem = document.getElementById(formId + "_" + fieldName);
            if (!elem) {
                elem = document.getElementById(formId).querySelector("[name='" + fieldName + "']");
            }
        } else {
            elem = document.getElementById(fieldName);
        }

        return elem;
    }

    /**
     * Gets the list of input component elements of form.
     *
     * @param {Object} formElement Form element
     *
     * @return {Array} the list of input component elements.
     */
    static getFields(formElement) {
        let elems = formElement.elements;
        let list = [];

        for (let i = 0; i < elems.length; i++) {
            if (elems[i] && (elems[i].classList.contains("s-input") || elems[i].type === "hidden")) {
                list[list.length] = elems[i];
            }
        }

        return list;
    }

    /**
     * Gets the value of input component.
     *
     * @param {Object} elem Input component element
     *
     * @return {string|string[]} the value of input component. Can be a unique value or a list.
     */
    static getValueByElement(elem) {
        let list;

        switch (elem.type) {
            case "text":
            case "password":
            case "textarea":
            case "select-one":
            case "hidden":
                return elem.value.trim();

            case "radio":
                list = document.getElementsByName(elem.name);
                for (let i = 0; i < list.length; i++) {
                    if (list[i].checked) {
                        return list[i].value.trim();
                    }
                }
                return "";

            case "checkbox":
                if (elem.classList.contains("s-switch")) {
                    return elem.checked ? "true" : "false";
                }

                let elems = Form.get(elem).querySelectorAll("[name='" + elem.name + "']");
                list = [];
                for (let i = 0; i < elems.length; i++) {
                    if (elems[i].checked) {
                        list[list.length] = elems[i].value.trim();
                    }
                }
                return list;

            case "select-multiple":
                list = [];
                let options = elem.options;
                for (let i = 0; i <= options.length; i++) {
                    if (options[i] && options[i].selected) {
                        list[list.length] = options[i].value.trim();
                    }
                }
                return list;
        }
    }

    /**
     * Gets the string value of input component.
     *
     * @param {string} formId    ID of form
     * @param {string} fieldName Name of field
     *
     * @return {string|string[]} the value of input component. Can be a unique value or a list.
     */
    static getValueString(formId, fieldName) {
        return Form.getValueByElement(Form.getField(formId, fieldName));
    }

    /**
     * Gets the date value of input component.
     * <br>
     * If value has date and hour(example: "2018/10/30 07:28") the date will be complete.
     * If value has only date(example: "2018/10/30") the time of date will be the current.
     * If value has only time(example: "07:28") the date will be the current.
     *
     * @param {string} formId    ID of form
     * @param {string} fieldName Name of field
     *
     * @return {Date|Date[]} the value of input component. Can be a unique value or a list.
     */
    static getValueDate(formId, fieldName) {
        let text = Form.getValueByElement(Form.getField(formId, fieldName));
        if (!text) {
            return null;
        } else if (!Array.isArray(text)) {
            return I18n.stringToDate(text);
        }

        for (let i = 0; i < text.length; i++) {
            let value = text[i];
            if (value.length === 10) {
                text[i] = I18n.stringToDate(value);
            } else if (value.length < 12) {
                text[i] = I18n.stringToTime(value);
            } else {
                text[i] = I18n.stringToDateTime(value);
            }
        }

        return text;
    }

    /**
     * Gets the number value of input component.
     *
     * @param {string} formId    ID of form
     * @param {string} fieldName Name of field
     *
     * @return {number|number[]} the value of input component. Can be a unique value or a list.
     */
    static getValueNumber(formId, fieldName) {
        let text = Form.getValueByElement(Form.getField(formId, fieldName));
        if (!text) {
            return null;
        } else if (!Array.isArray(text)) {
            return I18n.stringToNumber(text);
        }

        for (let i = 0; i < text.length; i++) {
            text[i] = I18n.stringToNumber(text[i]);
        }

        return text;
    }

    /**
     * Sets the value of input component. The component is updated.
     *
     * @param {Object} elem     Input component element
     * @param {string|string[]} value The value or list of values if component supports this
     */
    static setValueByElement(elem, value) {
        switch (elem.type) {
            case "text":
            case "password":
            case "textarea":
            case "hidden":
                if (!value) {
                    elem.value = "";
                } else {
                    elem.value = value;
                }
                break;

            case "select-one":
                if (!value) {
                    elem.selectedIndex = -1;
                } else if (!elem.dataset.search) {
                    elem.value = value;
                } else {
                    if (!Array.isArray(value)) {
                        elem.value = value;
                    } else {
                        elem.options.length = 0;
                        let opt = document.createElement("option");
                        opt.value = value[0];
                        opt.text = value[1] !== null ? value[1] : "";
                        elem.add(opt);
                        elem.selectedIndex = 0;
                    }
                }
                break;

            case "radio":
                document.getElementsByName(elem.name).forEach(function (item) {
                    item.checked = value !== null && item.value === value;
                });
                break;

            case "checkbox":
                if (elem.classList.contains("s-switch")) {
                    elem.checked = value === true || value === "true";
                } else {
                    document.getElementsByName(elem.name).forEach(function (item) {
                        item.checked = false;
                        for (let i = 0; i < value.length; i++) {
                            if (value[i] === item.value) {
                                item.checked = true;
                                break;
                            }
                        }
                    });
                }
                break;

            case "select-multiple":
                let options = elem.options;

                for (let i = 0; i < options.length; i++) {
                    options[i].selected = false;
                }

                for (let i = 0; i < value.length; i++) {
                    for (let j = 0; j < options.length; j++) {
                        if (options[j].value === value[i]) {
                            options[j].selected = true;
                            break;
                        }
                    }
                }
                break;
        }

        if (elem.component) {
            elem.component.update();
        }
    }

    /**
     * Sets the string value for input component. The component is updated.
     *
     * @param {string} formId         ID of form
     * @param {string} fieldName      Name of field
     * @param {string|string[]} value The value or list of values if component supports this
     */
    static setValueString(formId, fieldName, value) {
        Form.setValueByElement(Form.getField(formId, fieldName), value);
    }

    /**
     * Sets the date value for input component. The component is updated.
     *
     * @param {string} formId      ID of form
     * @param {string} fieldName   Name of field
     * @param {Date|Date[]} value  The value or list of values if component supports this
     */
    static setValueDate(formId, fieldName, value) {
        let valueOrlist;
        if (value) {
            if (Array.isArray(value)) {
                valueOrlist = [];
                for (let i = 0; i < value.length; i++) {
                    valueOrlist[i] = I18n.dateToString(value[i]);
                }
            } else {
                valueOrlist = I18n.dateToString(value);
            }
        }

        Form.setValueByElement(Form.getField(formId, fieldName), valueOrlist);
    }

    /**
     * Sets the time value for input component. The component is updated.
     *
     * @param {string} formId             ID of form
     * @param {string} fieldName          Name of field
     * @param {date|date[]} value         The value or list of values if component supports this
     * @param {boolean=} showSeconds      If true, show seconds. If omitted, doesn't show
     * @param {boolean=} showMilliseconds If true, show seconds. If omitted, doesn't show
     */
    static setValueTime(formId, fieldName, value, showSeconds, showMilliseconds) {
        let valueOrlist;
        if (value) {
            if (Array.isArray(value)) {
                valueOrlist = [];
                for (let i = 0; i < value.length; i++) {
                    valueOrlist[i] = I18n.timeToString(value[i], showSeconds, showMilliseconds);
                }
            } else {
                valueOrlist = I18n.timeToString(value, showSeconds, showMilliseconds);
            }
        }

        Form.setValueByElement(Form.getField(formId, fieldName), valueOrlist);
    }

    /**
     * Sets the date and time value for input component. The component is updated.
     *
     * @param {string} formId             ID of form
     * @param {string} fieldName          Name of field
     * @param {date|date[]} value         The value or list of values if component supports this
     * @param {boolean=} showSeconds      If true, show seconds. If omitted, doesn't show
     * @param {boolean=} showMilliseconds If true, show seconds. If omitted, doesn't show
     */
    static setValueDateTime(formId, fieldName, value, showSeconds, showMilliseconds) {
        let valueOrlist;
        if (value) {
            if (Array.isArray(value)) {
                valueOrlist = [];
                for (var i = 0; i < value.length; i++) {
                    valueOrlist[i] = I18n.dateTimeToString(value[i], showSeconds, showMilliseconds);
                }
            } else {
                valueOrlist = I18n.dateTimeToString(value, showSeconds, showMilliseconds);
            }
        }

        Form.setValueByElement(Form.getField(formId, fieldName), valueOrlist);
    }

    /**
     * Sets the number value for input component. The component is updated.
     *
     * @param {string} formId         ID of form
     * @param {string} fieldName      Name of field
     * @param {number|number[]} value The value or list of values if component supports this
     * @param {number=} decimals      Total of fractional numbers. If omitted, considers 0 decimals
     */
    static setValueNumber(formId, fieldName, value, decimals) {
        let valueOrlist;
        if (value) {
            if (Array.isArray(value)) {
                valueOrlist = [];
                for (let i = 0; i < value.length; i++) {
                    valueOrlist[i] = I18n.numberToString(value[i], decimals);
                }
            } else {
                valueOrlist = I18n.numberToString(value, decimals);
            }
        }

        Form.setValueByElement(Form.getField(formId, fieldName), valueOrlist);
    }

    /**
     * Changes the name of field and automatically adjusts the id of component.
     *
     * @param elem Element of field
     * @param name New name
     */
    static renameField(elem, name) {
        let formName = elem.id.substring(0, elem.id.startsWith("_"));
        elem.name = name;
        elem.id = formName + "_" + elem.name;
    }

    /**
     * Sends the form if the event of input element indicates that it was pressed by [ENTER] key.
     *
     * How it works:
     * <ul>
     *   <li>1) Gets the event element of [ENTER] key;<li>
     *   <li>2) Searches the "form" to which it belongs;<li>
     *   <li>3) Look for the "form" element in which the "onclick" code contains a call to a "submit"
     *          function;<li>
     *   <li>4) Generates the click event on this button.<li>
     * </ul>
     *
     * @param {Object} event Object of event
     */
    static sendByEnter(event) {
        if ((event.keyCode ? event.keyCode : event.which) === 13){
            //Search the form of the element that generated the event
            let form = $(event.target).closest("form");

            //Search for a button that calls the "submit" function and executes it
            let list = form.find("button");
            for (let i = 0; i < list.length; i++) {
                let func = list[i].onclick;
                if (func != null && func.toString().indexOf("submit") >= 0) {
                    list[i].click();
                    return;
                }
            }
        }
    }

    /**
     * Salves the values of input components.
     *
     * @param {string} id Form ID
     */
    static saveValues(id) {
        let form = document.getElementById(id);
        let elements = Form.getFields(form);

        form.savedValues = [];
        for (let i = 0; i < elements.length; i++) {
            let elem = elements[i];

            form.savedValues[form.savedValues.length] = elem;
            if (!elem.dataset.search) {
                form.savedValues[form.savedValues.length] = Form.getValueByElement(elem);
            } else {
                form.savedValues[form.savedValues.length] = [
                    Form.getValueByElement(elem),
                    elem.selectedIndex === -1 ? "" : elem.options[elem.selectedIndex].text
                ];
            }
        }
    }

    /**
     * Restores the values of input components.
     *
     * @param {string} id Form ID
     */
    static recoverValues(id) {
        let form = document.getElementById(id);
        if (form.savedValues === undefined) {
            return;
        }

        let savedValues = form.savedValues;
        let index = 0;
        while (index < savedValues.length) {
            Form.setValueByElement(savedValues[index++], savedValues[index++]);
        }
    }

    /**
     * Fills form fields and shows the error messages.
     *
     * @param {string} formId   Form ID
     * @param {Object[]} values List with fields names and their respective values
     * @param {string[]} errors List with fields names and their respective message errors
     */
    static fill(formId, values, errors) {
        let form = document.getElementById(formId);
        if (values !== null) {
            //Put the values of components
            for (let i = 0; i < values.length; i += 2) {
                let elem = form.querySelector("[name='" + values[i] + "']");
                if (!elem) {
                    console.error("[Form.fill] Field '" + values[i] + "' doesn't exist.");
                    continue;
                }
                Form.setValueByElement(elem, Form._valueToString(values[i + 1]));
            }

        }

        if (errors !== null) {
            //Remove all errors
            let panelError = $(form).find(".panel-error")[0];
            if (panelError) {
                panelError.innerHTML = "";
                panelError.classList.add("hide-element");
            }

            $(form).find("input, select, textarea").attr("data-error", null);

            //Put the errors
            for (let i = 0; i < errors.length; i += 2) {
                if (errors[i] === "") {
                    if (panelError) {
                        panelError.innerHTML = errors[i + 1];
                        panelError.classList.remove("hide-element");
                    }
                } else {
                    $("#" + formId + "_" + errors[i]).attr("data-error", errors[i + 1]);
                }
            }
        }

        let elems = form.querySelectorAll("input, select, textarea");
        for (let i = 0; i < elems.length; i++) {
            if (elems[i].component) {
                elems[i].component.update();
            }
        }
    }

    /**
     * Changes the form fields in read only or editable.
     * <br>
     * If read only, hides the save button (check icon).
     * If editable, hides the edit button (edit icon).
     *
     * @param {string} id           Form ID
     * @param {boolean} readonly    If true, changes the fields to read only, otherwise, changes to editable
     * @param {string[]} exceptions List of field names that should not have their status changed
     */
    static setReadOnly(id, readonly, exceptions) {
        let form = document.getElementById(id);
        let elems = Form.getFields(form);
        form.savedValues = [];

        //Treat each input element
        for (let i = 0; i < elems.length; i++) {
            let elem = elems[i];
            if (exceptions !== null && exceptions.indexOf(elem.name) !== -1) {
                //The element is in the list of those that should not have the status changed
                continue;
            }

            elem.disabled = readonly;
            if (elem.component) {
                elem.component.update();
            }
        }

        //Treat the buttons
        let buttons = form.querySelectorAll(".s-button");
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].dataset.leftIcon === "edit" || buttons[i].dataset.rightIcon === "edit") {
                //Edit button
                if (readonly) {
                    buttons[i].classList.remove("hide-element");
                } else {
                    buttons[i].classList.add("hide-element");
                }
            } else if (buttons[i].dataset.leftIcon === "check" || buttons[i].dataset.rightIcon === "check") {
                //Create button
                if (readonly) {
                    buttons[i].classList.add("hide-element");
                } else {
                    buttons[i].classList.remove("hide-element");
                }
            }
        }
    }

    /**
     * Shows the fields.
     *
     * @param {string} formId        ID of form
     * @param {boolean} targetIsCell If true, shows the cells that contains the fields. Default is false
     * @param {Array=} list          List of fields names. If omitted, get all fields of form
     */
    static showFields(formId, targetIsCell, list) {
        let elems;
        let form = document.getElementById(formId);

        if (list) {
            elems = [];
            for (let i = 0; i < list.length; i++) {
                elems[i] = form.querySelector("[name='" + list[i] + "']");
            }
        } else {
            elems = Form.getFields(form);
        }

        for (let i = 0; i < elems.length; i++) {
            if (targetIsCell === true) {
                let cell = Base.getCellOfField(elems[i]);
                if (cell) {
                    cell.classList.remove("hide-element");
                }
            } else {
                elems[i].dataset.visible = "true";
                Base.showInputComponent(elems[i]);
            }
        }
    }

    /**
     * Hides the fields.
     *
     * @param {string} formId        ID of form
     * @param {boolean} targetIsCell If true, hides the cells that contains the fields. Default is false
     * @param {Array=} list          List of fields names. If omitted, get all fields of form
     */
    static hideFields(formId, targetIsCell, list) {
        let elems;
        let form = document.getElementById(formId);

        if (list) {
            elems = [];
            for (let i = 0; i < list.length; i++) {
                elems[i] = form.querySelector("[name='" + list[i] + "']");
            }
        } else {
            elems = Form.getFields(form);
        }

        for (let i = 0; i < elems.length; i++) {
            if (elems[i].type === "hidden") {
                continue;
            }

            if (targetIsCell === true) {
                let cell = Base.getCellOfField(elems[i]);
                if (cell) {
                    cell.classList.add("hide-element");
                }
            } else {
                elems[i].dataset.visible = "false";
                Base.showInputComponent(elems[i]);
            }
        }
    }

    /**
     * Verifies if field is hidden.
     *
     * @param {string} formId    ID of form
     * @param {string} fieldName Name of field
     *
     * @return {boolean} true if field is hidden.
     */
    static isHiddenField(formId, fieldName) {
        let elem = Form.getField(formId, fieldName);

        return elem.component.getContainer().classList.contains("hide-element")
            || Base.getCellOfField(elem).classList.contains("hide-element");
    }

    /**
     * Hides the button inside the form.
     *
     * @param {string} formId   Id if form
     * @param {string} iconName Icon name of button
     */
    static hideButton(formId, iconName) {
        let form = document.getElementById(formId);
        let buttons = form.querySelectorAll(".s-button");
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].dataset.icon === iconName) {
                buttons[i].classList.add("hide-element");
            }
        }
    }

    /**
     * Shows the button inside the form.
     *
     * @param {string} formId   Id if form
     * @param {string} iconName Icon name of button
     */
    static showButton(formId, iconName) {
        let form = document.getElementById(formId);
        let buttons = form.querySelectorAll(".s-button");
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].dataset.icon === iconName) {
                buttons[i].classList.remove("hide-element");
            }
        }
    }

    /**
     * Removes the error texts of all fields and general error in panel.
     *
     * @param form Element of form
     */
    static removeAllErrors(form) {
        let errorPanel = form.querySelector(".panel-error");
        if (errorPanel !== null) {
            errorPanel.classList.add("hide-element");
        }

        let elems = Form.getFields(form);
        for (let i = 0; i < elems.length; i++) {
            let type = elems[i].type;

            if (type === "text" || type === "password" || type === "textarea" || type === "select-one" ||
                type === "select-multiple" || (type === "checkbox" && elems[i].classList.contains("s-switch"))) {
                elems[i].dataset.error = "";
                Base.showInputMessageError(elems[i]);
            } else if (type === "checkbox" || type === "radio") {
                elems[i].container.dataset.error = "";
                Base.showInputMessageError(elems[i].container);
            }
        }
    }

}