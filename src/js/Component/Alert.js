/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Shows message of alert.
 * <br>
 * Pay attention: this class is static.
 *
 * @author Fernando Viegas
 */
class Alert {
    /** Types of message. */
    static _TYPES = {
        SUCCESS: 0,
        INFO: 1,
        WARNING: 2,
        ERROR: 3
    };

    /** List of messages. */
    static _messages = [];

    /** DIV with messages. */
    static _container = null;


    /**
     * Displays the alert message.
     *
     * @param message Data of message
     *
     * @private
     */
    static _executeMessage(message) {
        if (Alert._container === null) {
            //Create the container of messages
            Alert._container = Base.createElement({
                tag: "div",
                classes: ["alert-container"],
                parent: document.body
            });
        }

        //Style of message
        let classes = ["alert-message"];
        if (message.type === Alert._TYPES.SUCCESS) {
            classes[classes.length] = "alert-message-success";
        } else if (message.type === Alert._TYPES.INFO) {
            classes[classes.length] = "alert-message-info";
        } else if (message.type === Alert._TYPES.WARNING) {
            classes[classes.length] = "alert-message-warning";
        } else {
            classes[classes.length] = "alert-message-error";
        }

        //Create the element that contains message and button
        let div = Base.createElement({
            tag: "div",
            classes: classes,
            parent: Alert._container
        });

        //Create the element with message
        let msgDiv = Base.createElement({
            tag: "div",
            classes: ["alert-message-text", "vcenter"],
            content: message.text,
            parent: div
        });

        //Timer to close the message
        let timeout = null;
        if (message.timer > 0) {
            timeout = setTimeout(function() {
                Alert._close(div, null);
            }, message.timer * 1000);
        }

        //Create icon to close the message
        Base.createElement({
            tag: "i",
            classes: ["material-icons", "alert-icon", "vcenter"],
            content: "close",
            events: ["click", function() { Alert._close(div, timeout); }],
            parent: msgDiv
        });

        //Show message
        setTimeout(function() {
            div.style.opacity = "1";
        },100);
    }

    /**
     * Close the message.
     *
     * @param div     Element with message
     * @param timeout Id of timeout
     *
     * @private
     */
    static _close(div, timeout) {
        if (timeout) {
            clearTimeout(timeout);
        }

        div.style.opacity = "0";
        setTimeout(function() {
            div.parentNode.removeChild(div);
        }, 500);
    }


    /**
     * Shows a success message alert.
     *
     * @param {string} text  Text of alert
     * @param {number} timer Display time in seconds. If 0, no timer
     */
    static showSuccess(text, timer) {
        let message = {
            type: Alert._TYPES.SUCCESS,
            text: text,
            timer: timer
        };

        Alert._executeMessage(message);
    }

    /**
     * Shows an information message alert.
     *
     * @param {string} text  Text of alert
     * @param {number} timer Display time in seconds. If 0, no timer
     */
    static showInfo(text, timer) {
        let message = {
            type: Alert._TYPES.INFO,
            text: text,
            timer: timer
        };

        Alert._executeMessage(message);
    }

    /**
     * Shows a warning message alert.
     *
     * @param {string} text  Text of alert
     * @param {number} timer Display time in seconds. If 0, no timer
     */
    static showWarning(text, timer) {
        let message = {
            type: Alert._TYPES.WARNING,
            text: text,
            timer: timer
        };

        Alert._executeMessage(message);
    }

    /**
     * Shows an error message alert.
     *
     * @param {string} text  Text of alert
     * @param {number} timer Display time in seconds. If 0, no timer
     */
    static showError(text, timer) {
        let message = {
            type: Alert._TYPES.ERROR,
            text: text,
            timer: timer
        };

        Alert._executeMessage(message);
    }

}