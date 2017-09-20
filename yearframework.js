var basecounts = {};
var allcounts;

var d = new Date();
var thisYear = d.getFullYear();
var startYear = 1945;
var endYear = thisYear;

var data;
var options;


$.get( "https://med-by-year.appspot.com/showbasecounts", function( data ) {
  //build out our data structure
  allCounts = data.counts;
})
.fail(function() {
  alert( "There was some sort of problem -- please reload the page" );
});

function yearsearch(searchkey, term) {
  urlstem = "https://med-by-year.appspot.com/search?q=";
  url = urlstem + encodeURIComponent(term);
  $.get( url, function( data ) {
    if (data.hasOwnProperty('counts')) {
      searches[searchkey].yearcounts = data.counts;
      drawYearChart([searchkey]);
    } else {
      return "Nothing found for this search or too few results to chart by year. Please try again";
    }
  })
  .fail(function() {
    alert( "There was some sort of problem -- please reload the page" );
  });
  }

  function drawYearChart(searchNumbers) {
    //takes an array of searches to compare...
    var searchNumbers = searchNumbers.filter(function(val) {
      return !( searches[val].yearcounts == "none" );
    });
    if (searchNumbers.length < 1) {
      $("#yearresults").empty();
      $("#yearresults").append("Nothing to show");
      return;
    }
    var yearsearches = { counts:{}, searchterms:[] };
    for (var year in allCounts) {
      yearsearches.counts[year] = { "total": allCounts[year] } ;
    }
    for (i = 0; i < searchNumbers.length; i++) {
      if (searches[searchNumbers[i]].nickname) {
        searchname = '"' + searches[searchNumbers[i]].nickname + '"';
      } else {
        searchname =  searches[searchNumbers[i]].term;
      }
      yearsearches.searchterms.push(searchname);
      myCounts = searches[searchNumbers[i]].yearcounts;
      for (var year in myCounts) {
        yearsearches.counts[year][searchname] = myCounts[year];
      }
    }

    data = new google.visualization.DataTable();

    //data.addColumn('string', 'Year');
    data.addColumn('date', 'Year');
    for (i = 0; i < yearsearches.searchterms.length; i++) {
      data.addColumn('number', yearsearches.searchterms[i]);
    }

    for (var year in yearsearches.counts) {
      if (Number(year) < startYear) { continue; }
      if (Number(year) > endYear) { continue; }
      //theseCounts = [year];
      theseCounts = [new Date(Number(year), 11)];
      for (i = 0; i < yearsearches.searchterms.length; i++) {
        var term = yearsearches.searchterms[i];
        var yearTotal = Number(yearsearches.counts[year]["total"]);
        if (yearsearches.counts[year][term]) {
          var proportion = Number(yearsearches.counts[year][term]) / yearTotal;
          construct = {
            v: proportion,
            f: yearsearches.counts[year][term] + " citations"
            //f: Number(yearsearches.counts[year][term]).toLocaleString() + " citations (out of " + yearTotal.toLocaleString() + " in " + year + ")"
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
          /**
          old options for material charts
          chart: {
            title: 'Proportion of citations in PubMed',
            subtitle: 'proportion for each search by year'
          },
          //width: myyearwidth,
          //height: myyearheight,
          axisTitlesPosition: 'in',
          vAxis: {format: 'decimal',
                  title: 'proportion'},
          **/
          legend: { position: 'bottom',
                    textStyle: {fontSize: 15 } },
          //chartArea:{left:10,top:10,width:'85%',height:'50%'}
        };
    $("#yearresults").empty();
    //$( "#yrearesults" ).append( '<div class="panel panel-default">' );
    //$( "#yearresults .panel" ).append( '<div id="chart_div" class="panel-body">' );

    //var chart = new google.charts.Line(document.getElementById('yearresults'));
    //chart.draw(data,  google.charts.Line.convertOptions(options));

    var date_formatter = new google.visualization.DateFormat({
      pattern: "yyyy"
    });
    date_formatter.format(data, 0);
    //trying standard
    var chart = new google.visualization.LineChart(document.getElementById('yearresults'));
    chart.draw(data, options);


    }
