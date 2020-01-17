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
class FloatButton {
    /** Element of component. */
    _elem;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();
        this._elem._mdc = new mdc.ripple.MDCRipple(this._elem);
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
        this._elem.type = "button";
        this._elem.classList.add("mdc-fab");
        Base.setBackgroundColorByTheme(this._elem, this._elem, false);
        this._mdc = new mdc.ripple.MDCRipple(this._elem);

        if (this._elem.dataset.type === 'mini') {
            this._elem.classList.add("mdc-fab--mini");
        } else if (this._elem.dataset.type === 'extended') {
            this._elem.classList.add("mdc-fab--extended");
        }

        //Create the ripple
        Base.createElement({
            tag: "div",
            classes: ["mdc-fab__ripple"],
            parent: elem
        });

        //Create the icon
        if (this._elem.dataset.icon !== undefined) {
            let icon = Scaliby.createIcon(this._elem.dataset.icon);
            if (this._elem.dataset.icon.startsWith("x1-")) {
                Base.configElement(this._elem, { styles: ["top", "-2px"] });
            }

            if (this._elem.dataset.iconAlign === "right") {
                this._elem.appendChild(icon);
            } else {
                Base.insertElementAt(icon, this._elem, 0);
            }
        }

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
