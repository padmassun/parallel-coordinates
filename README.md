# Parallel Coordinates Data Visualization using External Repository

## Parallel Coordinates config file


```javascript
{   
    /**
     * a place to store the information for the y-axis. the values present 
     * here are in the following format. 
     * <Y-Axis title>: <location of the data>
     * 
     * changing or deleting this will have NO consequence.
     * 
     * Y-Axis title: Any title you need
     * location of the data: has to be in dot notation
     */
    "all": {
        "Building Type": "building_type",
        "HDD": "geography.hdd",
        ...
        ...
    },
    
    /**
     * This title key determines the initial data grabbed from 
     * the simulations.json file. 
     * *************************************************************
     *   This key determines the data available in the SlickGrid.
     * *************************************************************
     * 
     * <Y-Axis title>: <location of the data>
     *
     * Y-Axis title: Any title you need
     * location of the data: has to be in dot notation
     */
    "title": {
        "Building Type": "building_type",
        "Province": "geography.state_province_region",
        ...
        ...
    },
    /**
     * "views" key determines the axis-es available for the PC
     *
     * The first level keys ("End Uses", "Mech eng", etc,) 
     * are used to populate the "View Types" dropdown menu
     *
     * The value of level keys is used to determine which axis are 
     * visible
     * 
     * *************************************************************
     *        This key determines the data visible in the PC*.
     * *************************************************************
     *                                * Except ECMs which are automatically determined
     * <Y-Axis title>: <location of the data>
     *
     * Y-Axis title: Any title you need
     * location of the data: has to be in dot notation
     */
    "views": {
        "End Uses": [
            "Heating (GJ/m2)",
            "Cooling (GJ/m2)",
            ...
            ...
        ],
        "Mech eng": ["CDD", "Climate Zone"],
        "Elec eng": ["HDD", "CDD", "Climate Zone"]
    },

    /**
     * "dimensions" key determines the properties of the data for each
     * y-axis
     *
     * The first level keys ("Building Type", "HDD", etc,) 
     * are used to determine the order of the y-axis title.
     * 
     * *************************************************************
     *        This key determines the data visible in the PC.
     * *************************************************************
     * 
     * FORMAT with POSSIBLE VALUES:
       <Y-Axis title>: {
                "title": String label for dimension. If no title is given, then
                                the given <Y-Axis title> is used
                "type": Possible values include: string, date and number. 
                                Detected types are automatically populated by 
                                detectDimensions using d3.parcoords.detectDimensionTypes.
                "ticks": Number of horizontal ticks to include on y axis
                "tickValues": Array of values to display for tick labels
                "orient": Orientation of ticks and tickValues(left or right of axis)
                "innerTickSize": Length of the horizontal ticks in between the top and bottom
                "outerTickSize": Length of the horizontal ticks at the top and bottom
                "tickPadding": Pixels to pad the tick title from the innerTickSize
                "yscale": Type of scale to use for the axis(log, linear, 
                                ordinal). Reference D3 Scales "index": Integer 
                                position for ordering dimensions on the x axis
            }
     */
    "dimensions": {

        "Building Type": {
            "type": "string"
        },
        "HDD": {
            "type": "number"
        },
        ...
    },
    
    /**
     * "tabs" key determines the name and the order of the tab and the HTML 
     * elements' ID that is visible when each tab button is clicked.
     *
     * The first level keys ("Parallel Plot", "3D  Model", etc.) are the Names 
     * of the keys visible in the webpage. each value in the key determines 
     * which HTML element is NOT hidden
     *
     * DO NOT CHANGE/REMOVE "Tooltip" KEY
     */
    "tabs": {
        "Parallel Plot": [
            "chart",
            "bldgType_selector",
            "spaceholder3",
            "spaceholder4",
            "grid",
            "pager"
        ],
        "3D  Model": [
            "spaceholder4",
            "model_3d_html"
        ],
        "End Uses Data": [
            "end-uses-data-tab",
            "spaceholder2",
            "spaceholder4",
            "spaceholder",
            "pieChart1-data",
            "pieChart2-data",
            "piedata"
        ],
        "Tooltip" :[]
    },
    
    /**
     * "End Uses Data" determines the number of choices available for the comparision
     *
     * DOES NOT WORK AS INTENDED
     * DO NOT REMOVE OR CHANGE THIS KEY
     */
    "End Uses Data": [
        "Choice 1",
        "Choice 2"
    ],
    
    /**
     * "pie-data" key determines the title and the location of that data in 
     * the simulations.json file
     *
     * Format:
     * <Pie-Sector and legend title>: <location of the data>
     *  The <Pie-Sector title> must available in the "title" key
     * 
     */
    "pie-data": {
        "Heating (GJ/m2)": "end_uses_eui.heating_gj_per_m2",
        "Cooling (GJ/m2)": "end_uses_eui.cooling_gj_per_m2",
        "Interior Lighting (GJ/m2)": "end_uses_eui.interior_lighting_gj_per_m2",
        "Interior Equipment (GJ/m2)": "end_uses_eui.interior_equipment_gj_per_m2",
        "Fans (GJ/m2)": "end_uses_eui.fans_gj_per_m2",
        "Pumps (GJ/m2)": "end_uses_eui.pumps_gj_per_m2",
        "Heat Rejection (GJ/m2)": "end_uses_eui.heat_rejection_gj_per_m2",
        "Water Systems (GJ/m2)": "end_uses_eui.water_systems_gj_per_m2"
    },

    "file_location":{
        "baselines": {
            "root": "https://raw.githubusercontent.com/canmet-energy/necb-2011-baselines/master",
            "simulations": "./data/baselines/min-simulations.json",
            "index_map": "./data/baselines/index_map.json"
        },
        "ecms" : {
            "root": "https://raw.githubusercontent.com/canmet-energy/necb-2011-ecms/master",
            "simulations": "./data/ecms/min-simulations.json",
            "index_map": "./data/ecms/index_map.json"
        },
        "3d_model" : "/output/$(building_type)/$(epw_file)/3d_model/$(id)_3d.html",
        "eplus_table" : "/output/$(building_type)/$(epw_file)/eplus_table/$(id)-eplustbl.htm",
        "os_report" : "/output/$(building_type)/$(epw_file)/os_report/$(id)-os-report.html",
        "osm_files" : "/output/$(building_type)/$(epw_file)/osm_files/$(id).osm",
        "qaqc_files" :"/output/$(building_type)/$(epw_file)/qaqc_files/$(id).json"
    }



}

```


# index_map.json file

Ruby script to produce index_map.json file

```ruby
require 'json'

simulations_json_folder = "."
File.open("#{simulations_json_folder}/index_map.json", 'wb'){|f|
      sim = JSON.parse(File.read("#{simulations_json_folder}/simulations.json"))
      out = {}
      # out["building_type"] contains a list of all the building type
      out["building_type"] = []
      # out["cities"] contains a list of all the cities
      out["cities"] = []
      
      out["id"] = {}
      #out["id"] contains a list of all uuid mapping information in the 
      #follwing format
=begin
            "0ebb137f-01cd-465e-b1b0-a7e877b6109f": 0,
            "460b2a6e-be37-4b17-93a0-95a2ff46aeaf": 1,
            "180792a6-7fbe-4068-96fc-d6b3da6344c3": 2,
            "a69bda6a-09e9-4945-92fd-425c24f1ca83": 3,
            "258de806-be7f-457f-862e-433a20c37b31": 4,
            etc...
=end
      out["datapoint"] = {}
      #out["datapoint"] contains a list of all uuid mapping information in the 
      #follwing format
=begin
        "FullServiceRestaurant": {                  # <= building type #1
          "Brandon": [                              # <= city #1 of building type #1
            "0ebb137f-01cd-465e-b1b0-a7e877b6109f"  # <= id
          ],
          "Sydney": [                               # <= city #2 building type #1
            "a69bda6a-09e9-4945-92fd-425c24f1ca83"  # <= id
          ],
          ...
        },
        "LargeHotel": {                             # <= building type #2
          "Brandon": [                              # <= city #1 of building type #2
            "0ebb137f-01cd-465e-b1b0-a7e877b6109f"  # <= id
          ],
          "Sydney": [                               # <= city #2 building type #2
            "a69bda6a-09e9-4945-92fd-425c24f1ca83"  # <= id
          ],
          ...
        },

=end
      sim.each_with_index { |datapoint, i|
        out["id"]["#{datapoint['run_uuid']}"] = i
        out["building_type"] << datapoint['building_type']
        out["cities"] << datapoint['geography']['city']
        out["datapoint"]["#{datapoint['building_type']}"] = {} unless out["datapoint"].has_key?("#{datapoint['building_type']}")
        out["datapoint"]["#{datapoint['building_type']}"]["#{datapoint['geography']['city']}"] = [] unless out["datapoint"]["#{datapoint['building_type']}"].has_key?("#{datapoint['geography']['city']}")
        out["datapoint"]["#{datapoint['building_type']}"]["#{datapoint['geography']['city']}"] << "#{datapoint['run_uuid']}"
      }
      out["building_type"].uniq!
      out["cities"].uniq!
      f.write(JSON.pretty_generate(out))
    }
```

## Producing a min-simulations.json file
This script is used to delete unwanted data from the simulations.json file to reduce the file size.

```ruby
require 'json'

full_json = JSON.parse(File.read("./simulations.json"))

full_json.each { |datapoint|
  datapoint['envelope'].delete('constructions')
  datapoint.delete('spaces')
  datapoint.delete('thermal_zones')
  datapoint.delete('air_loops')
  datapoint.delete('plant_loops')
  datapoint.delete('eplusout_err')
  datapoint.delete('ruby_warnings')
  datapoint.delete('information')
  datapoint.delete('warnings')
  datapoint.delete('errors')
  datapoint.delete('unique_errors')
  datapoint.delete('sanity_check')
}
File.open("./min-simulations.json", 'wb'){|f|
  f.write(JSON.generate(full_json))
}

```
