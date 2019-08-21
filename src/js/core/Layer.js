/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Manager of layers.
 * A layer is a HTML content inside of an element. An element may has one or more layers.
 * <br>
 * <b>Definition:</b><br>
 * An element must have the "data-layers" attribute equal to "true" to say that it has layers.
 * After that, use this class to display contents in layers. Every time that the element receives a new content, a new
 * layer is created and displayed and the previous layer is hidden.
 * When the current content is removed, the last layer is deleted and the previous layer is displayed. The operation is
 * similar to stacking.
 * <b>Example:<b><br>
 * <pre>
 *     ...
 *     <div id="elementWithLayer" data-layers="true"></div>
 *     ...
 *     //Show "Hello"
 *     Layer.show("elementWithLayer", "Hello");
 *     //Show "I have layers" and hides "Hello"
 *     Layer.show("elementWithLayer", "I have layers");
 *     //Remove "I have layers" and shows "Hello"
 *     Layer.remove("elementWithLayer");
 * </pre>
 *
 * @author Fernando Viegas
 */
class Layer {
    /** Map of elements configuration with layers. Each item has the following structure:
     {
       total: total of layers that the element has;
       events: [{ name: name of event, elem: element of layer, func: function of event }]
     } */
    static _elementsWithLayers = {};


    /**
     * Removes the configuration events of layer.
     *
     * @param elemWithLayers Element with layers
     * @param layer          Element of layer
     *
     * @private
     */
    static _removeEventsOfLayer(elemWithLayers, layer) {
        let config = Layer._elementsWithLayers[elemWithLayers.id];
        if (config) {
            let removed = true;
            //Remove all events of layer
            while (removed) {
                removed = false;
                for (let i = 0; i < config.events.length; i++) {
                    if (config.events[i].elem === layer) {
                        config.events.splice(i, 1);
                        removed = true;
                        break;
                    }
                }
            }
        }
    }

    /**
     * Executes the event of layer.
     *
     * @param name           Name of event
     * @param elemWithLayers Element with layers
     * @param layer          Element of layer
     *
     * @private
     */
    static _executeEvents(name, elemWithLayers, layer) {
        let config = Layer._elementsWithLayers[elemWithLayers.id];
        if (config) {
            for (let i = 0; i < config.events.length; i++) {
                if (config.events[i].name === name && config.events[i].elem === layer) {
                    config.events[i].func();
                }
            }
        }
    }

    /**
     * Hides the current content and shows a new.
     *
     * @param {string} id      Element ID with layers
     * @param {string} content New content
     */
    static show(id, content) {
        //If current content isn't controlled by layer, remove all
        let elem = document.getElementById(id);
        if (elem.dataset.layers !== "true") {
            console.error("'" + id + "' element hasn't layers. Defines the attribute 'data-layers' equals 'true'.");
            return;
        }

        //Create the configuration if it is the first time
        if (!Layer._elementsWithLayers[id]) {
            Layer._elementsWithLayers[id] = {total: 0, events: []};
        }

        let totalLayers = Layer._elementsWithLayers[id].total;
        if (totalLayers !== elem.children.length) {
            while (elem.children.length > 0) {
                elem.removeChild(elem.children[0]);
            }
            totalLayers = 0;
        }
        Layer._elementsWithLayers[id].total = ++totalLayers;

        //Hide the current content
        if (elem.children.length > 0) {
            elem.children[elem.children.length - 1].style.display = "none";
        }

        //Show the new content
        $(elem).append("<div>" + content + "</div>");
    }

    /**
     * Appends the content in current layer of element.
     *
     * @param {string} id      Element ID with layers
     * @param {string} content New content
     */
    static appendInCurrentLayer(id, content) {
        let elem = document.getElementById(id);
        $(elem.children[elem.children.length - 1]).append(content);
    }

    /**
     * Removes the current layer and shows the previous.
     *
     * @param {object} target ID or object of the element with layers. If element hasn't layer, consider it a child and
     *                        look for a parent with layers
     */
    static remove(target) {
        let elem = Layer.getElementWithLayers(target);

        //Remove the last content
        let lastLayer = elem.children[elem.children.length - 1];
        Layer._removeEventsOfLayer(elem, lastLayer);
        elem.removeChild(lastLayer);
        Layer._elementsWithLayers[elem.id].total = Layer._elementsWithLayers[elem.id].total - 1;

        //Show the new last content
        if (elem.children.length > 0) {
            elem.children[elem.children.length - 1].style.display = "block";
            Layer._executeEvents("show", elem, elem.children[elem.children.length - 1]);
        }
    }

    /**
     * Removes all layers of element.
     *
     * @param {string} id Element ID with layers
     */
    static clear(id) {
        let elem = document.getElementById(id);

        while (elem.children.length > 0) {
            elem.removeChild(elem.children[0]);
        }

        delete Layer._elementsWithLayers[id];
    }

    /**
     * Adds a listener when an event happens.
     * <br>
     * Event available:
     * <ul>
     *   <li>show - The layer is shown after being hidden.</li>
     * </ul>
     *
     * @param {object} target ID or object of element within a layer. If it is the element with layers itself, it takes
     *                        the last layer (currently displayed)
     * @param {string} name   Event name
     * @param {function} func Function to be executed
     */
    static addEventListener(target, name, func) {
        //Search element with layers and layer element
        let layer;
        let elem = typeof target === 'string' ? document.getElementById(target) : target;
        if (elem.dataset.layers === "true") {
            //Element has layers
            layer = elem.children[elem.children.length - 1];
        } else {
            //Element under layer
            while (elem) {
                layer = elem;
                elem = elem.parentNode;
                if (elem.dataset.layers === "true") {
                    break;
                }
            }
        }

        //Add the event
        let config = Layer._elementsWithLayers[elem.id];
        if (config) {
            config.events[config.events.length] = {
                elem: layer,
                name: name,
                func: func
            };
        }
    }

    /**
     * Gets the element with layers.
     *
     * @param {object} target ID or object of the element with layers. If element hasn't layer, consider it a child and
     *                        look for a parent with layers
     *
     * @return {object} the element with layers.
     */
    static getElementWithLayers(target) {
        let elemWithLayers;

        if (target) {
            //Get element by id or object
            if (typeof target === 'string') {
                elemWithLayers = document.getElementById(target);
            } else {
                elemWithLayers = target;
            }

            if (elemWithLayers.dataset.layers !== "true") {
                //Element doesn't use layers. Consider a child. Searches a parent with layers
                while ((elemWithLayers = elemWithLayers.parentNode)) {
                    if (elemWithLayers.dataset.layers === "true") {
                        break;
                    }
                }
            }
        }

        return elemWithLayers
    }

}
