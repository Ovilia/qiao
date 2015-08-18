(function() {

  var gb = {
    soap: {
      width: 500,
      height: 290
    },
    zoom: {
      size: 300,
      img: null
    },
    mouse: {
      isDown: false
    }
  };

  init();



  function init() {

    loadResource();

    initStage();

  }



  function initStage() {

    var ratio = window.innerWidth / gb.soap.width;

    Stage(function(stage, display) {

      // init zoom canvas size
      var canvases = document.getElementsByTagName('canvas');
      var zoomCanvas = canvases[1];
      zoomCanvas.width = gb.zoom.size * window.devicePixelRatio;
      zoomCanvas.height = zoomCanvas.width;
      var zoomCtx = zoomCanvas.getContext('2d');

      // canvas for main game scene
      var mainCanvas = canvases[0];
      var mainCtx = mainCanvas.getContext('2d');

      // event handling
      stage.viewbox(window.innerWidth, window.innerHeight).on(
        Stage.Mouse.START, function(point) {
          gb.mouse.isDown = true;
          zoomCanvas.style.display = 'block';
          // copy to zoom canvas
          updateZoom(point.x, point.y);
        }
      ).on(
        Stage.Mouse.MOVE, function(point) {
          if (gb.mouse.isDown) {
            // copy to zoom canvas
            updateZoom(point.x, point.y);
          }
        }
      ).on(
        Stage.Mouse.END, function(point) {
          gb.mouse.isDown = false;
          zoomCanvas.style.display = 'none';
        }
      );

      // copy pixels to zoom canvas
      function updateZoom(x, y) {
        var width = zoomCanvas.width;
        var height = zoomCanvas.height;
        var left = x * 0.8;
        var top = y * 0.8;

        var load = function() {
          // write to zoom canvas
          zoomCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
          zoomCtx.drawImage(gb.zoom.img, left, top, width, height,
              0, 0, width, height);
        };
        if (gb.zoom.img === null) {
          var url = document.getElementsByTagName('canvas')[0].toDataURL();
          // load image
          gb.zoom.img = new Image();
          gb.zoom.img.onload = load;
          gb.zoom.img.src = url;
        } else {
          load();
        }
      }

      // soap
      var soap = Stage.image('soap').appendTo(stage);
      soap.pin({
        alignX: -0.5,
        alignY: -0.5,
        scale: ratio * 0.09
      });
      // soap tween
      var soapSpeed = 500;
      soap.tween(soapSpeed).ease('bounce').pin({
        alignX: 0.5,
        alignY: 0.9,
        scale: ratio * 0.9,
        rotation: Math.PI * 2
      });

      // needle
      for (var i = 0; i < 7; ++i) {
        var rotation = Math.PI / 10 * Math.random() - Math.PI / 20;
        var ty = 0.65  + Math.random() * 0.1;
        var tx = 0.2 + i / 10;
        var dy = 2;
        var dx = dy * Math.tan(rotation);

        var needle = Stage.image('needle').appendTo(stage).pin({
          alignX: tx + dx,
          alignY: ty - dy,
          scale: ratio * 0.6,
          rotation: rotation
        });
        // needle tween
        var needleSpeed = 200;
        needle.tween().delay(soapSpeed + needleSpeed * i).ease('in').pin({
          alignX: tx,
          alignY: ty
        });
      }
    });

  }



  function loadResource() {

    Stage({
      image: 'img/soap-500.png',
      textures: {
        soap: {
          x: 0,
          y: 0,
          width: gb.soap.width,
          height: gb.soap.height
        }
      }
    });

    Stage({
      image: 'img/needle.png',
      textures: {
        needle: {
          x: 0,
          y: 0,
          width: 33,
          height: 500
        }
      }
    });

  }

})();
