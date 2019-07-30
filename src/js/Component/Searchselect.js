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
    _div;

    /** If true, doesn't update the input. */
    _doesNotUpdateInput = false;

    /* Last value. */
    _lastValue = null;

    /* Input element. */
    _input;

    /** MDC framework of input. */
    _inputMdc;



    /**
     * Create the event handlers.
     *
     * @private
     */
    _createEvents() {
        let elem = this._elem;
        let label = this._label;
        let div = this._div;
        let input = this._input;
        let divIcon = this._divIcon;
        let divSpinner = this._divSpinner;
        let searchselect = this;

        //Label clicked
        label.addEventListener("click", function () {
            elem.focus();
        });

        //Focus on select
        input.addEventListener("focus", function () {
            div.classList.add("input-bg-focus");
            input.focus();
        });

        //Blur from select
        elem.addEventListener("blur", function () {
            div.classList.remove("input-bg-focus");
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
            searchselect._markSelectedOptionOfSearchSelect();
            setTimeout(function () {
                input.focus();
            }, 50);
        });

        //Blur from input
        input.addEventListener("blur", function() {
            setTimeout(function() {
                if (Scaliby.getCurrentFocusedElement() !== searchselect._elem) {
                    searchselect._markSelectedOptionOfSearchSelect();
                    Base.dispatchEvent(input.select, "blur");
                }
            }, 50);
        });

        //Click on input
        input.addEventListener("click", function () {
            Base.dispatchEvent(input.select, "click");
        });

        //Key down on input
        input.addEventListener("keydown", function (event) {
            if ($(elem).css("left") !== "0px" || elem.options.length === 0) {
                return;
            }

            searchselect._doesNotUpdateInput = true;
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
                searchselect._markSelectedOptionOfSearchSelect();
                event.preventDefault();
                input.focus();
            }
            searchselect._doesNotUpdateInput = false;
        });

        //Selected index changed
        elem.oldSelectedIndex = -1;
        Object.defineProperty(elem, "selectedIndex", {
            get: function () {
                return this.oldSelectedIndex;
            },
            set: function (index) {
                this.oldSelectedIndex = index;
                if (this.doNotUpdateInput === false) {
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
            if (searching || text.length < 2 || text === lastText
                || !elem.dataset.search || event.keyCode === 13) {
                lastText = text;
                return;
            }
            lastText = text;
            searching = true;

            //Show option box without options
            elem.style.left = "0px";
            elem.style.size = "2";
            elem.innerHTML = "";
            divIcon.style.display = "none";
            divSpinner.style.display = "block";

            if (elem.dataset.search.indexOf("javascript:") === 0) {
                //Build options from local data
                searchselect._setSearchSelectOptions(eval(elem.dataset.search.substring(11)));
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
                        searchselect._setSearchSelectOptions(data);
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
     * Marks the selected option, removes the other options, closes the options box and copies the text to input.
     *
     * @private
     */
    _markSelectedOptionOfSearchSelect() {
        $(this._elem).css("left", "-8000px");

        let event;
        event = document.createEvent('HTMLEvents');
        event.initEvent("change", true, true);

        if (this._input.value === "" || this._elem.options.length === 0 || this._elem.selectedIndex === -1) {
            this._input.value = "";
            this._elem.selectedIndex = -1;

            if (this._elem.lastValue !== null) {
                Base.dispatchEvent(this._elem, "change");
            }
            this._elem.lastValue = null;
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
        if (this._elem.lastValue !== this._elem.options[0].value) {
            this._elem.lastValue = this._elem.options[0].value;
            Base.dispatchEvent(this._elem, "change");
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
            $(this._elem).css("left", "-8000px");
        }
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
        this._div = Base.createElement({
            tag: "div",
            classes: ["mdc-text-field", "mdc-text-field--with-trailing-icon", "multiselect-div",
                "input-bg", "input-fullwidth"],
            styles: ["overflow", "visible"],
            parent: this._container
        });

        //Configure the element
        Base.configElement(elem, {
            generateId: true,
            classes: ["searchselect"],
            attrs: ["tabindex", "-1"],
            parent: this._div
        });
        if (this._elem.size < 2) {
            this._elem.size = 2;
        }

        //Create the input
        this._input = Base.createElement({
            tag: "input",
            id: elem.id + "_input",
            classes: ["mdc-text-field__input"],
            styles: ["padding", "18px 12px 2px"],
            attrs: ["tab-index", elem.tabIndex, "autocomplete", "new-password"],
            parent: this._div
        });
        this._input.select = this._elem;

        //Create the label
        this._label = Base.createElement({
            tag: "label",
            id: elem.id + "_label",
            classes: ["mdc-floating-label"],
            attrs: ["for", this._input.id],
            styles: ["bottom", "12px"],
            parent: this._div
        });

        //Create the icon of search
        this._divIcon = Base.createElement({
            tag: "i",
            classes: ["material-icons", "mdc-text-field__icon"],
            styles: ["bottom", "10px"],
            content: "search",
            parent: this._div
        });

        //Create the line ripple
        Base.createElement({
            tag: "div",
            classes: ["mdc-line-ripple"],
            parent: this._div
        });

        //Create the loading spinner
        this._divSpinner = Scaliby.createLoadingSpinner(1);
        Base.configElement(this._divSpinner, {
            classes: ["mdc-text-field__icon"],
            styles: ["display", "none", "top", "16px"],
            parent: this._div
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
        this._inputMdc = new mdc.textField.MDCTextField(this._div);
        if (this._elem.options.length === 1) {
            this._elem.selectedIndex = 0;
        }
        this._elem.autofocus = false;

        this.update();
        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }
    }

    /**
     * Update the component.
     */
    update() {
        if (this._elem.selectedIndex !== -1) {
            $(this._input).val(this._elem.options[this._elem.selectedIndex].innerHTML);
            this._markSelectedOptionOfSearchSelect();
        }
        Base.showInputComponent(this._elem);

        $(this._label).html($(this._elem).attr("data-label"));
        this._inputMdc.value = this._input.value;

        //Adjust if required and empty
        this._input.required = this._elem.required;
        this._inputMdc.required = this._input.required;
        let searchselect = this;
        setTimeout(function () {
            if (searchselect._elem.disabled === false && searchselect._input.value === "" &&
                searchselect._input.required) {
                searchselect._input.parentNode.classList.add("mdc-text-field--invalid");
            } else {
                searchselect._input.parentNode.classList.remove("mdc-text-field--invalid");
            }
        }, 100);

        //Adjust if disabled
        this._input.disabled = this._elem.disabled;
        this._inputMdc.disabled = this._elem.disabled;

        //Show the error message
        Base.showInputMessageError(this._elem);
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