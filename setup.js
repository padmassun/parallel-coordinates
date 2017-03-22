function setup() {
    d3.json("data/simulations.json", function (json) {
        var unparsed_data = function (json) {
            //may be i could also get another input as a filter, use if statements to select groups (end_uses or end_uses_eui) 
            //based on filter and add or remove blocks from title... the filter could be an input from eventlisteners on the checkboxes
            //parallel_plots_config.json
            title = parallel_plots_config.title;
            $.getJSON('./parallel_plots_config.json', function (responseObject) {
                var obj = responseObject
                console.log(obj)
            })
            console.log("obj^")
            data = []

            for (i = 0; i < json.length; i++) {
                x = []
                for (var key in title) {
                    if (title.hasOwnProperty(key)) {
                        command = "x.push(json[i]." + title[key] + ")"
                        eval(command)
                    }
                }
                //console.log(x);
                data.push(x)
            };

            return data
        };
        //console.log(unparsed_data(json));


        var colorgen = d3.scale.ordinal(d3.schemeCategory20)
            .domain(['FullServiceRestaurant', 'LargeHotel', 'LargeOffice', 'MediumOffice', 'MidriseApartment', 'Outpatient', 'PrimarySchool', 'QuickServiceRestaurant', 'RetailStandalone', 'SecondarySchool', 'SmallHotel', 'SmallOffice', 'RetailStripmall', 'Warehouse'])
            .range(["#3366cc", "#dc3912", "#ff9900", "#109618",
                "#990099", "#0099c6", "#dd4477", "#66aa00",
                "#b82e2e", "#316395", "#994499", "#22aa99",
                "#aaaa11", "#6633cc",
                //"#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"
            ]);
        var color = function (d) { return colors(d.building_type); };
        title = ["hdd", "cdd", "climate_zone", "heating_gj", "cooling_gj", "interior_lighting_gj"];
        data = unparsed_data(json)
        /*
        for (i = 0; i < json.length; i++){
        	
            x = []
            x.push(json[i].building_type)
            x.push(json[i].geography.hdd)
            x.push(json[i].geography.cdd)
            //x.push(json[i].geography.climate_zone)
            x.push(json[i].end_uses.heating_gj)
            x.push(json[i].end_uses.cooling_gj)
            //x.push(json[i].end_uses.interior_lighting_gj)
            data.push(x)
        };*/

        console.log(data);
        var parcoords = d3.parcoords()("#example")
            .margin({
                top: 30,
                left: 100,
                right: 10,
                bottom: 20
            })
            .smoothness(0.2)
            .bundlingStrength(0)
            .data(data)
            .color(function (d) { return colorgen(d[0]); })
            .mode("queue")
            .render()
            .createAxes()
            .brushMode("1D-axes");

        parcoords.svg.selectAll("text")
            .style("font", "10px sans-serif");

    });
}