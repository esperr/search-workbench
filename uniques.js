function findUniques(terms) {
  newterms = [];
  for (i=0; i<terms.length; i++) {
    newterms.push("(" + terms[i] + ")");
  }
  var uniques = [];
  for (i=0; i<newterms.length; i++) {
    console.log(newterms[i]);
    var notme = newterms.slice();
    notme.splice(i,1);
    var notmestr = notme.join(' OR ');
    var notmesearch = newterms[i] + " NOT (" + notmestr + ")";
    uniques.push( { 'search': notmesearch }  );
  }

  for (i=0; i<uniques.length; i++) {
      console.log( uniques[i].search );
      esearch(uniques[i].search)
      .then(function( data ) {
        console.log(JSON.stringify(data));
 	      //getDocs(data);
      }).fail(function() {
        alert("Search failed");
      });
    }
}
