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

    /** Image of component. */
    _divImage;

    /** Icon of component. */
    _divIcon;

    /** Text of component. */
    _divText;


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
        this._elem.classList.add("mdc-chip");

        //Image on the left
        if (this._elem.dataset.image) {
            if (this._elem.dataset.align !== "right") {
                this._divImage = Base.createElement({
                    tag: "img",
                    attrs: ["src", this._elem.dataset.image],
                    parent: this._elem
                });
            }
        }

        //Icon on the left
        if (this._elem.dataset.icon) {
            if (this._elem.dataset.align !== "right") {
                this._divIcon = Scaliby.createIcon(this._elem.dataset.icon);
                Base.configElement(this._divIcon, {
                    classes: ["mdc-chip__icon", "mdc-chip__icon--leading"],
                    styles: ["font-size", "18px"],
                    parent: this._elem
                });
            }
        }

        //Text
        this._divText = Base.createElement({
            tag: "div",
            classes: ["mdc-chip__text"],
            parent: this._elem
        });

        //Icon on th right
        if (elem.dataset.icon) {
            if (this._elem.dataset.align === "right") {
                this._divIcon = Scaliby.createIcon(this._elem.dataset.icon);
                Base.configElement(this._divIcon, {
                    classes: ["mdc-chip__icon", "mdc-chip__icon--trailing"],
                    styles: ["font-size", "18px"],
                    parent: this._elem
                });
            }
        }

        //Image on the right
        if (elem.dataset.image) {
            if (this._elem.dataset.align === "right") {
                this._divImage = Base.createElement({
                    id: this._elem.id + "_divImage",
                    tag: "img",
                    parent: this._elem
                });
            }
        }

        //Focusable
        if (this._elem.dataset.focusable === "true") {
            this._elem.setAttribute("tabIndex", "0");
            this._elem.classList.add("mdc-chip-set--input");
        }

        //Adjust the parent to align a set of chips
        Base.configElement(this._elem.parentNode, {
            classes: ["chip-parent"]
        });

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
        this._divText.innerHTML = this._elem.dataset.text;
        if (this._divImage) {
            this._divImage.src = this._elem.dataset.image;
        }
    }

}