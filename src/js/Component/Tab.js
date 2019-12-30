/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Organizes and allow navigation between groups of content that are related and at the same level of hierarchy.
 *
 * @author Fernando Viegas
 */
class Tab {
    /** Element of component. */
    _elem;

    /* Main element. */
    _main;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();
        this._elem._mdc = new mdc.tabBar.MDCTabBar(this._main);
    }

    /**
     * Shows the selected tab area.
     *
     * @private
     */
    _tabShowSelected() {
        let divs = this._getTabs(this._elem); //The first DIV is the tab buttons structure

        for (let i = 1; i < divs.length; i++) {
            if (divs[i].dataset.selected === "true") {
                divs[i].style.display = "block";

                //Adjust the listing components on the selected tab area
                let tables = divs[i].querySelectorAll("table.s-listing");
                for (let i = 0; i < tables.length; i++) {
                    if (tables[i].component) {
                        tables[i].component.update();
                    }
                }
            } else {
                divs[i].style.display = "none";
            }
        }
    };

    /**
     * Gets the list of div elements that represents the tabs.
     *
     * @private
     */
    _getTabs() {
        let list = this._elem.children;
        let divs = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].tagName === "DIV") {
                divs[divs.length] = list[i];
            }
        }
        return divs;
    };


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
        let tab = this;

        //Create tab bar
        this._main = Base.createElement({
            tag: "div",
            classes: ["mdc-tab-bar"],
            attrs: ["role", "tablist"]
        });

        //Create the scroller
        let divScroller = Base.createElement({
            tag: "div",
            classes: ["mdc-tab-scroller"],
            parent: this._main
        });

        //Create the content area
        let divArea = Base.createElement({
            tag: "div",
            classes: ["mdc-tab-scroller__scroll-area", "mdc-tab-scroller__scroll-area--scroll"],
            parent: divScroller
        });

        let divContent = Base.createElement({
            tag: "div",
            classes: ["mdc-tab-scroller__scroll-content"],
            parent: divArea
        });

        //Discover the selected tab
        let divs = this._getTabs();
        let selected = 0;
        for (let i = 0; i < divs.length; i++) {
            if (divs[i].dataset.selected === "true") {
                selected = i;
                break;
            }
        }

        //Create the tab buttons
        for (let i = 0; i < divs.length; i++) {
            let button = Base.createElement({
                tag: "button",
                classes: ["mdc-tab"],
                attrs: ["role", "tab",
                    "aria-selected", i === selected ? "true" : "false",
                    "tabindex", i === selected ? "0" : "-1"]
            });
            button.index = i + 1;
            if (i === selected) {
                button.classList.add("mdc-tab--active");
            }
            Base.setBackgroundColorByTheme(elem, button, false);
            button.addEventListener("click", function (event) {
                let divs = tab._getTabs();
                for (let i = 1; i < divs.length; i++) {
                    divs[i].dataset.selected = "false";
                }
                divs[event.currentTarget.index].dataset.selected = "true";
                tab._tabShowSelected();
            });

            let spanContent = Base.createElement({
                tag: "span",
                classes: ["mdc-tab__content"],
                parent: button
            });

            let spanLabel = null;
            if (divs[i].dataset.title) {
                spanLabel = Base.createElement({
                    tag: "span",
                    classes: ["mdc-tab__text-label"],
                    content: divs[i].dataset.title
                });
                Base.setTextColorByTheme(this._elem, spanLabel, false);
            }

            let spanIcon = null;
            if (divs[i].dataset.icon) {
                // spanIcon = Base.createElement({
                //     tag: "span",
                //     classes: ["mdc-tab__icon", "material-icons"],
                //     content: !divs[i].dataset.icon ? "" : divs[i].dataset.icon
                // });
                spanIcon = Scaliby.createIcon(!divs[i].dataset.icon ? "" : divs[i].dataset.icon);

                Base.setTextColorByTheme(this._elem, spanIcon, false);
            }

            if (divs[i].dataset.iconAlign === "right") {
                if (spanLabel !== null) {
                    spanContent.appendChild(spanLabel);
                }
                if (spanIcon !== null) {
                    spanContent.appendChild(spanIcon);
                }
            } else {
                if (spanIcon !== null) {
                    spanContent.appendChild(spanIcon);
                }
                if (spanLabel !== null) {
                    spanContent.appendChild(spanLabel);
                }
            }

            let spanIndicator = Base.createElement({
                tag: "span",
                classes: ["mdc-tab-indicator"],
                parent: button
            });
            if (i === selected) {
                spanIndicator.classList.add("mdc-tab-indicator--active");
            }
            Base.setTextColorByTheme(this._elem, spanIndicator, false);

            let spanUnderline = Base.createElement({
                tag: "span",
                classes: ["mdc-tab-indicator__content", "mdc-tab-indicator__content--underline"],
                parent: spanIndicator
            });
            Base.setLineColorByTheme(this._elem, spanUnderline);

            Base.createElement({
                tag: "span",
                classes: ["mdc-tab__ripple", "mdc-ripple-upgraded"],
                parent: button
            });
            divContent.appendChild(button);
        }

        //Adjust the areas of content
        for (let i = 0; i < divs.length; i++) {
            divs[i].style.display = "none";
        }

        //Create the component
        this._elem.insertBefore(this._main, this._elem.firstChild);
        this._createMDC();

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
        //Show the selected content tab
        this._tabShowSelected();
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
     * Sets the selected tab.
     *
     * @param index Index of tab
     */
    setSelectedTab(index) {
        let divs = this._getTabs();
        for (let i = 1; i < divs.length; i++) {
            divs[i].dataset.selected = "false";
        }
        divs[index + 1].dataset.selected = "true";
        this._tabShowSelected();
    }

}
