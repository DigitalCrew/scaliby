/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Creates and configures the loading spinner that informs the user that needs to wait until data is loaded.
 *
 * @author Fernando Viegas
 */
class LoadingSpinner {
    /**
     * Disables the focus of elements and builds a list of disabled focus elements.
     * <br>
     * The structure of each list item:
     * <ul>
     *   <li>elem: Element with disabled focus (Object);</li>
     *   <li>tabIndex: The original value (int).</li>
     * </ul>
     *
     * @param {Object} elem Element with another elements
     *
     * @return {Array} a list of disabled focus elements.
     *
     * @private
     */
    static _disableFocus(elem) {
        let list = [];
        let elems = elem.getElementsByTagName("*");

        if (elem.tabIndex > -1) {
            list[0] = { elem: elem, tabIndex: elem.tabIndex };
            elem.tabIndex = -1;
        }

        for (let i = 0; i < elems.length; i++) {
            if (elems[i].tabIndex > -1) {
                list[list.length] = { elem: elems[i], tabIndex: elems[i].tabIndex };
                elems[i].tabIndex = -1;
            }
        }

        return list;
    }

    /**
     * Enables the focus of elements.
     *
     * @param {Object} elems List o structure of locked elements. See Comm._disableFocus()
     *
     * @private
     */
    static _enableFocus(elems) {
        for (let i = 0; i < elems.length; i++) {
            elems[i].elem.tabIndex = elems[i].tabIndex;
        }
    }

    /**
     * Creates the loading spinner component. Because this method has the element that receives the spinner, size and
     * position are automatically calculated.
     *
     * @param {Object} elem The element that receives the spinner
     *
     * @returns {Object} element of loading spinner.
     */
    static _createWithAutoSizeAndPosition(elem) {
        //Create the loading spinner component
        let size = this._defineSize(elem);
        let spinner = LoadingSpinner.create(size);
        spinner.lastElemOffsetWidth = elem.offsetWidth;
        spinner.lastElemOffsetHeight = elem.offsetHeight;
        Base.configElement(spinner, {
            styles: [
                "position", "absolute",
                "left", (elem.offsetLeft + (elem.offsetWidth / 2) - size) + "px",
                "top", (elem.offsetTop + (elem.offsetHeight / 2) - size) + "px",
                "z-index", 2000001
            ],
            parent: elem.parentNode
        });

        //Monitors spinner to adjust size and position
        spinner.funcInterval = setInterval(function() {
            if (spinner.lastElemOffsetWidth !== elem.offsetWidth ||
                spinner.lastElemOffsetHeight !== elem.offsetHeight) {
                let size = LoadingSpinner._defineSize(elem);
                spinner.innerHTML = LoadingSpinner._getSvg(size);

                spinner.lastElemOffsetWidth = elem.offsetWidth;
                spinner.lastElemOffsetHeight = elem.offsetHeight;
                Base.configElement(spinner, {
                    styles: [
                        "left", (elem.offsetLeft + (elem.offsetWidth / 2) - size) + "px",
                        "top", (elem.offsetTop + (elem.offsetHeight / 2) - size) + "px"
                    ]
                });
            }
        }, 200);

        return spinner;
    }

    /**
     * Defines the size of spinner from size of element that contains the spinner.
     *
     * @param {Object} elem The element that contains the spinner
     *
     * @return {number} the size of spinner in pixels.
     *
     * @private
     */
    static _defineSize(elem) {
        if (elem.offsetHeight > 200 && elem.offsetWidth > 200) {
            return 64;
        } else if (elem.offsetHeight > 64 && elem.offsetWidth > 64) {
            return 32;
        } else if (elem.offsetHeight > 32 && elem.offsetWidth > 32) {
            return  16;
        } else {
            return  8;
        }
    }

    /**
     * Get text of svg element.
     *
     * @param {number} size Size in pixels of element
     *
     * @return {string} text of svg element.
     *
     * @private
     */
    static _getSvg(size) {
        return "<svg class='spinner' width='" + size + "px' height='" + size + "px' viewBox='0 0 66 66'>" +
            "<circle class='spinner-path' fill='none' stroke-width='6' stroke-linecap='round' " +
            "cx='33' cy='33' r='30'></circle></svg>"
    }


    /**
     * Creates the loading spinner component.
     *
     * @param {number} size The size of spinner:
     *                      1- Small;
     *                      2- Normal;
     *                      3- Large.
     *
     * @returns {Object} element of loading spinner.
     */
    static create(size) {
        let pixels;
        switch (size) {
            case 1:
                pixels = 16;
                break;

            case 2:
                pixels = 32;
                break;

            default:
                pixels = 64;
        }

        let span = document.createElement("span");
        span.innerHTML = LoadingSpinner._getSvg(pixels);
        return span;
    }

    /**
     * Creates the loading spinner component and locks the elements that waiting data from server.
     *
     * @param {Array} elems The elements to be locked
     *
     * @return {Array|null} list of locked elements, or null if nothing locked. This array is used to unlock elements
     * when the data is received from unlockElements() method.
     * <br>
     * The structure of each list item:
     * <ul>
     *   <li>{Object} elem - The locked element. If empty, don't lock. If null, locks the body;</li>
     *   <li>{Object} spinner - the spinner element;</li>
     *   <li>{Object} tabIndexList - List with elements with disabled focus. See Comm._disableFocus().</li>
     * </ul>
     */
    static createAndlockElements(elems) {
        if (document.activeElement) {
            document.activeElement.blur();
        }

        if (!elems) {
            return null;
        }

        let list = [];
        for (let i = 0; i < elems.length; i++) {
            let locked = {};

            if (typeof elems[i] === "string") {
                locked.elem = document.getElementById(elems[i]);
            } else {
                locked.elem = elems[i];
            }

            locked.elem.classList.add("spinner-overlay");

            locked.spinner = LoadingSpinner._createWithAutoSizeAndPosition(locked.elem);
            locked.tabIndexList = LoadingSpinner._disableFocus(locked.elem);
            list[list.length] = locked;
        }

        return list;
    }

    /**
     * Unlocks the elements by lockElements() method.
     *
     * @param {Array} elems List o structure of locked elements
     */
    static unlockElements(elems) {
        if (!elems) {
            return;
        }

        for (let i = 0; i < elems.length; i++) {
            try {
                elems[i].elem.classList.remove("spinner-overlay");
            } catch (error) {
            }

            try {
                clearInterval(elems[i].spinner.funcInterval);
                elems[i].spinner.parentNode.removeChild(elems[i].spinner);
            } catch (error) {
            }

            try {
                Comm._enableFocus(elems[i].tabIndexList);
            } catch (error) {
            }
        }
    }

}
