/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * This component is a spec-aligned linear progress indicator component.
 *
 * @author Fernando Viegas
 */
class Progress {
    /** Element of component. */
    _elem;

    /** Container of elements. */
    _container;

    /** Progress of bar (0 - 1). */
    _progress = 0;

    /** If true, the component is visible. */
    _visible = true;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();
        this._elem._mdc = new mdc.linearProgress.MDCLinearProgress(this._elem);
    }

    /**
     * Constructor.
     *
     * @param {Element} elem element of component
     */
    constructor(elem) {
        if (elem.component) {
            return;
        }
        elem.component = this;
        this._elem = elem;

        //Configure the element
        Base.configElement(this._elem, {
            classes: ["div-container", "mdc-linear-progress"],
            attrs: ["role", "progressbar"]
        });

        //Buffering dots
        Base.createElement({
            tag: "div",
            classes: ["mdc-linear-progress__buffering-dots"],
            parent: this._elem
        });

        //Buffer
        Base.createElement({
            tag: "div",
            classes: ["mdc-linear-progress__buffer"],
            parent: this._elem
        });

        //Primary Bar
        let divPrimary = Base.createElement({
            tag: "div",
            classes: ["mdc-linear-progress__bar", "mdc-linear-progress__primary-bar"],
            parent: this._elem
        });

        //Primary Inner
        Base.createElement({
            tag: "span",
            classes: ["mdc-linear-progress__bar-inner"],
            parent: divPrimary
        });

        //Secondary bar
        let divSecondary = Base.createElement({
            tag: "div",
            classes: ["mdc-linear-progress__bar", "mdc-linear-progress__secondary-bar"],
            parent: this._elem
        });

        //Secondary Inner
        Base.createElement({
            tag: "span",
            classes: ["mdc-linear-progress__bar-inner"],
            parent: divSecondary
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
        this._elem._mdc.progress = this._progress;
        if (this._elem.dataset.buffering) {
            this._elem._mdc.buffer = this._elem.dataset.buffering;
        }
        if (this._elem.dataset.indeterminate === "true") {
            this._elem.classList.add("mdc-linear-progress--indeterminate");
        } else {
            this._elem.classList.remove("mdc-linear-progress--indeterminate");
        }
        if (this._elem.dataset.reversed === "true") {
            this._elem.classList.add("mdc-linear-progress--reversed");
        } else {
            this._elem.classList.remove("mdc-linear-progress--reversed");
        }
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

    /**
     * Gets the container of elements.
     *
     * @return {Element} the container.
     */
    getContainer() {
        return this._elem;
    }

    /**
     * Sets the progress of bar.
     *
     * @param {number} value Value of progress (0 - 1)
     */
    setProgress(value) {
        this._elem._mdc.progress = value;
    }

    /**
     * Shows the bar.
     */
    show() {
        this._elem._mdc.open();
        this._visible = true;
    }

    /**
     * Hides the bar.
     */
    hide() {
        this._elem._mdc.close();
        this._visible = false;
    }

    /**
     * Informs if the bar is visible.
     *
     * @return {boolean} If true, the component is visible.
     */
    isVisible() {
        return this._visible;
    }

}