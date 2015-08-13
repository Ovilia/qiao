(function() {

  init();



  function init() {

    loadResource();
    initStage();

  }



  function initStage() {

    Stage(function(stage, display) {

      // stage
      stage.viewbox(window.innerWidth, window.innerHeight);

      // soap
      var soap = Stage.image('soap').appendTo(stage);
      soap.pin({
        alignX: -0.5,
        alignY: -0.5,
        scaleMode: 'in',
        scaleWidth: window.innerWidth * 0.9,
        scaleHeight: window.innerHeight * 0.4,
      });
      // soap tween
      var soapTween = soap.tween(500);
      soapTween.ease('bounce');
      soapTween.pin({
        alignX: 0.5,
        alignY: 0.9
      });

      // needle
      var needle = Stage.image('needle').appendTo(stage);
    });

  }



  function loadResource() {

    Stage({
      image: 'img/soap-500.png',
      textures: {
        soap: {
          x: 0,
          y: 0,
          width: 500,
          height: 290
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
