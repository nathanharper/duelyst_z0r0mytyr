var sesh = SDK.GameSession.getInstance();
var orig_PlayCardFromHandAction = SDK.PlayCardFromHandAction.prototype._execute;

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
            console.log('AlERT:  z0r pprogress for player '+i+' equals '+mechazorProgress[i].progress);
            if (mechazorProgress[i].progress === 1) {
                resetMechaz0r(i);
                break;
            }
        }
    }
    return 0;
};

var resetMechaz0r = function (id) {
    mechazorProgress[id].progress = 0;
    console.log('ALERT: reset mechaz0r progress for player ' + id);
    return 0;
};

SDK.PlayCardFromHandAction.prototype._execute = function() {
    var args = arguments;
    var z0r = "ModifierOpeningGambitApplyMechazorPlayerModifiers";
    var progressType = "PlayerModifierMechazorBuildProgress";
    var ownerId = this.ownerId;

    var modifiers;
    try{
        modifiers = this.cardDataOrIndex.appliedModifiersContextObjects;
    } catch(e){}

    try {
        if (modifiers) {
            for (var i=0; i<modifiers.length; i++) {
                var mod = modifiers[i];
                if (mod.type === z0r) {
                    for (var j=0; j<mod.modifiersContextObjects.length; j++) {
                        var innerMod = mod.modifiersContextObjects[j];
                        if (innerMod.type === progressType) {
                            updateZ0rProgress(ownerId, innerMod.progressContribution);
                            break;
                        }
                    }
                    break;
                }
            }
        }
    } catch (e) {
        console.log('ERROR: ' + e.message);
    }

    return orig_PlayCardFromHandAction.apply(this, args);
};
