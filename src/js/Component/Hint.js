/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Displays a suggestion value about a input component.
 * <br>
 * Pay attention: this class is static.
 *
 * @author Fernando Viegas
 */
class Hint {
    /** Manager of hints. */
    static _hintManager = null;


    /**
     * Creates a hint component.
     *
     * @param hintStructure Structure of hint
     */
    static _createHint(hintStructure) {
        setTimeout(function() {
            //If target has hint, remove it
            for (let i = 0; i < Hint._hintManager.list.length; i++) {
                if (Hint._hintManager.list[i].parentNode === hintStructure.target.parentNode) {
                    Hint._removeHint(Hint._hintManager.list[i]);
                    break;
                }
            }

            //Create the component with 3 div's
            let divHint = document.createElement("div");
            divHint.classList.add("hint");
            hintStructure.target.component.getContainer()
                .insertBefore(divHint, hintStructure.target.component.getContainer().childNodes[0]);

            let divText = document.createElement("div");
            divText.classList.add("hint-text");
            divHint.appendChild(divText);

            divText.addEventListener("mouseover", function() {
                divArrow.style.display = "none";
            });
            divText.addEventListener("mouseout", function() {
                divArrow.style.display = "block";
            });

            let divArrow = document.createElement("div");
            divArrow.classList.add("hint-arrow");
            divHint.appendChild(divArrow);

            //Set the text
            divText.hintTarget = hintStructure.target;
            let text = "";
            for (let i = 0; i < hintStructure.values.length; i += 2) {
                if (i > 0) {
                    text += "<br>";
                }
                text += hintStructure.values[i];
            }
            divText.innerHTML = text;
            divText.hintList = hintStructure.values;

            //Store the hint
            Hint._hintManager.list[Hint._hintManager.list.length] = divHint;

            //Set the click event
            divText.addEventListener("click", function(event) {
                let elem = event.target.hintTarget;
                let list = event.target.hintList;

                switch (Scaliby.getComponentType(elem)) {
                    case Scaliby.COMPONENT_TYPE.TEXT_FIELD:
                    case Scaliby.COMPONENT_TYPE.TEXT_AREA:
                        Form.setValueByElement(elem, list[0]);
                        elem.component.update();
                        break;

                    case Scaliby.COMPONENT_TYPE.RADIO_BOX:
                    case Scaliby.COMPONENT_TYPE.SELECT:
                    case Scaliby.COMPONENT_TYPE.SWITCH:
                        Form.setValueByElement(elem, list[1]);
                        elem.component.update();
                        break;

                    case Scaliby.COMPONENT_TYPE.SEARCH_SELECT:
                        Form.setValueByElement(elem, [list[1], list[0]]);
                        elem.component.update();
                        break;

                    case Scaliby.COMPONENT_TYPE.CHECK_BOX:
                    case Scaliby.COMPONENT_TYPE.MULTI_SELECT:
                        let options = [];
                        for (let i = 0; i < list.length; i += 2) {
                            options[options.length] = list[i + 1];
                        }
                        Form.setValueByElement(elem, options);
                        elem.component.update();
                        break;
                }

                //Remove hint
                Hint._removeHint(event.target.parentNode);

                event.preventDefault();
                return false;
            });

            //Show the hint
            setTimeout(function() {
                divHint.style.top = (divHint.offsetTop - 22) + "px";
                divHint.style.opacity = "1";
            }, 50);
        }, 50);
    }

    /**
     * Removes a hint component.
     *
     * @param elem The hint element
     */
    static _removeHint(elem) {
        //Remove the element of page
        elem.parentNode.removeChild(elem);

        //Remove hint of list
        for (let i = 0; i < this._hintManager.list.length; i++) {
            if (Hint._hintManager.list[i] === elem) {
                Hint._hintManager.list.splice(i, 1);

            }
        }

        //If no more hints, remove the hint manager
        if (Hint._hintManager.list.length === 0) {
            Hint._hintManager.main.parentNode.removeChild(Hint._hintManager.main);
            Hint._hintManager = null;
        }
    }


    /**
     * Shows hints for elements(or components).
     * <br>
     * Each hints is a JSON with the attributes:
     * <ul>
     *     <li>target: Element that will receive the hint (object);</li>
     *     <li>values: The array with the sequence text-value of each option (array).</li>
     * </ul>
     * When the hint is clicked, its value is copied to element. The syntax of values depends the type of
     * target:
     * <ul>
     *     <li>Text field, text area and switch: array with one item that represents the text to be displayed
     *         and the value of target. Example: ["Text and value"];</li>
     *     <li>Radio box, select and search select: array with two items. The first item is the text to be
     *         displayed and the second item is the value of target. Example: ["Twenty three", 23];</li>
     *     <li>Check box and multi select: array with two or more items. It is similar the above, but can have
     *         more than one sequence text-value. Example: ["Ten", 10, "Eleven", 11].</li>
     * </ul>
     *
     * @param hints List of hints
     */
    static show(hints) {
        if (hints.length > 0 && this._hintManager === null) {
            //Create the buttons to confirm or refuse the hints
            let divMain = document.createElement("div");
            divMain.classList.add("hint-main");

            let divYes = document.createElement("div");
            divYes.innerHTML = "<i class='material-icons hint-yes'>check_circle</i>";
            divMain.appendChild(divYes);
            divYes.addEventListener("click", function () {
                while (Hint._hintManager !== null) {
                    let ev = document.createEvent('MouseEvent');
                    ev.initEvent('click', false, true);
                    Hint._hintManager.list[0].childNodes[0].dispatchEvent(ev);
                }
            });

            let divSpace = document.createElement("div");
            divSpace.style.width = "20px";
            divMain.appendChild(divSpace);

            let divNo = document.createElement("div");
            divNo.innerHTML = "<i class='material-icons hint-no'>cancel</i>";
            divMain.appendChild(divNo);
            divNo.addEventListener("click", function () {
                while (Hint._hintManager !== null) {
                    Hint._removeHint(Hint._hintManager.list[0]);
                }
            });

            //Create the manager of hints (only one at a time)
            document.body.appendChild(divMain);
            this._hintManager = {};
            this._hintManager.main = divMain;
            this._hintManager.list = [];
        }

        //Create the hints
        for (let i = 0; i < hints.length; i++) {
            this._createHint(hints[i]);
        }
    }

    /**
     * Removes hints for elements(or components).
     *
     * @param all If true, remove all hints. If false, remove only hints that elements no longer exist
     */
    static remove(all) {
        if (Hint._hintManager !== null) {
            if (all) {
                for (let i = 0; i < Hint._hintManager.list.length; i++) {
                    Hint._removeHint(Hint._hintManager.list[i]);
                }
            } else {
                let index = 0;
                while (Hint._hintManager != null && index < Hint._hintManager.list.length) {
                    if (!document.body.contains(Hint._hintManager.list[index])) {
                        Hint._removeHint(Hint._hintManager.list[index]);
                    } else {
                        index++;
                    }
                }
            }
        }
    }

    /**
     * Gets a list of hints from the application domain and displays them.
     * <br>
     * The response of the server needs to be a list with the same structure as the {@link Hint.show} method
     * with one difference: the "target" attribute, instead of the element, must be the name of the field.
     *
     * @param path   Request path
     * @param fields List of field names and their respective values. The names of fields can be repeated
     * @param idForm ID of form
     */
    static requestHints(path, fields, idForm) {
        let callback = function(data) {
            if (data.length > 0) {
                //Convert the name of field to element
                for (let i = 0; i < data.length; i++) {
                    data[i].target = Form.getField(idForm, data[i].target);
                }

                //Show hints
                Hint.show(data);
            }
        };

        Comm.send({ path: path, fields: fields, callback: callback, elems: [], dataType: "json", type: "POST" });
    }

}