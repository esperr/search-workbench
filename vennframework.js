overlapcalls = 0;
var sets = [];
var overlaps = [];
var vennsearches = [];
var termsarray = [];
var search;
var index;
var myOverlap;
var mySet;
var mySearch;
var myIndex;


   //display sharing link
   $( "#vennresults" ).on( "click", ".shareLink", function() {
     var currentLocation = location.protocol + '//'+ location.hostname + (location.port ? ':'+location.port: '') + location.pathname;
     searchstr = $("#search").val();
     var shareUrl = currentLocation + "?" + encodeURIComponent(searchstr);
     $( "#printable-stuff" ).append('<p>Copy this link your clipboard to share: <input type="text" id="sharingUrlcontent"></p>');
     //$( "textarea" ).attr( "rows", "width: 40em;" );
     $( "#sharingUrlcontent" ).attr( "style", "width: 40em;" );
     $( "#sharingUrlcontent" ).attr( "value", shareUrl );
     $( "#sharingUrlcontent" ).select();
    });



function setOverlapSet(slist, sresults) {
    this.sets = slist;
    this.size = Number(sresults);
}

function setSet(slabel, ssize) {
    this.sets = [sets.length];
    this.label = slabel;
    this.size = Number(ssize);
}

function setSearch(sets, terms) {
    this.sets = sets;
    this.terms = terms;
}

function esearch(term) {
     return $.ajax({
	url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
	data: {
	db: 'pubmed',
	usehistory: 'y',
	term: term,
	retmode: 'json',
	retmax: 0,
	email: 'ed_sperr@hotmail.com',
	tool: 'searchworkbench'
	}
     });
}

function buildOLCounts(search) {
  $.ajax({
	url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
	data: {
	db: 'pubmed',
	usehistory: 'y',
	term: search.terms,
	retmode: 'json',
	retmax: 0,
	email: 'ed_sperr@hotmail.com',
	tool: 'searchworkbench'
  },
  success: function( data ) {
	   myOverlap = new setOverlapSet(search.sets,data.esearchresult.count);
	   sets.push(myOverlap);
     if (!vennsearches.length) {
       if (myIndex && !searches[myIndex].vennsets) {
         writeSets();
       }
       drawVennDiagram();
     }
  }
     });
}

function writeSets() {
  var mysets = [];
  mysets = sets.slice(0);
  searches[myIndex].vennsets = mysets;
}

function getOLCounts() {
	//We do it this way instaed of a loop so we can easily throttle the count requests with setTimeout
	mysearch = vennsearches.pop();
	buildOLCounts(mysearch);
  var progressProportion = 1/vennsearches.length;
  $("progress").attr("value", progressProportion*100);
	if (vennsearches.length) {
		setTimeout(getOLCounts, 300);
	} else {
    return;
		}
}

function getOverlaps() {
var results;
var overlapcount = 0;

for (index = 0; index < sets.length; index++) {
     for (j = index; j < (sets.length - 1); j++) {
       search = "(" + sets[index].label + ") AND (" + sets[j+1].label + ")";
	 //send sets and terms to our temporary 'search' object
	 mySearch = new setSearch([index,(j+1)], search);
         vennsearches.push(mySearch);
       }
   }

var totalsets = vennsearches.length + sets.length;
getOLCounts();

}

function getSimpleSets(termsarray, possibles) {
 $.each(termsarray, function (i, term) {
     esearch(termsarray[i])
     .then(function( data ) {
	var numResults = Number(data.esearchresult.count);
	if (numResults != 0) {
		mySet = new setSet(termsarray[i], numResults);
		sets.push(mySet);
	}
    if (sets.length >= possibles) { getOverlaps(); }
     });

    });
}

function startVenn(searchkey, term) {
    myIndex = searchkey;
    //clear the decks
    $("#vennresults").empty();
    $( "#vennresults" ).append('<div class="vennMsg"><p>Loading your diagram. Please wait...</p><progress id="fetchresults" value="1" max="100"></progress></div> ');

    while (sets.length) { sets.pop(); }
    while (vennsearches.length) { vennsearches.pop(); }
    while (overlaps.length) { overlaps.pop(); }

    //check for parentheses in our search string
    var termsarray = [];
    var parensdex = 0;

    findParens(term);

    function findParens() {
    if ((term.lastIndexOf(")")) > -1) {
      var n = term.indexOf("(");
      for(var i=n; i < term.length; i++){
        if(term.charAt(i) == '(') { parensdex+=1 }
        if(term.charAt(i) == ')') { parensdex-=1 }
        if( parensdex == 0 && /\(/g.test(term) ) {
          parenTerm = term.slice(n,i+1);
          termsarray.push(parenTerm);
          termPartone = term.slice(0,n);
          termParttwo = term.slice(i+1);
          term = termPartone + termParttwo;
          findParens(term);
        }
      }
      } else { return; }
    }

    var termsarray2 = term.split(/ and | or | not /i);
    termsarray.push.apply(termsarray, termsarray2);
    termsarray = partCleaner(termsarray);
    var termsarray = termsarray.filter(function(val) {
      return !(val === " " || val === "" || typeof val == "undefined" || val === null || val == " AND " || val == " OR " || val == " NOT ");
    });


    var possibleTerms = termsarray.length;
		//if (data.esearchresult.errorlist) {
		//	possibleTerms = possibleTerms - Number(data.esearchresult.errorlist.phrasesnotfound.length);
		//}
		if (possibleTerms<2) {
			$("#vennresults").empty();
			$("#vennresults").append('<p class="vennMsg">Only one valid term entered.</p>');
      searches[myIndex].vennsets = [];
		} else {
			getSimpleSets(termsarray, possibleTerms);
      shareLinks([term], "venn");
		}
}

function partCleaner(parts) {
  cleanedTerms = [];
  for (var i = 0; i < parts.length; i++) {
     var str = parts[i];
     str = str.replace(/(^\(|\)$)/g, '');
     cleanedTerms.push(str);
   }
  return cleanedTerms;
}

function compVenn(comparisons) {
    //clear the decks
    $("#vennresults").empty();
    $( "#vennresults" ).append('<div class="vennMsg"><p>Loading your diagram. Please wait...</p><progress id="fetchresults" value="1" max="100"></progress></div> ');

    while (sets.length) { sets.pop(); }
    while (vennsearches.length) { vennsearches.pop(); }
    while (overlaps.length) { overlaps.pop(); }
    var compareterms = [];
    for (i=0; i<comparisons.length; i++) {
      compareterms.push(searches[comparisons[i]].term);
    }
    possibleTerms = compareterms.length;
		getSimpleSets(compareterms, possibleTerms);
    setNickname();

    function setNickname() {
    	if (sets.length < compareterms.length) {
    		setTimeout(setNickname, 300);
    	} else {
        for (i=0; i<comparisons.length; i++) {
          if (searches[comparisons[i]].nickname) {
            for (n=0; n<comparisons.length; n++) {
              var origterm = searches[comparisons[i]].term;
              var setlabel = sets[n].label.replace(/\\/g, '');
              if ( origterm == setlabel ) {
                sets[n].label = '"' + searches[comparisons[i]].nickname + '"';
              }
            }
          }
        }
        drawVennDiagram();
    		}
    }
	}

function drawVennDiagram() {
$("#vennresults").empty();
var currentwidth = $("#vennresults").innerWidth();

var chart = venn.VennDiagram()
                 .width(currentwidth)
                 .height(currentwidth);

var div = d3.select("#vennresults")
div.datum(sets).call(chart);

//var fixtext = d3.selectAll("text")
//         .attr("font-size","1.25em");

//var svg = d3.select("svg").call(zoom);

var tooltip = d3.select("body").append("div")
    .attr("class", "venntooltip");

div.selectAll("path")
    .style("stroke-opacity", 0)
    .style("stroke", "#fff")
    .style("stroke-width", 0)

div.selectAll("g")
    .on("mouseover", function(d, i) {
        // sort all the areas relative to the current item
        venn.sortAreas(div, d);

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", .9);
        tooltip.text(d.size + " citations");

        // highlight the current path
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("stroke-width", 3)
            .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
            .style("stroke-opacity", 1);
    })

    .on("mousemove", function() {
        tooltip.style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
    })

    .on("mouseout", function(d, i) {
        tooltip.transition().duration(400).style("opacity", 0);
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("stroke-width", 0)
            .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
            .style("stroke-opacity", 0);
    })



}
