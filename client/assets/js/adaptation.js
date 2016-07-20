
  (function (doc, win) {

      var docEl = doc.documentElement,

       // resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',

        recalc = function () {

          var clientWidth = docEl.clientWidth;

          if (!clientWidth) return;
          if(clientWidth<=640){
        	  docEl.style.fontSize = 10 * (clientWidth / 375) + 'px';
          }else{
        	  docEl.style.fontSize = 14+ 'px';
          }

        };


      if (!doc.addEventListener) return;

     // win.addEventListener(resizeEvt, recalc, false);

      doc.addEventListener('DOMContentLoaded', recalc, false);

    })(document, window);
