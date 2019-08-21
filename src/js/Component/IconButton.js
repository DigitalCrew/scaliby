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
class IconButton {
    /** Element of component. */
    _elem;

    /** MDC framework. */
    _mdc;

    /** MDC of toggle effect. */
    _toggleButton = null;


    /**
     * Gets the state.
     *
     * @return {boolean} true if on, otherwise false.
     */
    getState() {
        return this._toggleButton.on;
    }

    /**
     * Sets the state.
     *
     * @param {boolean} value True if on, otherwise false
     */
    setState(value) {
        this._toggleButton.on = value;
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

        //Configure the element
        //this._elem.type = "button";
        //this._elem.classList.add("mdc-icon-button");
        //--mdc-ripple-fg-size:28px; --mdc-ripple-fg-scale:1.71429; --mdc-ripple-left:10px; --mdc-ripple-top:10px;
        Base.configElement(this._elem, {
            classes: ["mdc-icon-button"],
            attrs: ["type", "button"]
        });



        this._mdc = new mdc.ripple.MDCRipple(this._elem);
        this._mdc.unbounded = true;

        //Final settings
        this.update();
        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }

        //Issue not found! Without this style change, the ripple is not displayed when the mouse pointer is over the
        //icon, only after the first click
        setTimeout(function() {
            elem.style = "--mdc-ripple-fg-size:28px; --mdc-ripple-fg-scale:1.71429; --mdc-ripple-left:10px; " +
                "--mdc-ripple-top:10px;";
        }, 250);

    }

    /**
     * Update the component.
     */
    update() {
        //Clear the element
        this._elem.innerHTML = "";
        Base.setBackgroundColorByTheme(this._elem, this._elem, false);
        if (this._toggleButton !== null) {
            this._toggleButton.destroy();
        }

        if (this._elem.dataset.icon !== undefined) {
            if (!this._elem.dataset.iconOn) {
                //Only icon
                this._elem.classList.add("material-icons");
                this._elem.appendChild(Scaliby.createIcon(this._elem.dataset.icon));
            } else {
                let icon = Scaliby.createIcon(this._elem.dataset.icon);
                Base.configElement(icon, {
                    classes: ["mdc-icon-button__icon"],
                    parent: this._elem
                });
                icon = Scaliby.createIcon(this._elem.dataset.iconOn);
                Base.configElement(icon, {
                    classes: ["mdc-icon-button__icon", "mdc-icon-button__icon--on"],
                    parent: this._elem
                });

                this._toggleButton = new mdc.iconButton.MDCIconButtonToggle(this._elem);
            }
        }
    }

}