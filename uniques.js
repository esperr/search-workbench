function findUniques(comparisons) {
  if (scratchuniques) {
    while (scratchuniques.length) { scratchuniques.pop(); }
  } else {
    var scratchuniques = [];
  }
  if (uniques) {
    while (uniques.length) { uniques.pop(); }
  } else {
    var uniques = [];
  }

  for (i=0; i<comparisons.length; i++) {
    var myUnique = { 'term': searches[comparisons[i]].term };
    if (searches[comparisons[i]].nickname) {
      myUnique.nickname = searches[comparisons[i]].nickname;
    }
    var notme = comparisons.slice();
    notme.splice(i,1);
    notme = jQuery.map( notme, function( n, i ) {
      return ("(" + searches[n].term + ")");
    });
    var notmestr = notme.join(' OR ');
    var notmesearch = "(" + myUnique.term + ") NOT (" + notmestr + ")";
    myUnique.search = notmesearch;
    scratchuniques.push( myUnique );
  }

  getuniqueSearches();

  function getuniqueSearches() {
  	//We do it this way instead of a loop so we can easily throttle the requests with setTimeout
  	mysearch = scratchuniques.pop();
  	grabKey(mysearch);
  	if (scratchuniques.length) {
  		setTimeout(getuniqueSearches, 300);
  	} else {
      return;
  		}
  }

  function grabKey(mysearch) {
    $.ajax({
      url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
    	data: {
    	db: 'pubmed',
    	usehistory: 'y',
    	term: mysearch.search,
    	retmode: 'json',
    	retmax: 0,
    	email: 'ed_sperr@hotmail.com',
    	tool: 'searchworkbench'
    },
    success: function( data ) {
      mysearch.query_key = data.esearchresult.querykey;
      mysearch.WebEnv = data.esearchresult.webenv;
      getuniqueDocs(mysearch);
    }
    });
    }

  function getuniqueDocs(myUnique) {
    $.ajax({
      url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi',
      data: {
      db: 'pubmed',
      usehistory: 'y',
      WebEnv: myUnique.WebEnv,
      query_key: myUnique.query_key,
      retmode: 'json',
      retmax: 10,
      email: 'ed_sperr@hotmail.com',
      tool: 'searchworkbench'
    },
    success: function( data ) {
      myUnique.docs = data.result;
      uniques.push(myUnique);
      if (uniques.length == comparisons.length) {
        parseUniques(uniques);
       }

    }
    });
    }
}

function parseUniques(uniques) {
  $( "#uniques" ).empty();
  for (i=0; i<uniques.length; i++){
    $( "#uniques" ).append('<div class="uniquelist">');
    var uniquetitle = uniques[i].term;
    if (uniques[i].nickname) { uniquetitle = uniques[i].nickname; }
    $( ".uniquelist" ).last().append('<p>Records found <em>only</em> for "' + uniquetitle + '" in this set of comparisons:</p> <dl/>');
    var mydocs = uniques[i].docs;
    $.each(mydocs, function (i, record) {
        if (record.hasOwnProperty('uid')) {
          $( ".uniquelist dl" ).last().append('<dt><a href="https://www.ncbi.nlm.nih.gov/pubmed/' + record.uid + '">' + record.title + '</a></dt>');
          var names = [];
          var a = 0;
          while (a < record.authors.length) {
            names.push(record.authors[a].name);
            a++;
            }
          var cite = names.join(", ");
          cite += ". <em>" + record.source + "</em>. " + record.pubdate
          if (record.volume) { cite += ";" + record.volume; }
          if (record.issue) { cite += "(" + record.issue + ")"; }
          if (record.pages) { cite += ":" + record.pages; }
          cite += ".";
          $( ".uniquelist dl" ).last().append("<dd>" + cite + "</dd>");
        }

        // code...
      });
      var pmurl = pubmedURLstem + encodeURI(uniques[i].search);
      $( ".uniquelist" ).last().append('<a href="' + pmurl + '" target="_pmresults">See more on PubMed</a>');
  }
  $( "#translation" ).append('<button class="btn btn-primary" data-toggle="modal" data-target="#unique-records">Show unique records</button>')
}
