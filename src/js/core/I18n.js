/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Internationalization of client.
 * <br>
 * Pay attention: this class is static.
 *
 * @author Fernando Viegas
 */
class I18n {
    /** Type of date format. */
    static _dateType = 2;

    /** Date separator. */
    static _dateSeparator = "/";

    /** Decimal separator in fractional number. */
    static _numberDecimalSeparator = ".";

    /** Group separator in number. */
    static _numberGroupSeparator = ",";


    /**
     * Sets the configuration of this class.
     *
     * @param {number} dateType               Type of date format: 0-"mm/dd/yyyy", 1-"dd/mm/yyyy", 2-"yyyy/mm/dd"
     * @param {string} dateSeparator          Date separator
     * @param {string} numberDecimalSeparator Decimal separator in fractional number
     * @param {string} numberGroupSeparator   Group separator in number
     */
    static setConfiguration(dateType, dateSeparator, numberDecimalSeparator, numberGroupSeparator) {
        I18n._dateType = dateType;
        I18n._dateSeparator = dateSeparator;
        I18n._numberDecimalSeparator = numberDecimalSeparator;
        I18n._numberGroupSeparator = numberGroupSeparator;
    }

    /**
     * Gets the type of date format.
     *
     * @return {number} type of date format. Types:
     * <ul>
     * <li>0- "mm/dd/yyyy";</li>
     * <li>1- "dd/mm/yyyy";</li>
     * <li>2- "yyyy/mm/dd".</li>
     * </ul>
     */
    static getDateType() {
        return I18n._dateType;
    }

    /**
     * Gets the date separator.
     *
     * @return {string} date separator.
     */
    static getDateSeparator() {
        return I18n._dateSeparator;
    }

    /**
     * Gets the decimal separator in fractional numbers.
     *
     * @return {string} decimal separator in fractional numbers.
     */
    static getNumberDecimalSeparator() {
        return I18n._numberDecimalSeparator;
    }

    /**
     * Gets the group separator in fractional numbers.
     *
     * @return {string} group separator in fractional numbers.
     */
    static getNumberGroupSeparator() {
        return I18n._numberGroupSeparator;
    }

    /**
     * Rounds the number.
     *
     * @param {number} value    Value of number
     * @param {number} decimals Total of fractional numbers
     *
     * @return {number} rounded number.
     */
    static roundNumber(value, decimals) {
        return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
    }

    /**
     * Converts the date to text.
     *
     * @param {Date} date The date to be format
     *
     * @return {string} text of date. Example: "2018/10/30".
     */
    static dateToString(date) {
        if (!date) {
            return "";
        }

        let year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString().padStart(2, "0");
        let day = date.getDate().toString().padStart(2, "0");

        switch (I18n.getDateType()) {
            case 0:
                return month + I18n._dateSeparator + day + I18n._dateSeparator + year;

            case 1:
                return day + I18n._dateSeparator + month + I18n._dateSeparator + year;

            default:
                return year + I18n._dateSeparator + month + I18n._dateSeparator + day;
        }
    }

    /**
     * Converts the time to text.
     *
     * @param {Date} date                 The date with time
     * @param {boolean=} showSeconds      If true, show seconds. If omitted, doesn't show
     * @param {boolean=} showMilliseconds If true, show seconds. If omitted, doesn't show
     *
     * @return {string} text of time. Examples: "09:20", "09:20:15", "09:20:15:435".
     */
    static timeToString(date, showSeconds, showMilliseconds) {
        if (!date) {
            return "";
        }

        let text = date.getHours() + ":" + date.getMinutes();
        if (showSeconds) {
            text += ":" + date.getSeconds();
        }
        if (showMilliseconds) {
            text += ":" + date.getMilliseconds();
        }
        return text;
    }

    /**
     * Converts the date and time to text.
     *
     * @param {Date} date                 The date to be format
     * @param {boolean=} showSeconds      If true, show seconds. If omitted, doesn't show
     * @param {boolean=} showMilliseconds If true, show seconds. If omitted, doesn't show
     *
     * @return {string} text of date. Example: "2018/10/30 07:28".
     */
    static dateTimeToString(date, showSeconds, showMilliseconds) {
        return (I18n.dateToString(date) + " " + I18n.timeToString(date, showSeconds, showMilliseconds)).trim();
    }

    /**
     * Converts a number(decimal or integer) to text.
     *
     * @param {number} value     Number value
     * @param {number=} decimals Total of fractional numbers. If omitted, considers 0 decimals
     *
     * @return {string} text that represents the number.
     */
    static numberToString(value, decimals) {
        if (value === null) {
            return "";
        }

        if (!decimals) {
            decimals = 0;
        }

        let negative = value < 0 ? "-" : "";
        let intValue = parseInt(value = Math.abs(+value || 0).toFixed(decimals), 10) + "";
        let firstDigits = intValue.length > (decimals + 1) ? intValue.length % (decimals + 1) : 0;

        return negative + (firstDigits ? intValue.substr(0, firstDigits)
            + I18n._numberGroupSeparator : "")
            + intValue.substr(firstDigits).replace(/(\d{3})(?=\d)/g, "$1" + I18n._numberGroupSeparator)
            + (decimals ? I18n._numberDecimalSeparator
                + Math.abs(value - intValue).toFixed(decimals).slice(2) : "");
    }

    /**
     * Converts a text to date.
     * <br>
     * Only the date is converted. The time will be the current.
     *
     * @param {string} text Text of date. Example: "2018/10/30"
     *
     * @return {Date} converted date.
     */
    static stringToDate(text) {
        if (!text) {
            return new Date();
        }

        let year, month, day;
        switch (I18n.getDateType()) {
            case 0:
                year = text.substring(6, 10);
                month = text.substring(0, 2);
                day = text.substring(3, 5);
                break;
            case 1:
                year = text.substring(6, 10);
                month = text.substring(3, 5);
                day = text.substring(0, 2);
                break;
            default:
                year = text.substring(0, 4);
                month = text.substring(5, 7);
                day = text.substring(8, 10);
                break;
        }

        return new Date(year, month, day);
    }

    /**
     * Converts a text to time.
     * <br>
     * Only the time is converted. The date will be the current.
     *
     * @param {string} text Text of time. Example: "07:28"
     *
     * @return {Date} converted time.
     */
    static stringToTime(text) {
        if (!text) {
            return new Date();
        }

        if (text.length < 7) {
            return new Date(
                parseInt(text.substring(0, 2)),
                parseInt(text.substring(3, 5)));
        } else if (text.length < 10) {
            return new Date(
                parseInt(text.substring(0, 2)),
                parseInt(text.substring(3, 5)),
                parseInt(text.substring(6, 8))
            );
        } else {
            return new Date(
                parseInt(text.substring(0, 2)),
                parseInt(text.substring(3, 5)),
                parseInt(text.substring(6, 8)),
                parseInt(text.substring(9, 12))
            );
        }
    }

    /**
     * Converts a text to date and time.
     *
     * @param {string} text Text of date. Example: "2018/10/30 07:28"
     *
     * @return {Date} converted date and time.
     */
    static stringToDateTime(text) {
        if (!text) {
            return new Date();
        }

        let date = I18n.stringToDate(text);
        let time = I18n.stringToTime(text.substring(11));
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        date.setSeconds(time.getSeconds());
        date.setMilliseconds(time.getMilliseconds());
        return date;
    }

    /**
     * Converts a text to number.
     *
     * @param {string} value Text value
     *
     * @return {number} converted number.
     */
    static stringToNumber(value) {
        let text = value.replace(".", "").replace(",",".");
        if (text.indexOf(".") >= 0) {
            return parseFloat(text);
        } else {
            return parseInt(text);
        }
    }

}
