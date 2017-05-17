function setup() {
    const config_file = JSON.parse(get_file("parallel_plots_config.json"));
    var tab_list = Object.keys(config_file.tabs)
    show_tab(config_file.tabs[tab_list[0]])
    setup_options()
    manage_tabs()
    update_plot_with_options()
    toggle_data_hide()
    //draw_pie_chart("#pieChart1", "000ca287-f6b6-47d3-945f-65e907544110")
    //draw_pie_chart("#pieChart2", "0a02f204-9e1d-4e09-811b-25ee2377cf08")

    function manage_tabs() {
        var tabs = d3.select('#tabs').selectAll('button')[0]
        //console.log(tabs)
        tabs.forEach(function (item, index) {
            //console.log(d3.select(item))
            d3.select(item).on('click', function () {
                //console.log(item.id)
                tab_options = config_file.tabs[item.id]
                //console.log(tab_options)
                show_tab(tab_options)
                return null
            })

        })

    }

    function show_tab(tab_options) {
        var elems = document.body.children
        //console.log(elems)
        for (var i = 0, len = elems.length; i < len; i++) {
            //console.log(elems[i])
            if (tab_options.includes(elems[i].id) || (elems[i].id == "tabs")) {
                //console.log("VIEW: " + elems[i].id)
                //elems[i].style.visibility = 'visible'
                elems[i].style.display = 'block';
            } else {
                //console.log("HIDE: " + elems[i].id)
                //elems[i].style.visibility = 'hidden'
                elems[i].style.display = 'none';
            }
        }
    }


    function toggle_data_hide() {
        var button = document.getElementById('hideData');
        button.onclick = function () {
            var grid = document.getElementById('grid');
            var pager = document.getElementById('pager');
            if (grid.style.visibility !== 'hidden') {
                grid.style.visibility = 'hidden';
                pager.style.visibility = 'hidden';
            } else {
                grid.style.visibility = 'visible';
                pager.style.visibility = 'visible';
            }
            return null
        };
        button = null
    }

    function get_file(name) {
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", name, false);
        xmlhttp.send();
        return xmlhttp.responseText;
    }

    function setup_canvas(data) {
        var color_by_bldg_type = d3.scale.ordinal()
            .domain(config_file.buildings)
            .range(["#3366cc", "#dc3912", "#ff9900", "#109618",
                "#990099", "#0099c6", "#dd4477", "#66aa00",
                "#b82e2e", "#316395", "#994499", "#22aa99",
                "#aaaa11", "#6633cc", "#e67300", "#8b0707",
                "#651067", "#329262", "#5574a6", "#3b3eac"
            ]);
        var red_to_cyan = d3.scale.linear()
            .domain([3000, 8000])
            .range(["cyan", "red"]);

        var color = function (d) {
            //console.log(d);
            //console.log(d3.select("#pager"));
            option = d3.select("#bldgType").property("value")

            if (option == "Select All") {
                return color_by_bldg_type(d["Building Type"]);
            } else {
                return red_to_cyan(d["HDD"]);
            }

        };
        view_option = d3.select("#viewType").property("value")
        var dimensions = {}
        //console.log(JSON.parse(JSON.stringify(config_file)).dimensions)
        //console.log("JSON.parse(JSON.stringify(config_file)).dimensions")


        dimensions = JSON.parse(JSON.stringify(config_file)).dimensions;
        views = []
        command = "views = JSON.parse(JSON.stringify(config_file)).views[\"" + view_option + "\"]"
        //console.log(command)
        eval(command)
        //console.log(views)
        Object.keys(dimensions).forEach(function (dim) {
            //console.log(dim)
            if (views.indexOf(dim) == -1) {
                eval("delete dimensions[\"" + dim + "\"]")
            }
            //console.log(JSON.parse(JSON.stringify(config_file)).views[view_option])
            //eval("dimensions = config_file.views[\"" + view_option + "\"]");
        })
        //console.log("new v")
        //console.log(dimensions)

        /*  if (d3.select("#remove_singular").property("checked")) {
                var remove = []
                Object.keys(dimensions).forEach(function (keyID) {
                    data_for_keyID = []
                    data.forEach(function (d) {
                        command = "data_for_keyID.push(d[\"" + keyID + "\"])"
                        //console.log(command)
                        eval(command)
                    })
                    max_value = Math.max.apply(null, data_for_keyID)
                    min_value = Math.min.apply(null, data_for_keyID)
                    if (max_value - min_value == 0) {
                        remove.push(keyID)
                    }
                    console.log(data_for_keyID)
                })
                //return remove
                console.log(dimensions)
                console.log(remove)
                console.log("^ REMOVE d3.select(#remove_singular).property(checked)")
                remove.forEach(function (key) {
                    delete dimensions[key]
                })
                console.log(dimensions)
            }
        */

        /*
            function toObject(arr) {
                var rv = {};
                for (var i = 0; i < arr.length; ++i)
                    rv[arr[i]] = {};
                return rv;
            }

            console.log(toObject(dimensions))
            console.log("my_dimensions")
        */


        // slickgrid needs each data element to have an id
        //console.log(data);
        data.forEach(function (d, i) {

            d.id = d.id || i;
        });
        var parcoords = d3.parcoords()("#chart")
            //.height(d3.max([document.body.clientHeight - 100, 200]))
            .height(500)
            .margin({
                top: 100,
                left: 150,
                right: 50,
                bottom: 16
            })
            .interactive()
            .rotateLabels(true)
            .smoothness(0.2)
            .bundlingStrength(0)
            .data(data)
            .color(function (d) {
                return color(d)
            })
            .mode("queue")
            .render()
            .dimensions(dimensions)
            //.render()
            .createAxes()
            .brushMode("1D-axes-multi")
            .reorderable();
        //console.log(document.body.clientHeight + " = document.body.clientHeight")
        //console.log(parcoords.height() + " = parcoords.height()")
        //dafault_dimensions = parcoords.dimensions()
        //console.log(JSON.stringify(dafault_dimensions))
        //console.log("dafault_dimensions ^")
        function formatter(row, cell, value, columnDef, dataContext) {
            return value;
        }

        var objDiv = document.getElementById("chart");
        objDiv.scrollTop = objDiv.scrollHeight;
        var column_keys = d3.keys(data[0]);
        var columns = column_keys.map(function (key, i) {
            if (key == "id") {
                return {
                    id: "id",
                    name: "id",
                    field: "id",
                    //width: 50,
                    minWidth: 350,
                    toolTip: "id"
                    //maxWidth: 0
                    /*, 
                                  cssClass: "reallyHidden", 
                                  headerCssClass: "reallyHidden"*/
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
            if ($(e.target).hasClass('view-3d-model-button')) {
                console.log(e.target)
                // Your code here
                document.getElementById('model_3d_html').src = "./data/osm_files/" + e.target.id + "_3d.html";
                console.log(document.getElementById('model_3d_html').src);
                document.getElementById('model_3d_html').height = 800;
                document.getElementById('model_3d_html').width = 1000;
                show_tab("model_3d_html");
            }
        });

        // fill grid with data
        gridUpdate(data);

        // update grid on brush
        parcoords.on("brush", function (d) {
            gridUpdate(d);
        });

        parcoords.on("brushend", function (d) {
            d3.select("#pieChart1").html("")
            d3.select("#pieChart2").html("")
            if (d[0] != null) {
                draw_pie_chart("#pieChart1", d[0])
            }
            if (d[1] != null) {
                draw_pie_chart("#pieChart1", d[1])
            }
        })

        function gridUpdate(data) {
            dataView.beginUpdate();
            dataView.setItems(data);
            dataView.endUpdate();
        };

    }

    function sigFigs(n, sig) {
        var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    }

    function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }

    function get_filtered_data(option) {
        //may be i could also get another input as a filter, use if statements to select groups (end_uses or end_uses_eui) 
        //based on filter and add or remove blocks from title... the filter could be an input from eventlisteners on the checkboxes
        //parallel_plots_config.json 
        /*console.log("config_file");
        console.log(config_file);
        console.log("config_file.title");
        console.log(config_file.title);
        */
        json = JSON.parse(get_file("./data/simulations.json"));
        title = JSON.parse(JSON.stringify(config_file)).title;
        /*console.log(config_file.title)
        if (!("Building Type" in title)){
            title["Building Type"] = config_file.title["Building Type"];
            console.log("config_file.title[Building Type] = " + config_file.title["Building Type"]);
        }*/
        data = []
        for (i = 0; i < json.length; i++) {
            x = {};
            //console.log(option)
            if (option[0] != "Select All" && json[i].building_type != option[0]) {
                continue;
            }
            if (option[1] != "Select All" && json[i].geography.city != option[1]) {
                continue;
            }
            for (var key in title) {
                if (title.hasOwnProperty(key)) {
                    command = "x[\"" + key + "\"] = " + "json[i]." + title[key];
                    //console.log(command);
                    eval(command);
                }
            }
            x["osm"] = "<a href='./data/osm_files/" + json[i].run_uuid + ".osm'>OSM File</a> "
            //console.log("<button class='view-3d-model-button' onclick=\"view_model('" + json[i].run_uuid + "')\">View 3D Model</button>")

            //x["model"] = "<button type=\"button\" onclick=\"view_model(" + json[i].run_uuid + ")\">View 3D Model</button>"
            x["model"] = "<button class='view-3d-model-button' id='" + json[i].run_uuid + "'>View Model</button>"
            //x["model"] = "<a href='./data/osm_files/" + json[i].run_uuid + "_3d.html'>View 3D Model</a> "
            x["id"] = json[i].run_uuid;
            //console.log(x);
            Object.keys(x).forEach(function (key) {
                if (isFloat(x[key])) {
                    x[key] = sigFigs(x[key], 4)
                }
            });

            data.push(x)
        };
        //console.log(data)
        return data
    }

    function setup_options() {
        options = config_file.buildings;
        //options.unshift("Select All")
        //console.log(options + " < options in setup_options")
        /*console.log(config_file.tabs["End Uses Data"][0])
        var viewType = d3.select('body')
        viewType.append('div')
            .attr('id',config_file.tabs["End Uses Data"][0])
            .append('tr')
            .append('th')
            .append('th')
        */
        var tab_options = Object.keys(config_file.tabs)
        //console.log(tab_options)
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



        var bldgType = d3.select('#bldgType')
        bldgType.selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            });

        options = Object.keys(config_file.views);
        var viewType = d3.select('#viewType')
        viewType.selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            });

        options = config_file.city;
        var viewType = d3.select('#cityType')
        viewType.selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .text(function (d) {
                return d;
            });


    }

    function update_plot_with_options() {
        d3.select('#update_bldgType').on('click', null)

        d3.select('#update_bldgType').on('click', function () {
            d3.select(".parcoords svg").remove();
            //console.log(d3.select('#update_bldgType') + "<< select")
            option = [d3.select("#bldgType").property("value"), d3.select("#cityType").property("value")]
            //console.log(option + " < Option");
            var title = {};
            data = get_filtered_data(option)
            //console.log(data);
            setup_canvas(data)
            return null
        })
    }

    function draw_pie_chart(domID, datapoint = null, id = null) {
        var dataset = []

        if (datapoint != null) {
            console.log("extract_data_for_pie(datapoint)")
            dataset = extract_data_for_pie(datapoint)
        } else {
            console.log("get_pie_data_by_id(id)")
            dataset = get_pie_data_by_id(id)
        }

        var width = 300;
        var height = 300;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 75;
        var legendRectSize = 18;
        var legendSpacing = 4;

        var color = d3.scale.ordinal(d3.scale.category20());

        var tooltip = d3.select(domID)
            .append('div')
            .attr('class', 'tooltip');

        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'count');

        tooltip.append('div')
            .attr('class', 'percent');

        var color = d3.scale.ordinal().domain(Object.keys(config_file["pie-data"]))
            .range(["#3366cc", "#dc3912", "#ff9900", "#109618",
                "#990099", "#0099c6", "#dd4477", "#66aa00",
                "#b82e2e", "#316395", "#994499", "#22aa99",
                "#aaaa11", "#6633cc", "#e67300", "#8b0707",
                "#651067", "#329262", "#5574a6", "#3b3eac"
            ]);
        var svg = d3.select(domID)
            .append('svg')
            .attr('width', width + 200)
            .attr('height', height + 100)
            .append('g')
            .attr('transform', 'translate(' + (width / 2 + 15) +
                ',' + (height / 2 + 100) + ')');

        svg.append("text")
            .attr("x", ((width - 200) / 2))
            .attr("y", (-height / 2 - 15))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(datapoint["Building Type"] + " for \n" + datapoint["City"]);

        var arc = d3.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

        var pie = d3.pie()
            .value(function (d) {
                return d.value;
            })
            .sort(null);

        var path = svg.selectAll('path')
            .data(pie(dataset))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d, i) {
                return color(d.data.label);
            });

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

        path.on('mouseout', function () {
            tooltip.style('display', 'none');
        });

        path.on('mousemove', function (d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX + 10) + 'px');
        });

        var legend = svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * color.domain().length / 2;
                var horz = radius + 10;
                var vert = -i * height + offset;
                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', color)
            .style('stroke', color);

        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function (d) {
                return d;
            });
    }

    function get_pie_data_by_id(id) {
        json = JSON.parse(get_file("./data/simulations.json"));
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
        console.log(title);
        console.log(datapoint);
        console.log(datapoint.length);
        var data = []
        for (var key in title) {
            console.log(title[key])
            if (title.hasOwnProperty(key)) {
                x = {};
                x.label = key;
                x['value'] = datapoint[key]
                x['value'] = sigFigs(x['value'], 4)
                x.enabled = true
                console.log(datapoint[key]);
                console.log(x);
                data.push(x)
            }
        };

        console.log("data vv")
        console.log(data)
        return data
    }
}