/**
 * Copyright (c) DigitalCrew and individual contributors.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

/**
 * Displays sets of data.
 *
 * Uses Datatables and its extensions: FixedColumns and Responsive.
 *
 * @author Fernando Viegas
 */
class Listing {
    /** If true, this component was first time. */
    static _firstTime = true;

    /** Element of component. */
    _elem;

    /** If true, component is ready to use. */
    _ready = false;

    /** Element of filter button. */
    _filterButton;

    /** Element of "select all" button. */
    _selectAllButton;

    /** Element of "deselect all" button. */
    _deselectAllButton;

    /** If true, the "oncreated" event was executed. */
    _isOncreatedExecuted = false;


    /**
     * Called when the listing component is ready to use.
     *
     * @private
     */
    _listingReady() {
        //Put the buttons to select or deselect all rows
        let id = $(this._elem).attr("id");
        let div = document.getElementById(id + "_filter");

        //Create the buttons of selection and filter
        let messages = Scaliby.getConfiguration().messages;
        let buttons = Base.createElement({
            tag: "span",
            id: id + "_select_buttons",
            parent: div,
            insertAt: 0
        });

        let attrs = ["title", messages.listing.filterButtonTitle, "data-mode", "text", "data-left-icon", "filter_list"];
        if (this._isOncreatedExecuted === false) {
            attrs[attrs.length] = "data-oncreated";
            attrs[attrs.length] = "Scaliby.getComponent('" + id + "')._onCreated()";
        }
        this._filterButton = Base.createElement({
            tag: "button",
            id: id + "_btn_filter",
            classes:["s-button"],
            attrs: attrs,
            parent: buttons,
            events: ["click", function() { Scaliby.getComponent(id)._sendFilterRequest(); }]
        });

        if (this._elem.dataset.type === "mult") {
            this._selectAllButton = Base.createElement({
                tag: "button",
                id: id + "_btn_select_all",
                classes:["s-button"],
                attrs: ["title", messages.listing.selectAllButtonTitle, "data-mode", "text", "data-left-icon", "layers"],
                parent: buttons,
                events: ["click", function() { Scaliby.getComponent(id).selectAll(); }]
            });

            this._deselectAllButton = Base.createElement({
                tag: "button",
                id: id + "_btn_deselect_all",
                classes:["s-button"],
                attrs: ["title", messages.listing.deselectAllButtonTitle, "data-mode", "text",
                    "data-left-icon", "layers_clear"],
                parent: buttons,
                events: ["click", function() { Scaliby.getComponent(id).deselectAll(); }]
            });
        }
        Scaliby.createComponents(id + "_select_buttons");

        //Adjust the layout of search input
        let search = div.querySelector("[type=search]");
        search.id = id + "_search";
        search.name = id + "_search";
        search.type = "text";
        search.dataset.label = "";
        search.dataset.icon = "search";
        search.classList.add("s-input");
        Scaliby.createComponent(search);
        search.parentNode.parentNode.style.display = "inline-block"; //container of textfield
        search.parentNode.style.backgroundColor = "transparent"; //main of textfield

        //General adjusts
        this._adjustMouseScroll();
        this._ready = true;
    }

    /**
     * Adjusts the mouse scroll by wheel.
     *
     * @private
     */
    _adjustMouseScroll() {
        if (this._elem.dataset.scroll === "horizontal" || this._elem.dataset.scroll === "horizontal-fixed-column") {
            let amount = 60;
            let scroller = this._elem.parentNode;

            let elem = this._elem;
            $(this._elem).bind("DOMMouseScroll mousewheel", function (event) {
                let oEvent = event.originalEvent;

                if (elem.dataset.scroll === "horizontal-fixed-column" && oEvent.target.tagName === "TD" &&
                    Base.getIndexOfElement(oEvent.target) === 0) {
                    //If the listing has a fixed column, horizontal scrolling should not be applied to the first column
                    return;
                }

                let direction = oEvent.detail ? oEvent.detail * -amount : oEvent.wheelDelta;
                let position = $(scroller).scrollLeft();

                position += direction > 0 ? -amount : amount;
                $(scroller).scrollLeft(position);
                event.preventDefault();
            });
        }
    }

    /**
     * Applies the format in the cell.
     *
     * @param {Object} td TD of cell
     * @param {Object} th TH of cell
     *
     * @private
     */
    _listingFormatColumn(td, th) {
        //Adjust the align
        let align = $(th).attr("data-align");
        if (align === "right") {
            $(td).css("text-align", "right");
        } else if (align === "center") {
            $(td).css("text-align", "center");
        } else {
            $(td).css("text-align", "left");
        }
    }

    /**
     * Selects the row of listing component.
     *
     * @param {Object} event The click event object
     * @param {Object} row   The row
     *
     *
     * @private
     */
    _listingOnRowClick(event, row) {
        let table = $(row).closest("table");
        let type = $(table).attr("data-type");
        let rows = $(table)[0].rows;

        if (type === "single") {
            $(rows).each(function () {
                $(this).removeClass("dataTable-tr-selected");
            });
            $(row).addClass("dataTable-tr-selected");
        } else if (type === "mult") {
            $(row).toggleClass("dataTable-tr-selected");
        }
    }

    /**
     * Executes a code defined in the "data-oncreated" after this component is created.
     *
     * @private
     */
    _onCreated() {
        this._isOncreatedExecuted = true;
        let elem = this._elem;
        let func = function() { eval(elem.dataset.oncreated); };
        func.apply(this._elem);
    }

    /**
     * Initializes the listing component.
     *
     * @private
     */
    _init() {
        //Build a list with columns names and their respective formatters
        let id = this._elem.id;
        let formatters = [];
        let columns = [];
        let thList = $(this._elem).find("th");
        let listing = this;

        for (let i = 0; i < thList.length; i++) {
            let name = $(thList[i]).attr("data-name");
            if (listing._elem.dataset.cellclass) {
                thList[i].classList.add(listing._elem.dataset.cellclass);
            }
            if (!name) {
                columns[i] = {"defaultContent": ""};
                formatters[formatters.length] = null;
            } else {
                if (!$(thList[i]).attr("data-formatter")) {
                    columns[i] = {
                        "data": name,
                        "createdCell": function (td, cellData, rowData, row, col) {
                            if (listing._elem.dataset.cellclass) {
                                td.classList.add(listing._elem.dataset.cellclass);
                            }
                            listing._listingFormatColumn(td, $("#" + id + " th")[col]);
                        }
                    };
                    formatters[formatters.length] = null;
                } else {
                    formatters[formatters.length] = {
                        "function": $(thList[i]).attr("data-formatter"),
                        "name": name
                    };

                    columns[i] = {
                        "data": name,
                        "createdCell": function (td, cellData, rowData, row, col) {
                            try {
                                if (listing._elem.dataset.cellclass) {
                                    td.classList.add(listing._elem.dataset.cellclass);
                                }
                                listing._listingFormatColumn(td, $("#" + id + " th")[col]);
                                rowData[formatters[col].name] = Base.executeFunctionByName(
                                    formatters[col].function, td, rowData[formatters[col].name], row, col);
                            } catch (ex) {
                                console.error("Error while applies the format in the cell by calling the function '" +
                                    formatters[col].function + "': ", ex);
                            }
                        }
                    }
                }
            }
        }

        //Ordering
        let order = [];
        if (listing._elem.dataset.ordering !== "false") {
            let zeros = "0000";
            let orderList = [];
            for (let i = 0; i < thList.length; i++) {
                let ordering = thList[i].dataset.order;
                if (ordering === undefined) {
                    continue;
                }
                let info = ordering.split("-");
                if (info.length === 1) {
                    orderList[orderList.length] = zeros + "_" + i + "," + info[0];
                } else {
                    orderList[orderList.length] = zeros.substring(0, 4 - info[1].length) +
                        info[1] + "_" + i + "," + info[0];
                }
            }

            orderList.sort();
            for (let i = 0; i < orderList.length; i++) {
                let values = orderList[i].substring(5).split(",");
                order[order.length] = [parseInt(values[0]), values[1]];
            }
        }

        //Build the config
        let source = this._elem.dataset.source;
        let ajax = function(data, callback, settings) {
            listing._getDataSource(source, callback);
        };

        let language = this._setLanguage();

        let elem = this._elem;
        let config = {
            destroy: true,
            language: language,
            dom: "<f<t>ip>",
            ajax: ajax,
            columns: columns,
            fnInitComplete: function() { listing._listingReady(elem); },
            ordering: listing._elem.dataset.ordering !== "false",
            order: order,
            rowCallback: function (row, data, index) {
                $(row).unbind();
                $(row).bind("click", function(event) { listing._listingOnRowClick(event, row); });
            },
        };

        if (this._elem.dataset.scroll === "horizontal") {
            config.scrollX = true;
        } else if (this._elem.dataset.scroll === "horizontal-fixed-column") {
            config.scrollX = true;
            config.fixedColumns = true;
        } else {
            config.responsive =  true;
        }

        //Apply the component in the "table" element
        $(this._elem).DataTable(config);
        this.setRowsPerPage(this._elem.dataset.rowsPerPage ? this._elem.dataset.rowsPerPage : -1);
    }

    /**
     * Sends the request of filter.
     *
     * @private
     */
    _sendFilterRequest() {
        let filter = this._elem.dataset.filter;
        if (filter && filter.startsWith("javascript:")) {
            //From Javascript code
            eval(filter.substring(11));
            this.refresh();
        } else {
            //From URL
            let listing = this;
            Comm.send({
                path: filter,
                fields: ["listingId", this._elem.id],
                id: this._elem.id,
                lockedList: [this.getContainer()],
                type: "GET"
            });
        }
    }

    /**
     * Sets the messages language.
     *
     * @return {Object} the configuration of messages language.
     *
     * @private
     */
    _setLanguage() {
        let messages = Scaliby.getConfiguration().messages;
        return {
            "sEmptyTable": messages.listing.recordNotFound,
            "sInfo": "(_START_-_END_ de _TOTAL_)",
            "sInfoEmpty": "",
            "sInfoFiltered": "",
            "sInfoPostFix": "",
            "sInfoThousands": ".",
            "sLengthMenu": "_MENU_ " + messages.listing.rowsPerPage,
            "sLoadingRecords": messages.listing.loading,
            "sProcessing": messages.listing.processing,
            "sZeroRecords": messages.listing.recordNotFound,
            "sSearch": "",
            "oPaginate": {
                "sNext": ">",
                "sPrevious": "<",
                "sFirst": "<<",
                "sLast": ">>"
            },
            "oAria": {
                "sSortAscending": messages.listing.sortAscending,
                "sSortDescending": messages.listing.sortDescending
            }
        };
    }

    /**
     * Create CSSs that depends of configuration.
     *
     * @private
     */
    _createCSS() {
        if (Listing._firstTime === false) {
            return;
        }
        Listing._firstTime = false;

        let dir = Scaliby.getConfiguration().imageDirectory;
        let sheet = document.createElement('style');
        sheet.innerHTML =
            "table.dataTable thead .sorting {" +
            "    background-image: url('" + dir + "sort_both.png');" +
            "}" +
            "table.dataTable thead .sorting_asc {" +
            "    background-image: url('" + dir + "sort_asc.png');" +
            "}" +
            "table.dataTable thead .sorting_desc {" +
            "    background-image: url('" + dir + "sort_desc.png');" +
            "}" +
            "table.dataTable thead .sorting_asc_disabled {" +
            "    background-image: url('" + dir + "sort_asc_disabled.png');" +
            "}" +
            "table.dataTable thead .sorting_desc_disabled {" +
            "    background-image: url('" + dir + "sort_desc_disabled.png');" +
            "}";
        document.body.appendChild(sheet);
    }

    /**
     * Get the data source(Javascript code or URL).
     *
     * @param {string} source     Data source
     * @param {function} callback Function to call with data source
     *
     * @private
     */
    _getDataSource(source, callback) {
        let listing = this;

        if (source && source.startsWith("javascript:")) {
            //From Javascript code
            let lockedElems = LoadingSpinner.createAndlockElements([this.getContainer()]);
            function execCallback(source, lockedElements) {
                let data = listing._processDataSource(eval(source.substring(11)));
                LoadingSpinner.unlockElements(lockedElems);
                return data;
            }

            callback({ "data": execCallback(source, lockedElems) });
        } else {
            //From URL
            Comm.send({
                path: source,
                lockedList: [this.getContainer()],
                callback: function(jsonData) { callback({ "data": listing._processDataSource(jsonData) }) },
                dataType: "json",
                type: "GET"
            });
        }
    }

    /**
     * Process the data result to get the information.
     *
     * @param {Object} data Data source
     *
     * @return {Array} the array of rows.
     *
     * @private
     */
    _processDataSource(data) {
        let msgElem = document.getElementById(this._elem.id + "_msg");
        if (!msgElem) {
            msgElem = Base.createElement({
                tag: "div",
                id: this._elem.id + "_msg",
                styles: ["color", "#ff4040"],
                parent: document.getElementById(this._elem.id + "_filter").parentNode,
                insertAt: 1
            });
        }
        msgElem.innerHTML = data.msg ? data.msg : "";

        return data.rows;
    }


    /**
     * Constructor.
     * <br>
     * Creates/updates the "listing" component.<br>
     * The element that receives the component must have the following structure as in the example below:
     * <pre>
     * <table id="myListing" data-source="link or javascript code with rows" data-type="type of listing"
     *  data-filter="link or javascript code to filter" data-oncreated="function name to call after the component is
     *  created" data-rows-per-page="number of rows per page">
     *     <thead>
     *          <th data-name="name of column" data-align="align of column" data-formatter="formatting method">
     *              Column Title</th>
     *          ...
     *     </thead>
     * </table>
     * </pre>
     *
     * The listing type ("data-type" attribute in "table" element) may have the following values:
     * <ul>
     *     <li>none - No selection;</li>
     *     <li>single - Allows to select only one row;</li>
     *     <li>mult - Allows to select one or more rows.</li>
     * </ul>
     *
     * By default, ordering is allowed. To remove ordering, defines the "data-order" attribute with "false" in "table"
     * element.
     * <br>
     *
     * To activate horizontal scroll ("data-scroll" attribute in "table" element):
     * <ul>
     *   <li>horizontal - Put the horizontal scroller;</li>
     *   <li>horizontal-fixed-column - Put the horizontal scroller and put the first fixed column.</li>
     * </ul>
     *
     * The align type of column ("data-align" attribute in "th" element) may have the following values:
     * <ul>
     *     <li>left - Left align;</li>
     *     <li>center - Center align;</li>
     *     <li>right - Right align.</li>
     * </ul>
     * The formatter of column ("data-formatter" attribute in "th" element) is the name of method to call. The
     * parameters are:
     * <ul>
     *     <li>column - "td" element of column;</li>
     *     <li>value - Column value in the correct type;<.li>
     *     <li>rowIndex - Row number of column;</li>
     *     <li>colIndex - Column number;</li>
     *     <li>The return must be the column value in the desired type. This information is important to searching
     *         and ordering.</li>
     * </ul>
     * The ordering of column ("data-order" attribute in "th" element) has the structure "direction-sequence"
     * (examples: "desc", "asc-2"):
     * <ul>
     *     <li>direction - "asc" for ascending order or "desc" for descending order;</li>
     *     <li>sequence - Optional. If there is more than one ordered column this number defines the ordering
     *                    sequence of the columns from lowest to highest.</li>
     * </ul>
     *
     * @param {object} elem Element(table) that receives the "listing" component
     */
    constructor(elem) {
        if (elem.component) {
            return;
        }

        if (elem.classList.contains("dataTable") || Base.getClosest(elem, "table")) {
            return;
        }

        this._createCSS();

        elem.component = this;
        this._elem = elem;

        if ($(elem).find("th").length !== 0) {
            //There are columns
            this._init();
        } else {
            this._onCreated();
        }
    }

    /**
     * Update the component.
     */
    update() {
        if (this._ready) {
            $(this._elem).dataTable().fnAdjustColumnSizing();
        }
    }

    /**
     * Clean up the component and MDC Web component.
     */
    destroy() {
        $(this._elem).dataTable().api().clear();
        $(this._elem).dataTable().api().destroy();
    }

    /**
     * Reloads the listing data.
     */
    refresh() {
        if (this._ready) {
            try {
                $(this._elem).dataTable().api().ajax.reload(null, false);
            } catch (ex) {
                console.error("Invalid data source: ", ex);
            }
        }
    }

    /**
     * Gets the container of elements.
     *
     * @return {Object} the container.
     */
    getContainer() {
        return document.getElementById(this._elem.id + "_wrapper"); //Created by Datatables
    }

    /**
     * Gets all rows.
     *
     * @return {json[]} a list of JSON. Each JSON represents a row. This JSON contains the names of columns and their
     * respective values.
     */
    getAllRows() {
        let table = $(this._elem).DataTable();
        return table.rows().data();
    }

    /**
     * Gets a list of selected rows.
     *
     * @param column The column name of row that to be collected instead of all columns. Optional
     *
     * @return {json[]} a list of JSON. Each JSON represents a row. This JSON contains the names of columns and their
     * respective values.
     */
    getSelectedRows(column) {
        let table = $(this._elem).DataTable();
        let data = table.rows().data();
        let nodes = table.rows().nodes();
        let list = [];

        if (column === null) {
            for (let i = 0; i < data.length; i++) {
                if ($(nodes[i]).hasClass("dataTable-tr-selected")) {
                    list.push(data[i]);
                }
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                if ($(nodes[i]).hasClass("dataTable-tr-selected")) {
                    list.push(data[i][column]);
                }
            }
        }

        return list;
    }

    /**
     * Selects all rows of listing component.
     */
    selectAll() {
        let table = $(this._elem).DataTable();
        let nodes = table.rows().nodes();

        $(nodes).each(function () {
            $(this).addClass("dataTable-tr-selected");
        });
    }

    /**
     * Deselects all rows of listing component.
     */
    deselectAll() {
        let table = $(this._elem).DataTable();
        let nodes = table.rows().nodes();

        $(nodes).each(function () {
            $(this).removeClass("dataTable-tr-selected");
        });
    }

    /**
     * Sets the columns to dynamically create.
     * <br>
     * Each Column structure is a Json with attributes:
     * <ul>
     *   <li>title: Title of column {string};</li>
     *   <li>name: Name of column {string};</li>
     *   <li>align: Align of column. See constructor {string};</li>
     *   <li>formatter: formatting method. See constructor {string};</li>
     *   <li>order: Defines the direction and sequence of ordering. See constructor {string}.</li>
     * </ul>
     *
     * @param {json[]} columns List of column structure
     */
    setColumns(columns) {
        //Destroy previous datatable
        if (this._ready === true) {
             $(this._elem).dataTable().api().clear();
             $(this._elem).dataTable().api().destroy();
        }
        this._ready = false;

        //Remove and create a "thead"
        let thead = this._elem.querySelector("thead");
        if (thead) {
            thead.parentNode.removeChild(thead);
        }
        thead = document.createElement("thead");
        this._elem.appendChild(thead);

        //Create the columns
        let tr = document.createElement("tr");
        thead.appendChild(tr);
        for (let i = 0; i < columns.length; i++) {
            let th = document.createElement("th");
            th.innerHTML = columns[i].title;
            th.dataset.name = columns[i].name;
            if (columns[i].align) {
                th.dataset.align = columns[i].align;
            }
            if (columns[i].formatter) {
                th.dataset.formatter = columns[i].formatter;
            }
            if (columns[i].order) {
                th.dataset.order = columns[i].order;
            }
            tr.appendChild(th);
        }

        //Initialize the listing
        this._init();
    }

    /**
     * Sets the rows per page.
     *
     * @param {number} rows Number of rows per page
     */
    setRowsPerPage(rows) {
        $(this._elem).dataTable().api().page.len(rows).draw();
        document.getElementById(this._elem.id + "_paginate").style.display = rows === -1 ? "none" : "block";
    }

    /**
     * Gets the element of filter button.
     *
     * @return {Element} the element.
     */
    getFilterButton() {
        return this._filterButton;
    }

    /**
     * Gets the element of "select all" button.
     *
     * @return {Element} the element.
     */
    get getSelectAllButton() {
        return this._selectAllButton;
    }

    /**
     * Gets the element of "deselect all" button.
     *
     * @return {Element} the element.
     */
    get getDeselectAllButton() {
        return this._deselectAllButton;
    }
}