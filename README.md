# Parallel Coordinates Data Visualization using External Repository

Explaination of the Parallel Coordinates config file


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
     *        This key determines the data visible in the PC.
     * *************************************************************
     * 
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
    "dimensions": {

        "Building Type": {
            "type": "string"
        },
        "HDD": {
            "type": "number"
        },
        ...
    },

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

    "End Uses Data": [
        "Choice 1",
        "Choice 2"
    ],

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


Ruby script to produce index.json file

```ruby
require 'json'

simulations_json_folder = "."
File.open("#{simulations_json_folder}/index_map.json", 'wb'){|f|
      sim = JSON.parse(File.read("#{simulations_json_folder}/simulations.json"))
      out = {}
      # contains a list of all the building type
      out["building_type"] = []
      # contains a list of all the cities
      out["cities"] = []
      ##############################
      out["id"] = {}
      #contains a list of all uuid mapping information
=begin
            "0ebb137f-01cd-465e-b1b0-a7e877b6109f": 0,
            "460b2a6e-be37-4b17-93a0-95a2ff46aeaf": 1,
            "180792a6-7fbe-4068-96fc-d6b3da6344c3": 2,
            "a69bda6a-09e9-4945-92fd-425c24f1ca83": 3,
            "258de806-be7f-457f-862e-433a20c37b31": 4,
            etc...
=end
      out["datapoint"] = {}
=begin
        "FullServiceRestaurant": {
          "Brandon": [
            "0ebb137f-01cd-465e-b1b0-a7e877b6109f"
          ],
          "Sydney": [
            "a69bda6a-09e9-4945-92fd-425c24f1ca83"
          ],
          ...
        }
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
