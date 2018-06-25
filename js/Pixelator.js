    
/** Adding_Library

Before starting make sure you have included [jQuery (http://jquery.com)] and the Pixelator.js library in the head of your script. If using the toolbar options make sure you include spectrum.js as a dependency.

@info   
@group Getting_Started

*******************************************
@example [id: Include Script, lang: html]
*******************************************
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Demo</title>

        <!--essentials -->
        <script src="js/jquery.min.js"></script>
        <script src="js/Pixelator.js"></script>

        <!-- dependecies if using toolbar -->
        <link rel="stylesheet" type="text/css" href="css/spectrum.css"> 
        <link rel="stylesheet" type="text/css" href="css/pixelator_toolbar.css"> 
        <script src='js/spectrum.js'></script>

    </head>
    <body>
        <div class='wpr'>
            <canvas id='myCanvas' />
        </div>
    </body>
</html>

*/


/** Pixelator

Constructor for creating a new pixelator object. See options below.

@Constructor
@group Constructor
@param opts {object} [optional] - Init Options
        element {String} [sample: '#myCanvas'] --> Jquery Dom selector that is the canvas
        width {int} [default: 400] --> canvas width, must be explicity called + will change width if different
        height {int} [default: 400]-->  canvas height, must be explicitly called + will change height if different
        pixelSize {int} [default: 13] -->  pixel size (module), so total amount of pixels in x direction would be width/pixelSize and in y direction would e height/pixelSize
        mode {string}  [default: "edit", sample:"edit"|"display"]  -->To not have  editablility / etc.. once can set this to "display" to just have a display mode essentially. If using this, you'll probably want to check #import.
        includeToolbar {boolean}  [default: false]  --> To display toolbar or not
        currentColor {string}  [default: "#000"]  --> Default Color for swatch
        eventMode {string}  [default: "fillPixel", sample:"fillPixel"|"paintBucket"|"eraser"]  --> Default tool to srart with
        gridBGCellColor {string} [default: "#e1e1e1"] --> Checkboard grid cell color. For main bg, you can style the canvas tag.
        onMouseDown {func} [default: function(eventMode\, pixel\, pxltr){}]  --> callback event for on mouse down. 
        onMouseUp {func} [default: function(eventMode\, pixel\, pxltr){}]  --> callback event for on mouse up. 
        onMouseMove {func} [default: function(eventMode\, pixel\, pxltr){}]  --> callback event for on mouse up. 

@returns {#Pixelator Object} Pixelator instance

*********************************************************
@example [id: Create a pixelator instance,  lang: js ]
*********************************************************
//create a new instance 400 x 400 with 20 pixel module (10 x 10 grid)
var pxltr =  new Pixelator({
    element: "#myCanvas",
    width: 400,
    height: 400,
    pixelSize: 20
})

*********************************************************
@example [id: Create a pixelator instance with toolbar and red drawing color,  lang: js ]
*********************************************************
//create a new instance 400 x 400 with 10 pixel module (10 x 10 grid)
var pxltr =  new Pixelator({
    element: "#myCanvas",
    width: 400,
    height: 400,
    pixelSize: 20,
    includeToolbar: true,
    currentColor: "#ff0000"
})

//import a smily face :)
pxltr.import({
"120,160":"#ff0000","120,140":"#ff0000",
"120,120":"#ff0000","120,100":"#ff0000",
"260,160":"#ff0000","260,140":"#ff0000",
"260,120":"#ff0000","260,100":"#ff0000",
"80,240":"#ff0000","80,260":"#ff0000",
"100,260":"#ff0000","100,280":"#ff0000",
"120,300":"#ff0000","140,320":"#ff0000",
"160,320":"#ff0000","180,320":"#ff0000",
"200,320":"#ff0000","220,320":"#ff0000",
"240,320":"#ff0000","260,320":"#ff0000",
"260,300":"#ff0000","280,300":"#ff0000",
"280,280":"#ff0000","300,260":"#ff0000",
"300,240":"#ff0000"}, 20);
*/


var Pixelator = function(opts){
    this.opts = $.extend({
        width: 400,
        height: 400,
        mode: "edit",
        includeToolbar: false,
        element: "",
        pixelSize: 13,
        rawData: {},
        currentColor: "#000",
        eventMode: "fillPixel",
        cursor: "pointer",
        gridBGCellColor: "#e1e1e1",
        strokeWidth: 1,

        onMouseDown: function(mode, pixel, pxltr){ 

        },
        onMouseMove: function(mode, pixel,pxltr){

        },
        onMouseUp: function(mode, pixel, pxltr){

        }

    },

    opts)
     /** .el
        
        Property to access the DOM Element (Canvas)

        @group Properties
        @property
    */
    this.el = $(this.opts.element)[0]

    /** .ctx
        
        Property to access the Canvas Context

        @group Properties
        @property
    */
    this.ctx = this.el.getContext("2d");
    this.wpr = false
    this.isMouseDown = false
    /** .rawData
        
        Property to access raw data, which is the textual data store . Save this data to be able to reimport it! It stores the pixel coordinates as the key + color as value.

        @group Properties
        @property
@example [id: Example of data, lang: js]
console.log(pxltr.rawData)
//{60,80: "#000", 80,80: "#000", 100,80: "#000", 120,80: "#000", 120,160: "#000"}

     */
    this.rawData = {}
    this.history = [{}]
    this.redoHistory =  []
    this.downloadURL = this.el.toDataURL();

    this.init = function(){
        //turn off smoothing
        this.ctx.imageSmoothingEnabled= false
        this.ctx['mozImageSmoothingEnabled'] = false;    /* Firefox */
        this.ctx['oImageSmoothingEnabled'] = false;      /* Opera */
        this.ctx['webkitImageSmoothingEnabled'] = false; /* Safari */
        this.ctx['msImageSmoothingEnabled'] = false;     /* IE */
        //change size
        this.el.width=this.opts.width
        this.el.height=this.opts.height
        $(this.opts.element).css({
            width: this.opts.width,
            height: this.opts.height,
            cursor: this.opts.cursor
        })
        //set default strokeWidth
        this.ctx.lineWidth=this.opts.strokeWidth;
    
        //if this isnt just a raw instantiation
        if (this.opts.mode=="edit"){
            //set events
            var that = this;
            
            this.el.onmousedown = function(e){ 
                    $(".debugConsole").html("event: "+JSON.stringify({
                        clientX: e.clientX,
                        clientY: e.clientY,
                        offsetX: e.offsetX,
                        offsetY: e.offsetY
                    }))
                    that.mouseDown(e);
            }
            this.el.onmouseout =   function(e){ that.mouseUp(e)}
            this.el.onmouseup =   function(e){ that.mouseUp(e)}
            this.el.onmousemove = function(e){ that.mouseMove(e)}

            //mobile
            this.el.addEventListener("touchmove",  function(e){     
                $(".debugConsole").html("event: "+JSON.stringify({
                        clientX: e.clientX,
                        clientY: e.clientY,
                        offsetX: e.offsetX,
                        offsetY: e.offsetY
                    }))
                that.replicateMouseEvent(e, "mousedown")
            })

            this.el.addEventListener("touchmove", function(e){ that.replicateMouseEvent(e, "mousemove")})
            this.el.addEventListener("touchleave" , function(e){ that.replicateMouseEvent(e, "mouseup")})
            this.el.addEventListener("touchend", function(e){ 
                $(".debugConsole").html("event: touchend");
                that.replicateMouseEvent(e, "mouseup")
    
            })
            this.el.addEventListener("touchcancel", function(e){    
             that.replicateMouseEvent(e, "mouseup")})

            // Prevent scrolling when touching the canvas
            document.body.addEventListener("touchstart", function (e) {
              if (e.target == that.el) {
                e.preventDefault();
              }
            }, false);
            document.body.addEventListener("touchend", function (e) {
              if (e.target ==  that.el) {
                e.preventDefault();
              }
            }, false);
            document.body.addEventListener("touchmove", function (e) {
              if (e.target ==  that.el) {
                e.preventDefault();
              }
            }, false);
            //layout grid
            this.layoutGrid()
            //setup wpr
            //wrap canvas
            $(this.el).wrap("<div class='pxltr_wpr'></div>")
            this.wpr = $(this.el).closest(".pxltr_wpr")[0];
            $(this.wpr).width(this.opts.width);
            if (this.opts.includeToolbar===true){
                //setup toolbar
                this.setupToolbar();
            }
        }
    }


    this.replicateMouseEvent = function(e, eventName){
        console.log("eventName:",eventName,e)
          var touch = e.touches[0];
          var mouseEvent = new MouseEvent(eventName, {
            clientX: (eventName=="mouseup") ? 0 : touch.pageX,
            clientY: (eventName=="mouseup") ? 0 : touch.pageY
          });
          this.el.dispatchEvent(mouseEvent);
    }

    this.setupToolbar = function(){
        var that = this
        //change color

        /*
        $("#pixelColor").on("change", function(e,data){
            that.opts.cuçrrentFill = this.value
            console.log("current color changed", that.opts.currentFill)
        })
        */

        
        

        //create toolbar
        var $toolbar = $("<div class='toolbar'>"+
                       "<div class='toolbar_wpr'>"+
                            "Color: <input id='pixelColor' type='color' />"+
                            "<div class='toggler' data-toggler-event='changeMode'>"+
                                "<div class='pxltr_btn active' data-value='fillPixel'>Draw</div><div class='pxltr_btn'  data-value='paintBucket'>Fill</div><div class='pxltr_btn'  data-value='eraser'>Eraser</div>"+
                            "</div>"+
                            "<a href='#' download='pixltr_image.png' class='saveBtn pxltr_btn rightAlign'>Save</a>"+
                            "<div class= 'clearBtn pxltr_btn rightAlign'>Clear</div>"+
                            "<div class= 'undoBtn pxltr_btn rightAlign disabled'>Undo</div>"+
                            "<div class= 'redoBtn pxltr_btn rightAlign disabled'>Redo</div>"+
                            "<div style='clear:both;'></div>"+
                        "</div>"+
                    "</div>");

        $toolbar.width(that.opts.width);
        var $wpr = $(this.wpr);
        $wpr.append($toolbar);

        $("#pixelColor").spectrum({
            showPaletteOnly: true,
            change: function(color){console.log("color change!");that.opts.currentColor =  color.toHexString()}, 
            togglePaletteOnly: true,
            togglePaletteMoreText: 'more',
            togglePaletteLessText: 'less',
            color:  that.opts.currentColor,
            palette: [
                ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
                ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
                ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
                ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
                ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
                ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
                ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
                ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
            ]
        });
        //setup togglers
         $wpr.find(".toggler .pxltr_btn").each(function(){
            $(this).on("click", function(){
                $(this).parent().find(".pxltr_btn").removeClass("active")
                $(that.el).trigger($(this).parent().attr("data-toggler-event"), [
                    {value: $(this).attr("data-value")
                }])
                $(this).addClass("active")
            })
        })

        //listen to canvas change, if so than update save btn
        $(that.el).on("canvasChange", function(e, data){
             $wpr.find(".saveBtn").attr("href",that.downloadURL)
        })

        //listen to mode change
        $(that.el).on("changeMode", function(e,data){
            that.opts.eventMode = data.value
        })
        
        //undo/redo diable checker
        $(that.el).on("historyChange", function(e, data){
            if (that.history.length<=0){
                 $wpr.find(".undoBtn").addClass("disabled")
            }else{
                 $wpr.find(".undoBtn").removeClass("disabled")
            }
            if (that.redoHistory.length<=0){
                 $wpr.find(".redoBtn").addClass("disabled")
            }else{
                 $wpr.find(".redoBtn").removeClass("disabled")
            }
        })

        //undo
         $wpr.find(".undoBtn").on("click", function(e){
            that.undo()
        })
        //undo
          $wpr.find(".redoBtn").on("click", function(e){
            that.redo()
        })
        //clear
         $wpr.find(".clearBtn").on("click", function(e){
            that.clearBoard()
        })
    }
/** import

Import raw data (drawing in  Object Format). See #.rawData for exporting raw data

@group Methods
@param rawData {object} --> JSON style object represeting raw pixel data. See #.rawData for exporting data.
@param inputPixelModule {int} --> pixel module (i.e. pixelSize) of original exported raw data. This will translate to current pixel size.

*/
    this.import = function(rawData, inputPixelModule){
        var coords
        var that = this
        var newData = {}
        $.each(rawData, function(k,v){
            coords = k.split(",").map(function(v2){
                return (Number(v2)/inputPixelModule)*that.opts.pixelSize

            })
            newData[coords.join(",")] = v
        })
        this.rawData = newData
        this.redrawFromRaw()
    }

    this.mouseDown = function(e){
            if (this.opts.eventMode=="fillPixel"){
                this.fillPixel([e.offsetX, e.offsetY])
            }else if (this.opts.eventMode=="paintBucket"){
                this.paintBucket([e.offsetX, e.offsetY])
            }else if (this.opts.eventMode=="eraser"){
                this.eraser([e.offsetX, e.offsetY])
            }
            this.opts.onMouseDown(this.opts.eventMode, [e.offsetX, e.offsetY], this);
            //this.layoutGrid()
            this.isMouseDown = true
    }
    this.mouseMove = function(e){
        if (this.opts.eventMode=="fillPixel"){
            if (this.isMouseDown){
                this.fillPixel([e.offsetX, e.offsetY]);
            }
        }else if (this.opts.eventMode=="eraser"){
            if (this.isMouseDown){
                this.eraser([e.offsetX, e.offsetY]);
            }
        }
        if (this.isMouseDown){
            this.opts.onMouseMove(this.opts.eventMode, [e.offsetX, e.offsetY], this);
        }
        
        
    }
    this.change = function(){
        this.export()
        $(this.el).trigger("canvasChange")
        
    }
/** clearBoard

Clears board of any data!

@group Methods
@param preserveData {boolean} [optional, default:false] --> Optional boolean flag to preserve rawData .

*/
    this.clearBoard = function(preserveData){
        if (!preserveData)
            this.rawData = {}
        this.ctx.clearRect(0, 0, this.el.width, this.el.height);
        //layoutgrid
        if (this.opts.mode=="edit"){
            this.layoutGrid()
        }
    }
    this.isBlankCanvas = function(){
        return $.isEmptyObject(this.rawData)
    }
    this.mouseUp = function(e){
            if (this.isMouseDown){
                //change was made
                $(".debugConsole").html("change found!");
                this.opts.onMouseUp(this.opts.eventMode, [e.offsetX, e.offsetY], this);
                this.redoHistory = [];
                this.change();
                this.saveHistoryState();
            }

            this.isMouseDown = false;
    }
    this.saveHistoryState = function(){
        
        this.history.push($.extend({}, this.rawData))
        $(this.el).trigger("historyChange")

    }
/** undo

undo last change to canvas

@group Methods

*/
    this.undo = function(){
        //this.historyIndex--
        var lastThing = this.history.pop()
        this.redoHistory.push(lastThing)
        this.rawData = $.extend({},this.history[this.history.length-1])
        $(this.el).trigger("historyChange")
        this.redrawFromRaw() 
    }

/** redo

redo last undid change to canvas

@group Methods

*/
    this.redo = function(){
        var lastThing = this.redoHistory.pop()
        this.rawData = $.extend({},lastThing)
        $(this.el).trigger("historyChange")
        this.redrawFromRaw() 
        this.history.push(lastThing)

    }
    this.nearest = function(x,n){
        return  Math.floor(x / n) * n;
    }
    this.getNearestNode = function(xy){
        return [this.nearest(xy[0], this.opts.pixelSize),this.nearest(xy[1], this.opts.pixelSize)]
    }
    this.colorAtNode = function(xy){
        nearestNode = this.getNearestNode(xy)
        return this.rawData[nearestNode.join(",")]
    }
    this.paintBucket = function(xy, color){
        var that = this
        nearestNode = this.getNearestNode(xy)
        if (nearestNode[0]>=0 && nearestNode[0]<this.opts.width &&
            nearestNode[1]>=0 && nearestNode[1]<this.opts.height)
        {
            colorAtNode = this.colorAtNode(nearestNode)
            this.fillPixel(nearestNode, color)
            var top =    [nearestNode[0], nearestNode[1]+this.opts.pixelSize]
            var bottom = [nearestNode[0], nearestNode[1]-this.opts.pixelSize]
            var left =   [nearestNode[0]-this.opts.pixelSize,nearestNode[1]]
            var right =  [nearestNode[0]+this.opts.pixelSize,nearestNode[1]]
            var allPieces = [top, bottom, left, right]
            $.each(allPieces, function(k,v){
                if (that.rawData[v.join(",")]!=colorAtNode){
                    //its filled
                }else{
                    that.paintBucket(v)
                }
            })
        }
    }

    this.eraser = function(xy, color){
        nearestNode = this.getNearestNode(xy)
        delete this.rawData[nearestNode.join(",")] 
        this.redrawFromRaw()
    }

    this.redrawFromRaw = function(){
        //clear but preserve data
        this.clearBoard(true)
        this.drawRawData(this.rawData)
    }

    this.fillPixel = function(xy,color,ignoreFromLog){
        //determine grid 
        ignoreFromLog = ignoreFromLog || false
        nearestNode = this.getNearestNode(xy)

        if (ignoreFromLog==false)
            this.rawData[nearestNode.join(",")] = color || this.opts.currentColor
        this.rect(nearestNode, this.opts.pixelSize, this.opts.pixelSize, color)

    }
    this.rect = function(startPt, width, height,color){
        this.ctx.beginPath();
        this.ctx.rect(startPt[0],startPt[1],this.opts.pixelSize,this.opts.pixelSize);
        this.ctx.closePath();
        if (color!=undefined){
            var origColor = this.ctx.fillStyle;
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.fillStyle =  origColor;
        }else{
            this.ctx.fillStyle =  this.opts.currentColor;
            this.ctx.fill();
        }
    }



    this.export = function(){
        //create new pixelator
        var that = this
        $("#pxltr_tmp").remove()
        $("<canvas id='pxltr_tmp' style:'display:none'></canvas>").appendTo("body")
        //new tmp instance thats raw (no events, no grid, etc)
        var pxltr_tmp = new Pixelator($.extend({},that.opts, {"element": "#pxltr_tmp", "mode": "display"}))
        pxltr_tmp.drawRawData(this.rawData)
        this.downloadURL = pxltr_tmp.el.toDataURL();
        //destroy afterward
        $("#pxltr_tmp").remove()
        delete pxltr_tmp
    }
/** getImgUrl

Get image url (as data uri) for downloading or using as src

@group Methods
@returns {string} - data uri for downloading

*************************************
@example [id: export as PNG, lang: js]
***************************************
//generate image uri
uri = pxlr.getImgUrl();
//then populate it in a link 
$("a.myDownloadLink").attr("href", uri);

*/

    this.getImgUrl = function(){
        this.export()
        return this.downloadURL
    }
    this.drawRawData = function(rawData){
        var that = this
        $.each(rawData, function(k,v){
            coords = k.split(",").map(function(n){return Number(n)})
            that.fillPixel(coords, v)
        })
    }

    this.drawLine = function(from,to,color){
        this.ctx.beginPath();
        this.ctx.moveTo(from[0],from[1])
        this.ctx.lineTo(to[0], to[1]);
        this.ctx.closePath();
        var origColor = this.ctx.strokeStyle
        if (color!=undefined){
            this.ctx.strokeStyle=color;
            this.ctx.stroke()
            this.ctx.strokeStyle=origColor;
        }else{
            this.ctx.stroke()
        }

        
    }
    this.layoutGrid = function(){
        //cell checkerboard
            var rowCount = 0
            var colCount =0
            for (var i=this.opts.width; i>=0; i-=this.opts.pixelSize){
                colCount = 0
                for (var j=this.opts.height; j>=0; j-=this.opts.pixelSize){
                    if (rowCount%2!=colCount%2){
                        this.fillPixel([i, j],this.opts.gridBGCellColor,true)
                    }
                    colCount++
                }
                rowCount++
            }
        
  
    
    }
    //<---end functions
    this.init()
}