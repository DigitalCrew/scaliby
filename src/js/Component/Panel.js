/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Simple content container.
 *
 * @author Fernando Viegas
 */
class Panel {
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

        //Configure the main div
        Base.configElement(this._elem, {
            classes: ["mdc-elevation--z2", "mdc-theme--background"]
        });

        if (this._elem.dataset.title) {
            //Create the title
            let divTitle = Base.createElement({
                tag: "div",
                classes: ["mdc-typography"],
                styles: ["font-size", "110%", "padding", "10px"],
                content: this._elem.dataset.title,
                parent: this._elem,
                insertAt: 0
            });
            Base.setBackgroundColorByTheme(this._elem, divTitle, false);
            Base.setTextColorByTheme(this._elem, divTitle)
        }

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
    }

}