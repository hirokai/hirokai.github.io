module.exports.paper = function (paper)  {
	var res = paper.citation;
	if(paper.pubmed){
		res += '[PubMed ID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/'+paper.pubmed+'">'+paper.pubmed+'</a>]&nbsp;';
	}
	if(paper.journal){
		res += '[<a href="'+paper.journal+'">Journal</a>]&nbsp;';	
	}
	return res;
};

