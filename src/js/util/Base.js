/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * This object provides resources for the creation and operation of components.
 *
 * @author Fernando Viegas
 */
class Base {
    /**
     * Creates an element.
     *
     * @param {Object} data tag: tag name (string);
     *                      id: ID of element (string);
     *                      generateId: If true, generates the element ID. Syntax: "form ID"_"element name" (boolean);
     *                      content: Content of element (Object);
     *                      classes: Array of CSS classes (string[]);
     *                      attrs: Array with name and value of each attribute (string[]);
     *                      styles: Array with name and value of each style (string[]);
     *                      parent: Element that receives the new element (Object);
     *                      insertAt: If informed, indicates the index of insert into parent (number);
     *                      events: Creates events. Array of events with syntax name and function (Object[])
     *
     * @return {Object} the new element.
     */
    static createElement(data) {
        let elem = document.createElement(data.tag);

        if (data.id) {
            elem.id = data.id;
        }

        if (data.generateId && data.generateId === true) {
            let formId = Form.get(elem);
            if (formId) {
                elem.id = formId.getAttribute("id") + "_" + elem.name;
            } else {
                elem.id = elem.name;
            }
        }

        if (data.classes) {
            for (let i = 0; i < data.classes.length; i++) {
                elem.classList.add(data.classes[i]);
            }
        }

        if (data.attrs) {
            for (let i = 0; i < data.attrs.length; i += 2) {
                elem.setAttribute(data.attrs[i], data.attrs[i + 1]);
            }
        }

        if (data.styles) {
            for (let i = 0; i < data.styles.length; i += 2) {
                elem.style[data.styles[i]] = data.styles[i + 1];
            }
        }

        if (data.parent) {
            if (data.insertAt === undefined) {
                data.parent.appendChild(elem);
            } else {
                Base.insertElementAt(elem, data.parent, data.insertAt);
            }
        }

        if (data.content) {
            elem.innerHTML = data.content;
        }

        if (data.events) {
            for (let i = 0; i < data.events.length; i += 2) {
                elem.addEventListener(data.events[i], data.events[i + 1]);
            }
        }

        return elem;
    }

    /**
     * Configures an element.
     *
     * @param {Object} elem The element or the ID of element
     * @param {Object} data id: ID of element (string);
     *                      generateId: If true, generates the element ID. Syntax: "form ID"_"element name" (boolean);
     *                      content: Content of element (Object);
     *                      classes: Array of class names. If name starts with "-", then removes the class (string[]);
     *                      attrs: Array with name and value of each attribute (string[]);
     *                      styles: Array with name and value of each style (string[]);
     *                      parent: Element that receives the new element (Object);
     *                      insertAt: If informed, indicates the index of insert into parent (number);
     *                      events: Creates events. Array of events with syntax name and function (Object[])
     *
     * @return the new element.
     */
    static configElement(elem, data) {
        if (typeof elem === 'string') {
            elem = document.getElementById(elem);
        }

        if (data.id) {
            elem.id = data.id;
        }
        if (data.generateId && data.generateId === true) {
            let formId = Form.get(elem);
            if (formId) {
                elem.id = formId.getAttribute("id") + "_" + elem.name;
            } else {
                elem.id = elem.name;
            }
        }

        if (data.classes) {
            for (let i = 0; i < data.classes.length; i++) {
                if (data.classes[i][0] !== '-') {
                    elem.classList.add(data.classes[i]);
                } else {
                    elem.classList.remove(data.classes[i].substring(1));
                }
            }
        }

        if (data.attrs) {
            for (let i = 0; i < data.attrs.length; i += 2) {
                elem.setAttribute(data.attrs[i], data.attrs[i + 1]);
            }
        }

        if (data.styles) {
            for (let i = 0; i < data.styles.length; i += 2) {
                elem.style[data.styles[i]] = data.styles[i + 1];
            }
        }

        if (data.parent) {
            if (!data.insertAt) {
                data.parent.appendChild(elem);
            } else {
                Base.insertElementAt(elem, data.parent, data.insertAt);
            }
        }

        if (data.content !== null && data.content !== undefined) {
            elem.innerHTML = data.content;
        }

        if (data.events) {
            for (let i = 0; i < data.events.length; i += 2) {
                elem.addEventListener(data.events[i], data.events[i + 1]);
            }
        }

        return elem;
    }

    /**
     * Adds mandatory icon in label.
     *
     * @param {Object} elem      The input element
     * @param {boolean} required If true, the value is required
     * @param {boolean} focus    If true, the element is focused
     * @param {Object} label     Label element
     * @param {string} msg       Message of label
     */
    static addMandatoryIcon(elem, required, focus, label, msg) {
        //Verify if element has value
        let value = Form.getValueByElement(elem);
        let hasValue = false;
        if (Array.isArray(value)) {
            if (value.length !== 0) {
                hasValue = true;
            }
        } else if (value !== "") {
            hasValue = true;
        }

        if (elem.disabled) {
            label.innerHTML = msg;
            if (required) {
                label.innerHTML += "*";
            }
        } else {
            //Adjust the color
            if (required && !hasValue) {
                label.innerHTML = "<span style='color:#b00020'>" + msg + "</span>";
            } else if (focus) {
                label.innerHTML = "<span style='color:rgba(98,0,238,0.87)'>" + msg + "</span>";
            } else {
                label.innerHTML = msg;
            }

            //Put the mandatory symbol
            if (required) {
                if (focus || !hasValue) {
                    label.innerHTML += "<span style='color:#b00020'>*</span>";
                } else {
                    label.innerHTML += "*";
                }
            }
        }
    }

    /**
     * Sets the background color according to the theme.
     *
     * @param {Object} source   Element that have the theme class (nothing, "s-theme-primary" or "s-theme-secondary")
     * @param {Object} target   Element that receives the colors
     * @param {boolean} primary If true and source hasn't "s-theme-primary" or "s-theme-secondary", uses the primary
     */
    static setBackgroundColorByTheme(source, target, primary) {
        if (source.classList.contains("s-theme-secondary")) {
            target.classList.add("mdc-theme--secondary-bg");
        } else if (primary === true || source.classList.contains("s-theme-primary")) {
            target.classList.add("mdc-theme--primary-bg");
        }
    }

    /**
     * Sets the text color according to the theme.
     *
     * @param {Object} source   Element that have the theme class (nothing, "s-theme-primary" or "s-theme-secondary")
     * @param {Object} target   Element that receives the colors
     * @param {boolean} surface If true, the text is on surface, otherwise is on background
     */
    static setTextColorByTheme(source, target, surface) {
        if (surface) {
            target.classList.add("mdc-theme--on-surface");
        } else if (source.classList.contains("s-theme-primary")) {
            target.classList.add("mdc-theme--on-primary");
        } else if (source.classList.contains("s-theme-secondary")) {
            target.classList.add("mdc-theme--on-secondary");
        }
    }

    /**
     * Sets the line color according to the theme.
     *
     * @param {Object} source Element that have the theme class (nothing, "s-theme-primary" or "s-theme-secondary")
     * @param {Object} target Element that receives the colors
     */
    static setLineColorByTheme(source, target) {
        if (source.classList.contains("s-theme-primary") || source.classList.contains("s-theme-secondary")) {
            target.classList.add("mdc-theme--background");
        }
    }

    /**
     * Transfers the classes of element to another element.
     *
     * @param {Object} source  The source element
     * @param {Object} destiny The destiny element
     */
    static transferClass(source, destiny) {
        let color = $(source).css("color");

        let classList = source.className.split(/\s+/);
        for (let i = 0; i < classList.length; i++) {
            if (!classList[i].startsWith("s-") && !classList[i].startsWith("mdc-")) {
                $(source).removeClass(classList[i]);
                $(destiny).addClass(classList[i]);
            }
        }

        $(source).css("color", color);
    }

    /**
     * Shows the message error of input component.
     *
     * @param {Object} input The input element
     */
    static showInputMessageError(input) {
        let type = Scaliby.getComponentType(input);

        if (type === Scaliby.COMPONENT_TYPE.CHECK_BOX || type === Scaliby.COMPONENT_TYPE.RADIO_BOX) {
            let container = input.component.getContainer();
            let msg = container.dataset.error;
            if (!msg) {
                Base.configElement(input.component.getErrorElement(), {content: "", styles: ["display", "none"]});
            } else {
                Base.configElement(input.component.getErrorElement(), {content: msg, styles: ["display", "block"]});
            }
        } else {
            let msg = input.dataset.error;
            if (!msg) {
                Base.configElement(input.component.getErrorElement(), {content: "", styles: ["display", "none"]});
            } else {
                Base.configElement(input.component.getErrorElement(), {content: msg, styles: ["display", "block"]});
            }
        }
    }

    /**
     * Shows the component.
     * If "data-visible" attribute is true, the component is displayed.
     *
     * @param {Object} elem The element of component
     */
    static showInputComponent(elem) {
        let component = Scaliby.getComponent(elem);
        if (component) {
            let type = Scaliby.getComponentType(elem);
            if (type === Scaliby.COMPONENT_TYPE.RADIO_BOX || type === Scaliby.COMPONENT_TYPE.CHECK_BOX) {
                elem = component.getContainer();
            }

            if (elem.dataset.visible === undefined) {
                elem.dataset.visible = "true";
            }

            if (elem.dataset.visible === "false") {
                component.getContainer().classList.add("hide-element");
            } else {
                component.getContainer().classList.remove("hide-element");
            }
        }
    }

    /**
     * Gets the cell element that contains the element
     *
     * @param {Object} elem The element
     *
     * @return {Object} the cell that contains the element. If null, cell not found.
     */
    static getCellOfField(elem) {
        let parent = elem;

        while (parent) {
            let list = parent.classList;
            for (let i = 0; i < list.length; i++) {
                if (list[i].indexOf("s-cell-") !== -1) {
                    return parent;
                }
            }
            parent = parent.parentNode;
        }

        return null;
    }

    /**
     * Gets the grid element that contains the element
     *
     * @param {Object} elem The element
     *
     * @return {Object} the grid that contains the element. If null, grid not found.
     */
    static getGridOfField(elem) {
        let parent = elem;

        while (parent) {
            let list = parent.classList;
            for (let i = 0; i < list.length; i++) {
                if (list[i] === "s-grid") {
                    return parent;
                }
            }
            parent = parent.parentNode;
        }

        return null;
    }

    /**
     * Inserts an element from the child index of the parent element.
     *
     * @param {Object} elem   Element be inserted
     * @param {Object} parent Parent that receives the element
     * @param {number} index  Position in list of children elements to insert
     */
    static insertElementAt(elem, parent, index) {
        if (index >= parent.children.length) {
            parent.appendChild(elem);
        } else {
            parent.insertBefore(elem, parent.children[index]);
        }
    }

    /**
     * Gets the position of the element within the set of parent elements.
     *
     * @param {Object} elem Element
     *
     * @return {number} the index of position (starts 0).
     */
    static getIndexOfElement(elem) {
        return $(elem).index();
    }

    /**
     * Get the first element that matches the selector by testing the element itself and traversing up through its
     * ancestors.
     *
     * @param {Object} elem     Starting point element
     * @param {string} selector CSS selector to match the element
     *
     * @return {Object} the closest element.
     */
    static getClosest(elem, selector) {
        if (!Element.prototype.matches) {
            Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.msMatchesSelector ||
                function(sel) {
                    let matches = (Base.document || Base.ownerDocument).querySelectorAll(sel),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {
                    }
                    return i > -1;
                };
        }

        //Get the closest matching element
        elem = elem.parentNode;
        for (; elem && elem !== document; elem = elem.parentNode) {
            if (elem.matches(selector)) {
                return elem;
            }
        }
        return null;
    }

    /**
     * Verifies if the element is inside another element and its children.
     *
     * @param {Object} elem   Element to be searched
     * @param {Object} target Target element that can have the element to search
     *
     * @return {boolean} true if target has element.
     */
    static hasElement(target, elem) {
        if (!target) {
            return false;
        }
        if (target === elem) {
            return true;
        } else if (!target.childNodes) {
            return false;
        }

        for (let i = 0 ; i < target.childNodes.length; i++) {
            if (target.childNodes[i] === elem) {
                return true;
            }
            if (this.hasElement(target.childNodes[i], elem) === true) {
                return true;
            }
        }

        return false;
    }

    /**
     * Executes a function by name.
     *
     * The optional parameters are used by the function to be executed.
     * Examples:
     * <ul>
     *   <li>executeFunctionByName("soma", 1, 2);</li>
     *   <li>executeFunctionByName("App.reset");</li>
     * </ul>
     *
     * @param {string} functionName Name of function
     */
    static executeFunctionByName(functionName) {
        let args = Array.prototype.slice.call(arguments, 1);
        let namespaces = functionName.split(".");
        let func = namespaces.pop();
        let context = window;
        for (let i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }

        return context[func].apply(context, args);
    }

}
