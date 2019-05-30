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

module.exports.presentation = function (p)  {
	var res = "<li data-kind='"+(p.kind || '')+"'>";
	if(p.authors){
		res += "<span class='authors'>" + p.authors + "<br/></span>";
		res += "<span class='title'>" + p.title + (p.invited ? "<strong>（招待講演）</strong>" : "") + "<br/></span>";
		res += "<span class='conference'>" + (p.url ? ("<a href='"+p.url+"'>"+p.conference+"</a>") : p.conference);
		res += " (" + p.date + "; " + p.place + ")<br/></span>";
	}else{
		res += p;
	}
	res += '</li>'
	return res;
};
