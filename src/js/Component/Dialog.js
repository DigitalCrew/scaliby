/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Informs users about a task and can contain critical information, require decisions or involve multiple tasks.
 * <br>
 * Pay attention: this class is static.
 *
 * @author Fernando Viegas
 */
class Dialog {
    /** Modal dialog window component. */
    static _dialog;

    /** MDC of dialog. */
    static _mdcDialog;

    /** Accept button. */
    static _buttonAccept;

    /** Decline button. */
    static _buttonDecline;

    /** OK button. */
    static _buttonOk;

    /** Element to show in dialog. */
    static _sourceElement = null;


    /**
     * Creates the component.
     *
     * @private
     */
    static _create() {
        //Main element
        this._dialog = Base.createElement({
            tag: "div",
            classes: ["mdc-dialog"],
            attrs: ["role", "alertdialog", "aria-modal", "true", "aria-labelledby", "system_dialog_title",
                "aria-describedby", "system_dialog_content"],
            parent: document.getElementsByTagName("body")[0]
        });

        //Container div
        let divContainer = Base.createElement({
            tag: "div",
            classes: ["mdc-dialog__container"],
            parent: this._dialog
        });

        //Surface div
        let divSurface = Base.createElement({
            tag: "div",
            classes: ["mdc-dialog__surface"],
            styles: ["overflow", "visible"],
            parent: divContainer
        });

        //Title div
        Base.createElement({
            tag: "h2",
            id: "system_dialog_title",
            classes: ["mdc-dialog__title"],
            parent: divSurface
        });

        //Content div
        Base.createElement({
            tag: "div",
            id: "system_dialog_content",
            classes: ["mdc-dialog__content"],
            styles: ["overflow", "visible"],
            parent: divSurface
        });

        //Footer
        let footer = Base.createElement({
            tag: "footer",
            classes: ["mdc-dialog__actions"],
            styles: ["flex-direction", "row"],
            parent: divSurface
        });

        //Scrim div
        Base.createElement({
            tag: "div",
            classes: ["mdc-dialog__scrim"],
            parent: this._dialog
        });

        //Decline button
        this._buttonDecline = Base.createElement({
            tag: "button",
            classes: ["mdc-button", "mdc-dialog__button"],
            attrs: ["type", "button"],
            content: "<div class='mdc-button__ripple'></div>" +
                "<i class='material-icons mdc-button__icon' aria-hidden='true'>close</i>" +
                "<span id='system_dialog_decline_label' class='mdc-button__label'></span>",
            parent: footer
        });
        this._buttonDecline.dataset.mdcDialogAction = "close";

        //Accept button
        this._buttonAccept = Base.createElement({
            tag: "button",
            classes: ["mdc-button", "mdc-dialog__button"],
            attrs: ["type", "button"],
            content: "<div class='mdc-button__ripple'></div>" +
                "<i class='material-icons mdc-button__icon' aria-hidden='true'>check</i>" +
                "<span id='system_dialog_accept_label' class='mdc-button__label'></span>",
            parent: footer
        });
        this._buttonAccept.dataset.mdcDialogAction = "accept";

        //OK button
        this._buttonOk = Base.createElement({
            tag: "button",
            classes: ["mdc-button", "mdc-dialog__button"],
            attrs: ["type", "button"],
            content: "<div class='mdc-button__ripple'></div>" +
                "<i class='material-icons mdc-button__icon' aria-hidden='true'>check</i>" +
                "<span id='system_dialog_ok_label' class='mdc-button__label'></span>",
            parent: footer
        });
        this._buttonOk.dataset.mdcDialogAction = "accept";
    }

    /**
     * Creates the events of buttons
     *
     * @private
     */
    static _createEvents() {
        let elem = this._mdcDialog;
        this._buttonAccept.addEventListener("click", function() {
            if (this.clickEvent) {
                if (this.clickEvent() !== false) {
                    elem.close();
                }
            } else {
                elem.close();
            }
        });

        this._buttonDecline.addEventListener("click", function () {
            if (this.clickEvent) {
                this.clickEvent();
            }
        });

        this._buttonOk.addEventListener("click", function () {
            if (this.clickEvent) {
                this.clickEvent();
            }
        });

        this._mdcDialog.listen('MDCDialog:closing', function() {
            let contentElement = document.getElementById("system_dialog_content");
            if (Dialog._sourceElement !== null) {
                let source = Dialog._sourceElement;
                source.classList.add("hide-element");
                contentElement.removeChild(source);

                if (source.dialogParent !== null) {
                    Base.insertElementAt(source, source.dialogParent, source.dialogPositionAtParent);
                }
            }

            Scaliby.destroyMdcComponents(contentElement);
            contentElement.innerHTML = "";
        });
    }

    /**
     * Puts a text or content of element within the Dialog.
     *
     * @param {object} source Text or element
     *
     * @private
     */
    static _putContent(source) {
        if (!source) {
            source = "";
        }

        if (typeof source === "string") {
            document.getElementById("system_dialog_content").innerHTML = source;
            this._sourceElement = null;
        } else {
            source.classList.remove("hide-element");

            source.dialogParent = source.parentNode;
            if (source.dialogParent !== null) {
                source.dialogPositionAtParent = Base.getIndexOfElement(source);
                source.parentNode.removeChild(source);
            }

            document.getElementById("system_dialog_content").appendChild(source);
            this._sourceElement = source;
        }
    }


    /**
     * Configures the Dialog component.
     * <br>
     * This method needs to be called only once.
     *
     * @param {string} okLabel      The label of "OK" button
     * @param {string} acceptLabel  The label of "Accept" button
     * @param {string} declineLabel The label of "Decline" button
     */
    static configure(okLabel, acceptLabel, declineLabel) {
        if (!this._dialog) {
            //Create the component
            this._create();

            //Create the MDC of dialog
            this._mdcDialog = new mdc.dialog.MDCDialog(document.querySelector('.mdc-dialog'));

            //Create the events
            this._createEvents();
        }

        document.getElementById("system_dialog_accept_label").innerHTML = acceptLabel;
        document.getElementById("system_dialog_decline_label").innerHTML = declineLabel;
        document.getElementById("system_dialog_ok_label").innerHTML = okLabel;
    }

    /**
     * Shows a modal dialog with "OK" button.
     *
     * @param {string} title          Title of dialog
     * @param {string|Object} content Text of dialog if string or element with content
     * @param {function} onOk         Function that treats the click event on the "OK" button
     */
    static showOk(title, content, onOk) {
        this._putContent(content);
        document.getElementById("system_dialog_title").innerHTML = title;

        this._buttonOk.classList.remove("hide-element");
        this._buttonDecline.classList.add("hide-element");
        this._buttonAccept.classList.add("hide-element");

        this._buttonOk.clickEvent = onOk;
        this._buttonDecline.clickEvent = null;
        this._buttonAccept.clickEvent = null;

        this._mdcDialog.open();
    }

    /**
     * Shows a modal dialog with "Accept" and "Decline" buttons.
     *
     * @param {string} title          Title of dialog
     * @param {string|Object} content Text of dialog if string or element with content
     * @param {function} onAccept     Function that treats the click event on the "Accept" button. If this function
     *                                returns true, the dialog is close, otherwise, keep opened
     * @param {function} onDecline    Function that treats the click event on the "Decline" button
     */
    static showConfirmation(title, content, onAccept, onDecline) {
        this._putContent(content);
        document.getElementById("system_dialog_title").innerHTML = title;

        this._buttonDecline.classList.remove("hide-element");
        this._buttonAccept.classList.remove("hide-element");
        this._buttonOk.classList.add("hide-element");

        this._buttonDecline.clickEvent = onDecline;
        this._buttonAccept.clickEvent = onAccept;
        this._buttonOk.clickEvent = null;

        this._mdcDialog.open();
    }

    /**
     * Close the dialog if opened.
     */
    static close() {
        this._mdcDialog.close();
    }
}