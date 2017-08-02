var yearsearches = { counts:{}, searchterms:[] };
var basecounts = {};

var data;
var options;

$.get( "https://med-by-year.appspot.com/showbasecounts", function( data ) {
  //build out our data structure
  var allCounts = data.counts;
  for (var year in allCounts) {
    yearsearches.counts[year] = { "total": allCounts[year] } ;
  }
})
.fail(function() {
  alert( "There was some sort of problem -- please reload the page" );
});

function yearsearch(term) {
  urlstem = "https://med-by-year.appspot.com/search?q=";
  url = urlstem + encodeURIComponent(term);
  $.get( url, function( data ) {
    if (data.hasOwnProperty('counts')) {
      yearsearches.searchterms.push(term);
      myCounts = data.counts;
      for (var year in myCounts) {
        yearsearches.counts[year][term] = myCounts[year];
      }
      drawYearChart();
    } else {
      alert("Nothing found for this search or too few results to chart by year. Please try again");
    }
  })
  .fail(function() {
    alert( "There was some sort of problem -- please reload the page" );
  });
  }

  function drawYearChart() {
    $("#yearresults").empty();

    $( "#yrearesults" ).append( '<div class="panel panel-default">' );
    $( "#yearresults .panel" ).append( '<div id="chart_div" class="panel-body">' );


    data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    for (i = 0; i < yearsearches.searchterms.length; i++) {
      data.addColumn('number', yearsearches.searchterms[i]);
    }


    for (var year in yearsearches.counts) {
      theseCounts = [year];
      for (i = 0; i < yearsearches.searchterms.length; i++) {
        var term = yearsearches.searchterms[i];
        var yearTotal = Number(yearsearches.counts[year]["total"]);
        if (yearsearches.counts[year][term]) {
          var proportion = Number(yearsearches.counts[year][term]) / yearTotal;
          construct = {
            v: proportion,
            f: Number(yearsearches.counts[year][term]).toLocaleString() + " citations (out of " + yearTotal.toLocaleString() + " in " + year + ")"
          }
          theseCounts.push(construct);
          //theseCounts.push(proportion);
        } else {
          theseCounts.push(0);
        }
      }
      data.addRow(theseCounts);
    }

    options = {
          chart: {
            title: 'Proportion of citations in PubMed',
            subtitle: 'proportion for each search by year, ' + $("[name=startyear]").val() + ' to ' + $("[name=endyear]").val()
          },
          width: mywidth,
          height: myheight,
          vAxis: {format: 'decimal',
                  title: 'proportion'},
        };

    var chart = new google.charts.Line(document.getElementById('chart_div'));

    chart.draw(data,  google.charts.Line.convertOptions(options));

    }
