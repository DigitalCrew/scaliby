/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Allows users to take actions and make choices with a single tap.
 *
 * @author Fernando Viegas
 */
class Button {
    /** Element of component. */
    _elem;

    /** MDC framework. */
    _mdc;


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

        //Create the label
        let content = elem.innerHTML;
        elem.innerHTML = "";
        this._label = Base.createElement({
            tag: "span",
            classes: ["mdc-button__label"],
            content: content,
            parent: elem
        });

        //Configure the element
        Base.configElement(elem, {
            classes: ["mdc-button"],
            attrs: ["type", "button"]
        });

        Base.setBackgroundColorByTheme(elem, elem, false);
        this._mdc = new mdc.ripple.MDCRipple(elem);

        //Final settings
        this.update();
        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }
    }

    /**
     * Update the component.
     */
    update() {
        //Adjust the style
        this._elem.classList.remove("mdc-button--raised", "mdc-button--unelevated", "mdc-button--outlined");
        let modeClass = null;
        if (!this._elem.dataset.mode || this._elem.dataset.mode === "raised") {
            modeClass = "mdc-button--raised";
        } else if (this._elem.dataset.mode === "unelevated") {
            modeClass = "mdc-button--unelevated"
        } else if (this._elem.dataset.mode === "outlined") {
            modeClass = "mdc-button--outlined";
        }

        if (modeClass) {
            this._elem.classList.add(modeClass);
        }

        //Remove previous icons
        let icons = [];
        for (let i = 0; i < this._elem.children.length; i++) {
            if (this._elem.children[i].tagName === "I") {
                icons[icons.length] = this._elem.children[i];
            }
        }

        for (let i = 0; i < icons.length; i++) {
            this._elem.removeChild(icons[i]);
        }

        //Put icons
        if (this._elem.dataset.leftIcon) {
            Base.createElement({
                tag: "i",
                classes: ["material-icons", "mdc-button__icon"],
                attrs: ["aria-hidden", "true"],
                content: this._elem.dataset.leftIcon,
                parent: this._elem,
                insertAt: 0
            });
        }

        if (this._elem.dataset.rightIcon) {
            Base.createElement({
                tag: "i",
                classes: ["material-icons", "mdc-button__icon"],
                attrs: ["aria-hidden", "true"],
                content: this._elem.dataset.rightIcon,
                parent: this._elem
            });
        }
    }

}