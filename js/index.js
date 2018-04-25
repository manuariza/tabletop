  var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1Qg0m1Ia7xEAyOIQvX_rsygClqau-oWagrOzeuc35t_8/edit#gid=1378603210';

  function init() {
    Tabletop.init( { key: publicSpreadsheetUrl,
                     callback: showInfo,
                     simpleSheet: true } )
  }

  function showInfo(data, tabletop) {
    console.log(parseInt(data[0].Amount));
    drawChart(data);
    testing(data);
  }

// GOOGLE CHARTS

      // Load the Visualization API and the corechart package.
      google.charts.load('current', {'packages':['corechart']});

      // Set a callback to run when the Google Visualization API is loaded.
      //google.charts.setOnLoadCallback();

      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
      function drawChart(data_import) {

        var data = new google.visualization.DataTable();

        // Create the data table.
       
        console.log(data_import[0].Name);
        data.addColumn('string', 'Ingredient');
        data.addColumn('number', 'Time');
        
        data_import.forEach(function(person){

            data.addRows([
              [person.Name,parseInt(person.Amount)]
              ])

        });

            //data.addRows([
              //[person_one, person_one_amount],
              //[person_two, person_two_amount],
              //[person_three, person_three_amount]
            //]);

        // Set chart options
        var options = {'title':'Steaming times (min)',
                       'width':1000,
                       'height':1000};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
        chart.draw(data, options);
      }

        window.addEventListener('DOMContentLoaded', init)