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

    /** Element of card. */
    _card;

    /** Thumbnail element. */
    _thumbnail;

    /** Title element. */
    _title;

    /** Subtitle element. */
    _subtitle;

    /** Image element. */
    _image;

    /** Element with content. */
    _content;

    /** Primary area. */
    _cardPrimary;

    /** List of buttons. */
    _buttonsList = [];

    /** List of icon buttons. */
    _iconsList = [];


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

        //Create the card element
        this._card = Base.createElement({
            tag: "div",
            classes: ["mdc-card"],
            parent: this._elem
        });

        //Create the primary area
        this._cardPrimary = Base.createElement({
            tag: "div",
            parent: this._card
        });

        if (this._elem.dataset.thumbnail || this._elem.dataset.title || this._elem.dataset.subtitle) {
            let box = Base.createElement({
                tag: "div",
                styles: ["display", "flex"],
                parent: this._cardPrimary
            });

            //Create the thumbnail
            if (this._elem.dataset.thumbnail) {
                this._thumbnail = Base.createElement({
                    tag: "img",
                    styles: ["padding", "0.5rem"],
                    attrs: ["src", this._elem.dataset.thumbnail],
                    parent: box
                });
            }

            //Create the box with title and subtitle
            let divTitle = Base.createElement({
                tag: "div",
                classes: ["demo-card__primary"],
                styles: ["padding", "0.5rem"],
                parent: box
            });

            //Create the title
            this._title = Base.createElement({
                tag: "h2",
                classes: ["mdc-typography", "mdc-typography--headline6"],
                styles: ["margin", "0"],
                parent: divTitle
            });

            //Create the subtitle
            this._subtitle = Base.createElement({
                tag: "h3",
                classes: ["mdc-typography", "mdc-typography--subtitle2"],
                styles: ["margin", "0", "color", "var(--mdc-theme-text-secondary-on-background,rgba(0,0,0,.54))"],
                parent: divTitle
            });
        }

        //Create the image
        if (this._elem.dataset.image) {
            this._image = Base.createElement({
                tag: "img",
                styles: ["width", "100%", "height", "auto"],
                parent: this._cardPrimary
            });
        }

        //Create the content
        this._content = Base.createElement({
            tag: "div",
            classes: ["mdc-typography", "mdc-typography--body2"],
            styles: ["padding", "0.5rem", "color", "var(--mdc-theme-text-secondary-on-background,rgba(0,0,0,.54))"],
            parent: this._cardPrimary
        });

        //Create the card actions
        let cardActions = Base.createElement({
            tag: "div",
            classes: ["mdc-card__actions"],
            parent: this._card
        });

        let cb = this._elem.querySelector(".s-card-buttons");
        if (cb) {
            //Move the buttons
            let cardButtons = Base.createElement({
                tag: "div",
                classes: ["mdc-card__action-buttons"],
                parent: cardActions
            });
            cb.querySelectorAll(".s-button").forEach((button) => {
                button.parentNode.removeChild(button);
                cardButtons.appendChild(button);
                this._buttonsList[this._buttonsList.length] = button;
            });

            //Move the icon buttons
            let cardIcons = Base.createElement({
                tag: "div",
                classes: ["mdc-card__action-icons"],
                parent: cardActions
            });
            cb.querySelectorAll(".s-icon-button").forEach((icon) => {
                icon.parentNode.removeChild(icon);
                cardIcons.appendChild(icon);
                this._iconsList[this._iconsList.length] = icon;
            })
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
        if (this._elem.dataset.thumbnail) {
            this._thumbnail.src = this._elem.dataset.thumbnail;
        }
        if (this._elem.dataset.title) {
            this._title.innerHTML = this._elem.dataset.title
        }
        if (this._elem.dataset.subtitle) {
            this._subtitle.innerHTML = this._elem.dataset.subtitle
        }
        if (this._elem.dataset.image) {
            this._image.src = this._elem.dataset.image
        }

        //Adjust the content
        let content = this._elem.querySelector(".s-card-content");
        if (content) {
            this._content.innerHTML = "";
            this._content.appendChild(content);
        }

        //Adjust the tab index
        let component = this;
        setTimeout(function() {
            if (component._elem.tabIndex !== -2) {
                component._cardPrimary.tabIndex = component._elem.tabIndex;

                if (component._elem.tabIndex >= 0) {
                    component._cardPrimary.classList.add("mdc-card__primary-action");
                    component._cardPrimary.style.outline = "";
                } else {
                    component._cardPrimary.classList.remove("mdc-card__primary-action");
                    component._cardPrimary.style.outline = "0";
                }

                component._elem.tabIndex = -2;
            }
        }, 100);

    }

    /**
     * Clean up the component and MDC Web component.
     */
    destroy() {
        this._buttonsList.forEach((button) => {
            Scaliby.getComponent(button).destroy();
        });
        this._iconsList.forEach((icon) => {
            Scaliby.getComponent(icon).destroy();
        });
    }

}