/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 *  Displays a list of choices on a temporary surface. They appear when users interact with a button, action, or other
 *  control.
 *
 * @author Fernando Viegas
 */
class Menu {
    /** Element of component. */
    _elem;

    /* Main element. */
    _main;

    /* Anchor element. */
    _anchor;


    /**
     * Creates the MDC component.
     *
     * @private
     */
    _createMDC() {
        this.destroy();

        this._elem._mdc = new mdc.menu.MDCMenu(this._main);
        this._elem._mdc.setDefaultFocusState(2);
        this._elem.component = this;

        this._main.elem = this._elem;
        this._elem._mdc.listen("MDCMenu:selected", this._selectedEvent);
    }

    /**
     * Component event listener of selected item.
     * Observation: this = main element.
     *
     * @param {json} data
     *
     * @private
     */
    _selectedEvent(data) {
        let component = this.elem.component;

        if (component._elem._mdc !== null) {
            let item = data.detail.item;
            if (!item.classList.contains("mdc-list-item--disabled") && item.onselected) {
                if (typeof item.onselected === "string") {
                    eval(item.onselected);
                } else {
                    item.onselected();
                }
            }
        }
    }

    /**
     * Disable or enable an item.
     * Observation: Workaround when item is disabled.
     *
     * @param {Object} li     Item element
     * @param {boolean} state If true, disable the element, otherwise enable it
     *
     * @private
     */
    _disableItem(li, state) {
        if (state === true) {
            li.classList.remove("mdc-list-item");
            li.classList.add("mdc-list-item--disabled");
            li.classList.add("list-item-disabled");
        } else {
            li.classList.remove("mdc-list-item--disabled");
            li.classList.remove("list-item-disabled");
            li.classList.add("mdc-list-item");
        }
    }

    /**
     * Create the component.
     *
     * @param {object} elem Input element of component
     *
     * @private
     */
    _create(elem) {
        elem.component = this;
        this._elem = elem;

        this._removeAnchorAndSurface();

        let index = Base.getIndexOfElement(this._elem);
        let parent = this._elem.parentNode;
        let elemOver = null;
        if (this._elem.dataset.over) {
            //Put menu under this element
            elemOver = document.getElementById(this._elem.dataset.over);
            index = Base.getIndexOfElement(elemOver);
            parent = elemOver.parentNode;
        }

        //Anchor
        this._anchor = Base.createElement({
            tag: "div",
            classes: ["mdc-menu-surface--anchor"],
            styles: ["display", "inline-block"],
            parent: parent,
            insertAt: index
        });
        if (elemOver) {
            Base.configElement(elemOver, {
                parent: this._anchor,
                insertAt: 0
            });
        }

        //Surface
        this._main = Base.createElement({
            tag: "div",
            classes: ["mdc-menu", "mdc-menu-surface"],
            attrs: ["tabindex", "-1"],
            parent: this._anchor
        });

        //Configure the "ul" element
        Base.configElement(this._elem, {
            classes: ["mdc-list"],
            attrs: ["aria-orientation", "vertical", "aria-hidden", "true", "role", "menu"],
            parent: this._main
        });

        //List of "li"
        let items = [];
        for (let i = 0; i < this._elem.children.length; i++) {
            items[i] = this._elem.children[i];
        }

        let imgClass;
        for (let i = 0; i < items.length; i++) {
            if (items[i].tagName === "LI") {
                if (items[i].dataset.type === "separator") {
                    //Separator
                    Base.createElement({
                        tag: "hr",
                        classes: ["mdc-list-divider"],
                        attrs: ["role", "separator"],
                        content: items[i].innerHTML,
                        parent: this._elem,
                        insertAt: Base.getIndexOfElement(items[i])
                    });
                    items[i].parentNode.removeChild(items[i]);
                    continue;
                }

                //Configure the "li" element
                let text = items[i].innerHTML;
                Base.configElement(items[i], {
                    classes: ["mdc-list-item"],
                    attrs: ["role", "menuitem"],
                    content: ""
                });
                if (items[i].dataset.disabled === "true") {
                    this._disableItem(items[i], true);
                }

                //Left Image
                if (items[i].dataset.leftImg) {
                    if (this._elem.dataset.leftImgClass) {
                        imgClass = [this._elem.dataset.leftImgClass];
                    }

                    Base.createElement({
                        tag: "img",
                        classes: imgClass,
                        attrs: ["src", items[i].dataset.leftImg],
                        parent: items[i]
                    });
                }

                //Left icon
                if (items[i].dataset.leftIcon) {
                    let leftIconClass = ["material-icons"];
                    if (elem.dataset.leftIconClass) {
                        leftIconClass[leftIconClass.length] = elem.dataset.leftIconClass;
                    } else {
                        leftIconClass[leftIconClass.length] = "mdc-list-item__graphic";
                    }

                    Base.configElement(Scaliby.createIcon(items[i].dataset.leftIcon), {
                            classes: leftIconClass,
                            attrs: ["aria-hidden", "true"],
                            parent: items[i]
                    });
                }

                let span = Base.createElement({
                    tag: "span",
                    classes: ["mdc-list-item__text"],
                    parent: items[i]
                });

                //Adjust the text
                Base.createElement({
                    tag: "span",
                    classes: ["mdc-list-item__text"],
                    content: text,
                    parent: span
                });

                //Right icon
                if (items[i].dataset.rightIcon) {
                    let rightIconClass = ["material-icons"];
                    if (elem.dataset.leftIconClass) {
                        rightIconClass[rightIconClass.length] = this._elem.dataset.leftIconClass;
                    } else {
                        rightIconClass[rightIconClass.length] = "mdc-list-item__meta";
                    }

                    Base.configElement(Scaliby.createIcon(items[i].dataset.rightIcon), {
                            classes: rightIconClass,
                            attrs: ["aria-hidden", "true"],
                            parent: items[i]
                    });
                }

                //Right Image
                if (items[i].dataset.rightImg) {
                    if (this._elem.dataset.rightImgClass) {
                        imgClass = [this._elem.dataset.rightImgClass];
                    }

                    Base.createElement({
                        tag: "img",
                        classes: imgClass,
                        attrs: ["src", items[i].dataset.rightImg],
                        parent: items[i]
                    });
                }

                //Keyboard command list
                if (items[i].dataset.command) {
                    Base.createElement({
                        tag: "span",
                        classes: ["mdc-list-item__meta"],
                        styles: ["color", "rgba(0,0,0,0.38)"],
                        attrs: ["aria-hidden", "true"],
                        content: items[i].dataset.command,
                        parent: items[i]
                    });
                }

                //Event when item is selected
                if (items[i].dataset.onselected) {
                    items[i].onselected = items[i].dataset.onselected;
                }
            }
        }

        //Final settings
        this.update();
    }

    /**
     * Removes the anchor and surface elements.
     *
     * @private
     */
    _removeAnchorAndSurface() {
        let elemOver = null;

        if (this._elem.parentNode && this._elem.parentNode.classList.contains("mdc-menu-surface")) {
            //Element under surface and anchor
            this._main = this._elem.parentNode;
            this._anchor = this._elem.parentNode.parentNode;

            if (!this._anchor.children[0].classList.contains("mdc-menu-surface")) {
                //Element Within Wrapper
                elemOver = this._anchor.children[0];
            }

            //Move out the element
            Base.configElement(this._elem, {
                parent: this._anchor.parentNode,
                insertAt: Base.getIndexOfElement(this._anchor)
            });
        }

        if (elemOver) {
            //There is an element within wrapper. Move out
            Base.configElement(elemOver, {
                parent: this._elem.parentNode,
                insertAt: Base.getIndexOfElement(this._elem)
            });

        }

        if (this._anchor) {
            //Remove elements
            this._main.parentNode.removeChild(this._main);
            this._anchor.parentNode.removeChild(this._anchor);
        }
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

        this._create(elem);

        if (this._elem.dataset.oncreated) {
            eval(this._elem.dataset.oncreated);
        }
    }

    /**
     * Update the component.
     */
    update() {
        this.destroy();
        this._createMDC();
    }

    /**
     * Clean up the component and MDC Web component.
     */
    destroy() {
        if (this._elem._mdc) {
            try {
                this._elem._mdc.unlisten("MDCMenu:selected", this._selectedEvent);
                this._elem._mdc.destroy();
                this._elem._mdc = null;
            } catch (ex) {
            }
        }
    }

    /**
     * Opens de menu.
     */
    open() {
        if (this._elem._mdc.open === false) {
            this._elem._mdc.open = true;
        }
    }

    /**
     * Closes de menu.
     */
    close() {
        if (this._elem._mdc.open === true) {
            this._elem._mdc.open = false;
        }
    }

    /**
     * Defines the items of menu.
     * <br>
     * Syntax of item JSON:
     * <ul>
     *   <li>text: The text of item (string);</li>
     *   <li>leftIcon: Icon name of left side (string);</li>
     *   <li>rightIcon: Icon name of right side (string);</li>
     *   <li>leftImg: Image source of left side (string);</li>
     *   <li>rightImg: Image source of right side (string);</li>
     *   <li>disabled: If true, the item is disabled (boolean);</li>
     *   <li>command: Text of Keyboard command list (string);</li>
     *   <li>separator: if true, it is a separator. Only this attribute is necessary (boolean)</li>
     *   <li>onselected: Javascript text or function to be called when item is selected by click or
     *                   SPACE/ENTER key (string|function).</li>
     * </ul>
     *
     * @param {json[]} items List of items. Each item is a Json
     */
    setItems(items) {
        //Build the items
        this._elem.innerHTML = "";
        for (let i = 0; i < items.length; i++) {
            let li = Base.createElement({
                tag: "li",
                parent: this._elem
            });

            if (items[i].separator === true) {
                li.dataset.type = "separator";
                continue;
            }

            li.innerHTML = items[i].text;
            if (items[i].leftIcon) {
                li.dataset.leftIcon = items[i].leftIcon;
            }
            if (items[i].rightIcon) {
                li.dataset.rightIcon = items[i].rightIcon;
            }
            if (items[i].leftImg) {
                li.dataset.leftImg = items[i].leftImg;
            }
            if (items[i].rightImg) {
                li.dataset.rightImg = items[i].rightImg;
            }
            if (items[i].command) {
                li.dataset.command = items[i].command;
            }
            if (items[i].disabled === true) {
                li.dataset.disabled = "true";
            }
            if (items[i].onselected) {
                li.onselected = items[i].onselected;
            }
        }

        //Recreate the component
        this._create(this._elem);
    }

}