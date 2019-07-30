/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Provides input mask in input components.
 * <br>
 * Pay attention: this class is static.
 *
 * @author Fernando Viegas
 */
class Inmask {
    /** Regular Expression to Integer. */
	static _patternInteger = /^-{0,1}\d*$/;

	/** Delete key code. */
	static _deleteCode = 999;


    /**
     * Adjusts the value of input component.
     * After the user has typed a key, this method corrects invalid values​​.
     *
     * @param {Object} elem HTML element
     */
    static _adjustValue(elem) {
        elem.value = elem.maskLastValue;
        Inmask._setTextCursorPosition(elem, elem.maskCursorPosition);
    }

    /**
     * Formats the text of decimal value.
     *
     * @param {Object} elem    The input element
     * @param {String} value   The text of decimal value
     * @param {number} keyType The key type:
     *                         0-Normal key;
     *                         1-Backspace;
     *                         2-Delete
     *
     * @return {string} decimal value formatted in text type.
     */
    static _formatDecimal(elem, value, keyType) {
        //Verifies if value is empty
        if (value === null) {
            return null;
        } else if (value.length === 0) {
            return "";
        }

        //Removes the group separators
        value = value.replace(new RegExp("\\" + I18n.getNumberGroupSeparator(), "g"), "");

        //Removes the decimal digits
        let decimals = "";
        let pos;
        if ((pos = value.indexOf(I18n.getNumberDecimalSeparator())) >= 0) {
            decimals = value.substring(pos);
            value = value.substring(0, pos);
        }

        //Puts the group separators
        let text = "";
        pos = (value.length % 3);

        for (let i = 0; i < value.length; i++) {
            if (i === pos) {
                //Next group separator
                if (i !== 0) {
                    text += I18n.getNumberGroupSeparator();
                }
                pos += 3;
            }

            //Next digit
            text += value[i];
        }

        //Puts the decimals
        value = text + decimals;

        //Gets the current and new value
        let value1, value2;
        if (keyType === 0) {
            //Normal key
            value1 = elem.value.substring(0, elem.maskCursorPosition > 0 ?
                elem.maskCursorPosition - 1 : elem.maskCursorPosition);
            value2 = value.substring(0, elem.maskCursorPosition);
        } else if (keyType === 1) {
            //Backspace key
            value1 = elem.value.substring(0, elem.maskCursorPosition);
            value2 = value.substring(0, elem.maskCursorPosition > 0 ?
                elem.maskCursorPosition - 1 : elem.maskCursorPosition);
        } else {
            //Delete key
            value1 = elem.value.substring(0, elem.maskCursorPosition);
            value2 = value.substring(0, elem.maskCursorPosition < value.length - 1 ?
                elem.maskCursorPosition + 1 : elem.maskCursorPosition);
        }

        //Counts the total of group separators
        let count1 = 0;
        let count2 = 0;
        for (let i = 0; i < value1.length; i++) {
            if (value1[i] === I18n.getNumberGroupSeparator()) {
                count1++;
            }
        }

        for (let i = 0; i < value2.length; i++) {
            if (value2[i] === I18n.getNumberGroupSeparator()) {
                count2++;
            }
        }

        //If  the new value has different total of group separators, adjusts the cursor position
        if (keyType === 0) {
            //Normal key
            if (count1 < count2) {
                elem.maskCursorPosition = elem.maskCursorPosition + 1;
            }
        } else if (keyType === 1) {
            //Backspace key
            if (count1 > count2) {
                elem.maskCursorPosition = elem.maskCursorPosition - 1;
            }
        } else {
            //Delete key
            if (value.charAt(elem.maskCursorPosition) === I18n.getNumberGroupSeparator()) {
                elem.maskCursorPosition++;
            }
            if (count1 > count2) {
                elem.maskCursorPosition = elem.maskCursorPosition - 1;
            }
        }

        //Returns the formatted value
        return value;
    }

    /**
     * Formats the text of string value.
     *
     * @param {Object} elem    The input element
     * @param {string} value   The text of string value
     * @param {number} keyType The key type:
     *                         0-Normal key;
     *                         1-Backspace;
     *                         2-Delete
     *
     * @return string string value formatted in text type.
     */
    static _formatString(elem, value, keyType) {
        let pos = elem.maskCursorPosition;
        let selection = Inmask._getTextCursorPosition(elem, false) - Inmask._getTextCursorPosition(elem, true);
        let charReplaced = null;
        let newMask = null;
        let charValue, charDefinition, aux, posReplaced;

        if (keyType === 0) {
            //Normal key
            //Removes the pressed key of value
            pos--;
            charValue = value.charAt(pos);
            if (pos === value.length) {
                value = value.substring(0, value.length - 1);
                pos--;
            } else {
                value = value.substring(0, pos) + value.substring(pos + 1);
            }

            //Puts marks in removed keys
            if (selection > 0) {
                aux = value.substring(0, pos);
                for (let i = 0; i < selection; i++) {
                    aux += String.fromCharCode(1);
                }
                aux += value.substring(pos);
                value = aux;
            }

            //If the current position is static mask, goes to the next isn't static
            while (pos < elem.maskAttr.definition.length) {
                charDefinition = elem.maskAttr.definition.charAt(pos);

                if (elem.maskAttr.custom[charDefinition] !== undefined) {
                    break; //Mask character has treatment
                }

                if (charValue === charDefinition) {
                    charValue = null; //Mask character is static
                    break;
                }

                if (pos >= value.length) {
                    value += charDefinition; //Value is smaller than mask. Puts the mask static character
                }

                pos++;
            }

            //Puts the key pressed
            if (charValue !== null) {
                if (pos >= value.length - 1) {
                    value = value.substring(0, pos) + charValue; //Appends the key
                } else {
                    charReplaced = value.charAt(pos);
                    posReplaced = pos;
                    value = value.substring(0, pos) + charValue + value.substring(pos + 1); //Replaces the key
                }
            }

            pos++;
        } else {
            //Delete or Backspace key
            //Puts marks in removed keys
            if (selection === 0) {
                selection = 1;
            }
            aux = value.substring(0, pos);
            for (let i = 0; i < selection; i++) {
                aux += String.fromCharCode(1);
            }
            aux += value.substring(pos);

            value = aux;
        }

        //Gets the value without mask and mark(removed key)
        let  valueWithoutMask = "";
        for (let i = 0; i < value.length; i++) {
            if (i >= elem.maskAttr.definition.length) {
                break;
            }

            if (elem.maskAttr.custom[elem.maskAttr.definition.charAt(i)] !== undefined && value.charCodeAt(i) !== 1) {
                valueWithoutMask += value.charAt(i);
            }
        }

        //Adjusts the value with mask
        //Puts valid characters and static masks
        let j = 0;
        value = "";
        for (let i = 0; i < elem.maskAttr.definition.length; i++) {
            if (j === valueWithoutMask.length) {
                break;
            }

            charDefinition = elem.maskAttr.definition.charAt(i);
            if (elem.maskAttr.custom[charDefinition] === undefined) {
                value += elem.maskAttr.definition.charAt(i);
            } else if (elem.maskAttr.custom[charDefinition].regex !== undefined) {
                if (elem.maskAttr.custom[charDefinition].regex.test(valueWithoutMask[j]) === true) {
                    value += valueWithoutMask[j];
                } else if (charReplaced !== undefined && posReplaced === i) {
                    value += charReplaced;
                    pos--;
                } else {
                    i--;
                }
                j++;
            } else if (elem.maskAttr.custom[charDefinition].keyPressed !== undefined) {
                let ret = elem.maskAttr.custom[charDefinition].keyPressed(value + valueWithoutMask[j], elem.maskLastValue, elem.maskAttr.definition);
                value = ret.value;
                if (ret.mask !== undefined) {
                    newMask = ret.mask;
                }
                j++;
            } else {
                value += valueWithoutMask[j++];
            }
        }

        //If all remaining characters after the cursor position are static masks, moves the cursor to the end
        if (pos > value.length && pos > elem.maskAttr.definition.length) {
            for (let i = value.length; i < elem.maskAttr.definition.length; i++) {
                value += elem.maskAttr.definition.charAt(i);
            }
        }

        //If new mask, applies it
        if (newMask !== null) {
            Inmask.removeMask(elem);
            Inmask.setMask(elem, newMask);
        }

        //Positions the cursor and returns the value
        elem.maskCursorPosition = pos;
        return value;
    }

    /**
     * Treats key down event.
     *
     * @param {Object} event Event structure
     */
    static _keydown(event) {
        let key = (event.keyCode || event.which);

        //Browsers compatible with IE not catch BACKSPACE and DELETE keys on keypress event.
        //To fix this problem, the keydown event takes these keys and calls the keypress event
        if (key === 8) {
            event.byInmask = true;
            event.target.aMaskFunctionKeyPress(event);
        } else if (key === 46) {
            event.keyCode = Inmask._deleteCode;
            event.keyCode = Inmask._deleteCode;
            event.byInmask = true;
            event.target.aMaskFunctionKeyPress(event);
        }
    }

    /**
     * Treats integer mask.
     *
     * @param {Object} event Event structure
     */
    static _maskInteger(event) {
        let elem = event.target;
        let start = Inmask._getTextCursorPosition(elem, true);
        let end	= Inmask._getTextCursorPosition(elem, false);
        let code = (event.which || event.charCode);
        let char = String.fromCharCode(code);
        let value = elem.value;
        let max = elem.maskAttr.length;
        let valid = true;

        if ((code === 8 || code === Inmask._deleteCode) && event.byInmask !== true) {
            return; //Compatibility between browsers
        }

        if (code === 0) {
            //Special key
            return;
        } else if (event.ctrlKey === true) {
            //Control key pressed
            valid = false;
        } else if (code === 8) {
            //Backspace
            if (start === end) {
                value = value.substring(0, start - 1) + value.substring(end);
            } else {
                value = value.substring(0, start) + value.substring(end);
            }

            if (start !== 0) {
                if (start !== end) {
                    elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - (end - start);
                } else {
                    elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - 1;
                }
            } else {
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - (end - start);
            }
        } else if (code === Inmask._deleteCode) {
            //Delete
            if (start === end) {
                value = value.substring(0, start) + value.substring(end + 1);
            } else {
                value = value.substring(0, start) + value.substring(end);
            }

            elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - (end - start);
        } else {
            if ((code === 45 && elem.aMask.positive !== true) || (code >= 48 && code <= 57)) {
                //Validates the key
                //If there is selection, removes the range
                if (start !== end) {
                    value = value.substring(0, start) + value.substring(end);
                }

                //Gets the value
                value = value.substring(0, start) + char + value.substring(start);

                //Validates the value
                if (Inmask._patternInteger.test(value) === false ||
                    (value.length > max && value.charAt(0) !== '-') ||
                    (value.length > max + 1 && value.charAt(0) === '-')) {
                    valid = false;
                } else {
                    elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) + 1 - (end - start);
                }
            } else {
                valid = false;
            }
        }

        //Stores the value
        if (valid === true) {
            elem.maskLastValue = value;
        } else {
            elem.maskCursorPosition = Inmask._getTextCursorPosition(elem);
        }

        //Adjusts the value
        setTimeout(elem.aMaskFunctionAdjustValue, 10);
    }

    /**
     * Treats decimal mask.
     *
     * @param {Object} event Event structure
     */
    static _maskDecimal(event) {
        let elem = event.target;
        let start = Inmask._getTextCursorPosition(elem, true);
        let end	= Inmask._getTextCursorPosition(elem, false);
        let code = (event.which || event.charCode);
        let char = String.fromCharCode(code);
        let value = elem.value;
        let valid = true;
        let decimalSeparator = I18n.getNumberDecimalSeparator().charCodeAt(0);
        let keyType = 0;
        let patternDecimal;
        let test;

        if ((code === 8 || code === Inmask._deleteCode) && event.byInmask !== true) {
            return; //Compatibility between browsers
        }

        if (code === 0) {
            //Special key
            return;
        } else if (event.ctrlKey === true) {
            //Control key pressed
            valid = false;
        } else if (code === 8) {
            //Backspace
            if (start === end) {
                value = value.substring(0, start - 1) + value.substring(end);
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - 1;
            } else {
                value = value.substring(0, start) + value.substring(end);
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - (end - start);
            }
            keyType = 1;
        } else if (code === Inmask._deleteCode) {
            //Delete
            if (start === end) {
                value = value.substring(0, start) + value.substring(end + 1);
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem);
            } else {
                value = value.substring(0, start) + value.substring(end);
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - (end - start);
            }
            keyType = 2;
        } else {
            if ((code === 45 && elem.aMask.positive !== true) || code === decimalSeparator
                || (code >= 48 && code <= 57)) {
                //Validates the key
                //If there is selection, removes the range
                if (start !== end) {
                    value = value.substring(0, start) + value.substring(end);
                }

                //Gets the value
                value = value.substring(0, start) + char + value.substring(start);

                //Removes the group separators
                test = value.replace(new RegExp("\\" + I18n.getNumberGroupSeparator(), "g"), "");

                //Validates the value
                patternDecimal = new RegExp("^-{0,1}(\\d*|\\d+\\" + I18n.getNumberDecimalSeparator() + "\\d*)$");
                if (patternDecimal.test(test) === false) {
                    valid = false;
                } else {
                    //Validates the size
                    if (test.replace(/\D/g, "").length > elem.maskAttr.totalDigits) {
                        valid = false;
                    } else {
                        test = new RegExp("\\" + I18n.getNumberDecimalSeparator() + "\\d*").exec(test);
                        if (test !== null && test[0].length - 1 > elem.maskAttr.totalDecimal) {
                            valid = false;
                        } else {
                            elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) + 1 - (end - start);
                        }
                    }
                }
            } else {
                valid = false;
            }
        }

        //Stores the value
        if (valid === true) {
            elem.maskLastValue = Inmask._formatDecimal(elem, value, keyType);
        } else {
            elem.maskCursorPosition = Inmask._getTextCursorPosition(elem);
        }

        //Adjusts the value
        setTimeout(elem.aMaskFunctionAdjustValue, 10);
    }

    /**
     * Treats string mask.
     *
     * @param {Object} event Event structure
     */
    static _maskString(event) {
        let elem = event.target;
        let start = Inmask._getTextCursorPosition(elem, true);
        let end	= Inmask._getTextCursorPosition(elem, false);
        let code = (event.which || event.charCode);
        let char = String.fromCharCode(code);
        let value = elem.value;
        let valid = true;
        let keyType = 0;

        if ((code === 8 || code === Inmask._deleteCode) && event.byInmask !== true) {
            return; //Compatibility between browsers
        }

        if (code === 0) {
            //Special key
            return;
        } else if (event.ctrlKey === true) {
            //Control key pressed
            valid = false;
        } else if (code === 8) {
            //Backspace
            if (start === end) {
                value = value.substring(0, start - 1) + value.substring(end);
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - 1;
            } else {
                value = value.substring(0, start) + value.substring(end);
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - (end - start);
            }
            keyType = 1;
        } else if (code === Inmask._deleteCode) {
            //Delete
            if (start === end) {
                value = value.substring(0, start) + value.substring(end + 1);
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem);
            } else {
                value = value.substring(0, start) + value.substring(end);
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) - (end - start);
            }
            keyType = 2;
        } else {
            //Validates the key
            if (code >= 32) {
                //If there is selection, removes the range
                if (start !== end) {
                    value = value.substring(0, start) + value.substring(end);
                }

                //Gets the value
                value = value.substring(0, start) + char + value.substring(start);

                //Current cursor position
                elem.maskCursorPosition = Inmask._getTextCursorPosition(elem) + 1 - (end - start);
            } else {
                valid = false;
            }
        }

        //Stores the value
        if (valid === true) {
            elem.maskLastValue = Inmask._formatString(elem, value, keyType);
        } else {
            elem.maskCursorPosition = Inmask._getTextCursorPosition(elem);
        }

        //Adjusts the value
        setTimeout(elem.aMaskFunctionAdjustValue, 10);
    }

    /**
     * Starts the string mask.
     *
     * @param {Object} elem HTML input element
     */
    static _startStringMask(elem) {
        //Default character masks
        if (elem.maskAttr.custom === undefined)
            elem.maskAttr.custom = [];

        if (elem.maskAttr.custom["A"] === undefined)
            elem.maskAttr.custom["A"] = {regex: new RegExp("[A-Za-z]")};

        if (elem.maskAttr.custom["S"] === undefined)
            elem.maskAttr.custom["S"] = {regex: new RegExp("[A-Z]")};

        if (elem.maskAttr.custom["s"] === undefined)
            elem.maskAttr.custom["s"] = {regex: new RegExp("[a-z]")};

        if (elem.maskAttr.custom["0"] === undefined)
            elem.maskAttr.custom["0"] = {regex: new RegExp("[0-9]")};

        if (elem.maskAttr.custom["*"] === undefined)
            elem.maskAttr.custom["*"] = {regex: new RegExp("[A-Za-z0-9]")};
    }

    /**
     * Sets the cursor position of a input text(i.g.: Textfield).
     *
     * @param {Object} elem HTML element
     * @param {number} pos  The cursor position
     */
    static _setTextCursorPosition(elem, pos) {
        if (elem.selectionEnd !== undefined) {
            elem.selectionStart = pos;
            elem.selectionEnd = pos;
        } else {
            let range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    /**
     * Gets the cursor position of a input text(i.g.: Textfield).
     * IMPORTANT: If there is a selection, it is necessary to choose the start or end of the selection.
     *
     * @param {Object} elem  HTML element
     * @param {number} start If true, returns the start position of selection, otherwise returns the end position
     *
     * @return {number} cursor position (start or end of selection).
     */
    static _getTextCursorPosition(elem, start) {
        if (document.selection) {
            let range = document.selection.createRange();
            let storedRange = range.duplicate();
            storedRange.expand('textedit');
            storedRange.setEndPoint('EndToEnd', range);

            let selectionStart = storedRange.text.length - range.text.length;
            let selectionEnd = selectionStart + range.text.length;
            return (start === true ? selectionStart : selectionEnd);
        } else {
            let region = (start === true ? "selectionStart" : "selectionEnd");

            if (typeof(elem[region]) !== "undefined") {
                return elem[region];
            } else {
                return elem.value.length;
            }
        }
    }


    /**
     * Sets the mask for an input element.
     * <br><b>(Overloaded)</b><br>
     *
     * The "mask" parameter is a structure with the follow attributes:
     * <ul>
     *   <li>type: Type of mask: "int"(Only integer value), "decimal"(Only decimal value), "date"(Only date value) or
     *             "string"(Custom mask) (String);</li>
     *   <li>length: Total of digits. Only "int" and "decimal" types (Integer):</li>
     *   <li>decimals: Total of decimals. Only "decimal" types (Integer);</li>
     *   <li>definition: Definition of mask. Only "string" type (String);</li>
     *   <li>positive: Positive number. Only "int" and "decimal" types (Boolean);</li>
     *   <li>custom: See bellow (Object).</li>
     * </ul>
     * The syntax of "custom" attribute:
     * <ul>
     *   <li>key: Character (String);</li>
     *   <li>value: Attributes(Object):
     *               <ul>
     *                 <li>regex: Text of regular expression. Optional(String);
     *                 <li>keyPressed: Function that handles the pressed key event (function). Optional.
     *                                 Parameter:
     *                                 <ul>
     *                                   <li>valueUntilPosition: Value until the position in treatment (String)</li>
     *                                   <li>lastValue: The last value (String)</li>
     *                                   <li>mask: Current mask (String)</li>
     *                                 </ul>
     *                                 Returns JSON with:
     *                                 <ul>
     *                                   <li>value: New value until the position in treatment (String)</li>
     *                                   <li>mask: New mask. The syntax is equal of this parameter mask of
     *                                   setMask (Object)</li>
     *                                 </ul></li>
     *               </ul>
     *   <li>OBS: The default behavior of characters are:
     *     <ul>
     *       <li>A - Alpha character (A-Z,a-z);</li>
     *       <li>S - Alpha upper case character (A-Z);</li>
     *       <li>s - Alpha lower case character (a-z);</li>
     *       <li>0 - Numeric character (0-9);</li>
     *       <li>* - Alphanumeric character (A-Z,a-z,0-9)</li>
     *     </ul></li>
     * </ul>
     *
     * @param {Object} elem HTML input element
     * @param {Object} mask Feature of mask
     */
    static setMask(elem, mask) {
        //Does general configurations
        Inmask.removeMask(elem);
        $(elem).on("keydown", Inmask._keydown);
        elem.aMask = mask;
        elem.maskLastValue = "";
        elem.maskCursorPosition = null;

        let inmask = this;
        elem.aMaskFunctionAdjustValue = function () {
            inmask._adjustValue(elem)
        };

        if (mask.type === "int") {
            //Integer mask
            $(elem).on("keypress", Inmask._maskInteger);
            elem.maskAttr = {length: mask.length};
            elem.aMaskFunctionKeyPress = Inmask._maskInteger;
            $(elem).css("text-align", "right");
        } else if (mask.type === "decimal") {
            //Decimal mask
            $(elem).on("keypress", Inmask._maskDecimal);
            elem.maskAttr = {totalDigits: mask.length, totalDecimal: mask.decimals};
            elem.aMaskFunctionKeyPress = Inmask._maskDecimal;
            $(elem).css("text-align", "right");
        } else if (mask.type === "date") {
            //Date mask
            $(elem).on("keypress", Inmask._maskString);
            if (I18n.getDateType() === 2) {
                elem.maskAttr = {definition: "00/00/0000"};
            } else {
                elem.maskAttr = {definition: "00/00/0000"};
            }
            elem.aMaskFunctionKeyPress = Inmask._maskString;
            Inmask._startStringMask(elem);
        } else if (mask.type === "string") {
            //String mask
            $(elem).on("keypress", Inmask._maskString);
            elem.maskAttr = {definition: mask.definition, custom: mask.custom};
            elem.aMaskFunctionKeyPress = Inmask._maskString;
            Inmask._startStringMask(elem);
        } else {
            throw new Error("Invalid mask.");
        }
    }

    /**
     * Removes the mask.
     *
     * @param {Object} elem HTML input element
     */
    static removeMask(elem) {
        if (elem.aMaskFunctionAdjustValue !== null) {
            elem.aMask = null;
            elem.aMaskFunctionAdjustValue = null;
            elem.maskLastValue = null;
            elem.maskCursorPosition = null;
            elem.maskAttr = null;
            $(elem).off("keypress", elem.aMaskFunctionKeyPress);
            elem.aMaskFunctionKeyPress = null
        }
    }
}
