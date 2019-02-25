// Based on: http://bl.ocks.org/mbostock/3892928

var SvgPanel = React.createClass({
    getInitialState() {
        return {};
    },
    render() {
        return <div>
            <svg></svg></div>;
    },
    componentDidMount: function () {
        this.doDraw();
    },
    componentDidUpdate: function (prevProps, prevState) {
        var self = this;
        if (!_.isEqual(prevProps.positions, this.props.positions)) {
//            console.log("positions changed.");
            this.updateDraw();
        } else {
  //          console.log("positions unchanged.");
            this.updateDraw();
        }
    },
    zoom: '',
    currentZoom: 0.8,
    currentTranslate: [0,0],
    dragging: false,
    calcBgImgPos() {
        const vi = 150, wi = 250;
        return _.flatten(_.map(_.range(-5, 5), function (i) {
            return _.map(_.range(-4, 7), function (j) {
                return [i * wi, j * vi, 20];
            });
        }), true);
    },
    doDraw() {
        const self = this;
        this.zoom = d3.behavior.zoom()
            .x(x)
            .y(y)
            .scaleExtent([0.8, 20])
            .on("zoom", zoomed);

        svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right + 400)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("rect")
            .attr("width", width)
            .attr("height", height);


        var sc = 1;
        var color = d3.scale.linear().domain([0, this.props.positions.length - 1]).range(['blue', '#cc0033']);


        this.drag = d3.behavior.drag()
            .origin(function (d) {
                return {x: 0, y: 0};
            })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        this.dragBG = d3.behavior.drag()
            .origin(function (d) {
                return {x: 0, y: 0};
            })
            .on("dragstart", dragstartedBG)
            .on("drag", draggedBG)
            .on("dragend", dragendedBG);

        function dragstarted() {
            if(d3.event.sourceEvent.shiftKey) return;
            self.dragging = true;
            console.log(self.zoom.scale());
            self.currentZoom = self.zoom.scale();
            self.currentTranslate = self.zoom.translate();
            console.log(d3.event);
        }

        function dragged() {
            if(d3.event.sourceEvent.shiftKey) return;
            //console.log(self.currentZoom,self.currentTranslate);
            const dragfactor = 21/self.currentZoom;
            self.zoom.scale(self.currentZoom);
            self.zoom.translate(self.currentTranslate);
            if(d3.event.sourceEvent.altKey) {
                self.props.onAngleChange(-d3.event.dy/5);
            }else{
                self.props.onPosChange({x: d3.event.dx * dragfactor, y: -d3.event.dy * dragfactor});
            }
        }

        function dragended() {
            if(d3.event.sourceEvent.shiftKey) return;
            self.dragging = false;
            self.zoom.scale(self.currentZoom);
            self.zoom.translate(self.currentTranslate);
            self.zoom.event(svg);
            console.log(d3.event);
        }

        function dragstartedBG() {
            if(!d3.event.sourceEvent.shiftKey) return;
            self.dragging = true;
            console.log(self.zoom.scale());
            self.currentZoom = self.zoom.scale();
            self.currentTranslate = self.zoom.translate();
            console.log(d3.event);
        }

        function draggedBG() {
            if(!d3.event.sourceEvent.shiftKey) return;
            //console.log(self.currentZoom,self.currentTranslate);
            const dragfactor = 1/self.currentZoom;
            self.zoom.scale(self.currentZoom);
            self.zoom.translate(self.currentTranslate);
            if(d3.event.sourceEvent.altKey){
                self.props.onImgAngleChange(-d3.event.dy/5);
            }else{
                self.props.onImgOffsetChange({x: d3.event.dx * dragfactor, y: d3.event.dy * dragfactor});
            }
        }

        function dragendedBG() {
            if(!d3.event.sourceEvent.shiftKey) return;
            self.dragging = false;
            self.zoom.scale(self.currentZoom);
            self.zoom.translate(self.currentTranslate);
            self.zoom.event(svg);
            console.log(d3.event);
        }


        pos1 = svg.append("g")
            .attr('class', 'container')
            .selectAll('g')
            .data(this.props.positions)
            .enter();

        //border
        border = svg.select('g.container').append("g")
            .attr('class', 'border')
            .attr('transform', function (d) {
                return 'translate(' + x(-9000) + ',' + y(4500) + ') scale(' + 1 + ')';
            });

        border.append('rect')
            .attr("width", Math.abs(x(18000) - x(0)))
            .attr("height", Math.abs(x(9000) - x(0)));



        bgimage = svg.select('g.container')
            .append('g')
            .attr('clip-path', 'url(#bgimage-clip)')
            .attr('class', 'images');

        images = bgimage.selectAll('image')
            .data(this.calcBgImgPos())
            .enter()
            .append('image')
            .attr('transform', function (d) {
                return 'rotate(' + (-self.props.bgImageAngle) + ')';
            })
            .attr('xlink:href', this.props.bgImage)
            .style('display', this.props.showBgImage ? 'block' : 'none')
            .attr({width: 252, height: 200, opacity: 0.3})
            .attr('x', function (d) {
                return d[0] + self.props.bgImageOffset[0];
            })
            .attr('y', function (d) {
                return d[1] + self.props.bgImageOffset[1];
            });

        pos = pos1.append('g')
            .attr("class", "pos")
            .attr('transform', function (d) {
                return 'translate(' + x(d.x) + ',' + y(d.y) + ') scale(' + sc + ')'
            });

        // X axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Y axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var w = Math.abs(x(fov.width) - x(0));
        var h = Math.abs(y(fov.height) - y(0));
        pos.append('rect')
            .attr('class', 'pos')
            .attr('x', -w / 2)
            .attr('y', -h / 2)
            .attr('width', function (d) {
                return w;
            })
            .attr('height', function (d) {
                return h;
            })
            .style('fill', function (d) {
                return color(d.i)
            })
            .attr({stroke: '#333377', opacity: 0.6});

        pos.call(this.drag);
        svg.call(this.zoom);
        bgimage.call(this.dragBG);

        pos.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .style('dominant-baseline', 'middle')
            .style('text-anchor', 'middle')
            .style('fill', 'white')
            .text(function (d) {
                return d.i;
            });


        svg.append('clipPath')
            .attr('id', 'bgimage-clip')
            .append('rect')
            .attr({width: 900, height: 450});

        svg.append('clipPath')
            .attr('id', 'wholearea-clip')
            .append('rect')
            .attr({width: 1200, height: 410});

        svg.select('g.container').attr('clip-path', 'url(#wholearea-clip)');


        d3.select("button").on("click", reset);

        this.zoom.translate([20, 40]).scale(0.8);
        this.zoom.event(svg);


        function zoomed() {
            //console.log('zoomed',self.dragging, self.currentZoom,self.currentTranslate);
            if (self.dragging)
                return;
            self.currentZoom = d3.event.scale;
            self.currentTranslate = d3.event.translate;

            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);
            pos.attr('transform', function (d) {
                return 'translate(' + x(d.x) + ',' + y(d.y) + ') scale(' + d3.event.scale + ')';
            });
            bgimage.attr('transform', function (d) {
                return 'translate(' + x(-9000) + ',' + y(4500) + ') scale(' + d3.event.scale + ')';
            });
            border.attr('transform', function (d) {
                return 'translate(' + x(-9000) + ',' + y(4500) + ') scale(' + d3.event.scale + ')';
            });
            pos.selectAll('text').style('font-size', function () {
                return self.props.fontSize / d3.event.scale;
            })
        }

        function zoomedPos() {
            console.log('zoomedPos');
            pos.attr('transform', function (d) {
                return 'translate(' + x(d.x) + ',' + y(d.y) + ') scale(' + d3.event.scale + ')';
            });
            d3.event.stopPropagation();
        }

        function reset() {
            d3.transition().duration(750).tween("zoom", function () {
                var ix = d3.interpolate(x.domain(), [-width / 2, width / 2]),
                    iy = d3.interpolate(y.domain(), [-height / 2, height / 2]);
                return function (t) {
                    zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
                    zoomed();
                };
            });
        }
    },
    updateDraw() {
        const self = this;
        var color = d3.scale.linear().domain([0, this.props.positions.length - 1]).range(['blue', '#cc0033']);
        var sc1 = 1;

        d3.selectAll('g.pos').remove();
        d3.selectAll('.images image').remove();

        bgimage.selectAll("image")
            .data(this.calcBgImgPos())
            .enter()
            .append('image')
            .attr('transform', function (d) {
                return 'rotate(' + (-self.props.bgImageAngle) + ')';
            })
            .style('display', this.props.showBgImage ? 'block' : 'none')
            .attr('xlink:href', 'testpositions.png')
            .attr({width: 252, height: 200, opacity: 0.3})
            .attr('x', function (d) {
                return d[0] + self.props.bgImageOffset[0];
            })
            .attr('y', function (d) {
                return d[1] + self.props.bgImageOffset[1];
            });

        pos = svg.select("g.container")
            .selectAll('g.pos')
            .data(this.props.positions)
            .enter()
            .append('g')
            .attr("class", "pos")
            .attr('transform', function (d) {
                return 'translate(' + x(d.x) + ',' + y(d.y) + ') scale(' + sc1 + ')'
            });

        var w = Math.abs(x(fov.width) - x(0));
        var h = Math.abs(y(fov.height) - y(0));
        const sc = this.zoom.scale();
        pos.append('rect')
            .attr('class', 'pos')
            .attr('x', -w / 2 / sc)
            .attr('y', -h / 2 / sc)
            .attr('width', function (d) {
                return w / sc;
            })
            .attr('height', function (d) {
                return h / sc;
            })
            .style('fill', function (d) {
                return color(d.i)
            })
            .attr('stroke', '#333377');
        pos.call(this.drag);

        pos.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .style('dominant-baseline', 'middle')
            .style('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-size', this.props.fontSize)
            .text(function (d) {
                return d.i;
            });
        self.zoom.event(svg);

    }
});


var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom;

var factor = 20;
var x = d3.scale.linear()
    .domain([-9000, 9000])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([-height * factor / 2, height * factor / 2])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width);

var fov = {width: 264, height: 264};

var svg, pos;

function tr(x, y) {
    return {transform: 'translate(' + x + ',' + y + ')'};
}

