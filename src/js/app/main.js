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
      holes: [],
      curId: -1,
      cnt: 7
    },
    particle: {
      proton: null,
      emitters: [],
      renderer: null,
      colorId: 0,
      colorBehaviours: []
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
      for (var i = 0; i < gb.needles.cnt; ++i) {
        var rotation = Math.PI / 10 * Math.random() - Math.PI / 20;
        var ty = 0.6  + Math.random() * 0.1;
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

    // update color of emitters
    ++gb.particle.colorId;
    for (var i = 0, len = gb.particle.emitters.length; i < len; ++i) {
      var color1 = Color.parse("hsl(" + (gb.particle.colorId + Math.floor(
          360 / gb.needles.cnt * i)) % 360 + ", 100%, 50%)").hexTriplet();
      var color2 = Color.parse("hsl(" + (gb.particle.colorId + Math.floor(
          360 / gb.needles.cnt * (i + 1))) % 360 + ", 100%, 50%)").hexTriplet();
      gb.particle.colorBehaviours[i].reset(color1, color2);
    }

    gb.particle.proton.update();

    requestAnimationFrame(tick);

  }

  function addEmitter() {

    var emitter = new Proton.Emitter();
    gb.particle.emitters.push(emitter);

    // emit 10 to 20 particles per 0.1 second
    emitter.rate = new Proton.Rate(Proton.getSpan(10, 20), 0.1);

    emitter.addInitialize(new Proton.Radius(1, 12));
    emitter.addInitialize(new Proton.Life(0.1, 0.5));
    emitter.addInitialize(new Proton.Velocity(3, Proton.getSpan(90, 90), 'polar'));
    emitter.addInitialize(new Proton.Radius(5));

    var color1 = Color.parse("hsl(" + 360 / gb.needles.cnt * gb.needles.curId
        + ", 100%, 50%)").hexTriplet();
    var color2 = Color.parse("hsl(" + 360 / gb.needles.cnt * (gb.needles.curId + 1)
        + ", 100%, 50%)").hexTriplet();
    var colorBehaviour = new Proton.Color(color1, color2);
    gb.particle.colorBehaviours.push(colorBehaviour);
    emitter.addBehaviour(colorBehaviour);

    emitter.addBehaviour(new Proton.Alpha(1, 0));
    emitter.addBehaviour(new Proton.Scale(1, 0.5));

    // first emitter, moving and rotating with touch, set in eventHandler
    // others will emit to last needle
    if (gb.needles.curId >= 0) {
      var last = getLastNeedlePosition();
      var cur = gb.needles.holes[gb.needles.curId];
      // set position of thread
      emitter.p.x = cur.x;
      emitter.p.y = cur.y;
      // set length of thread
      var distance = getDistance(last, cur);
      gb.particle.emitters[0].addInitialize(new Proton.Life(
          0.008 * distance, 0.02 * distance));
      // set rotation of thread
      var angle = 90 - getAngle(last, cur);
      emitter.addInitialize(new Proton.Velocity(3,
          Proton.getSpan(angle - 20, angle + 20), 'polar'));

      emitter.emit();
    }

    gb.particle.proton.addEmitter(emitter);

  }

  function getLastNeedlePosition() {
    if (gb.needles.curId > 0) {
      return gb.needles.holes[gb.needles.curId - 1];
    } else {
      // first needle, use left side
      return {
        x: 0,
        y: window.innerHeight * 3 / 4
      };
    }
  }

  function getCurNeedlePosition() {
    if (gb.needles.curId >= 0) {
      return gb.needles.holes[gb.needles.curId];
    } else {
      // first needle, use left side
      return {
        x: 0,
        y: window.innerHeight * 3 / 4
      };
    }
  }

  function getDistance(last, cur) {
    return Math.sqrt((last.x - cur.x) * (last.x - cur.x)
        + (last.y - cur.y) * (last.y - cur.y));
  }

  function getAngle(last, cur) {
    if (last.x === cur.x) {
      return (cur.y - last.y >= 0) ? 0 : 180;
    }
    var radian = Math.atan(-(cur.y - last.y) / (cur.x - last.x));
    if (cur.x - last.x < 0) {
      radian += Math.PI;
    }
    return radian / Math.PI * 180 + 180;
  }



  function win() {
    console.log('win');
  }



  // event handling
  document.addEventListener('touchstart', function(e) {

    gb.mouse.isDown = true;

    gb.canvas.zoom.style.display = 'block';
    document.getElementById('touch-position').style.display = 'block';

    // copy to zoom canvas
    updateZoom(e.touches[0].clientX, e.touches[0].clientY);

    gb.particle.emitters[0].emit();

  });

  document.addEventListener('touchend', function() {

    gb.mouse.isDown = false;

    gb.canvas.zoom.style.display = 'none';
    document.getElementById('touch-position').style.display = 'none';

    gb.particle.emitters[0].stopEmit();

  });

  document.addEventListener('touchmove', function(e) {

    if (gb.mouse.isDown) {
      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY;

      // check if enters hole of the next needle
      var tolerance = 10;
      var hole = gb.needles.holes[gb.needles.curId + 1];
      if (hole && Math.abs(hole.x - x) < tolerance
          && Math.abs(hole.y - y) < tolerance) {
        // bingo
        ++gb.needles.curId;
        addEmitter();

        if (gb.needles.curId === gb.needles.cnt - 1) {
          // last needle! win!!!
          win();
        }
      }

      // copy to zoom canvas
      updateZoom(x, y);

      // update the first emitter with touch position
      var emitter = gb.particle.emitters[0];
      emitter.p.x = x;
      emitter.p.y = y;
      var last = getCurNeedlePosition();
      var cur = {x: x, y: y};
      // set length of thread
      var distance = getDistance(last, cur);
      gb.particle.emitters[0].addInitialize(new Proton.Life(
          0.005 * distance, 0.01 * distance));
      // set rotation of thread
      var angle = 90 - getAngle(last, cur);
      emitter.addInitialize(new Proton.Velocity(3,
          Proton.getSpan(angle - 2, angle + 2), 'polar'));

    }

    e.preventDefault();

  });

})();
