const config_file = JSON.parse(get_file("parallel_plots_config.json"));
//options = get_options()
function setup() {
    setup_options()
    //d3.csv("./data/output.csv",function(csv_data){console.log(csv_data)});
    //console.log(unparsed_data(json));
    //console.log(raw_data);

    //data = get_filtered_data('Select All')

    //console.log(data);

    //setup_canvas(data)

    update_plot_with_options()
    toggle_data_hide()



}

function toggle_data_hide() {
    var button = document.getElementById('hideData');
    button.onclick = function () {
        var grid = document.getElementById('grid');
        var pager = document.getElementById('pager');
        if (grid.style.display !== 'none') {
            grid.style.display = 'none';
            pager.style.display = 'none';
        } else {
            grid.style.display = 'block';
            pager.style.display = 'block';
        }
    };
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

    bldgType = d3.select("#bldgType").property("value")
    if (bldgType == "Select All") {
        dimensions = JSON.parse(JSON.stringify(config_file)).dimensions;
    } else {
        console.log(dimensions)
        dimensions = JSON.parse(JSON.stringify(config_file)).dimensions;
        delete dimensions["Building Type"]
    }

    if (view_option != "View All") {
        console.log("dimensions = config_file.views[\"" + view_option + "\"]")
        eval("dimensions = config_file.views[\"" + view_option + "\"]");
    }

    /*function toObject(arr) {
        var rv = {};
        for (var i = 0; i < arr.length; ++i)
            rv[arr[i]] = {};
        return rv;
    }

    console.log(toObject(dimensions))
    console.log("my_dimensions")*/


    // slickgrid needs each data element to have an id
    //console.log(data);
    data.forEach(function (d, i) {

        d.id = d.id || i;
    });

    var parcoords = d3.parcoords()("#chart")
        //.height(d3.max([document.body.clientHeight - 100, 200]))
        .height(500)
        .margin({
            top: 50,
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
                width: 0,
                minWidth: 0,
                maxWidth: 0 /*, 
               cssClass: "reallyHidden", 
               headerCssClass: "reallyHidden"*/
            }
        };
        return {
            id: key,
            name: key,
            field: key,
            sortable: true,
            formatter: formatter
        }
    });

    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
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

    // fill grid with data
    gridUpdate(data);

    // update grid on brush
    parcoords.on("brush", function (d) {
        gridUpdate(d);
    });

    function gridUpdate(data) {
        dataView.beginUpdate();
        dataView.setItems(data);
        dataView.endUpdate();
    };
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
        if (option != "Select All" && json[i].building_type != option) {
            continue;
        }
        for (var key in title) {
            if (title.hasOwnProperty(key)) {
                command = "x[\"" + key + "\"] = " + "json[i]." + title[key];
                //console.log(command);
                eval(command);
            }
        }
        x["osm"] = "<a href='./data/osm_files/" + json[i].run_uuid + ".osm'>Task</a> "
        x["model"] = "<a href='./data/osm_files/" + json[i].run_uuid + "_3d.html'>Task</a> "
        //x["id"] = json[i].run_uuid;
        //console.log(x);
        data.push(x)
    };
    return data
}

function setup_options() {
    options = config_file.buildings;
    options.unshift("Select All")
    //console.log(options + " < options in setup_options")
    var bldgType = d3.select('#bldgType')
    bldgType.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        });

    options = config_file.view_types;
    var viewType = d3.select('#viewType')
    viewType.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        });

}

function update_plot_with_options() {

    d3.select('#update_bldgType').on('click', function () {
        d3.select("svg > *").remove();
        //console.log(d3.select('#update_bldgType') + "<< select")
        option = d3.select("#bldgType").property("value")
        //console.log(option + " < Option");
        var title = {};
        data = get_filtered_data(option)
        //console.log(data);
        setup_canvas(data)

    })
}