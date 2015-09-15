function norm(v) {
    var x = v[0];
    var y = v[1];
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function angle(v) {
    return Math.atan(v[1] / v[0]) + (v[0] > 0 ? 0 : Math.PI);
}


//http://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function mean(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
}

//http://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function stdev(values) {
    var avg = mean(values);

    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = mean(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function sem(values) {
    return stdev(values) / Math.sqrt(values.length);
}


function mean_and_sem(vs, digit) {
    digit = digit || 1;
    var s = _.repeat('0', digit);
    return vs.length == 0 ? '' : numeral(mean(vs)).format('0.' + s) + ' &plusmn; ' + numeral(sem(vs)).format('0.' + s);
}

function calc_vectors(coords, conns, paths, frame, step) {
    if(step > 1){
        var r = calc_vectors_path(coords,paths,frame,step);
        //console.log(r);
        return r;
    }

    var conn = conns[frame] ? conns[frame].values : [];
    var conn_prev = conns[frame - 1] ? conns[frame - 1].values : [];
    var coord = coords[frame] ? coords[frame].values : [];
    var coord_prev = coords[frame - 1] ? coords[frame - 1].values : [];

    return conn.map(function (c) {
        var fr = _.findWhere(coord_prev, {id: c.from});
        var to = _.findWhere(coord, {id: c.to});
        return [to.x - fr.x, to.y - fr.y];
    });
}

function calc_vectors_path(coords,paths,frame,step){
    var coord_ids = _.map(coords[frame] ? coords[frame].values : [],function(c){return c.id});
    return _.compact(_.map(coord_ids,function(c) {
        var v;
        for(var i = 0; i < paths.length; i++){
            var path = paths[i];
            var idx = path.indexOf(c);
            if (idx >= 0 && idx + step < path.length) {
                var end_frame = frame;
                var end_coord = _.findWhere(coords[end_frame].values,{id: path[idx]});
                var start_frame = frame-step;
                var start_coord = _.findWhere(coords[start_frame].values,{id:path[idx+step]});
                v = [end_coord.x-start_coord.x, end_coord.y-start_coord.y];
                break;
            }
        }
        return v;
    }));
}
//
//function calc_vectors_new2(coords, conns, frame, step) {
//    function follow(frame, step, coord_id) {
//        following('')
//        if (step > 0) {
//            if(frame > 1){
//                var prev_conn = _.findWhere(conns[frame].values, {to: coord_id});
//                //if(prev_conn){
//                //    console.log(prev_conn);
//                //}
//                if (prev_conn) {
//                    follow(frame - 1, step - 1, prev_conn.from);
//                } else {
//                    return undefined;
//                }
//            }else{
//                return undefined;
//            }
//        } else {
//            return coord_id;
//        }
//    }
//
//    var conn = conns[frame] ? conns[frame].values : [];
//    var coord = coords[frame] ? coords[frame].values : [];
//    var coords_start = coords[frame - step] ? coords[frame - step].values : [];
//    return _.compact(conn.map(function (c) {
//        var to = c.to;
//        var start_id = follow(frame, step, to);
//        if(start_id){
//            var fr = _.findWhere(coords_start,{id: start_id});
//            return [to.x - fr.x, to.y - fr.y];
//        }else{
//            return undefined;
//        }
//    }));
//}

function calc_all_vectors(coords, conns, paths, max_frame, step) {
    var r = {};
    _.range(1 + step, max_frame + 1).map(function (frame) {
        r[frame] = calc_vectors(coords, conns, paths, frame, step);
    });
    return r;
}