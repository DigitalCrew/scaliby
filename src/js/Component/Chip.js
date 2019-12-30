/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Compact element that allow users to enter information, select a choice, filter content, or trigger an action.
 *
 * @author Fernando Viegas
 */
class Chip {
    /** Element of component. */
    _elem;

    /** Element that contains the chip. */
    _chipset;

    /** Element that contains the button. */
    _gridcell;



    /** Image of component. */
    _divImage;

    /** Icon of component. */
    _divIcon;

    /** Text of component. */
    _divText;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();
        this._elem._mdc = new mdc.chips.MDCChipSet(this._chipset);
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

        //Create the chipset
        this._chipset = Base.createElement({
            tag: "div",
            classes: ["mdc-chip-set"],
            styles: ["display", "inline"],
            attrs: ["role", "grid"],
            parent: this._elem.parentNode,
            insertAt: Base.getIndexOfElement(this._elem)
        });

        //Configure the element
        Base.configElement(this._elem, {
            classes: ["mdc-chip"],
            attrs: ["role", "row"],
            parent: this._chipset
        });

        //Create the line ripple
        Base.createElement({
            tag: "div",
            classes: ["mdc-chip__ripple"],
            parent: this._elem
        });

        //Create the gridcell
        let gridcell = Base.createElement({
            tag: "span",
            attrs: ["role", "gridcell"],
            parent: this._elem
        });

        //Create the button
        this._button = Base.createElement({
            tag: "span",
            classes: ["mdc-chip__text"],
            attrs: ["role", "button"],
            parent: gridcell
        });

        //Final settings
        this._createMDC();
        this.update();
        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }
    }

    /**
     * Update the component.
     */
    update() {
        //Set icons, images and text
        this._button.innerHTML = "";

        if (this._elem.dataset.leftIcon) {
            let img = Scaliby.createIcon(this._elem.dataset.leftIcon);
            Base.configElement(img, {
                classes: ["mdc-chip__icon", "mdc-chip__icon--leading"],
                styles: ["font-size", "20px"],
                parent: this._button
            });
        }

        if (this._elem.dataset.leftImage) {
            this._divImage = Base.createElement({
                tag: "img",
                classes: ["chip-image"],
                attrs: ["src", this._elem.dataset.leftImage],
                parent: this._button
            });
        }

        Base.createElement({
            tag: "span",
            content: this._elem.dataset.text,
            parent: this._button
        });

        if (this._elem.dataset.rightImage) {
            this._divImage = Base.createElement({
                tag: "img",
                classes: ["chip-image"],
                attrs: ["src", this._elem.dataset.rightImage],
                parent: this._button
            });
        }

        if (this._elem.dataset.rightIcon) {
            let img = Scaliby.createIcon(this._elem.dataset.rightIcon);
            Base.configElement(img, {
                classes: ["mdc-chip__icon", "mdc-chip__icon--trailing"],
                styles: ["font-size", "20px"],
                parent: this._button
            });
        }

        //Adjust the tab index
        let component = this;
        setTimeout(function() {
            if (component._elem.tabIndex !== -2) {
                component._button.tabIndex = component._elem.tabIndex;
                component._elem.tabIndex = -2;
            }
        }, 100);
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

}