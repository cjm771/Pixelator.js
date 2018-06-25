
Pixelator.js v0.500
============

*A small pixel painter widget by Chris Malcolm. Originally I made this to facilitate a crowdsourced emoji website I was building. No pixel painter met my needs to I decided to build one myself. See [http://pixelatorjs.chris-malcolm.com](http://pixelatorjs.chris-malcolm.com) for more info*

![example](https://i.imgur.com/Vut5EU2.png)

```js
//create a new instance 400 x 400 with 10 pixel module (10 x 10 grid)
var pxltr =  new Pixelator({
    element: "#myCanvas",
    width: 400,
    height: 400,
    pixelSize: 20,
    includeToolbar: true,
    currentColor: "#ff0000"
})
```
  ** *Menu* **  

 
  - [Adding Library](#Adding_Library) 
  - [Pixelator()](#Pixelator)  *Constructor* 
  - [.el](#.el) 
  - [.ctx](#.ctx) 
  - [.rawData](#.rawData) 
  - [import()](#import) 
  - [clearBoard()](#clearBoard) 
  - [undo()](#undo) 
  - [redo()](#redo) 
  - [getImgUrl()](#getImgUrl) 
 

<a id='Adding_Library' name='Adding_Library'></a>
Adding Library
-----
---

  

Before starting make sure you have included <a target='_blank' href='http://jquery.com'>jQuery </a> and the Pixelator.js library in the head of your script. If using the toolbar options make sure you include spectrum.js as a dependency.

*Example 1: Include Script (html)*
```html
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
 ```

<a id='Pixelator' name='Pixelator'></a>
Pixelator()
-----
---

 *Constructor*   
 
#### Returns: *[Pixelator](#Pixelator) Object* 

```
Pixelator()
```

Constructor for creating a new pixelator object. See options below.

+ **opts** *object* *(optional)* - Init Options  
  + **element** *String*  - Jquery Dom selector that is the canvas ... *e.g: * *'#myCanvas'*
  + **width** *int*  - canvas width, must be explicity called + will change width if different ...  *Default:* **400**
  + **height** *int*  - canvas height, must be explicitly called + will change height if different ...  *Default:* **400**
  + **pixelSize** *int*  - pixel size (module), so total amount of pixels in x direction would be width/pixelSize and in y direction would e height/pixelSize ...  *Default:* **13**
  + **mode** *string*  - To not have  editablility / etc.. once can set this to "display" to just have a display mode essentially. If using this, you'll probably want to check #import. ... *e.g: * *"edit"|"display"* *Default:* **"edit"**
  + **includeToolbar** *boolean*  - To display toolbar or not ...  *Default:* **false**
  + **currentColor** *string*  - Default Color for swatch ...  *Default:* **"#000"**
  + **eventMode** *string*  - Default tool to srart with ... *e.g: * *"fillPixel"|"paintBucket"|"eraser"* *Default:* **"fillPixel"**
  + **gridBGCellColor** *string*  - Checkboard grid cell color. For main bg, you can style the canvas tag. ...  *Default:* **"#e1e1e1"**
  + **onMouseDown** *func*  - callback event for on mouse down. ...  *Default:* **function(eventMode, pixel, pxltr){}**
  + **onMouseUp** *func*  - callback event for on mouse up. ...  *Default:* **function(eventMode, pixel, pxltr){}**
  + **onMouseMove** *func*  - callback event for on mouse up. ...  *Default:* **function(eventMode, pixel, pxltr){}**

**Return --&gt;** *[Pixelator](#Pixelator) Object* - Pixelator instance

*Example 1: Create a pixelator instance (js)*
```js
//create a new instance 400 x 400 with 20 pixel module (10 x 10 grid)
var pxltr =  new Pixelator({
    element: "#myCanvas",
    width: 400,
    height: 400,
    pixelSize: 20
})
 ```

*Example 2: Create a pixelator instance with toolbar and red drawing color (js)*
```js
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
 ```

<a id='.el' name='.el'></a>
.el
-----
---

  

Property to access the DOM Element (Canvas)

<a id='.ctx' name='.ctx'></a>
.ctx
-----
---

  

Property to access the Canvas Context

<a id='.rawData' name='.rawData'></a>
.rawData
-----
---

  

Property to access raw data, which is the textual data store . Save this data to be able to reimport it! It stores the pixel coordinates as the key + color as value.

*Example 1: Example of data (js)*
```js
console.log(pxltr.rawData)
//{60,80: "#000", 80,80: "#000", 100,80: "#000", 120,80: "#000", 120,160: "#000"}
 ```

<a id='import' name='import'></a>
import()
-----
---

  

```
import()
```

Import raw data (drawing in  Object Format). See [.rawData](#.rawData) for exporting raw data

+ **rawData** *object*  - -> JSON style object represeting raw pixel data. See [.rawData](#.rawData) for exporting data.  
+ **inputPixelModule** *int*  - -> pixel module (i.e. pixelSize) of original exported raw data. This will translate to current pixel size.  

<a id='clearBoard' name='clearBoard'></a>
clearBoard()
-----
---

  

```
clearBoard()
```

Import raw data (drawing in  Object Format). See rawData property for what this looks like

+ **preserveData** *boolean* *(optional)* - -> Optional boolean flag to preserve rawData . ...  *Default:* **false** 

<a id='undo' name='undo'></a>
undo()
-----
---

  

```
undo()
```

undo last change to canvas

<a id='redo' name='redo'></a>
redo()
-----
---

  

```
redo()
```

redo last undid change to canvas

<a id='getImgUrl' name='getImgUrl'></a>
getImgUrl()
-----
---

  
 
#### Returns: *string* 

```
getImgUrl()
```

Get image url (as data uri) for downloading or using as src

**Return --&gt;** *string* - - data uri for downloading

*Example 1: export as PNG (js)*
```js
//generate image uri
uri = pxlr.getImgUrl();
//then populate it in a link 
$("a.myDownloadLink").attr("href", uri);
 ```