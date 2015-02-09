var Content = React.createClass({
    getInitialState() {
        const ori = [0, 0];
        return {
            gridMode: 'rotating',
            origin: ori, interval: 500, angle: 20, numRows: 6, numCols: 8,
            bgImageOffset: [0, 0],
            bgImageAngle: 20,
            imgOrigin: [0, 0],
            fontSize: 10,
            positions: mkData(ori, 6, 8, 500, 20, 'rotating')
        };
    },
    mkDataCurrent() {
        return mkData(this.state.origin, this.state.numRows, this.state.numCols, this.state.interval, this.state.angle);
    },
    updateDrawWithData() {
        updateDraw(this.mkDataCurrent(), this.state.bgImages, this.state.config, this.state.imgOrigin);
    },
    render() {
        var poss = _.map(this.mkDataCurrent(), function (d, i) {
            return {
                GRID_COL: 0, GRID_ROW: 0, LABEL: "Pos" + (i + 1),
                DEFAULT_Z_STAGE: "ASI ZStage", DEFAULT_XY_STAGE: "ASI XYStage",
                PROPERTIES: {},
                DEVICES: [{
                    DEVICE: "ASI XYStage",
                    AXES: 2,
                    Y: Math.round(d.y * 10) / 10,
                    X: Math.round(d.x * 10) / 10,
                    Z: 0
                }]
            };
        });
        var obj = {VERSION: 3, ID: "Micro-Manager XY-position list", POSITIONS: poss};
        var jsondata = "data:application/json," + encodeURI(JSON.stringify(obj, undefined, 2));
        return <div>
            <h1>Positions</h1>
            <label htmlFor='x'>X</label>
            <input id='x' type='text' defaultValue={this.state.origin[0]} onBlur={this.changeOrigin}/>
            <label htmlFor='y'>Y</label>
            <input id='y' type='text' defaultValue={this.state.origin[1]} onBlur={this.changeOrigin}/>
            <br/>
            <label htmlFor='cols'>Columns</label>
            <input id='cols' type='text' defaultValue={this.state.numCols} onBlur={this.changeNumCols}/>
            <label htmlFor='rows'>Rows</label>
            <input id='rows' type='text' defaultValue={this.state.numRows} onBlur={this.changeNumRows}/>
            <label htmlFor='interval'>Interval</label>
            <input id='interval' type='text' defaultValue={this.state.interval} onBlur={this.changeInterval}/>
            <label htmlFor='angle'>Angle</label>
            <input id='angle' type='text' defaultValue={this.state.angle} onBlur={this.changeAngle}/>
            <br/>
            <label htmlFor='imgx'>Image X</label>
            <input id='imgx' type='text' defaultValue={this.state.imgOrigin[0]} onBlur={this.changeImgOrigin}/>
            <label htmlFor='imgy'>Image Y</label>
            <input id='imgy' type='text' defaultValue={this.state.imgOrigin[1]} onBlur={this.changeImgOrigin}/>
            <label htmlFor='imgangle'>Image Angle</label>
            <input id='imgangle' type='text' defaultValue={this.state.bgImageAngle} onBlur={this.changeImgAngle}/>
            <br/>
            <a download={'' + (this.state.numRows * this.state.numCols) + ' positions.pos'} href={jsondata}>Download .pos file</a>
            <br/>
            <SvgPanel positions={this.state.positions} scale={this.state.scale} translate={this.state.translate}
                bgImage='testpositions.png' bgImageAngle={this.state.bgImageAngle}
                bgImageOffset={this.state.bgImageOffset}
                fontSize={this.state.fontSize}
                onPosChange={this.onPosChange}
                onAngleChange={this.onAngleChange}
                onImgOffsetChange={this.onImgOffsetChange}
                onImgAngleChange={this.onImgAngleChange}
            />
        </div>;
    },
    onImgAngleChange(delta){
        const v = Math.round((this.state.bgImageAngle + delta)*10)/10;
        this.setState({bgImageAngle: v});
        document.getElementById('imgangle').value = v;
    },
    onImgOffsetChange(delta){
        var x = this.state.bgImageOffset[0];
        var y = this.state.bgImageOffset[1];
        x += delta.x;
        y += delta.y;
        this.setState({bgImageOffset: [x,y]});
        document.getElementById('imgx').value = Math.round(x*10)/10;
        document.getElementById('imgy').value = Math.round(y*10)/10;
    },
    onAngleChange(delta){
        const v = Math.round((this.state.angle + delta)*10)/10;
        this.setState({angle: v, positions: this.mkDataCurrent()});
        document.getElementById('angle').value = v;
    },
    onPosChange(delta) {
        var x = this.state.origin[0];
        var y = this.state.origin[1];
        x += delta.x;
        y += delta.y;
        const poss = mkData([x,y], this.state.numRows, this.state.numCols,
            this.state.interval, this.state.angle, this.state.gridMode);
        this.setState({origin: [x,y], positions: poss});
        document.getElementById('x').value = Math.round(x*10)/10;
        document.getElementById('y').value = Math.round(y*10)/10;
    },
    showError(msg) {
        window.alert(msg)
    },
    changeOrigin(ev) {
        const f = (id) => parseFloat(document.getElementById(id).value);
        const ori = [f('x'), f('y')];
        const poss = mkData(ori, this.state.numRows, this.state.numCols,
            this.state.interval, this.state.angle, this.state.gridMode);
        this.setState({origin: ori, positions: poss});
    },
    changeImgAngle(ev) {
        var f = (id) => parseFloat(document.getElementById(id).value);
        this.setState({bgImageAngle: f('imgangle')});
    },
    changeImgOrigin(ev) {
        var f = (id) => parseFloat(document.getElementById(id).value);
        this.setState({bgImageOffset: [f('imgx'), f('imgy')]});
    },
    changeNumCols(ev) {
        const n = parseInt(ev.nativeEvent.target.value) || 1;
        if (n >= 2) {
            const poss = mkData(this.state.origin, this.state.numRows, n,
                this.state.interval, this.state.angle, this.state.gridMode);
            this.setState({numCols: n, positions: poss});
        } else {
            ev.nativeEvent.target.value = this.state.numCols;
            this.showError('# of columns must be >= 2.');
        }
    },
    changeNumRows(ev) {
        const n = parseInt(ev.nativeEvent.target.value) || 1;
        if (n % 2 == 0) {
            const poss = mkData(this.state.origin, n, this.state.numCols,
                this.state.interval, this.state.angle, this.state.gridMode);
            this.setState({numRows: n, positions: poss});
        } else {
            ev.nativeEvent.target.value = this.state.numRows;
            this.showError('# of rows must be even number.');
        }
    },
    changeInterval(ev) {
        const v = parseFloat(ev.nativeEvent.target.value) || 500;
        const poss = mkData(this.state.origin, this.state.numRows, this.state.numCols,
            v, this.state.angle, this.state.gridMode);
        this.setState({interval: v, positions: poss});
    },
    changeAngle(ev) {
        const v = parseFloat(ev.nativeEvent.target.value) || 0;
        const poss = mkData(this.state.origin, this.state.numRows, this.state.numCols,
            this.state.interval, v, this.state.gridMode);
        this.setState({angle: v, positions: poss});
    }
});

React.render(
    React.createElement(Content),
    document.getElementById('container')
);
