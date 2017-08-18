function setup() {
    const config_file = JSON.parse(get_file("parallel_plots_config.json"));
    var tab_list = Object.keys(config_file.tabs)
    var pie1_active = true
    show_tab(config_file.tabs[tab_list[0]])
    setup_options()
    manage_tabs()
    update_plot_with_options()
    toggle_data_hide()
    view_tooltip()
    //draw_pie_chart("#pieChart1", "000ca287-f6b6-47d3-945f-65e907544110")
    //draw_pie_chart("#pieChart2", "0a02f204-9e1d-4e09-811b-25ee2377cf08")

    /**
     * function manage_tabs
     * This function will listen for clicks and it will switch to that tab
     * using show_tab() function
     * 
     * @return {null}
     */
    function manage_tabs() {
        var tabs = d3.select('#tabs').selectAll('button')[0]
        //console.log(tabs)
        tabs.forEach(function (item, index) {
            //console.log(d3.select(item))
            d3.select(item).on('click', function () {
                //console.log(item.id)
                tab_options = config_file.tabs[item.id]
                console.log(tab_options)
                if (tab_options.length == 0){
                    return null
                }
                //console.log(tab_options)
                show_tab(tab_options)
                return null
            })
        })
    }

    /**
     * function show_tab
     *      This function will hide elements in a page thaat is not included in tab_options
     *      and reveal elements in the tab_options if they are hidden. the elements named tabs 
     *      are not hidden.
     * 
     * @param  {Array} tab_options Contains a list of html ids that should be shown.
     *                             Any ids not included here will be hidden in the page
     * @return {[null]}
     */
    function show_tab(tab_options) {
        var elems = document.body.children
        //console.log(tab_options)
        for (var i = 0, len = elems.length; i < len; i++) {
            //console.log(elems[i])
            if (tab_options.includes(elems[i].id) || (elems[i].id == "tabs")) {
                //console.log("VIEW: " + elems[i].id)
                //elems[i].style.visibility = 'visible'
                if (elems[i].id == 'end-uses-data-tab') {
                    elems[i].style.display = 'table';
                } else {
                    elems[i].style.display = 'block';
                }
            } else {
                //console.log("HIDE: " + elems[i].id)
                //elems[i].style.visibility = 'hidden'
                elems[i].style.display = 'none';
            }
        }
        return null
    }

    /**
     * function toggle_data_hide()
     * Listens to the "Show/Hide Data table" button click and toffles the visibility
     * of the Slickgrid's table and pager
     * 
     * @return {null}
     */
    function toggle_data_hide() {
        var button = document.getElementById('hideData');
        button.onclick = function () {
            var grid = document.getElementById('grid');
            var pager = document.getElementById('pager');
            if (grid.style.display != 'none') {
                grid.style.display = 'none';
                pager.style.display = 'none';
            } else {
                grid.style.display = 'block';
                pager.style.display = 'block';
            }
            return null
        };
        button = null
    }

    /**
     * Sends an xmlhttp request for reading/requesting files
     * @param  {String} name contains the filepath relative to index.html
     * @return {String} contains the contents of the file
     */
    function get_file(name) {
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", name, false);
        xmlhttp.send();
        return xmlhttp.responseText;
    }

    /**
     * Draws parallel coordinates plot with slickgrid
     * 
     * @param  {Array} data: contains simulations.json format datapoint
     *               if the "Refresh Plot" button is clicked,
     *               the previous PC's data is passed which does not have the same
     *               format as simulations.json. This was done to save memory and speed up
     *               the loading time.
     * @param  {Hash} dimensions: contains dimensions in the format of parallel_plots_config["dimensions"]
     *              see: https://github.com/syntagmatic/parallel-coordinates#parcoords_dimensions
     *              default dimensions has a value of null, if the "Refresh Plot" button is clicked,
     *              the previous dimensions is passed
     * @return {null}
     */
    function setup_canvas(data, dimensions = null) {
        /**
         * [color_by_bldg_type: contains the color scheme of PC for the baseline's "Select All" option]
         * @type {d3.scale}
         */
        var color_by_bldg_type = d3.scale.ordinal()
        .domain(get_all_building_type(get_baseline_status()))
        .range([
          "#3366cc", "#dc3912", "#ff9900", /*"#109618",*/
            "#990099", "#ffdb2a", "#dd4477", /*"#66aa00",*/
            "#b82e2e", "#316395", "#994499", "#22aa99",
            /*"#aaaa11",*/ "#6633cc", "#e67300", "#8b0707",
            "#651067", /*"#329262",*/ "#5574a6", "#3b3eac"

            ,"#ff782b"
            ]);

        //Get the range of "Total End Uses"
        end_use_extent = d3.extent(data, function(d) { return +d["Total End Uses (GJ)"]; });
        console.log(end_use_extent)
        /**
         * [green_to_red: contains the color scheme of PC for the ecm view]
         * @type {d3.scale}
         */
        var green_to_red = d3.scale.linear()
        .domain(end_use_extent)
        .range(["#8ff727", "#ea5833"]);

        /**
         * @param  {Hash} d: datapoint of PC
         * @return {d3.scale} Color scheme based on ecm/baseline view
         */
        var color = function (d) {
            //console.log(d);
            //console.log(d3.select("#pager"));
            option = d3.select("#bldgType").property("value")
            //if the view type is ecm and the datapoint is baseline set color to black 
            if(!get_baseline_status()){
                if (d['Baseline'] == "true"){
                    return "#000000"
                }
            }
            //if the building option is "Select All" set colour scheme to the multicolour 
            //based on building type; Otherwise, set the colour based on "Total End Uses"
            if (option == "Select All") {
                return color_by_bldg_type(d["Building Type"]);
            } else {
                return green_to_red(d["Total End Uses (GJ)"]);
            }

        };
        view_option = d3.select("#viewType").property("value")
        //var dimensions = {}
        //console.log(JSON.parse(JSON.stringify(config_file)).dimensions)
        //console.log("JSON.parse(JSON.stringify(config_file)).dimensions")

        /**
         * Generate dimensions for PC
         * Format of dimensions can be found https://github.com/syntagmatic/parallel-coordinates#parcoords_dimensions
         * dimensions determines which axis are shown in the PC plot
         */
        if (dimensions == null){
            //set dimension types based on the first datapoint
            dimensions = get_dimensions(data[0])
        }else{
            //merge the old dimensions witd the new filtered datapoints
            dimensions = $.extend({}, dimensions, get_dimensions(data[0], ))
            //clear the y axis scales for the new dimensions
            Object.keys(dimensions).forEach(function (key) {
                delete dimensions[key].yscale
            });
            //console.log(dimensions)
        }
        
        /**
         * if "Delete Singlular data Axis" is checked, then eleminates axis with a
         * single value - this is only applicapable of the number of datapoints > 2
         *
         * The axis are eleminated by deleting the axis-title from the dimensions variable
         */
        if (data.length > 2 && document.getElementById('delete_single').checked){
            Object.keys(dimensions).forEach(function (key) {
                //get the range of the data
                extent = d3.extent(data, function(d) { return +d[key]; });
                if (extent[0]==extent[1] && key != "Building Type"){
                    console.log("delete dimensions[\"" + key + "\"]")
                    eval("delete dimensions[\"" + key + "\"]")
                }
            }); 
        }

        // slickgrid needs each data element to have an id
        data.forEach(function (d, i) {d.id = d.id || i;});
        //console.log(d3.select("#chart").property("clientWidth"))

        //Set the PC plot width with a minimum of 1500 px to a maximum of (# of axis)*200px
        chart_width = Math.max(Object.keys(dimensions).length*200, 1500);
        document.getElementById('chart').style.width = chart_width+"px"
        //console.log(d3.select("#chart").property("clientWidth"))
        
        //Increase the default padding if "Building Type" is part of the axis
        left_padding = 30
        if (Object.keys(dimensions).indexOf("Building Type") != -1){
            left_padding = 125
        }

        // append the parallel coordinate chart to element #chart
        var parcoords = d3.parcoords()("#chart")
            .height(d3.select("#chart").property("scrollHeight"))
            .width(chart_width)
            .margin({
                top: 150, // need a lot of padding because of long axis title
                left: left_padding,
                right: 100,
                bottom: 16
            })
            .interactive()
            .rotateLabels(true) //ability to rotate axis label
            .smoothness(0.2)
            .bundlingStrength(0.1)
            .data(data)
            .color(function (d) {
                return color(d)
            })
            .mode("queue")
            .render()
            .dimensions(dimensions)
            .createAxes()
            .brushMode("1D-axes-multi") //ability to brush/filter data
            .reorderable();

            //console.log(d3.selectAll(".label"))
            //wraps the axis labels
            wrap(d3.selectAll(".label"))

            // allows slickgrid's cell data to render html code 
            function formatter(row, cell, value, columnDef, dataContext) {
                return value;
            }
            //console.log(parcoords.dimensions())

            /**
             * Slickgrid Initialization
             */
            var objDiv = document.getElementById("chart");
            objDiv.scrollTop = objDiv.scrollHeight;
            var column_keys = d3.keys(data[0]);
            var columns = column_keys.map(function (key, i) {
                // set the width of id column to 1 to hide it
                if (key == "id") {
                    return {
                        id: "id",
                        name: "id",
                        field: "id",
                        width: 1,
                        minWidth: 1,
                        toolTip: "id",
                        maxWidth: 1
                    }
                };
                return {
                    id: key,
                    name: key,
                    field: key,
                    toolTip: key,
                    sortable: true,
                    formatter: formatter
                }
            });

            var options = {
                enableCellNavigation: true,
                enableColumnReorder: false,
                enableTextSelectionOnCells: true,
                multiColumnSort: false
            };

            var dataView = new Slick.Data.DataView();
            var grid = new Slick.Grid("#grid", dataView, columns, options);
            var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

        // wire up model events to drive the grid
        dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();
        });

        dataView.onRowsChanged.subscribe(function (e, args) {
            grid.invalidateRows(args.rows);
            grid.render();
        });

        // column sorting
        var sortcol = column_keys[0];
        var sortdir = 1;

        function comparer(a, b) {
            var x = a[sortcol],
            y = b[sortcol];
            return (x == y ? 0 : (x > y ? 1 : -1));
        }

        // click header to sort grid column
        grid.onSort.subscribe(function (e, args) {
            sortdir = args.sortAsc ? 1 : -1;
            sortcol = args.sortCol.field;

            if ($.browser.msie && $.browser.version <= 8) {
                dataView.fastSort(sortcol, args.sortAsc);
            } else {
                dataView.sort(comparer, args.sortAsc);
            }
        });

        // highlight row in chart
        grid.onMouseEnter.subscribe(function (e, args) {
            // Get row number from grid
            var grid_row = grid.getCellFromEvent(e).row;

            // Get the id of the item referenced in grid_row
            var item_id = grid.getDataItem(grid_row).id;
            var d = parcoords.brushed() || data;

            // Get the element position of the id in the data object
            elementPos = d.map(function (x) {
                return x.id;
            }).indexOf(item_id);

            // Highlight that element in the parallel coordinates graph
            parcoords.highlight([d[elementPos]]);
        });

        grid.onMouseLeave.subscribe(function (e, args) {
            parcoords.unhighlight();
        });

        grid.onClick.subscribe(function (e, args) {
            dataItem = args.grid.getDataItem(args.row)
            //console.log(dataItem)

            /**
             * checks clicking on view model button inside slickgrid
             * if the view model button is clicked it sets the iframe source 
             * to the 3D model html file, and switches tab to view the model
             */
            if ($(e.target).hasClass('view-3d-model-button')) {
                console.log(e.target)
                data_url = e.target.getAttribute('data-url')
                document.getElementById('model_3d_html').srcdoc = get_file(data_url);
                //console.log(e.target.getAttribute('data-url'));
                //console.log(document.getElementById('model_3d_html').src);
                document.getElementById('model_3d_html').height = 800;
                document.getElementById('model_3d_html').width = 1000;
                show_tab("model_3d_html");
            } 

            /**
             * checks clicking on compare button inside slickgrid.
             * if the compare button is clicked it renders the OpenStudio Results in
             * the pieChart1-data and pieChart2-data iframes
             */
            if ($(e.target).hasClass('compare-button')){
                if (pie1_active) {
                    pie1_active = false
                    d3.select("#pieChart1").html("")
                    if (dataItem != null) {
                        draw_pie_chart("#pieChart1", dataItem)
                        pieChartData = document.getElementById('pieChart1-data');
                        pieChartData.srcdoc = get_file(e.target.getAttribute('data-url'));
                        pieChartData.style = "width:100%;"
                        $('iframe').load(function () {
                            this.style.height = this.contentWindow.document.body.offsetHeight + 'px';
                        });
                    }
                } else {
                    pie1_active = true
                    d3.select("#pieChart2").html("")
                    if (dataItem != null) {
                        draw_pie_chart("#pieChart2", dataItem)
                        pieChartData = document.getElementById('pieChart2-data');
                        pieChartData.src = get_file(e.target.getAttribute('data-url'));
                        pieChartData.style = "width:100%;"
                        $('iframe').load(function () {
                            this.style.height = this.contentWindow.document.body.offsetHeight + 'px';
                        });
                    }
                }
            }
        });

        // fill grid with data
        gridUpdate(data);

        // update grid on brush
        parcoords.on("brush", function (d) {
            gridUpdate(d);
        });

        /**
         * By default the refresh button is hidden. if the plot is brushed/filtered,
         * the button appears.
         */
        var refresh_bldgType_button = document.getElementById('refresh_bldgType');
        refresh_bldgType_button.style.visibility = 'hidden'
        parcoords.on("brushend", function (d) {
            refresh_bldgType_button.style.visibility = 'visible'
        })

        //Update Slickgrid with PC's data
        function gridUpdate(data) {
            dataView.beginUpdate();
            dataView.setItems(data);
            dataView.endUpdate();
        };

        /**
         * Checks if the Refresh Button is clicked
         * if the button is clicked, then it will erase the current slickgird & PC plot
         * and call setup_canvas() with the current PC data and dimensons.
         *
         * if the number of brushed datapoints is 0, then clicking the refresh 
         * button does nothing
         */
        d3.select('#refresh_bldgType').on('click', function () {
            new_data = parcoords.brushed()
            if (new_data.length > 0){
                //erase PC and slickgrid
                document.getElementById('chart').innerHTML = "";
                document.getElementById('grid').innerHTML = "";
                document.getElementById('pager').innerHTML = "";
                setup_canvas(new_data,parcoords.dimensions())
            }
            return null //erases the listeners
        })
    }

    /**
     * @param  {Float} n: value to be rounded  
     * @param  {Float} sig: significant digit
     * @return {Float} value rounded to significant figure
     */
    function sigFigs(n, sig) {
        var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    }

    /**
     * @param  {Number} n: Number to be determined if it is a float 
     * @return {Boolean} returns true if number is of type float
     */
    function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }

    /**
     * calls get_data_by_building_and_city() and append_baseline_to_ecm() which
     *  returns data from simulations.json file based on the passed "option"
     * @param  {Array} option: [<building_type>,<city>]
     * @return {Array} data: contains data from simulations.json in a format 
     *                       compatible with PC's data format
     */
    function get_filtered_data(option) {
        baseline = get_baseline_status()
        building_type = option[0]
        city = option[1]
        //console.log(building_type)
        //console.log(city)
        //get the raw filtered data from simulations.json file based on building, city and baseline condition
        json = get_data_by_building_and_city(baseline,building_type,city)
        //console.log(json)

        //get the data's title from config files for simulation data
        title = JSON.parse(JSON.stringify(config_file)).title;
        data = [] //contains the processed simulations.json data (made to be compatible with PC)

        //apend baseline data to the current data if "Include Baseline for ECMs" chebox is checked
        if(!baseline && document.getElementById('include_baseline').checked){
            json = append_baseline_to_ecm(json, building_type, city)
        }
        //console.log(json[0]['measures'])

        //itterate through the raw data to process it such that it is compatible with PC
        for (i = 0; i < json.length; i++) {

            //get base path from config file
            root_path = ""
            if(baseline){
                root_path = config_file['file_location']['baselines']['root']
            }else{
                root_path = config_file['file_location']['ecms']['root']
            }
            //getother file paths from 
            osm_file_path = root_path + config_file['file_location']['osm_files']
            model_3d_file = root_path + config_file['file_location']['3d_model']
            os_report_file = root_path + config_file['file_location']['os_report']

            //get building name, weather file name and id to replace the string in the file paths
            for (var j=0; j < json[i]['measures'].length; j++) {
                if (json[i]['measures'][j]["name"] == "create_prototype_building"){
                    epw_file = json[i]['measures'][j]["arguments"]["epw_file"].replace(".epw","")

                    osm_file_path = osm_file_path.replace("$(building_type)",json[i].building_type)
                    osm_file_path = osm_file_path.replace("$(epw_file)",epw_file)
                    osm_file_path = osm_file_path.replace("$(id)",json[i].run_uuid)

                    model_3d_file = model_3d_file.replace("$(building_type)",json[i].building_type)
                    model_3d_file = model_3d_file.replace("$(epw_file)",epw_file)
                    model_3d_file = model_3d_file.replace("$(id)",json[i].run_uuid)

                    os_report_file = os_report_file.replace("$(building_type)",json[i].building_type)
                    os_report_file = os_report_file.replace("$(epw_file)",epw_file)
                    os_report_file = os_report_file.replace("$(id)",json[i].run_uuid)
                }
            }
            x = {}; //temporaroly stores the processed raw datapoint
            //creates the compare and view model button in the slickgrid
            x["compare"] = "<button class='compare-button' data-url='"+os_report_file+"' id='" + json[i].run_uuid + "'>Compare</button>"
            x["model"] = "<button class='view-3d-model-button' data-url='"+model_3d_file+"' id='" + json[i].run_uuid + "'>View Model</button>"
            
            //adds ECM data from the raw data
            for (var j=0; j < json[i]['measures'].length; j++) {
                //checks each workflow measure step is an ECM or not.
                //also checks if the measure is skipped or not
                if(json[i]['measures'][j]["is_ecm"] == "false" || json[i]['measures'][j]["is_ecm"] == false || json[i]['measures'][j]["arguments"]["__SKIP__"] == true){
                    continue
                }else{
                    measure_name = json[i]['measures'][j]["measure_class_name"]
                    //console.log(measure_name)
                    //adds measure variable name to the processed data
                    Object.keys(json[i]['measures'][j]["arguments"]).forEach(function (argument) {
                        if(argument != "__SKIP__"){
                            //console.log(argument)
                            args_name = measure_name + " [" + argument + "] (ECM)"
                            //console.log(args_name)
                            x[args_name] = json[i]['measures'][j]["arguments"][argument]
                        }
                    }); 
                }   
            }
            //console.log(option)

            //filters results by building_type
            if (option[0] != "Select All" && json[i].building_type != option[0]) {
                continue;
            }
            //filters results by city
            if (option[1] != "Select All" && json[i].geography.city != option[1]) {
                continue;
            }

            /**
             * iterates through the datapoint to check if the raw data's title is 
             * available for the slickgrid.
             */
            for (var key in title) {
                if (title.hasOwnProperty(key)) {
                    command = "x[\"" + key + "\"] = " + "json[i]." + title[key];
                    //console.log(command);
                    eval(command);
                }
            }
            //Creates OSM file download link
            x["osm"] = "<a href='"+osm_file_path+"'>OSM File</a> "
            //Creates the uuid for slickgrid
            x["id"] = json[i].run_uuid;
            //console.log(x);
            /**
             * itterates through the processed data, shecks if it is a float
             * and then rounds the data to 4 significant figures
             */
            Object.keys(x).forEach(function (key) {
                if (isFloat(x[key])) {
                    x[key] = sigFigs(x[key], 4)
                }
            });
            //console.log(x)
            //store processed data
            data.push(x)
        };
        //console.log(data)
        return data
    }

    /**
     * populates tabs and dropdown menus
     * @return {null}
     */
    function setup_options() {
        var tab_options = Object.keys(config_file.tabs)
        //console.log(tab_options)
        //populate tab menus from the config file
        var tabs = d3.select('#tabs')
        tabs.selectAll('option')
        .data(tab_options)
        .enter()
        .append("button")
        .text(function (d) {
            return d;
        })
        .attr("id", function (d) {
            return d;
        });

        //populate "Building Types" dropdown using the index file
        options = get_all_building_type(get_baseline_status());
        var bldgType = d3.select('#bldgType')
        bldgType.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        });

        //populate "View Type" dropdown from the config file
        options = Object.keys(config_file.views);
        var viewType = d3.select('#viewType')
        viewType.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        });

        //populate "City" dropdown using the index file
        options = get_all_cities(get_baseline_status());
        var viewType = d3.select('#cityType')
        viewType.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        });
    }

    /**
     * This function will check if any buttons are clicked and takes the appopriate action.
     * @return {null}
     */
    function update_plot_with_options() {
        d3.select('#update_bldgType').on('click', null)

        /**
         * Listens for "Update Plot" button click, and removes the plot with 
         * slickgrid and redraws/updates them based on building type, baseline 
         * status and city
         * 
         * @return {null}
         */
        d3.select('#update_bldgType').on('click', function () {
            //hide "Refresh Plot" button, remove chart, grid and pager
            document.getElementById('refresh_bldgType').style.visibility = 'hidden';
            document.getElementById('chart').innerHTML = "";
            document.getElementById('grid').innerHTML = "";
            document.getElementById('pager').innerHTML = "";
            //console.log(d3.select('#update_bldgType') + "<< select")
            option = [d3.select("#bldgType").property("value"), d3.select("#cityType").property("value")]
            //console.log(option + " < Option");
            var title = {};
            //get data based on building type and city
            data = get_filtered_data(option)
            //console.log(data);
            //draws PC and slickgrid
            setup_canvas(data)
            return null
        })

        /**
         * Whenever "Show ECMs" checkbox is toggled, it updates the building type and
         * city dropdown menu based on the index file
         * 
         * @return {null}
         */
        d3.select('#show_ecm').on('click', function () {
            console.log("show_ecm");
            //Update building type dropdown menu
            options = get_all_building_type(get_baseline_status());
            document.getElementById('bldgType').innerHTML = "";
            console.log(document.getElementById('bldgType'))
            var bldgType = d3.select('#bldgType')
            bldgType.selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            });
            //Update city dropdown menu
            options = get_all_cities(get_baseline_status());
            document.getElementById('cityType').innerHTML = "";
            console.log(document.getElementById('cityType'))
            var viewType = d3.select('#cityType')
            viewType.selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            });
        })
    }

    /**
     * Draw pie chart on the given domID based on the data available from datapoint
     * or search the database based on given uuid
     * 
     * @param  {String} domID: element Id whare the pie chart is to be drawn
     * @param  {String} datapoint: if present use data from the datapoint
     * @param  {String} id: if id is available search the database and match data by uuid
     * @return {null}
     */
    function draw_pie_chart(domID, datapoint = null, id = null) {
        var dataset = []

        //get data based on datapoint or id
        if (datapoint != null) {
            console.log("extract_data_for_pie(datapoint)")
            dataset = extract_data_for_pie(datapoint)
        } else {
            console.log("get_pie_data_by_id(id)")
            dataset = get_pie_data_by_id(id)
        }

        //ser width based on half the window width
        var width = Math.max(300, $(window).width() / 2);
        var height = 300;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 75; //inner radius width
        var legendRectSize = 18;
        var legendSpacing = 4;

        //set color scheme
        var color = d3.scale.ordinal(d3.scale.category20());

        //draw tooltip showing the usage value and percent
        var tooltip = d3.select(domID)
        .append('div')
        .attr('class', 'tooltip');

        tooltip.append('div')
        .attr('class', 'label');

        tooltip.append('div')
        .attr('class', 'count');

        tooltip.append('div')
        .attr('class', 'percent');

        //set color scheme similar to the one used on PC
        var color = d3.scale.ordinal().domain(Object.keys(config_file["pie-data"]))
        .range(["#3366cc", "#dc3912", "#ff9900", "#109618",
            "#990099", "#0099c6", "#dd4477", "#66aa00",
            "#b82e2e", "#316395", "#994499", "#22aa99",
            "#aaaa11", "#6633cc", "#e67300", "#8b0707",
            "#651067", "#329262", "#5574a6", "#3b3eac"
            ]);

        //create base svg vector view box and apend it to the given domID
        var svg = d3.select(domID)
        .append('svg')
        .attr('width', /*"100%"*/ width)
        .attr('height', /*"100%"*/ height + 100)
        //.attr("viewBox", "0 0 " + width + " " + height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2 - radius) +
            ',' + (height / 2 + 100) + ')');

        //draw the title
        svg.append("text")
        .attr("x", (0 + radius / 2))
        .attr("y", (-height / 2 - 15))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text(datapoint["Building Type"] + " for \n" + datapoint["City"]);

        //initialize the arc of a data sector
        var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

        //initialize a pie chart based on the data
        var pie = d3.pie()
        .value(function (d) {
            return d.value;
        })
        .sort(null);

        //draw the arcs/sectors based on the data
        var path = svg.selectAll('path')
        .data(pie(dataset))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d, i) {
            return color(d.data.label);
        });

        //when the mouse is hovering over the arc, display the tooltip
        path.on('mouseover', function (d) {
            var total = d3.sum(dataset.map(function (d) {
                return d.value;
            }));
            var percent = Math.round(1000 * d.data.value / total) / 10;
            tooltip.select('.label').html(d.data.label);
            tooltip.select('.count').html(d.data.value + ' GJ/m2');
            tooltip.select('.percent').html(percent + '%');
            tooltip.style('display', 'block');
        });

        //when the mouse is not hovering, hide the tooltip
        path.on('mouseout', function () {
            tooltip.style('display', 'none');
        });

        //when the mouse is moving over the arc, the tooltip will follow
        path.on('mousemove', function (d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
            .style('left', (d3.event.layerX + 10) + 'px');
        });

        //draw the legend
        var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * color.domain().length / 2;
            var horz = radius + 20;
            var vert = -i * height + offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

        //draw the small squares and fill it with color
        legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

        //draw the text corresponding to the square
        legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function (d) {
            return d;
        });
    }

    function get_pie_data_by_id(id, baseline = true) {
        json = get_simulations_json(baseline);
        title = JSON.parse(JSON.stringify(config_file))["pie-data"];
        var data = []
        for (i = 0; i < json.length; i++) {
            if (json[i].run_uuid != id) {
                continue
            }
            console.log("id = " + id + " < Lookin for > found " + json[i].run_uuid)
            for (var key in title) {
                if (title.hasOwnProperty(key)) {
                    x = {};
                    x.label = key;
                    command = "x['value'] = " + "json[i]." + title[key];
                    eval(command);
                    x['value'] = sigFigs(x['value'], 4)
                    console.log(typeof x.value);
                    data.push(x)
                }
            }

        };
        console.log("data vv")
        console.log(data)
        return data
    }

    function extract_data_for_pie(datapoint) {
        title = JSON.parse(JSON.stringify(config_file))["pie-data"];
        //console.log(title);
        //console.log(datapoint);
        //console.log(datapoint.length);
        var data = []
        for (var key in title) {
            //console.log(title[key])
            if (title.hasOwnProperty(key)) {
                x = {};
                x.label = key;
                x['value'] = datapoint[key]
                x['value'] = sigFigs(x['value'], 4)
                x.enabled = true
                //console.log(datapoint[key]);
                //console.log(x);
                data.push(x)
            }
        };

        //console.log("data vv")
        //console.log(data)
        return data
    }

    function get_simulations_json(baseline){
        json_file_path = ""
        json_file = {}
        index_file = {}
        baseline_json_file_path = config_file["file_location"]["baselines"]["simulations"]
        baseline_index_file = JSON.parse(get_file(config_file["file_location"]["baselines"]["index_map"]))
        if (baseline){
            json_file_path = baseline_json_file_path
            index_file = baseline_index_file
        }else{
            json_file_path = config_file["file_location"]["ecms"]["simulations"]
            index_file = JSON.parse(get_file(config_file["file_location"]["ecms"]["index_map"]))
        }
        return JSON.parse(get_file(json_file_path));
    }

    function get_data_by_id(id,baseline){
        json_file_path = ""
        json_file = {}
        index_file = {}
        index = ""
        if(!baseline) {
            json_file_path = config_file["file_location"]["ecms"]["simulations"]
            index_file = JSON.parse(get_file(config_file["file_location"]["ecms"]["index_map"]))
        } else {
            json_file_path = config_file["file_location"]["baselines"]["simulations"]
            index_file = JSON.parse(get_file(config_file["file_location"]["baselines"]["index_map"]))
        }
        if (id.constructor === Array){
            full_json = get_simulations_json(baseline)
            out_json = []
            for (var i = 0; i < id.length; i++) {
                index = index_file["id"][id[i]]
                out_json.push(full_json[index])
            }
            full_json = null //release memory
            return out_json
        }else{
            index = index_file["id"][id]
            return JSON.parse(get_file(json_file_path))[index]
        }
    }

    function get_data_by_building_and_city(baseline,building_type,city){
        json_file = {}
        index_file = {}

        baseline_index_file = JSON.parse(get_file(config_file["file_location"]["baselines"]["index_map"]))
        baseline_json_file_path = config_file["file_location"]["baselines"]["simulations"]
        
        if(!baseline) {
            json_file_path = config_file["file_location"]["ecms"]["simulations"]
            index_file = JSON.parse(get_file(config_file["file_location"]["ecms"]["index_map"]))
        } else {
            json_file_path = config_file["file_location"]["baselines"]["simulations"]
            index_file = JSON.parse(get_file(config_file["file_location"]["baselines"]["index_map"]))
        }
        ids = []
        if (building_type == "Select All"){
            //console.log("building_type == Select All")
            if (city == "Select All"){
                //console.log("city == Select All")
                return get_simulations_json(baseline)
            }else{
                all_building_types = get_all_building_type(baseline)
                for (var i = 0; i < all_building_types.length; i++) {
                    if (all_building_types[i] == "Select All"){
                        continue;
                    }
                    //console.log(all_building_types[i])
                    //console.log(index_file['datapoint'][all_building_types[i]][city])
                    //ids.push(index_file['datapoint'][all_building_types[i]][city])
                    ids = ids.concat(index_file['datapoint'][all_building_types[i]][city])
                }
                //console.log("city != Select All")
                //console.log(ids)
            }

        }else{
            //console.log("building_type != Select All")
            if (city == "Select All"){
                all_cities = get_all_cities(baseline)
                for (var i = 0; i < all_cities.length; i++) {
                    if (all_cities[i] == "Select All"){
                        continue;
                    }
                    //console.log("building_type "+ building_type + "  city: " + all_cities[i])
                    //console.log(index_file['datapoint'][building_type][all_cities[i]])
                    ids = ids.concat(index_file['datapoint'][building_type][all_cities[i]])
                }
                //console.log("city == Select All")
                //console.log(ids)
            }else{  
                ids = index_file['datapoint'][building_type][city]
                if (ids == null) {
                    console.log("datapoint for building_type: "+ building_type +"and City: "+ city + "was not found")
                }
                else{
                    //console.log("city != Select All")
                    //console.log(ids)
                }
            }
        }
        return get_data_by_id(ids,baseline)
    }

    function get_all_cities(baseline){
        if(!baseline) {
            index_file = JSON.parse(get_file(config_file["file_location"]["ecms"]["index_map"]))
        } else {
            index_file = JSON.parse(get_file(config_file["file_location"]["baselines"]["index_map"]))
            index_file["cities"].sort().unshift(["Select All"])
        }
        return index_file["cities"]
    }

    function get_all_building_type(baseline){
        if(!baseline) {
            index_file = JSON.parse(get_file(config_file["file_location"]["ecms"]["index_map"]))
        } else {
            index_file = JSON.parse(get_file(config_file["file_location"]["baselines"]["index_map"]))
            index_file["building_type"].sort().push(["Select All"])
        }

        //console.log(index_file["building_type"])
        return index_file["building_type"]
    }

    function get_baseline_status(){
        if(document.getElementById('show_ecm').checked) {
            //console.log("baseline = false")
            return false
        } else {
            //console.log("baseline = true")
            return true
        }
    }

    function is_baseline(datapoint){
        if (datapoint['is_baseline'] == "true") {
            return true;
        }else{
            return false;
        }
    }

    function get_baseline_datapoint_by_bldg_and_city(building_type,city){
        return get_data_by_building_and_city(true,building_type,city)
    }

    function append_baseline_to_ecm(input_datapoints, building_type, city){
        json_file_path = ""
        json_file = {}
        index_file = {}
        baseline_json_file_path = config_file["file_location"]["baselines"]["simulations"]
        baseline_index_file = JSON.parse(get_file(config_file["file_location"]["baselines"]["index_map"]))

        json_file_path = config_file["file_location"]["ecms"]["simulations"]
        index_file = JSON.parse(get_file(config_file["file_location"]["ecms"]["index_map"]))
        building_type = input_datapoints[0]['building_type']
        city = input_datapoints[0]['geography']['city']
        out = input_datapoints.concat(get_baseline_datapoint_by_bldg_and_city(building_type,city))
        //console.log(out)
        return out
    }

    function get_dimensions(data_point){
        dimensions = generate_dimensions(data_point)
        views = []
        command = "views = JSON.parse(JSON.stringify(config_file)).views[\"" + view_option + "\"]"
        //console.log(command)
        eval(command)
        //console.log(views)
        out = ["Building Type"]
        if (d3.select("#bldgType").property("value") == "Select All" && views.indexOf("Building Type") == -1){
            views.unshift("Building Type")
        }
        //console.log(views)
        //console.log(dimensions)
        Object.keys(dimensions).forEach(function (dim) {
            //console.log(dim)

            if (views.indexOf(dim) == -1 && dim.indexOf("(ECM)") == -1) {
                eval("delete dimensions[\"" + dim + "\"]")
            }
            //console.log(JSON.parse(JSON.stringify(config_file)).views[view_option])
            //eval("dimensions = config_file.views[\"" + view_option + "\"]");
        })
        //console.log(dimensions)
        return dimensions
    }

    function generate_dimensions(data_point){

        default_dimensions = JSON.parse(JSON.stringify(config_file)).dimensions
        console.log(default_dimensions)
        out_dimensions = {}
        Object.keys(data_point).forEach(function (keys) {
            if(Object.keys(default_dimensions).indexOf(keys) == -1){
                out_dimensions[keys] = {
                    title : split_camel_case(keys)
                    //tickPadding : 5
                }
                //console.log(split_camel_case(keys))
            }
        });
        //console.log(out_dimensions)
        out_dimensions = $.extend({}, out_dimensions, default_dimensions, );
        //out_dimensions.concat(default_dimensions)

        return out_dimensions
    }

    function wrap(text) {
        width = 150
        //max = []
        text.each(function() {
            var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(-0.5),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            //console.log(words) 
            while (word = words.shift()) {
              line.unshift(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                lineNumber++
                line.shift();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineNumber * lineHeight * -1  + dy + "em").text(word);
            }
        }
        //max.push(lineNumber * lineHeight + dy)
    });
        //console.log(max)
        //return max
    }

    function split_camel_case(str){
        out = str
        return out.replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\-/g, ' ')
        .replace(/\_/g, ' ')
        .replace(/^./, function(str){ return str.toUpperCase(); })
    }

    function view_tooltip(){
        var path = d3.select('#Tooltip');
        //console.log(path)
        var tooltip = d3.select('#tool-tip')
        //console.log(tooltip)

        path.on('mouseover', function (d) {
            tooltip.style('display', 'block');
        });

        path.on('mouseout', function () {
            tooltip.style('display', 'none');
        });

        path.on('mousemove', function (d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
            .style('left', (d3.event.layerX + 10) + 'px');
        });
    }
}
