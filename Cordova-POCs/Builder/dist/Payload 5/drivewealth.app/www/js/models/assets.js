define([
    'backbone'
], function (Backbone) {

    return Backbone.Model.extend({
        defaults: {
            chaikinGauge: '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" viewBox="0 0 0 0"> <defs> <symbol id="gauge-r-o" viewBox="0 0 100 56"> <path id="gauge-r-o" class="pgrBearish" d="M100,50H84c0,0-3-34-34-34S16,50,16,50H0C0,22.4,22.4,0,50,0S100,22.4,100,50z"></path> </symbol> <symbol id="gauge-nn-o" viewBox="0 0 100 56"> <path id="pgrNeutral" class="pgrNeutral" d="M100,50H84c0,0-3-34-34-34S16,50,16,50H0C0,22.4,22.4,0,50,0S100,22.4,100,50z"></path> <circle id="redBadge" class="redBadge" cx="19.5" cy="23" r="18"></circle> <rect id="badgeMinus" x="8.1" y="20.2" class="badgeMinus" width="23.8" height="5.6"></rect> </symbol> <symbol id="gauge-n-o" viewBox="0 0 100 56"> <path id="gauge-n-o" class="pgrNeutral" d="M100,50H84c0,0-3-34-34-34S16,50,16,50H0C0,22.4,22.4,0,50,0S100,22.4,100,50z"></path> </symbol> <symbol id="gauge-np-o" viewBox="0 0 100 56"> <path id="pgrNeutral" class="pgrNeutral" d="M100,50H84c0,0-3-34-34-34S16,50,16,50H0C0,22.4,22.4,0,50,0S100,22.4,100,50z"></path> <circle id="greenBadge" class="greenBadge" cx="80.5" cy="23" r="18"></circle> <rect id="badgePlus" x="77.7" y="11.1" class="badgePlus" width="5.6" height="23.8"></rect> <rect id="badgePlus" x="68.6" y="20.2" class="badgePlus" width="23.8" height="5.6"></rect> </symbol> <symbol id="gauge-g-o" viewBox="0 0 100 53"> <path id="gauge-g-o" class="pgrBullish" d="M100,50H84c0,0-3-34-34-34S16,50,16,50H0C0,22.4,22.4,0,50,0S100,22.4,100,50z"></path> </symbol> <symbol id="gauge-none-o" viewBox="0 0 100 56"> <path id="gauge-none-o" class="pgrNone" d="M100,50H84c0,0-3-34-34-34S16,50,16,50H0C0,22.4,22.4,0,50,0S100,22.4,100,50z"></path> </symbol> </defs> </svg>'
        }
    });
});