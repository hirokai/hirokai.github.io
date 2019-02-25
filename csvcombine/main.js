function readCSV(txt, skip_rows, has_header, column_indices) {
    var obj = Papa.parse(txt);
    var dat2 = obj.data;
    if (skip_rows) {
        dat = dat2.slice(has_header ? skip_rows + 1 : skip_rows);
    }
    if (column_indices) {
        dat = _.map(dat, function (row) {
            var d = [];
            _.map(column_indices, function (i) {
                var v = row[i];
                if (v) {
                    d.push(v.trim());
                }
            });
            return d;
        })
    }
    return {data: dat, header: has_header ? extractIndices(dat2[skip_rows || 0], column_indices) : null};
}

function extractIndices(arr, ns) {
    var rs = [];
    _.map(ns, function (n) {
        rs.push(arr[n]);
    });

    return rs;
}

function basename(name) {
    var ns = name.split('.');
    return ns.slice(0, ns.length - 1).join('.');
}

function mkHeader(filenames, column_names) {
    console.log(filenames);
    console.log(column_names);
    return _.flatten(_.map(filenames, function (f) {
        return _.map(column_names, function (c) {
            return f + "_" + c;
        });
    }));
};
function formatCSV(dat, header) {
    //var dat2 = dat.slice(has_header ? 1 : 0);
    //console.log(dat2);
    console.log(header, dat);
    return Papa.unparse([header].concat(dat));
}

var allData = null;
var downloadBlob = null;
var filenames = [];
var header_columns = [];

function concatCSV(a, b) {
    if (!allData || allData.length == 0) {
        return b;
    } else if (a.length != b.length) {
        return a;
    }
    return _.map(_.zip(a, b), function (vs) {
        return vs[0].concat(vs[1]);
    });
}

// Code from this site:
// http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-selecting-files-dnd
function handleFileSelect(evt) {
    evt.target.className = '';
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                var name = basename(theFile.name).replace(/\s/g, ' ');
                filenames.push(name);
                var has_header = $('#has_header').prop('checked');
                var column_indices = _.map($('#used_columns').val().split(","), function (s) {
                    return parseInt(s) - 1;
                });
                console.log(column_indices);
                var skip_rows = parseInt($('#skip_rows').val());
                var dat = readCSV(e.target.result, skip_rows, has_header, column_indices);
                console.log(dat.header);
                var hc = _.map((has_header ? dat.header : _.map(column_indices, function (i) {
                    return '' + (i + 1);
                })), function (c) {
                    console.log(c);
                    return name + "_" + c;
                });
                header_columns = header_columns.concat(hc);
                allData = concatCSV(allData, dat.data);
                var content = formatCSV(allData, header_columns);
                console.log(header_columns);
                downloadBlob = new Blob([content]);
                $('#download').attr({
                    href: URL.createObjectURL(downloadBlob),
                    download: 'Combined CSV.csv'
                });
                $('#result').html(content);
                $('#info').html('' + filenames.length + ' files loaded.');
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsText(f);
    }
    $('#list').html('<ul>' + output.join('') + '</ul>');
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    evt.target.className = 'hovered';
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');

dropZone.addEventListener('dragover', handleDragOver, false);

dropZone.addEventListener('dragleave', function (evt) {
    evt.target.className = '';
}, false);

dropZone.addEventListener('drop', handleFileSelect, false);

$('#clear').on(function () {
    $('#result').html('');
    allData = null;
    filenames = [];
    header_columns = [];
    $('#info').html('' + filenames.length + ' files loaded.');
    downloadBlob = null;
});

$(function () {
    $('#skip_rows').on('change', function (ev) {
        localStorage.setItem('csvcombine:skip_rows', $(ev.target).val());
    });

    $('#used_columns').on('change', function (ev) {
        localStorage.setItem('csvcombine:used_columns', $(ev.target).val());
    });
    $('#skip_rows').val(localStorage['csvcombine:skip_rows'] || '14');
    $('#used_columns').val(localStorage['csvcombine:used_columns'] || '1,2');
});
