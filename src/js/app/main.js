(function() {

  var gb = {
    soap: {
      width: 500,
      height: 290
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

      // stage
      stage.viewbox(window.innerWidth, window.innerHeight).on(
        // event handling
        Stage.Mouse.START, function(point) {
          // copy to zoom canvas
          var mainCtx = getCtx(0);
          // read pixels near touch position
          var width = 300;
          var height = width;
          var left = point.x - width / 2;
          var top = point.y - height / 2;
          // TODO: why all zero here?!!
          var pixels = mainCtx.getImageData(left, top, width, height);

          // write to zoom canvas
          var zoomCtx = getCtx(1);
          var zoomRatio = 2;
          zoomCtx.putImageData(pixels, 0, 0);
          // zoomCtx.setTransform(zoomRatio, 0, 0, zoomRatio, 0, 0);
        }
      );

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



  function getCtx(id) {
    var canvas = document.getElementsByTagName('canvas')[id];
    return canvas.getContext('2d');
  }

})();
