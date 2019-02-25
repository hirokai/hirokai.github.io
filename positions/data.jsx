function rotate(v, angle) {
    var x = v[0], y = v[1];
    return [Math.cos(angle) * x - Math.sin(angle) * y, Math.sin(angle) * x + Math.cos(angle) * y];
}

function mkData(origin, rows, cols, interval, angle, mode) {
    mode = mode || 'rotating';
    if (mode == 'zigzag') {
        return mkDataZigzag(origin, rows, cols, interval, angle);
    } else if (mode == 'rotating') {
        return mkDataRotating(origin, rows, cols, interval, angle);
    }
}

function mkDataZigzag(origin, row, col, interval, angle) {
    angle = (angle || 0) * Math.PI / 180;
    var count = 0;
    return _.flatten(_.map(_.range(col), function (i) {
        return _.map(_.range(row), function (j) {
            count += 1;
            var v = [i * interval, i % 2 == 0 ? j * interval : (row - j - 1) * interval];
            var v2 = rotate([v[0], v[1]], angle);
            return {x: v2[0] + origin[0], y: v2[1] + origin[1], i: count};
        });
    }));
}

function mkDataRotating(origin, row, col, interval, angle) {
    angle = (angle || 0) * Math.PI / 180;
    var count = 1;
    var res = [];
    var rep = _.flatten([[2], _.times(col - 2, () => 3), [2], _.times(col - 2, () => 1)]);
    var start = _.times(col - 1, () => 1);
    var end = _.flatten([[2], _.times(col - 1, ()=>3), _.times(row - 2, ()=>4)]);
    var moves = _.flatten([start, _.times(row / 2 - 1, () => rep), end]);

    var i = 0, j = 0;
    var v = [i * interval, j * interval];
    var v2 = rotate([v[0], v[1]], angle);
    res.push({x: v2[0] + origin[0], y: v2[1] + origin[1], i: count});
    _.map(moves, function (m) {
        count += 1;
        if (m == 1) i += 1;
        if (m == 2) j += 1;
        if (m == 3) i -= 1;
        if (m == 4) j -= 1;
        var v = [i * interval, j * interval];
        var v2 = rotate([v[0], v[1]], angle);
        res.push({x: v2[0] + origin[0], y: v2[1] + origin[1], i: count});
    });
    return res;
}
