////
/* jRumble v1.3 - http://jackrugile.com/jrumble - MIT License */
(function(f){f.fn.jrumble=function(g){var a=f.extend({x:2,y:2,rotation:1,speed:15,opacity:false,opacityMin:0.5},g);return this.each(function(){var b=f(this),h=a.x*2,i=a.y*2,k=a.rotation*2,g=a.speed===0?1:a.speed,m=a.opacity,n=a.opacityMin,l,j,o=function(){var e=Math.floor(Math.random()*(h+1))-h/2,a=Math.floor(Math.random()*(i+1))-i/2,c=Math.floor(Math.random()*(k+1))-k/2,d=m?Math.random()+n:1,e=e===0&&h!==0?Math.random()<0.5?1:-1:e,a=a===0&&i!==0?Math.random()<0.5?1:-1:a;b.css("display")==="inline"&&(l=true,b.css("display","inline-block"));b.css({position:"relative",left:e+"px",top:a+"px","-ms-filter":"progid:DXImageTransform.Microsoft.Alpha(Opacity="+d*100+")",filter:"alpha(opacity="+d*100+")","-moz-opacity":d,"-khtml-opacity":d,opacity:d,"-webkit-transform":"rotate("+c+"deg)","-moz-transform":"rotate("+c+"deg)","-ms-transform":"rotate("+c+"deg)","-o-transform":"rotate("+c+"deg)",transform:"rotate("+c+"deg)"})},p={left:0,top:0,"-ms-filter":"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)",filter:"alpha(opacity=100)","-moz-opacity":1,"-khtml-opacity":1,opacity:1,"-webkit-transform":"rotate(0deg)","-moz-transform":"rotate(0deg)","-ms-transform":"rotate(0deg)","-o-transform":"rotate(0deg)",transform:"rotate(0deg)"};b.bind({startRumble:function(a){a.stopPropagation();clearInterval(j);j=setInterval(o,g)},stopRumble:function(a){a.stopPropagation();clearInterval(j);l&&b.css("display","inline");b.css(p)}})})}})(jQuery);
////
//


//var _originalGameSessionCreate = SDK.GameSession.create;
var sesh = SDK.GameSession.getInstance();
var orig_PlayCardFromHandAction = SDK.PlayCardFromHandAction.prototype._execute;

//////////////

for (var i=1; i<3; i++)  {
    var margin = i == 1 ? 150 : 800;
    $('#app-game-player'+i+' .user-details').append($('<div id="z0r"><div class="progress"></div></div>'));
    $('#app-game-player'+i+' #z0r .progress').css({
        width:'200px',
        height:'30px',
        border:'3px solid red',
        'background-color': 'transparent'
    })
    .append(
        $('<div class="filling"></div>').css({
            height:'100%',
            width:'0%',
            'background-color': 'blue'
        })
    );
}

////////////////

var mechazorProgress = sesh.gameSetupData.players.map(function (player) {
    return {
        id: player.playerId,
        progress: 0
    };
});

var updateZ0rProgress = function (id, progress) {
    for (var i=0; i<mechazorProgress.length; i++) {
        if (mechazorProgress[i].id === id) {
            mechazorProgress[i].progress += progress;
            if (mechazorProgress[i].progress > 1) {
                return 0; // mechazor can't be built twice
            }
            var percent = mechazorProgress[i].progress * 100;
            var deviation = mechazorProgress[i].progress * 10;
            var playerNumber = i+1;

            $('#app-game-player'+playerNumber+' #z0r .progress')
                .jrumble({ x: deviation, y: deviation })
                .trigger('startRumble')
                .find('.filling')
                .animate({ width: percent+"%"});

            console.log('AlERT:  z0r pprogress for player '+playerNumber+' equals '+mechazorProgress[i].progress);
            if (mechazorProgress[i].progress === 1) {
                resetMechaz0r(i);
            }
            break;
        }
    }
    return 0;
};

var resetMechaz0r = function (id) {
    mechazorProgress[id].progress = 0;
    console.log('ALERT: reset mechaz0r progress for player ' + id);
    setTimeout(function() {
        //$('#app-game-player'+(id+1)+' #z0r .progress .filling').css({ width: "0%" });
        $('#app-game-player'+(id+1)+' #z0r .progress').trigger('stopRumble').hide();
    }, 3000);
    return 0;
};

var _origModAction = SDK.ApplyModifierAction.prototype._execute;
SDK.ApplyModifierAction.prototype._execute = function () {
    var args = arguments;

    console.log(this);
    var ownerId = this.ownerId;
    var modifier = this.modifierContextObject;

    if (modifier.type == "PlayerModifierMechazorBuildProgress") {
        updateZ0rProgress(ownerId, modifier.progressContribution);
    }

    return _origModAction.apply(this, args);
};
