/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";


/**
 * Main class that treats the User Interface.
 * <br>
 * Pay attention: this class is static.
 * <br>
 * This framework has the following dependencies:
 * <ul>
 *   <li>JQuery -> https://jquery.com </li>
 *   <li>DataTables -> https://datatables.net </li>
 *   <li>MDC -> https://github.com/material-components/material-components-web </li>
 * </ul>
 * This framework uses the following third-party codes:
 * <ul>
 *   <li>duDatePicker - https://github.com/dmuy/duDatepicker </li>
 *   <li>MDTimePicker - https://github.com/dmuy/MDTimePicker </li>
 * </ul>
 *
 * @author Fernando Viegas
 */
class Scaliby {
    /** The last focused element. */
    static _lastFocusedElement = null;

    /** The current focused element. */
    static _currentFocusedElement = null;

    /** @Media that indicate if the screen is desktop. */
    static _desktopScreen = window.matchMedia("(min-width: 769px)");

    /** Configuration of scaliby. */
    static _config;

    /** List of listeners after loaded. */
    static _listenerAfterLoadedList = [];

    /** If true, shows messages in console to trace. */
    static _debug;

    /** Messages. */
    static _messages = {};


    /** Constant that represents the type of component. */
    static COMPONENT_TYPE = {
        TEXT_FIELD: 1,
        TEXT_AREA: 2,
        RADIO_BOX: 3,
        CHECK_BOX: 4,
        SWITCH: 5,
        SELECT: 6,
        MULTI_SELECT: 7,
        SEARCH_SELECT: 8,
        BUTTON: 9,
        TAB: 10,
        LISTING: 11,
        CARD: 12,
        PANEL: 13,
        CHIP: 14,
        LAYOUT: 15,
        FLOAT_BUTTON: 16,
        ICON_BUTTON: 17,
        LIST: 18,
        MENU: 19,
        DIVIDER: 20,
        PROGRESS: 21,
        FILE_UPLOADER: 22
    };


    /**
     * Sets the configuration of Scaliby.
     *
     * @param {json} data Structure with configuration
     */
    static _setConfiguration(data) {
        Scaliby._config = data;
        I18n.setConfiguration(data.i18n.dateType, data.i18n.dateSeparator, data.i18n.numberDecimalSeparator,
            data.i18n.numberGroupSeparator);
        Scaliby._debug = data.debug;
        Scaliby._messages = data.messages;

        //Event to adjust the drawer
        Scaliby._desktopScreen.onchange = function (changed) {
            Scaliby.adjustDrawer(changed.matches);
        };

        //Stores the last element focused
        document.addEventListener('focus', function(event) {
            Scaliby.setLastFocusedElement(Scaliby.getCurrentFocusedElement());
            Scaliby.setCurrentFocusedElement(event.target);
        }, true);

        //Support for IE11
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function(searchString, position) {
                position = position || 0;
                return this.indexOf(searchString, position) === position;
            };
        }

        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function(suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1;
            };
        }

        //Configure the Dialog component
        let messages = Scaliby.getConfiguration().messages;
        Dialog.configure("OK", messages.button.accept, messages.button.cancel);

        //Steps after page loaded
        window.addEventListener("load", function() {
            //Set the Drawer
            Scaliby.adjustDrawer();
        });
    }


    /**
     * Initializes the Scaliby.
     */
    static init(callback) {
        //Load configuration of Scaliby. The root path is "/js"
        $.ajax({
            type: "get",
            url: "./js/scaliby.json",
            dataType: 'json',
            success: function (data) {
                Scaliby._setConfiguration(data);
                callback();
            },
        });
    }

    /**
     * Gets the configuration of Scaliby.
     *
     * @return {json} the structure with configuration. See Scaliby.setConfiguration(data).
     */
    static getConfiguration() {
        return Scaliby._config;
    }

    /**
     * Informs if debug is on.
     *
     * @return {boolean} true if debug is on.
     */
    static isDebug() {
        return Scaliby._config.debug;
    }

    /**
     * Adjusts the Drawer with screen width.
     *
     * @param {MediaQueryList.matches=} matches If true, the expression of media was matched
     */
    static adjustDrawer(matches) {
        if (matches === undefined) {
            matches = Scaliby._desktopScreen.matches;
        }

        let aside = $("#div_drawer aside");
        let nav = $("#div_drawer nav:first");
        let button = $(".mdc-toolbar__menu-icon");
        aside.removeClass("mdc-drawer mdc-drawer--temporary");
        nav.removeClass("mdc-drawer mdc-drawer--permanent mdc-drawer__drawer");

        if (matches) {
            button.css("display", "none");
            nav.addClass("mdc-drawer mdc-drawer--permanent");
        } else {
            button.css("display", "block");
            aside.addClass("mdc-drawer mdc-drawer--temporary");
            nav.addClass("mdc-drawer__drawer");
        }
    }

    /**
     * Indicates if the browser is Internet Explorer.
     *
     * @return true if browser is Internet Explorer.
     */
    static isIE() {
        return (/*@cc_on!@*/!!document.documentMode);
    }

    /**
     * Gets the component of element.
     *
     * @param {string} value ID or object of element that represents a component
     *
     * @return {Object} the component.
     */
    static getComponent(value) {
        if (typeof value  === "string") {
            return document.getElementById(value).component;
        } else {
            return value.component;
        }
    }

    /**
     * Gets the type of component.
     *
     * @param {Object} element Element that represents the component
     *
     * @return {number|null} the enumeration of COMPONENT_TYPE that represents the type of component.
     * If element isn't a component, returns null.
     */
    static getComponentType(element) {
        if (element.classList.contains("s-input")) {
            //Input components
            switch (element.tagName) {
                case "INPUT":
                    switch (element.type) {
                        case "text":
                        case "password":
                            return Scaliby.COMPONENT_TYPE.TEXT_FIELD;

                        case "radio":
                            return Scaliby.COMPONENT_TYPE.RADIO_BOX;

                        case "checkbox":
                            if (element.classList.contains("s-switch")) {
                                return Scaliby.COMPONENT_TYPE.SWITCH;
                            } else {
                                return Scaliby.COMPONENT_TYPE.CHECK_BOX;
                            }
                    }
                    break;
                case "TEXTAREA":
                    return Scaliby.COMPONENT_TYPE.TEXT_AREA;

                case "SELECT":
                    if (element.dataset.search) {
                        return Scaliby.COMPONENT_TYPE.SEARCH_SELECT;
                    } else if (element.multiple === true) {
                        return Scaliby.COMPONENT_TYPE.MULTI_SELECT;
                    } else {
                        return Scaliby.COMPONENT_TYPE.SELECT;
                    }
            }
            return null;
        } else if (element.classList.contains("s-button")) {
            return Scaliby.COMPONENT_TYPE.BUTTON;
        } else if (element.classList.contains("s-tab")) {
            return Scaliby.COMPONENT_TYPE.TAB;
        } else if (element.classList.contains("s-listing")) {
            return Scaliby.COMPONENT_TYPE.LISTING;
        } else if (element.classList.contains("s-card")) {
            return Scaliby.COMPONENT_TYPE.CARD;
        } else if (element.classList.contains("s-panel")) {
            return Scaliby.COMPONENT_TYPE.PANEL;
        } else if (element.classList.contains("s-chip")) {
            return Scaliby.COMPONENT_TYPE.CHIP;
        } else if (element.classList.contains("s-layout")) {
            return Scaliby.COMPONENT_TYPE.LAYOUT;
        } else if (element.classList.contains("s-float-button")) {
            return Scaliby.COMPONENT_TYPE.FLOAT_BUTTON;
        } else if (element.classList.contains("s-icon-button")) {
            return Scaliby.COMPONENT_TYPE.ICON_BUTTON;
        } else if (element.classList.contains("s-list")) {
            return Scaliby.COMPONENT_TYPE.LIST;
        } else if (element.classList.contains("s-menu")) {
            return Scaliby.COMPONENT_TYPE.MENU;
        } else if (element.classList.contains("s-divider")) {
            return Scaliby.COMPONENT_TYPE.DIVIDER;
        } else if (element.classList.contains("s-progress")) {
            return Scaliby.COMPONENT_TYPE.PROGRESS;
        } else if (element.classList.contains("s-file-uploader")) {
            return Scaliby.COMPONENT_TYPE.FILE_UPLOADER;
        }

        return null;
    }

    /**
     * Adds a listener that is dispatched after the asynchronous response has been loaded.
     * <br>
     * Who do asynchronous requests: {@link Comm.get}, {@link Comm.post}, {@link Comm.submit}, {@link Comm.send}.
     *
     * @param {function} func Function to call
     */
    static addListenerAfterLoaded(func) {
        Scaliby._listenerAfterLoadedList[Scaliby._listenerAfterLoadedList.length] = func;
    }

    /**
     * Execute the listeners after the asynchronous response has been loaded.
     */
    static executeListenerAfterLoaded() {
        while (Scaliby._listenerAfterLoadedList.length > 0) {
            try {
                Scaliby._listenerAfterLoadedList[0]();
            } catch (error) {
                console.error("Error while executing listener after loaded");
                console.error(error);
            }
            Scaliby._listenerAfterLoadedList.splice(0, 1);
        }
    }

    /**
     * Creates the children components from a parent element.
     *
     * @param {string=} parentId Parent element ID. If null, applies update in all page
     */
    static createComponents(parentId) {
        let parent;
        if ((parent = document.getElementById(parentId)) === null) {
            parent = document.body;
        }

        //Search and create components
        let focused = null;
        let elems = parent.querySelectorAll("button, div, table, ul, input, textarea, select");
        for (let i = 0; i < elems.length; i++) {
            Scaliby.createComponent(elems[i]);
            if (elems[i].autofocus) {
                focused = elems[i];
            }
        }

        //Apply focus
        if (focused !== null) {
            focused.focus();
        }
    }

    /**
     * Creates the children input components from a parent element.
     *
     * @param {string=} parentId Parent element ID. If null, applies update in all page
     */
    static createInputComponents(parentId) {
        let parent;
        if ((parent = document.getElementById(parentId)) === null) {
            parent = document.body;
        }

        //Search and create components
        let focused = null;
        let elems = parent.querySelectorAll("input, textarea, select");
        for (let i = 0; i < elems.length; i++) {
            Scaliby.createComponent(elems[i]);
            if (elems[i].autofocus) {
                focused = elems[i];
            }
        }

        //Apply focus
        if (focused !== null) {
            focused.focus();
        }
    }

    /**
     * Creates the component of element.
     *
     * @param {Object} elem Element that represents the component
     */
    static createComponent(elem) {
        try {
            if (elem.component) {
                elem.component.update();
            } else {
                switch (Scaliby.getComponentType(elem)) {
                    case Scaliby.COMPONENT_TYPE.TEXT_FIELD:
                        new Textfield(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.TEXT_AREA:
                        new Textarea(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.RADIO_BOX:
                        new Radiobox(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.CHECK_BOX:
                        new Checkbox(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.SWITCH:
                        new Switch(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.SELECT:
                        new Select(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.MULTI_SELECT:
                        new Multiselect(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.SEARCH_SELECT:
                        new Searchselect(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.BUTTON:
                        new Button(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.TAB:
                        new Tab(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.LISTING:
                        new Listing(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.CARD:
                        new Card(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.PANEL:
                        new Panel(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.CHIP:
                        new Chip(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.LAYOUT:
                        new Layout(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.FLOAT_BUTTON:
                        new FloatButton(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.ICON_BUTTON:
                        new IconButton(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.LIST:
                        new List(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.MENU:
                        new Menu(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.DIVIDER:
                        new Divider(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.PROGRESS:
                        new Progress(elem);
                        break;

                    case Scaliby.COMPONENT_TYPE.FILE_UPLOADER:
                        new FileUploader(elem);
                        break;
                }
            }
        } catch (error) {
            console.error("Error while creating component.", error);
        }
    }

    /**
     * Displays the element if has content. Otherwise, hide it.
     *
     * @param {string} selector jQuery selector that identify the element
     */
    static showOrHideElementByContent(selector) {
        let obj = $(selector);

        if (obj.html() !== "") {
            obj.show();
        } else {
            obj.hide();
        }
    }

    /**
     * Gets the width of element text.
     *
     * @param {Element} element Element that contains the text
     * @param {string}  text    The text
     *
     * @return {number} the width of text.
     */
    static getWidthOfText(element, text) {
        var canvas = document.createElement("canvas").getContext("2d");
        var styles = window.getComputedStyle(element, null);
        canvas.font = styles.getPropertyValue("font-size") + " " + styles.getPropertyValue("font-family");
        return canvas.measureText(text).width;
    }

    /**
     * Gets the last focused element.
     *
     * @return the element.
     */
    static getLastFocusedElement() {
        return Scaliby._lastFocusedElement;
    }

    /**
     * Sets the last focused element.
     *
     * @param {Element} elem The element
     */
    static setLastFocusedElement(elem) {
        Scaliby._lastFocusedElement = elem;
    }

    /**
     * Gets the current focused element.
     *
     * @return {Element} the element.
     */
    static getCurrentFocusedElement() {
        return Scaliby._currentFocusedElement;
    }

    /**
     * Sets the current focused element.
     *
     * @param {Element} elem the element
     */
    static setCurrentFocusedElement(elem) {
        Scaliby._currentFocusedElement = elem;
    }

    /**
     * Dispatches an event of element.
     *
     * @param {Element} elem The element
     * @param {string} name  Name of event
     */
    static dispatchEvent(elem, name) {
        elem.dispatchEvent(new Event(name));
    }

    /**
     * Create the icon element.
     * <br>
     * Source of icons:
     * <ul>
     *   <li><b>Icon name: </b> Material icons {@link https://material.io/resources/icons};</li>
     *   <li><b>"x1-" prefix + icon name:</b> Material Design Icons {@link http://materialdesignicons.com}.</li>
     * </ul>
     *
     * @param {string} name Name of icon
     *
     * @return the icon element.
     */
    static createIcon(name) {
        if (name.startsWith("x1-")) {
            //Material Design Icons
            return Base.createElement({
                tag: "i",
                classes: ["material-icons", "mdi", "mdi-" + name.substring(3)]
            });
        } else {
            //Material Icons
            return Base.createElement({
                tag: "i",
                content: name,
                classes: ["material-icons"]
            });
        }




        //If icon is extended, get the features
        let sizeOfPrefix = 0;
        let features = null;
        let icons = Scaliby.getConfiguration().extraIcons;
        if (icons) {
            for (let i = 0; i < icons.length; i++) {
                if (name.startsWith(icons[i].prefix)) {
                    features = icons[i];
                    sizeOfPrefix = icons[i].prefix.length;
                    break;
                }
            }
        }

        let icon;
        if (features === null) {
            //Material Design icons
            icon = Base.createElement({
                tag: "i",
                content: name,
                classes: ["material-icons"]
            });
        } else {
            //Extended icons
            let classes = features.classes ? features.classes.slice() : [];

            if (features.putNameInClass === true) {
                classes[classes.length] = name.substring(sizeOfPrefix);
            }

            if (features.removeAllName === true) {
                name = "";
            } else if (features.removeNamePrefix === true) {
                name = name.substring(sizeOfPrefix - 1);
            }

            icon = Base.createElement({
                tag: "i",
                content: name,
                classes: classes,
                styles: features.styles
            });
        }

        return icon;
    }

}
