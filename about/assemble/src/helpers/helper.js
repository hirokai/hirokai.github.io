module.exports.paper = function (paper)  {
	var res = paper.citation;
	if(paper.pubmed){
		res += '&nbsp;[PubMed ID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/'+paper.pubmed+'">'+paper.pubmed+'</a>]';
	}
	if(paper.journal){
		res += '&nbsp;[<a href="'+paper.journal+'">Journal</a>]';
	}
	return res;
};
