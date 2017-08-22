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

    data.addColumn('string', 'Year');
    for (i = 0; i < yearsearches.searchterms.length; i++) {
      data.addColumn('number', yearsearches.searchterms[i]);
    }

    for (var year in yearsearches.counts) {
      if (Number(year) < startYear) { continue; }
      if (Number(year) > endYear) { continue; }
      theseCounts = [year];
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
          chart: {
            title: 'Proportion of citations in PubMed',
            subtitle: 'proportion for each search by year'
          },
          width: myyearwidth,
          height: myyearheight,
          vAxis: {format: 'decimal',
                  title: 'proportion'},
        };
    $("#yearresults").empty();
    //$( "#yrearesults" ).append( '<div class="panel panel-default">' );
    //$( "#yearresults .panel" ).append( '<div id="chart_div" class="panel-body">' );
    var chart = new google.charts.Line(document.getElementById('yearresults'));

    chart.draw(data,  google.charts.Line.convertOptions(options));

    }
