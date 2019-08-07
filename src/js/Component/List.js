/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * It is continuous, vertical indexes of text or images.
 *
 * @author Fernando Viegas
 */
class List {
    /** Element of component. */
    _elem;

    /** MDC framework. */
    _mdc;


    /**
     * Creates the component.
     *
     * @param {object} elem Input element of component
     *
     * @private
     */
    _create(elem) {
        elem.component = this;
        this._elem = elem;

        //Configure the "ul" element
        Base.configElement(this._elem, {
            classes: ["mdc-list"],
            attrs: ["aria-orientation", "vertical"]
        });

        //List of "li"
        let items = [];
        for (let i = 0; i < this._elem.children.length; i++) {
            items[i] = this._elem.children[i];
        }

        let itemClass = ["mdc-list-item"];
        if (this._elem.dataset.itemClass) {
            itemClass[1] = this._elem.dataset.itemClass;
        }

        let imgClass;
        let withinSublist = 0;
        let hasSecondaryText = this._elem.querySelector("hr") !== null;
        let leftPadding = "";
        for (let i = 0; i < items.length; i++) {
            if (items[i].tagName === "LI") {
                if (items[i].dataset.type === "group") {
                    //Group
                    Base.createElement({
                        tag: "h3",
                        classes: ["mdc-list-group__subheader"],
                        styles: ["opacity", "0.7"],
                        content: items[i].innerHTML,
                        parent: this._elem,
                        insertAt: Base.getIndexOfElement(items[i])
                    });
                    items[i].parentNode.removeChild(items[i]);
                    continue;
                } else if (items[i].dataset.type === "separator") {
                    //Separator
                    Base.createElement({
                        tag: "hr",
                        classes: ["mdc-list-divider"],
                        content: items[i].innerHTML,
                        parent: this._elem,
                        insertAt: Base.getIndexOfElement(items[i])
                    });
                    items[i].parentNode.removeChild(items[i]);
                    continue;
                }

                //Get content of "li" and split in primary text and secondary text
                let primaryText = items[i].innerHTML;
                let secondaryText = null;
                let indexHr = primaryText.indexOf("<hr>");
                if (indexHr !== -1) {
                    secondaryText = primaryText.substr(indexHr + 4);
                    primaryText = primaryText.substr(0, indexHr);
                }

                //Configure the "li" element
                Base.configElement(items[i], {
                    classes: itemClass,
                    content: ""
                });

                if (items[i].dataset.selected === "true") {
                    Base.configElement(items[i], {
                        classes: ["mdc-list-item--selected"],
                        attrs: ["aria-selected", "true", "tabindex", "0"]
                    });
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
                    if (this._elem.dataset.leftIconClass) {
                        leftIconClass[leftIconClass.length] = this._elem.dataset.leftIconClass;
                    } else {
                        leftIconClass[leftIconClass.length] = "mdc-list-item__graphic";
                    }
                    Base.configElement(Scaliby.createIcon(items[i].dataset.leftIcon), {
                            classes: leftIconClass,
                            attrs: ["aria-hidden", "true"],
                            parent: items[i]
                    });
                }

                let spanClasses = ["mdc-list-item__text"];
                if (hasSecondaryText === true) {
                    spanClasses[spanClasses.length] = "list-item--two-line-text";
                }
                let span = Base.createElement({
                    tag: "span",
                    classes: spanClasses,
                    parent: items[i],
                    styles: ["display", "flex"],
                    content: leftPadding
                });

                if (secondaryText === null) {
                    //Adjust primary text
                    Base.createElement({
                        tag: "span",
                        classes: ["mdc-list-item__text"],
                        content: primaryText,
                        parent: span
                    });
                } else {
                    //Adjust primary and secondary texts
                    let div = Base.createElement({
                        tag: "div",
                        parent: span
                    });
                    Base.createElement({
                        tag: "span",
                        classes: ["mdc-list-item__primary-text"],
                        content: primaryText,
                        parent: div
                    });
                    Base.createElement({
                        tag: "span",
                        classes: ["mdc-list-item__secondary-text"],
                        content: secondaryText,
                        parent: div
                    });
                }

                //Right icon
                if (items[i].dataset.rightIcon) {
                    let rightIconClass = ["material-icons"];
                    if (this._elem.dataset.leftIconClass) {
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

                if (withinSublist > 0) {
                    //Item within a sublist
                    items[i].style.maxHeight = "0px";
                    items[i].style.transition = "max-height 0.2s";
                    items[i].classList.add("list-item-collapsed");
                }

                if (items[i].dataset.type === "start-sublist") {
                    //Item that start sublist
                    leftPadding += "&nbsp;&nbsp;";
                    if (this._elem.dataset.itemSublistClass) {
                        items[i].classList.add(this._elem.dataset.itemSublistClass);
                    }

                    items[i].spanArrow = Base.createElement({
                        tag: "span",
                        classes: ["material-icons", "mdc-list-item__meta"],
                        content: "keyboard_arrow_down",
                        parent: items[i]
                    });
                    items[i].addEventListener("click", this._expandOrCollapseSublist);
                    withinSublist++;
                } else if (items[i].dataset.type === "end-sublist") {
                    //Item that end sublist
                    leftPadding = leftPadding.substring(0, leftPadding.length - "&nbsp;&nbsp;".length);
                    items[i].style.display = "none";
                    withinSublist--;
                } else {
                    //Item click Event
                    this._addItemClickEvent(items[i]);
                }
            }
        }

        if (hasSecondaryText === true) {
            Base.configElement(this._elem, {
                classes: ["mdc-list--two-line"]
            });
        } else {
            Base.configElement(this._elem, {classes: ["list--one-line"]});
        }

        //Final settings
        this.update();
    }

    /**
     * Creates the event to treat click on item.
     *
     * @param item The item that receives the click
     *
     * @private
     */
    _addItemClickEvent(item) {
        let list = this;
        item.addEventListener("click", function (event) {
            let li = event.currentTarget;
            let type = li.parentNode.dataset.selectionType;

            if (!type || type === "none" || item.sublist) {
                //No selection or item opens/closes sublist
                return;
            }

            if (li.classList.contains("mdc-list-item--selected")) {
                //Deselect
                li.classList.remove("mdc-list-item--selected");
                Base.configElement(li, {
                    attrs: ["aria-selected", "false", "tabindex", "-1"]
                });
            } else if (type === "single") {
                //Select only one
                list._deselectAll(li.parentNode);
                Base.configElement(li, {
                    classes: ["mdc-list-item--selected"],
                    attrs: ["aria-selected", "true", "tabindex", "0"]
                });
            } else if (type === "multiple") {
                //Select one more
                Base.configElement(li, {
                    classes: ["mdc-list-item--selected"],
                    attrs: ["aria-selected", "true", "tabindex", "0"]
                });
            }
        });
    }

    /**
     * Expands or collapses a sublist.
     *
     * @param event Click event
     *
     * @private
     */
    _expandOrCollapseSublist(event) {
        let item = event.currentTarget;
        let index = Base.getIndexOfElement(item) + 1;
        let list = item.parentNode;
        let items = list.children;
        let total = items.length;

        if (index + 1 === total) {
            //Sublist is empty
            return;
        }

        //Adjust the arrow
        let expand = items[index].style.maxHeight === "0px";
        if (expand) {
            item.spanArrow.innerHTML = "keyboard_arrow_up";
        } else {
            item.spanArrow.innerHTML = "keyboard_arrow_down";
        }

        let anotherSublist = 0;
        for (let i = index; i < total; i++) {
            if (expand) {
                //Expand the sublist
                if (anotherSublist === 0) {
                    items[i].style.maxHeight = "80px";
                    items[i].classList.remove("list-item-collapsed");
                    if (items[i].spanArrow) {
                        items[i].spanArrow.innerHTML = "keyboard_arrow_down";
                    }
                }
            } else {
                //Collapse the sublist
                items[i].style.maxHeight = "0px";
                items[i].classList.add("list-item-collapsed");
                    if (items[i].spanArrow) {
                        items[i].spanArrow.innerHTML = "keyboard_arrow_up";
                    }
            }

            if (items[i].dataset.type === "end-sublist") {
                //Found end of sublist
                if (anotherSublist === 0) {
                    break;
                }
                anotherSublist--;
            } else if (items[i].dataset.type === "start-sublist") {
                //Found another sublist
                anotherSublist++;
            }
        }
    }

    /**
     * Deselects all items of sublist.
     *
     * @param elem Element of sublist component
     */
    _deselectAll(elem) {
        let options = elem.children;

        for (let i = 0; i < options.length; i++) {
            options[i].classList.remove("mdc-list-item--selected");
            Base.configElement(options[i], {
                attrs: ["aria-selected", "false", "tabindex", "-1"]
            });
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
        this._mdc = new mdc.list.MDCList(this._elem);
        this._mdc.singleSelection = false;
    }

    /**
     * Gets the selected items values.
     *
     * @return {Object} the array of selected items values.
     */
    getSelected() {
        let items = this._elem.children;
        let list = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].classList.contains("mdc-list-item--selected")) {
                list[list.length] = items[i].getAttribute("value");
            }
        }

        return list;
    };

    /**
     * Sets the selected items values.
     *
     * @param values Array of selected items values
     */
    setSelected(values) {
        this._deselectAll(this._elem);
        if (values === null || values.length === 0) {
            return;
        }

        let items = this._elem.children;
        for (let i = 0; i < items.length; i++) {
            for (let j = 0; j < values.length; j++) {
                if (items[i].getAttribute("value") === values[j]) {
                    //Item is selected
                    Base.configElement(items[i], {
                        classes: ["mdc-list-item--selected"],
                        attrs: ["aria-selected", "true", "tabindex", "0"]
                    });
                    break;
                }
            }
        }
    }

    /**
     * Defines the items of list.
     * <br>
     * Syntax of item JSON:
     * <ul>
     *   <li>text: The text of item (string);</li>
     *   <li>secundaryText: The secundary text (string);</li>
     *   <li>leftIcon: Icon name of left side (string);</li>
     *   <li>rightIcon: Icon name of right side (string);</li>
     *   <li>leftImg: Image source of left side (string);</li>
     *   <li>rightImg: Image source of right side (string);</li>
     *   <li>value: Value of item (string);</li>
     *   <li>selected: If true, the item is selected (boolean);</li>
     *   <li>separator: if true, it is a separator. Only this attribute is necessary (boolean)</li>
     *   <li>group: If informed and not empty, it is a group. Only this attribute is necessary (string)</li>
     *   <li>clickFunc: Function or name of function to be called when item is clicked. Receives the Event object by
     *       parameter (object or string);</li>
     *   <li>startSublist: Indicates that this item has a sublist (boolean);</li>
     *   <li>endSublist: Indicates that the sublist has ended (boolean).</li>
     * </ul>
     *
     * @param {json[]} items   List of items. Each item is a Json
     * @param {boolean} update If true, update the sub lists components
     */
    setItems(items, update) {
        //Destroy MDCList
        if (this._mdc) {
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
            } else if (items[i].group) {
                li.dataset.type = "group";
                continue;
            }

            li.innerHTML = items[i].text;
            if (items[i].value) {
                li.setAttribute("value", items[i].value);
            }
            if (items[i].secundaryText) {
                li.innerHTML += " <hr> " + items[i].secundaryText;
            }
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
            if (items[i].selected) {
                li.dataset.selected = items[i].selected;
            }
            if (items[i].clickFunc) {
                if (typeof items[i].clickFunc === "string") {
                    li.clickFuncName = items[i].clickFunc;
                    li.onclick = function (event) {
                        Base.executeFunctionByName(this.clickFuncName, event);
                    }
                } else {
                    li.onclick = items[i].clickFunc;
                }
            }
            if (items[i].startSublist === true) {
                li.dataset.type = "start-sublist";
            } else if (items[i].endSublist === true) {
                li.dataset.type = "end-sublist";
            }
        }

        //Recreate the component
        this._create(this._elem);
    }

}