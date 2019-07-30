/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Builds the layout of page with header, sidebar, content and footer.
 *
 * @author Fernando Viegas
 */
class Layout {
    /** Element of component. */
    _elem;

    /** MDC framework. */
    _mdc;

    /** Sidebar element. */
    _sidebar;


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

        //Sidebar
        this._sidebar = elem.querySelector("aside");
        if (this._sidebar !== undefined) {
            Base.configElement(this._sidebar, {
                classes: ["mdc-drawer", "mdc-drawer--dismissible"],
                styles: ["opacity", "0"]
            });
        }

        let sidebarHeader = this._elem.querySelector(".s-layout-sidebar-header");
        if (sidebarHeader !== undefined) {
            Base.configElement(sidebarHeader, {
                classes: ["mdc-drawer__header"]
            });
        }

        let sidebarContent = this._elem.querySelector(".s-layout-sidebar-content");
        if (sidebarContent !== undefined) {
            Base.configElement(sidebarContent, {
                classes: ["mdc-drawer__content"]
            });

            //Only for Modal to Work
            Base.createElement({
                tag: "a",
                attrs: ["tabindex", "0"],
                parent: sidebarContent
            });
        }

        //AppContent that contains header, content and footer
        let appContent = Base.createElement({
            tag: "div",
            classes: ["mdc-drawer-app-content"],
            styles: ["height", "100%"],
            parent: elem,
            insertAt: 1 //After "aside"
        });
        this._elem.appContent = appContent;

        //Header
        let header = this._elem.querySelector("header");
        if (header) {
            Base.configElement(header, {
                classes: ["mdc-top-app-bar"],
                parent: appContent
            });
            if (Scaliby.isIE()) {
                Base.configElement(header, {styles: ["position", "relative"]});
            }

            let divRow = Base.createElement({
                tag: "div",
                classes: ["mdc-top-app-bar__row"],
                styles: ["height", "inherit"],
            });

            let divSection = Base.createElement({
                tag: "section",
                classes: ["mdc-top-app-bar__section", "mdc-top-app-bar__section--align-start"],
                parent: divRow,
            });

            let list = [];
            for (let i = 0; i < header.childNodes.length; i++) {
                list[i] = header.childNodes[i];

            }
            for (let i = 0; i < list.length; i++) {
                let elem = list[i];
                elem.parentNode.removeChild(elem);
                divSection.appendChild(elem);
            }
            header.appendChild(divRow);

            //Menu button
            let button = Base.createElement({
                tag: "a",
                classes: ["material-icons", "mdc-icon-button"],
                attrs: ["href", "#"],
                content: "menu",
                parent: divSection,
                insertAt: 0
            });
            button.addEventListener("click", function () {
                elem.component._mdc.open = !elem.component._mdc.open;
            });
        }

        //Content
        let content = this._elem.querySelector("main");
        Base.configElement(content, {
            classes: ["mdc-top-app-bar--fixed-adjust"],
            styles: ["height", "100%"],
            parent: appContent
        });

        //Footer
        let footer = this._elem.querySelector("footer");
        if (footer) {
            Base.configElement(footer, {
                classes: ["footer"],
                styles: ["opacity", "0"],
                parent: elem.parentNode,
                insertAt: Base.getIndexOfElement(elem) + 1
            });
            this._elem.footer = footer;
        }

        //Events
        document.body.addEventListener('MDCDrawer:closed', function () {
            elem.footer.style.marginLeft = "0";
        });

        document.body.addEventListener('MDCDrawer:opened', function () {
            if (elem.dataset.type === "removable") {
                elem.footer.style.marginLeft = elem.component._sidebar.offsetWidth + "px";
            }
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
        if (this._elem.dataset.type === "removable") {
            //Drawer is removable type
            this._sidebar.classList.remove("mdc-drawer--modal");
            this._sidebar.classList.add("mdc-drawer--dismissible");

            //It haven't overlay on the app content
            if (this._elem.children[1].classList.contains("mdc-drawer-scrim")) {
                this._elem.removeChild(this._elem.children[1]);
            }
        } else if (this._elem.dataset.type === "modal") {
            //Drawer is modal type
            this._sidebar.classList.remove("mdc-drawer--dismissible");
            this._sidebar.classList.add("mdc-drawer--modal");

            //It have overlay on the app content
            if (!this._elem.children[1].classList.contains("mdc-drawer-scrim")) {
                Base.createElement({
                    tag: "div",
                    classes: ["mdc-drawer-scrim"],
                    parent: this._elem,
                    insertAt: 1
                });
            }
        }

        //Create or recreate the MDCDrawer
        if (this._mdc !== null) {
            try {
                this._mdc.destroy();
            } catch (ex) {
            }
        }
        this._mdc = new mdc.drawer.MDCDrawer(this._sidebar);

        //Adjust the height of content area
        let elem = this._elem;
        setTimeout(function () {
            if (elem.footer) {
                elem.style.minHeight = "calc(100% - " + elem.footer.offsetHeight + "px)";
                elem.style.opacity = "1";
                elem.footer.style.opacity = "1";
                elem.component._sidebar.style.opacity = "1";
            }
        }, 100);
    }

    /**
     * Opens the drawer.
     */
    openDrawer() {
        this._mdc.open = true;
    }

    /**
     * Closes the drawer.
     */
    closeDrawer() {
        this._mdc.open = false;
    }

    /**
     * Closes the drawer if is modal.
     */
    closeDrawerIfModal() {
        if (this._elem.dataset.type === "modal") {
            this.closeDrawer();
        }
    }

    /**
     * Opens the drawer if is removable.
     */
    openDrawerIfRemovable() {
        if (this._elem.dataset.type === "removable") {
            this.openDrawer();
        }
    }

}