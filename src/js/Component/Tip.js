/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Displays informative text about a component or element.
 *
 * @author Fernando Viegas
 */
class Tip {
    /** counter for id. */
    static _counter = 0;

    /** Element of component. */
    _elem;

    /** Element that receives the tip. */
    _target;

    /** The seconds until close the "tip". */
    _seconds;

    /** Link to be called when button of deactivate/activate is clicked. */
    _linkAction;

    /** Number of countdown to close the tip. */
    _divCountdown;

    /** Do the countdown of timer. */
    _timer;

    //Verify periodically the "tip" to update the position when the page changed. */
    _updatePosition;


    /**
     * Changes the state of button that defines if "tip" is enabled or disabled.
     * When the state changes, a request is sent to server.
     *
     * @param deactivate The button element
     *
     * @private
     */
    _changeState(deactivate) {
        let state;
        if (deactivate.src.endsWith("tip-on.png")) {
            deactivate.src = Scaliby.getConfiguration().imageDirectory + "tip-off.png";
            this._elem.style.opacity = "0.7";
            state = "0";
        } else {
            deactivate.src = Scaliby.getConfiguration().imageDirectory + "tip-on.png";
            this._elem.style.opacity = "1";
            state = "1";
        }

        //Send the new state to server
        Comm.send({
            path: this._linkAction,
            fields: ["id", this._elem.id, "state", state],
            type: "GET"
        });
    };

    /**
     * Decreases the timer and closes the "tip" when time ends.
     *
     * @private
     */
    _doCountdown() {
        this._divCountdown.innerHTML = this._seconds;
        if (this._seconds === 0) {
            this.destroy(this._elem.id);
        } else {
            this._seconds--;
        }
    };

    /**
     * Creates the component.
     *
     * @param data See {@link Tip.constructor}
     * @param id   Id of component
     *
     * @private
     */
    _init(data, id) {
        if (this._elem) {
            return;
        }
        this._target = typeof data.target === "string" ? document.getElementById(data.target) : data.target;

        //Remove a "tip" in execution associate with the element if exist
        if (this._target.tipInExecution) {
            this._target.tipInExecution.destroy();
        }

        //Create the component with 3 "div"s
        this._elem = Base.createElement({
            tag: "div",
            id: id,
            classes: ["tip"],
            styles: [
                "left", this._target.getBoundingClientRect().left + "px",
                "top", (this._target.getBoundingClientRect().top + this._target.getBoundingClientRect().height) + "px",
                "width", data.width
            ]
        });

        if (!data.parent) {
            Base.configElement(this._elem, {
                parent: Base.getCellOfField(this._target)
            });
        } else {
            let parent = document.getElementById(data.parent[0]);
            Base.configElement(this._elem, {
                parent: typeof parent === "string" ? document.getElementById(parent) : parent,
                insertAt: data.parent[1]
            });
        }

        this._elem.component = this;
        this._seconds = data.seconds;
        this._linkAction = data.linkAction;
        this._target.tipInExecution = this;

        Base.createElement({
            tag: "div",
            classes: ["tip-arrow"],
            parent: this._elem
        });

        let divText = Base.createElement({
            tag: "div",
            classes: ["tip-text"],
            content: data.text,
            parent: this._elem
        });

        //Area with information (countdown and disable/enable button)
        let divBottom = Base.createElement({
            tag: "div",
            classes: ["tip-bottom"],
            styles: ["width", "100%"],
            parent: divText
        });

        //Number of countdown to close the tip
        this._divCountdown = Base.createElement({
            tag: "div",
            parent: divBottom
        });

        //Button to disable de tip
        let tip = this;
        if (data.linkAction) {
            let button = Base.createElement({
                tag: "img",
                attrs: ["src", Scaliby.getConfiguration().imageDirectory + "tip-on.png"],
                parent: divBottom,
                events: ["click", function () { tip._changeState(button); }]
            });
        }

        //Event when "tip" is clicked
        let elem = this._elem;
        divText.addEventListener("click", function (event) {
            if (event.target.tagName !== "IMG") {
                tip.destroy(elem.id);
                event.preventDefault();
                return false;
            }
        });

        //Show the "tip" after element is refreshed
        setTimeout(function () {
            elem.style.opacity = "1";

            //Do the countdown of timer
            if (data.seconds !== 0) {
                tip._timer = setInterval(function () {
                    tip._doCountdown();
                }, 1000);
            }
        }, 50);

        //Verify periodically the "tip" to update the position when the page changed
        let target = this._target;
        this._updatePosition = setInterval(function () {
            elem.style.left = target.getBoundingClientRect().left + "px";
            elem.style.top = (target.getBoundingClientRect().top + target.getBoundingClientRect().height) + "px";

            let cell = Base.getCellOfField(target);
            let grid = Base.getCellOfField(target);

            if (!document.body.contains(target)
                || target.style.opacity === "0" || target.classList.contains("hide-element")
                || (cell != null && cell.classList.contains("hide-element")
                    || (grid != null && grid.classList.contains("hide-element")))) {
                tip.destroy();
            }
        }, 250);
    }


    /**
     * Constructor.
     * <br>
     * Shows tips for elements.
     * When the "tip" is clicked, it is closed.
     * <br><br>
     * Syntax of "data" parameter:
     * <ul>
     *   <li>id: ID of element that receives the "tip". The "elem" parameter should not be set {string};</li>
     *   <li>elem: Element that receives the "tip". The "id" parameter should not be set {Object};</li>

     *
     *   <li>id: ID of this component {string};</li>
     *   <li>target: Element(ID or object) that receives the "tip"; {object} </li>
     *   <li>text: Text of "tip" {string};</li>
     *   <li>width: The width of "tip" {string};</li>
     *   <li>seconds: The seconds until close the "tip". If 0, don't count down {number};</li>
     *   <li>linkAction: Link to be called when button of deactivate/activate is clicked. The request is GET with two
     *                   parameters: "id" - ID of "tip" and "state" - 1 is activate or 0 is deactivate {string};</li>
     *   <li>linkShow: Link to be called before displaying the component. The request is GET with one parameter: "id" -
     *                 ID of "tip". If the response is 1, shows the component, otherwise the component is finalized.
     *                 Optional {string};</li>
     *   <li>parent: This component automatically defines where it will be placed, but if this parameter is informed,
     *               the value must be an array of two values: parent element(ID or object) and its position within it
     *               {Array}.</li>
     * </ul>
     *
     * @param {json} data Data of "tip"
     */
    constructor(data) {
        let tip = this;
        let id = data.id ? data.id : "tip" + Tip._counter++;

        if (!data.linkShow) {
            this._init(data, id);
        } else {
            Comm.send({
                path: data.linkShow,
                fields: ["id", id],
                lockedList: [],
                dataType: "json",
                type: "GET",
                callback: function(response) {
                    if (response === 1) {
                        tip._init(data, id);
                    }
                }
            });
        }
    }

    /**
     * Clean up the component.
     */
    destroy() {
        clearInterval(this._timer);
        clearInterval(this._updatePosition);
        this._elem.parentNode.removeChild(this._elem);
        this._target.tipInExecution = null;
    }

}