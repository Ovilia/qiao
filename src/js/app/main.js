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
    },
    needles: {
      holes: []
    },
    particle: {
      proton: null,
      emitters: [],
      renderer: null
    },
    canvas: {
      zoom: null,
      main: null,
      particle: null
    }
  };

  init();



  function init() {

    loadResource();

    initStage();

    initParticle();

  }



  function initStage() {

    var ratio = window.innerWidth / gb.soap.width;

    Stage(function(stage, display) {

      // init zoom canvas size
      gb.canvas.zoom = document.getElementsByTagName('canvas')[1];
      var zoomCanvas = gb.canvas.zoom;
      zoomCanvas.width = gb.zoom.size * window.devicePixelRatio;
      zoomCanvas.height = zoomCanvas.width;
      var zoomCtx = zoomCanvas.getContext('2d');

      // canvas for main game scene
      gb.canvas.main = document.getElementsByTagName('canvas')[0];
      var mainCtx = gb.canvas.main.getContext('2d');

      // event handling
      stage.viewbox(window.innerWidth, window.innerHeight);

      // save main canvas to image for zoom canvas to use later
      function captureCanvas() {

        // use setTimeout to make sure tween has ended
        setTimeout(function() {

          var url = document.getElementsByTagName('canvas')[0].toDataURL();
          // load image
          gb.zoom.img = new Image();
          gb.zoom.img.src = url;

        }, 500);

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

        var h = 120;
        gb.needles.holes.push({
          x: tx * window.innerWidth + h * Math.tan(rotation),
          y: ty * window.innerHeight - h
        });

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
        }).done(captureCanvas);
      }

      // add emitter
      addEmitter();

    });

  }

  // copy pixels to zoom canvas
  function updateZoom(x, y) {

    var zoom = gb.canvas.zoom;
    var zoomCtx = zoom.getContext('2d');

    var width = zoom.width;
    var height = zoom.height;
    var left = (x - zoom.width / 4) * 2;
    var top = (y - zoom.height / 4) * 2;

    if (gb.zoom.img) {
      // write to zoom canvas
      zoomCtx.clearRect(0, 0, gb.canvas.main.width, gb.canvas.main.height);
      zoomCtx.drawImage(gb.zoom.img, left, top, width, height,
          0, 0, width, height);
    }

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



  function initParticle() {

    gb.canvas.particle = document.getElementById('particle');
    var canvas = gb.canvas.particle;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gb.particle.proton = new Proton();

    gb.particle.renderer = new Proton.Renderer('canvas', gb.particle.proton, canvas);
    gb.particle.renderer.start();

    tick();

  }

  function tick() {

    gb.particle.proton.update();

    // if (gb.needles.holes.length > 0) {
    //   gb.particle.emitters[0].p.x = gb.needles.holes[0].x;
    //   gb.particle.emitters[0].p.y = gb.needles.holes[0].y;
    // }

    requestAnimationFrame(tick);

  }

  function addEmitter(distance) {

    var emitter = new Proton.Emitter();
    gb.particle.emitters.push(emitter);

    // emit 10 to 20 particles per 0.1 second
    emitter.rate = new Proton.Rate(Proton.getSpan(10, 20), 0.01);

    emitter.addInitialize(new Proton.Radius(1, 5));
    emitter.addInitialize(new Proton.Life(0.1, 0.2));
    emitter.addInitialize(new Proton.Velocity(3, Proton.getSpan(90, 90), 'polar'));

    emitter.addBehaviour(new Proton.Color('ff0000', 'random'));
    emitter.addBehaviour(new Proton.Alpha(1, 0));

    emitter.p.x = 0;
    emitter.p.y = 0;
    emitter.emit();

    gb.particle.proton.addEmitter(emitter);

  }



  // event handling
  document.addEventListener('touchstart', function(e) {

    gb.mouse.isDown = true;

    gb.canvas.zoom.style.display = 'block';
    document.getElementById('touch-position').style.display = 'block';

    // copy to zoom canvas
    updateZoom(e.touches[0].clientX, e.touches[0].clientY);

  });

  document.addEventListener('touchend', function() {

    gb.mouse.isDown = false;

    gb.canvas.zoom.style.display = 'none';
    document.getElementById('touch-position').style.display = 'none';

  });

  document.addEventListener('touchmove', function(e) {

    if (gb.mouse.isDown) {
      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY;

      // copy to zoom canvas
      updateZoom(x, y);

      gb.particle.emitters[0].p.x = x;
      gb.particle.emitters[0].p.y = y;

      getZoomPosition(x, y);
    }

    e.preventDefault();

  });



  // main canvas position to zoom position in main canvas
  function getZoomPosition(x, y) {

    var width = zoom.width;
    var height = zoom.height;
    var left = x - gb.zoom.size / 2;
    var top = y - gb.zoom.size / 2;

  }

})();
