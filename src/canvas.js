module.exports = {
    brushed_data = {},
    setup_canvas: function (data) {
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

        var objDiv = document.getElementById("chart");
        objDiv.scrollTop = objDiv.scrollHeight;
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
            brushed_data = d
        });

        function gridUpdate(data) {
            dataView.beginUpdate();
            dataView.setItems(data);
            dataView.endUpdate();
        };
    }
}
