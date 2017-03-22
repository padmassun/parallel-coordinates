function setup() {
    d3.csv("./data/output.csv",function(csv_data){console.log(csv_data)});
    //console.log(unparsed_data(json));
    raw_data = JSON.parse(get_file("./data/simulations.json"));
    data = get_unparsed_data(raw_data)
    //console.log(data);
    setup_canvas(data)
}

function get_file(name) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", name, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

function setup_canvas(data) {
    var colorgen = d3.scale.ordinal(d3.schemeCategory20)
        .domain(['FullServiceRestaurant', 'LargeHotel', 'LargeOffice', 'MediumOffice', 'MidriseApartment', 'Outpatient', 'PrimarySchool', 'QuickServiceRestaurant', 'RetailStandalone', 'SecondarySchool', 'SmallHotel', 'SmallOffice', 'RetailStripmall', 'Warehouse'])
        .range(["#3366cc", "#dc3912", "#ff9900", "#109618",
            "#990099", "#0099c6", "#dd4477", "#66aa00",
            "#b82e2e", "#316395", "#994499", "#22aa99",
            "#aaaa11", "#6633cc",
            //"#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"
        ]);

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
        .color(function (d) {console.log(d); return colorgen(d.BuildingType); })
        .mode("queue")
        .render()
        .createAxes()
        .brushMode("1D-axes");

    parcoords.svg.selectAll("text")
        .style("font", "10px sans-serif");
        console.log(d3.selectAll("axis"));

}

function get_unparsed_data(json) {
    //may be i could also get another input as a filter, use if statements to select groups (end_uses or end_uses_eui) 
    //based on filter and add or remove blocks from title... the filter could be an input from eventlisteners on the checkboxes
    //parallel_plots_config.json
    config_file = JSON.parse(get_file("parallel_plots_config.json"));
    title = config_file.title;
    data = []
    for (i = 0; i < json.length; i++) {
        x = {};
        for (var key in title) {
            if (title.hasOwnProperty(key)) {
                command = "x[\""+key+"\"] = "+"json[i]."+title[key];
                //console.log(command);
                eval(command);
            }
        }
        //console.log(x);
        data.push(x)
    };
    return data
}