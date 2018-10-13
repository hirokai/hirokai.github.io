module.exports.paper = function (paper)  {
	var res = "";
	if(paper.authors){
		res += paper.authors + "; <br/>"
		res += "&quot;" + paper.title + "&quot<br/>"
		res += "<a href='"+paper.journal+"'>" + paper.journal_cit + ".</a>";
	}else{
		res += paper.citation;
		if(paper.pubmed){
			res += '&nbsp;[PubMed ID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/'+paper.pubmed+'">'+paper.pubmed+'</a>]';
		}
		if(paper.journal){
			res += '&nbsp;[<a href="'+paper.journal+'">Journal</a>]';
		}
	}
	return res;
};

module.exports.presentation = function (presentation)  {
	var res = "";
	if(presentation.authors){
		res += presentation.authors + "<br/>";
		res += presentation.title + "<br/>";
		res += presentation.conference + " (" + presentation.date + "; " + presentation.place + ")<br/>";
	}else{
		res += presentation;
	}
	return res;
};
