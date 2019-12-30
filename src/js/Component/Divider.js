/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * A thin line that groups content in lists and layouts.
 *
 * @author Fernando Viegas
 */
class Divider {
    /** Element of component. */
    _elem;


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
        let color = "#dfdfdf";
        if (this._elem.dataset.color) {
            color = this._elem.dataset.color;
        }

        let height = "1px";
        if (this._elem.dataset.height) {
            height = this._elem.dataset.height;
        }

        let border = height + " solid " + color;

        Base.configElement(this._elem, { styles: ["width", "100%", "border-top", border] });
    }

    /**
     * Clean up the component and MDC Web component.
     */
    destroy() {
    }

}