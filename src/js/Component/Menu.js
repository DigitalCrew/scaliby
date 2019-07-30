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

    /** MDC framework. */
    _mdc;


    /**
     * Constructor.
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
        let divAnchor = Base.createElement({
            tag: "div",
            classes: ["mdc-menu-surface--anchor"],
            styles: ["display", "inline-block"],
            parent: parent,
            insertAt: index
        });
        if (elemOver) {
            Base.configElement(elemOver, {
                parent: divAnchor,
                insertAt: 0
            });
        }

        //Surface
        let divSurface = Base.createElement({
            tag: "div",
            classes: ["mdc-menu", "mdc-menu-surface"],
            attrs: ["tabindex", "-1"],
            parent: divAnchor
        });

        //Configure the "ul" element
        Base.configElement(this._elem, {
            classes: ["mdc-list"],
            attrs: ["aria-orientation", "vertical", "aria-hidden", "true", "role", "menu"],
            parent: divSurface
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
                    var rightIconClass = ["material-icons"];
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
        let divAnchor = null, divSurface = null, elemOver = null;

        if (this._elem.parentNode && this._elem.parentNode.classList.contains("mdc-menu-surface")) {
            //Element under surface and anchor
            divSurface = this._elem.parentNode;
            divAnchor = this._elem.parentNode.parentNode;

            if (!divAnchor.children[0].classList.contains("mdc-menu-surface")) {
                //Element Within Wrapper
                elemOver = divAnchor.children[0];
            }

            //Move out the element
            Base.configElement(this._elem, {
                parent: divAnchor.parentNode,
                insertAt: Base.getIndexOfElement(divAnchor)
            });
        }

        if (elemOver) {
            //There is an element within wrapper. Move out
            Base.configElement(elemOver, {
                parent: this._elem.parentNode,
                insertAt: Base.getIndexOfElement(this._elem)
            });

        }

        if (divAnchor) {
            //Remove elements
            divSurface.parentNode.removeChild(divSurface);
            divAnchor.parentNode.removeChild(divAnchor);
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
        //Create or recreate the MDCList
        if (this._mdc) {
            try {
                this._mdc.destroy();
            } catch (ex) {
            }
        }
        this._mdc = new mdc.menu.MDCMenu(this._elem.parentNode);
    }

    /**
     * Opens de menu.
     */
    open() {
        if (this._mdc.open === false) {
            this._mdc.open = true;
        }
    }

    /**
     * Closes de menu.
     */
    close() {
        if (this._mdc.open === true) {
            this._mdc.open = false;
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
     *   <li>command: Text of Keyboard command list (string);</li>
     *   <li>separator: if true, it is a separator. Only this attribute is necessary (boolean)</li>
     *   <li>onclick: Text of Javascript code to be executed when item is clicked (string);</li>
     * </ul>
     *
     * @param {json[]} items List of items. Each item is a Json
     */
    setItems(items) {
        //Destroy the MDC
        if (this._mdc !== null) {
            try {
                this._mdc.destroy();
                this._mdc = null;
            } catch (ex) {
            }
        }

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
            if (items[i].onclick) {
                li.codeOfClick = items[i].onclick;
                li.onclick = function () {
                    eval(this.codeOfClick);
                };
            }
        }

        //Recreate the component
        this._create(this._elem);
    }

}