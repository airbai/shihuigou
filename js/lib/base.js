/**
 * User: 007
 * Date: 11-12-15
 * Time: 上午10:21
 * To change this template use File | Settings | File Templates.
 */
var Base = (function(){
    function clone(obj){
        try{
            return JSON.parse(JSON.stringify(obj));
        }catch(e){
            return {};
        }
    }

    function objExtend(base, target){
        if (typeof target != 'object')
            target = {};
        var _obj = clone(base);
        for (var k in target){
            _obj[k] = target[k];
        }
        return _obj;
    }

    function showPage(url, callback){
        chrome.tabs.query({
            url: chrome.extension.getURL(url)
        }, function (tabs){
            if (tabs.length == 0){
                chrome.tabs.getSelected(null,function(thisTab){
                    chrome.tabs.create({index:thisTab.index, url:chrome.extension.getURL(url), selected :true}, function(tab){
                        chrome.windows.update(tab.windowId, {
                            'focused': true
                        }, function(){});
                    });

                });
            }else{
                chrome.tabs.update(tabs[0].id, {
                    url: chrome.extension.getURL(url),
                    active: true
                }, function(){
                    chrome.windows.update(tabs[0].windowId, {
                        'focused': true
                    }, function(){});
                });
                
            }
        });
    }

    function getTime(){
        
    }
    function debug(){
        if (arguments.length <= 1)
            return false;
        var args = [];
        for (var k = 1 ; k < arguments.length; k++){
            args.push(arguments[k]);
        }
        if (console){
            try{
                console[arguments[0]].apply(console, args);
            }catch(e){
                console.error('Base.debug', arguments, e);
            }
        }
    }
    function setBadgeText(param){
        chrome.browserAction.setBadgeBackgroundColor({"color":[11,173,46,190]});
        chrome.browserAction.setBadgeText(param);
    }
    return {
        objExtend: objExtend,
        clone: clone,
        showPage: showPage,
        getTime: getTime,
        debug: debug,
        setBadgeText: setBadgeText
    };
})();