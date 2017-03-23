config_file = JSON.parse(get_file("parallel_plots_config.json"));
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

    var color = function (d) { /*console.log(d);*/
        option = d3.select("#bldgType").property("value")
        if (option == "Select All") {
            return color_by_bldg_type(d["Building Type"]);
        } else {
            return red_to_cyan(d["HDD"]);
        }

    };
    // slickgrid needs each data element to have an id
    //console.log(data);
    data.forEach(function (d, i) {
        d.id = d.id || i;
    });
    var parcoords = d3.parcoords()("#chart")
        .margin({
            top: 100,
            left: 150,
            right: 50,
            bottom: 20
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
        .createAxes()
        .brushMode("1D-axes-multi");

    //console.log(parcoords.dimensions())

    var column_keys = d3.keys(data[0]);
    var columns = column_keys.map(function (key, i) {
        return {
            id: key,
            name: key,
            field: key,
            sortable: true
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
    //console.log(config_file);
    json = JSON.parse(get_file("./data/simulations.json"));
    title = config_file.title;
    if (option != "Select All") {
        delete title["Building Type"]
    }
    console.log(title);
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
        //console.log(x);
        data.push(x)
    };
    return data
}

function setup_options() {
    options = config_file.buildings;
    options.unshift("Select All")
    console.log(options)
    var bldgType = d3.select('#bldgType')
    bldgType.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        });

}

function update_plot_with_options() {
    d3.select('#update_bldgType').on('click', function () {
        option = d3.select("#bldgType").property("value")
        console.log(option + " < Option");
        data = get_filtered_data(option)
        d3.selectAll("g > *").remove()
        setup_canvas(data)
    })
}