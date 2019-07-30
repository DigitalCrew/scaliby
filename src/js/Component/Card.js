/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Contains content and actions about a single subject.
 *
 * @author Fernando Viegas
 */
class Card {
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
        this._elem.classList.add("mdc-card");

        //Search img element
        let img = null;
        let list = elem.children;
        for (let i = 0; i < list.length; i++) {
            if (list[i].tagName === "IMG") {
                img = list[i];
                break;
            }
        }

        //Create the first div (image and content)
        let divFirst = Base.createElement({
            tag: "div"
        });

        //Create the image
        if (img !== null) {
            let divImg = Base.createElement({
                tag: "div",
                classes: ["mdc-card__media"],
                styles: ["width", img.style.width, "height", img.style.height,
                    "background-image", "url('" + img.src + "')"],
                parent: divFirst
            });
            Base.transferClass(img, divImg);
            img.parentNode.removeChild(img);
        }

        //Configure the content
        let divContent = null;
        list = this._elem.children;
        for (let i = 0; i < list.length; i++) {
            if (list[i].tagName === "DIV") {
                divContent = list[i];
                break;
            }
        }
        divContent.parentNode.removeChild(divContent);
        divFirst.appendChild(divContent);

        //Create the actions div
        let divActions = Base.createElement({
            tag: "div",
            classes: ["mdc-card__actions"]
        });

        //Create the buttons div
        let divButtons = Base.createElement({
            tag: "div",
            classes: ["mdc-card__action-buttons"],
            parent: divActions
        });

        //Create the icons div
        let divIcons = Base.createElement({
            tag: "div",
            classes: ["mdc-card__action-icons"],
            parent: divActions
        });

        //Configure the buttons and icons
        list = [];
        for (let i = 0; i < elem.children.length; i++) {
            list[i] = elem.children[i];
        }

        for (let i = 0; i < list.length; i++) {
            if (list[i].tagName === "BUTTON") {
                list[i].parentNode.removeChild(list[i]);
                if (list[i].classList.contains("s-card-button")) {
                    Base.configElement(list[i], {
                        classes: ["mdc-button", "mdc-card__action", "mdc-card__action--button"],
                        parent: divButtons
                    });
                } else if (list[i].classList.contains("s-card-icon")) {
                    let iconButton = Base.createElement({
                        tag: "button",
                        classes: ["s-icon-button"],
                        attrs: ["data-icon", list[i].innerHTML],
                        parent: divIcons
                    });
                    new IconButton(iconButton);
                    list[i].innerHTML = "";
                }
            }
        }

        //Put the new elements
        Base.insertElementAt(divFirst, this._elem, 0);
        this._elem.appendChild(divActions);

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