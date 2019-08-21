/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Map of variables that can be shared between Javascript code fragments loaded during the application lifecycle.
 *
 * @author Fernando Viegas
 */
class SVar {
    /** Map of variables. */
    static _variables = {};


    /**
     * Stores a variable.
     *
     * @param {string} name  Name of variable. If starting with "#", the {@link SVar.clear} method doesn't remove the
     *                       variable, only the {@link SVar.clearAll} method can remove this variable
     * @param {object} value Value of variable
     */
    static set(name, value) {
        SVar._variables[name] = value;
    }

    /**
     * Gets the value of variable.
     *
     * @param {string} name Name of variable
     *
     * @return {object} the value.
     */
    static get(name) {
        return SVar._variables[name];
    }

    /**
     * Clears the variables with exception of variables starting with "#".
     */
    static clear() {
        for (let i = 0; i < SVar._variables.length; i++) {
            if (SVar._variables[i][0] !== "#") {
                delete SVar._variables[i];
            }
        }
    }

    /**
     * Clear all variables, including variables starting with "#".
     */
    static clearAll() {
        SVar._variables = {};
    }
}
