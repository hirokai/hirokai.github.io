function toHash(key, arr, remove_key) {
    var hash = {};
    arr.map(function (d) {
        hash[d[key]] = d;
        if (remove_key)
            delete hash[d.key][key];
    });
    return hash;
}

var image = {width: 1392, height: 1040};
var imageAspectRatio = image.width / image.height;
var scaling = 0.4;

var drawing = {width: image.width * scaling, height: image.height * scaling};
var margin = {width: 20, height: 20};
var size = {width: drawing.width + margin.width * 2, height: drawing.height + margin.height * 2};

var x = d3.scale.linear().range([margin.width, margin.width + drawing.width]).domain([0, 1392]);
var y = d3.scale.linear().range([margin.height, margin.height + drawing.height]).domain([0, 1040]);

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var x_slider;

function init_slider(div_selector, max_frame) {
    x_slider = d3.scale.linear().range([0, 400]).domain([0, max_frame]);

    d3.select(div_selector)
        .selectAll('line')
        .data(_.range(0, max_frame, 10)).enter()
        .append('line')
        .attr({
            x1: function (d) {
                return x_slider(d);
            },
            y1: function (d) {
                return 0;
            },
            x2: function (d) {
                return x_slider(d);
            },
            y2: function (d) {
                return 40;
            },
            stroke: '#444',
            'stroke-width': 2,
            opacity: 0.5
        });
    d3.select(div_selector).append('circle')
        .attr({r: 5, fill: 'red'})
        .attr({
            cx: x_slider(0),
            cy: 10
        });

    $('#slider').click(function (ev) {
        var x = ev.offsetX;
        setCurrentFrame(Math.round(x_slider.invert(x)));
    });
}

function initializePlot() {
    d3.select('#img-container').select('*').remove();
    var svg = d3.select('#img-container')
        .append('svg')
        .style({width: '' + size.width + 'px', height: '' + size.height + 'px'});

    d3.select('#img-container').append('img')
        .attr({src:'img/'+basename+'_trajectories.png'
            ,width: '500px'
        });

    var imgs = d3.select('body')
        .append('div')
        .style({display: 'none'})
        .selectAll('img')
        .data(_.range(0, max_frame))
        .enter()
        .append('img')
        .attr('src', function (n) {
            return 'img/' + basename + pad(n, 4) + '.jpg'
        });

    svg.append('image').attr({
        'xlink:href': 'img/' + basename + '0000.jpg',
        'x': margin.width,
        'y': margin.height,
        'height': drawing.height,
        'width': drawing.width
    });
    svg.append('text').attr({id: 'info', x: margin.width + 20, y: margin.height + 20})
        .style({'font-family': 'Sans-Serif'});


    init_slider('#slider', max_frame);

    return svg;
}

function printTable(arr_of_hash) {
    var ks = Object.keys(arr_of_hash[0]);
    console.log(ks.join('\t'));
    arr_of_hash.map(function (hash) {
        console.log(ks.map(function (k) {
            return hash[k];
        }).join('\t'));
    })
}

function mkHist(vs, range, num_ticks, color, label, no_number) {
    return function (elem) {
        _mkHist(elem, vs, range, num_ticks, color, label, no_number)
    };
}

function mkTimeCourse(vs,xrange,yrange,color,label){
    function _mkTimeCourse(elem,xs,ys,es,color,label) {
        var height = 200, width = 300, margin = {left: 30, top: 10};

        var x = d3.scale.linear()
            .domain(xrange || [1, _.max(xs)])
            .range([margin.left, width]);
        var y = d3.scale.linear()
            .domain(yrange || [0, _.max(ys)])
            .range([height,margin.top]);

        var r = 2;

        elem.selectAll('circle')
            .data(vs)
            .enter()
            .append('circle')
            .attr({
                cx: function (d) {
                    return x(d[0]);
                },
                cy: function (d) {
                    return y(d[1]);
                },
                r: r,
                fill: color || 'blue'
            });

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(4)
            .orient("left");

        elem.append('g')
            .attr("class", "y axis")
            .attr("transform", "translate("+margin.left+"," + margin.top + ")").call(yAxis);

        elem.append("g")
            .attr("transform", "translate(" + width + ",20)")
            .append('text')
            .attr('text-anchor', 'end')
            .text(label);
        elem.selectAll('rect')
            .data(vs)
            .enter()
            .append("rect")
            .attr({x: function(d){return x(d[0])-r*0.8}, y: function(d){return y(d[1]+d[2])},
                width: r*2*0.8,
                fill: color || 'blue',
                opacity: 0.5    ,
                height: function(d){return (y(0)-y(d[2]))*2;}});
    }

    return function(elem){
        var xs = _.map(vs,function(v){return v[0];});
        var ys = _.map(vs,function(v){return v[1];});
        var es = _.map(vs,function(v){return v[2];});
        _mkTimeCourse(elem,xs,ys,es,color,label);
    }
}


function _mkHist(elem, vs, range, num_ticks, color, label, no_number) {

    var height = 150, width = 300;

    var x = d3.scale.linear()
        .domain(range)
        .range([0, width]);

// Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(num_ticks))(vs);

    var max_y = d3.max(data, function (d) {
        return d.y;
    });

    var y = d3.scale.linear()
        .domain([0, max_y])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var svg = elem
        .attr('class', 'hist')
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.width + "," + margin.height + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) {
            return "translate(" + x(d.x) + "," + y(d.y) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", function (d) {
            return x(d.dx) - x(0);
        })
        .attr("height", function (d) {
            return height - y(d.y);
        })
        .style("fill", color);

    var formatCount = d3.format(",.0f");

    if (!no_number) {
        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", (x(data[0].dx) - x(0)) / 2)
            .attr("text-anchor", "middle")
            .text(function (d) {
                return formatCount(d.y);
            });
    }

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + width + ",20)")
        .append('text')
        .attr('text-anchor', 'end')
        .text(label);

    svg.append("line")
        .attr({x1: x(0),y1: y(0),x2:x(0),y2:y(max_y)})
        .attr({stroke: 'black', 'stroke-width': '1px','stroke-dasharray': '3,3'});

}

var all_vectors_1;
var all_vectors_5;

function plotAllTimeHistograms(coordinates, connections, max_frame) {

    if(!all_vectors_1){
        all_vectors_1 = calc_all_vectors(coordinates, connections, paths, max_frame, 1);
    }
    if(!all_vectors_5){
        all_vectors_5 = calc_all_vectors(coordinates, connections, paths, max_frame, 5);
    }
    var xs = _.flatten(_.map(all_vectors_1, function (values, k) {
        return values.map(function (v) {
            return v[0]
        });
    }), true);
    var ys = _.flatten(_.map(all_vectors_1, function (values, k) {
        return values.map(function (v) {
            return v[1]
        });
    }), true);

//    d3.select('svg.hist-alltime').remove();

    var r = currentDataset.step_range;

    d3.select('#hist-alltime-container1').append('svg')
        .attr('class', 'hist-alltime')
        .call(mkHist(xs, [-r, r], 41, 'steelblue', 'X step [pixel]', true))
        .attr({width: '400px', height: '250px'})
        .append('text')
        .html(mean_and_sem(xs, 2))
        .attr({x: 10, y: 50});

    d3.select('#hist-alltime-container1').append('svg')
        .attr('class', 'hist-alltime')
        .call(mkHist(ys, [-r, r], 41, 'green', 'Y step [pixel]', true))
        .attr({width: '400px', height: '250px'})
        .append('text')
        .html(mean_and_sem(ys, 2))
        .attr({x: 10, y: 50});


    var xs5 = _.flatten(_.map(all_vectors_5, function (values, k) {
        return values.map(function (v) {
            return v[0];
        });
    }), true);
    var ys5 = _.flatten(_.map(all_vectors_5, function (values, k) {
        return values.map(function (v) {
            return v[1];
        });
    }), true);

    d3.select('#hist-alltime-container5').append('svg')
        .attr('class', 'hist-alltime')
        .call(mkHist(xs5, [-r*5, r*5], 41, 'steelblue', 'X step [pixel]', true))
        .attr({width: '400px', height: '250px'})
        .append('text')
        .html(mean_and_sem(xs5, 2))
        .attr({x: 10, y: 50});

    d3.select('#hist-alltime-container5').append('svg')
        .attr('class', 'hist-alltime')
        .call(mkHist(ys5, [-r*5, r*5], 41, 'green', 'Y step [pixel]', true))
        .attr({width: '400px', height: '250px'})
        .append('text')
        .html(mean_and_sem(ys5, 2))
        .attr({x: 10, y: 50});



    var xss2 = _.map(all_vectors_1,function(vs,k){
        var xs = _.map(vs,function(v){return v[0];});
        return [+k,mean(xs),sem(xs)];
    });
    var xss2_5 = _.map(all_vectors_5,function(vs,k){
        var xs = _.map(vs,function(v){return v[0];});
        return [+k,mean(xs),sem(xs)];
    });

    var yss2 = _.map(all_vectors_1,function(vs,k){
        var ys = _.map(vs,function(v){return v[1];});
        return [+k,mean(ys),sem(ys)];
    });
    var yss2_5 = _.map(all_vectors_5,function(vs,k){
        var ys = _.map(vs,function(v){return v[1];});
        return [+k,mean(ys),sem(ys)];
    });

    //d3.selectAll('svg.hist-timecourse').remove();

    d3.select('#hist-timecourse-container1').append('svg')
        .attr('class', 'hist-timecourse')
        .call(mkTimeCourse(xss2, [1,max_frame], [-r/2,r/2],'steelblue', 'X step [pixel]'))
        .attr({width: '400px', height: '250px'});

    d3.select('#hist-timecourse-container1').append('svg')
        .attr('class', 'hist-timecourse')
        .call(mkTimeCourse(yss2, [1,max_frame], [-r/2,r/2],'green', 'Y step [pixel]'))
        .attr({width: '400px', height: '250px'});

    d3.select('#hist-timecourse-container5').append('svg')
        .attr('class', 'hist-timecourse')
        .call(mkTimeCourse(xss2_5, [1,max_frame], [-r/2*5,r/2*5], 'steelblue', 'X step [pixel]'))
        .attr({width: '400px', height: '250px'});

    d3.select('#hist-timecourse-container5').append('svg')
        .attr('class', 'hist-timecourse')
        .call(mkTimeCourse(yss2_5, [1,max_frame], [-r/2*5,r/2*5], 'green', 'Y step [pixel]'))
        .attr({width: '400px', height: '250px'});
}

function plotInstantVelocityHistograms(vs) {
    var width = 700;
    var rectGrid = d3.layout.grid()
        .bands()
        .size([width, size.height])
        .padding([0.1, 0.1]).cols(2).rows(2);

    var rects = [{}, {}, {}, {}];

    d3.select('svg.hists').remove();

    d3.select('#hists-container').append('svg').attr({
        'class': 'hists',
        'width': '' + width + 'px',
        'height': '' + size.height + 'px'
    });

    var gs = d3.select('svg.hists').selectAll("g.section")
        .data(rectGrid(rects));

    var v_xs = vs.map(function (v) {
        return v[0];
    });

    var v_ys = vs.map(function (v) {
        return v[1];
    });

    var v_angles = vs.map(function (v) {
        return angle(v) * 180 / Math.PI;
    });

    var v_norms = vs.map(function (v) {
        return norm(v);
    });

    function mkHists(sel) {
        d3.select(sel[0][0]).select('*').remove();
        d3.select(sel[0][1]).select('*').remove();
        d3.select(sel[0][2]).select('*').remove();
        d3.select(sel[0][3]).select('*').remove();

        d3.select(sel[0][0]).call(mkHist(v_xs, [-currentDataset.step_range, currentDataset.step_range], 21, 'steelblue', 'X velocity [pixel/frame]'));
        d3.select(sel[0][1]).call(mkHist(v_ys, [-currentDataset.step_range*5, currentDataset.step_range*5], 21, 'green', 'Y velocity [pixel/frame]'));
        d3.select(sel[0][2]).call(mkHist(v_angles, [-90, 270], 13, 'blue', 'Velocity angle [deg]'));
        d3.select(sel[0][3]).call(mkHist(v_norms, [0, currentDataset.step_range], 21, 'orange', 'Speed (velocity norm) [pixel/frame]'));
    }

    gs.enter().append("g")
        .attr("class", "section")
        .attr("width", rectGrid.nodeSize()[0])
        .attr("height", rectGrid.nodeSize()[1])
        .attr("transform", function (d) {
            return "translate(" + (d.x + 10) + "," + d.y + ")";
        })
        .call(mkHists);

    $('#value-vx').html(mean_and_sem(v_xs));
    $('#value-vy').html(mean_and_sem(v_ys));
    $('#value-angle').html(mean_and_sem(v_angles));
    $('#value-speed').html(mean_and_sem(v_norms));

}

function setData(svg, coords, frame, conns) {
    var info = svg.select('#info').text('Frame ' + frame);

    var conn = conns[frame] ? conns[frame].values : [];
    var conn_prev = conns[frame - 1] ? conns[frame - 1].values : [];
    var coord = coords[frame] ? coords[frame].values : [];
    var coord_prev = coords[frame - 1] ? coords[frame - 1].values : [];

    var vectors = calc_vectors(coords, conns, paths, frame, 1);

    var g = svg.selectAll('g').data(coord, function (d) {
        return d.id;
    });

    g.enter()
        .append('g')
        .append('circle')
        .style('opacity', 1)
        .attr({
            r: 3, fill: function (d) {
                return _.findWhere(conn, {to: d.id}) ? 'blue' : 'pink';
            }
        })
        .attr({
            cx: function (d) {
                return x(d.x);
            }, cy: function (d) {
                return y(d.y);
            }
        });
//        .transition().duration(100).style('opacity', 1);

    g.exit().transition().duration(500).style('opacity', 0).remove();

    function calcLine(conn, frame) {
        return conn.map(function (c) {
//        var from = _.findWhere(coords, {id: c.from});
            var to = _.findWhere(coords[frame].values, {id: c.to});
            var from = _.findWhere(coords[frame - 1].values, {id: c.from});
            return {x1: from.x, y1: from.y, x2: to.x, y2: to.y, id: c.id};
        });
    }

    function mkLine(sel, cls, opacity) {
        sel.append('line').attr({
            x1: function (d) {
                return x(d.x1)
            },
            y1: function (d) {
                return y(d.y1)
            },
            x2: function (d) {
                return x(d.x2)
            },
            y2: function (d) {
                return y(d.y2)
            },
            'class': cls,
            stroke: '#444',
            'stroke-width': 2
        }).style('opacity', opacity);
    }

    var lines = calcLine(conn, frame);
    var lines2 = calcLine(conn_prev, frame - 1);

    var ls = svg.selectAll('line.last').data(lines, function (d) {
        return d.id;
    });
    var ls2 = svg.selectAll('line.last2').data(lines2, function (d) {
        return d.id;
    });

    svg.selectAll('image').attr('xlink:href', 'img/' + basename + pad(frame - 1, 4) + '.jpg');

    ls.enter().call(mkLine, 'last', 1);
    ls2.enter().call(mkLine, 'last2', 0.5);
    ls.exit().remove();
    ls2.exit().remove();

    d3.select('#slider circle')
        .attr({r: 5, fill: 'red'})
        .attr({
            cx: x_slider(frame),
            cy: 10
        });

    plotInstantVelocityHistograms(vectors);
    if(!all_vectors_1){
        plotAllTimeHistograms(coordinates, connections, max_frame);
    }
    updateStatsTable(vectors);
}

function updateStatsTable(vs) {

}

var coordinates;
var connections;
var paths;

var max_frame;
var currentFrame;

var svg;

//var basename = 'PDMS collagen4_7';
var basename = '20150806_AgCl_10uA';

function updateUIForNewFrame() {
    if (currentFrame <= 1) {
        currentFrame = 1;
        $('#prev').prop('disabled', true);
    } else {
        $('#prev').prop('disabled', false);
    }

    if (currentFrame > max_frame) {
        currentFrame = max_frame;
        $('#next').prop('disabled', true);
    } else {
        $('#next').prop('disabled', false);
    }
    setData(svg, coordinates,
        currentFrame,
        connections);
}

$('#prev').click(function () {
    setCurrentFrame(currentFrame - 1);
});

$('#next').click(function () {
    setCurrentFrame(currentFrame + 1);
});


$('#prev').on('mousedown', function () {
    pressed_move = -1;
    mouseTimer = window.setInterval(mouseFunc, 200);
})
$('#prev').on('mouseup', function () {
    pressed_move = 0;
    window.clearInterval(mouseTimer);
});
$('#prev').on('mouseout', function () {
    pressed_move = 0;
    window.clearInterval(mouseTimer);
})

$('#next').on('mousedown', function () {
    pressed_move = 1;
    mouseTimer = window.setInterval(mouseFunc, 200);
})
$('#next').on('mouseup', function () {
    pressed_move = 0;
    window.clearInterval(mouseTimer);
});
$('#next').on('mouseout', function () {
    pressed_move = 0;
    window.clearInterval(mouseTimer);
});

var playTimer;

$('#play').click(function () {
    function timerFunc() {
        var fr = currentFrame;
        fr += 1;
        if (fr > max_frame) {
            // For some reason, just going back directly causes a problem (blue dots do not show in the 2nd cycle).
            fr = 1;
            window.clearInterval(playTimer);
            window.setTimeout(function () {
                playTimer = window.setInterval(timerFunc, 200);
            }, 500);
        }
        setCurrentFrame(fr);
    }

    if (playTimer) {
        window.clearInterval(playTimer);
        playTimer = null;
        $('#play').removeClass('active');
    } else {
        $('#play').addClass('active');
        playTimer = window.setInterval(timerFunc, 200);
    }
});

var mouseTimer = null;
var pressed_move = 0;

function mouseFunc(d) {
    setCurrentFrame(currentFrame + pressed_move);
}

function setCurrentFrame(frameCount) {
    currentFrame = frameCount;
    updateUIForNewFrame();
}

var currentDataset;

var datasets = [
    {name: '20150806_AgCl_10uA', step_range: 20}
    , {name: 'PDMS collagen4_1',step_range: 40}
    , {name: 'PDMS collagen4_2',step_range: 40}
    , {name: 'PDMS collagen4_3',step_range: 100}
    , {name: 'PDMS collagen4_4',step_range: 50}
    , {name: 'PDMS collagen4_5',step_range: 40}
    , {name: 'PDMS collagen4_6',step_range: 40}
    , {name: 'PDMS collagen4_7',step_range: 40}
];

function initialize(){
    var list = $('#data-list');
    _.map(datasets,function(v){
        list.append('<option value="'+ v.name +'">'+ v.name +'</option>')
    });

    list.on('change',function(ev){
        updateDataset(_.findWhere(datasets,{name:list.val()}));
    })
    updateDataset(datasets[0]);
}

function updateDataset(d){
    currentDataset = d;
    basename = d.name;
    all_vectors_1 = null;
    all_vectors_5 = null;
//    d3.selectAll('svg').remove();

    d3.csv('data/'+basename + '_coords.csv', function (d) {
        return {
            slice: +d['Slice'],
            x: +d['XM'],
            y: +d['YM'],
            id: +d['ID']
        };
    }, function (coord) {

        d3.csv('data/'+basename + '_connections_v2.csv', function (d) {
                return {from: +d.from, to: +d.to, from_frame: +d.from_frame, to_frame: +d.to_frame, id: +d.id};
            }, function (conn) {
                d3.json('data/'+basename + '_paths.json', function (_paths) {
                    coordinates = toHash('key', d3.nest()
                        .key(function (d) {
                            return d.slice;
                        })
                        .entries(coord));

                    max_frame = _.max(Object.keys(coordinates).map(function (d) {
                        return +d;
                    }));


                    connections = toHash('key', d3.nest()
                        .key(function (d) {
                            return d.to_frame;
                        }).entries(conn));

                    paths = _paths;


                    svg = initializePlot();

                    setCurrentFrame(1);
                });


            }
        );
    });
}

$(function(){
    initialize();
});
