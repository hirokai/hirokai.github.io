function norm(v){
    var x = v[0];
    var y = v[1];
    return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
}

function angle(v){
    return Math.atan(v[1]/ v[0]) + (v[0] > 0 ? 0 : Math.PI);
}

function calc_vectors (coords,coords_prev,conns){
    return conns.map(function(conn){
        var fr = _.findWhere(coords_prev, {id: conn.from});
        var to = _.findWhere(coords, {id: conn.to});
        return [to.x-fr.x,to.y-fr.y];
    });
}
