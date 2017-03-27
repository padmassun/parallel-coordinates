# parallel-coordinates
Creates a parallel coordinate plot for QAQC simulation data

The data is obtained from simulations.json which is produced by btap_results_extractor

# WARNINGS
1. parallel_plots_config.json
    - The data present in view_types should match the keys present in "`views`" hash
        - The "`View All`" should always be present in "`view_types`"
    - The data present for each "views" hash's data array should match the keys present in "title"
        - when adding new "`view_types`", corresponding data should be present in "`views`"
    - The keys for "`dimensions`" should match the keys present in "`title`"
    - Add new items to BOTH "`title`" and "`dimensions`" to show the data in the plot
        - After adding a new line of data title to "`title`", corresponding data's key should be included in "`dimensions`", with the type of data which could be "`string`", "`date`" or "`number`"

# Running the Server
Run the following code in the terminal to start the server
`node server.js`
Next go to `http://localhost:8080/` to access the Parallel coordinate plot