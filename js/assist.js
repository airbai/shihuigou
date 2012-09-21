if (!exports) {
    var exports = {}
}
(function (e, c, f) {
    var a = c;
    if (!a) {
        var a = {}
    } 
    (function (g, h) {
        if (!g.browser) {
            g.browser = {}
        }
        g.browser.extension = {
            sendRequest: function (j, i) {
                if (typeof i == "undefined") {
                    i = function () { }
                }
                chrome.extension.sendRequest(j, i)
            },
            onRequest: {
                addListener: function (i) {
                    chrome.extension.onRequest.addListener(i)
                },
                removeListener: function (i) {
                    chrome.extension.onRequest.removeListener(i)
                }
            },
            getURL: function (i) {
                return chrome.extension.getURL(i || "")
            }
        }
    })(a);

    var u = c.browser.extension;
    if(!a.Notification){
        a.Notification = function(){};
    }
    a.Notification.prototype = {
        init: function(){
            this.renderFollow();
            this.registerEvents()
        },
        registerEvents: function (){
            var q = this;
            var _t = {url: window.location.protocol + "//" +window.location.host + window.location.pathname};
            var sites;
            var confKey = '360buy.com';
            $("#jingdongAssistBar").live('click', function (r) {
                r.preventDefault();
                var followed2 = $('#jingdongAssistBar').find('img[followed=followed]');
                if(followed2.length > 0)
                {
                    u.sendRequest({
                        topic: "open_tab",
                        url: "options.html"
                    }, function(){});
                }
                else
                {
                    q.addUrl(confKey, _t.url, function(){
                        u.sendRequest({
                            topic: "open_tab",
                            url: "options.html"
                        }, function(){});
                    });
                    q.getPageInfo(confKey, _t.url, function(){                                        
                        console.log(3111);
                        var followedImageUrl = u.getURL('img/followed.png');
                        $('#jingdongAssistBar>a>img').attr('src', followedImageUrl).attr('followed', 'followed').attr('title', '点击管理关注');
                    });

                }//end if
             });
        },
        renderFollow: function(){
            var q = this;
            var _t = {url: window.location.protocol + "//" +window.location.host + window.location.pathname};
            var sites;
            var confKey = '360buy.com';
            
            u.sendRequest({
                            topic: "get_data"
                        },function(s){
                            sites = s;
                            q.getTemplate(function(h)
                            {
                                $('#promotion1').nextUntil('div.clr', 'a[clstag*="jiangjia"]').remove();
                                $('#promotion1').after(h);
                                if (!(confKey && q.checkUrl(sites, confKey, _t.url))) {
                                    u.sendRequest({
                                        topic: "get_bar",
                                        url: "img/arrow.gif"
                                    }, function(data){
                                         var url = data.url;
                                         $('#jingdongAssistBar').find('img').attr('src', url);
                                    });
                                }
                                else{                                                                
                                    var url = u.getURL('img/followed.png');
                                    $('#jingdongAssistBar').find('img').attr('src', url).attr('followed', 'followed').attr('title', '点击管理关注');
                                }
                            });
            });
        },
        getTemplate: function (w) {
                u.sendRequest({
                    topic: "get_template",
                    page: "assets/bar.htm"
                }, w);
        },

        url2key: function (domain, url, w) {
            u.sendRequest({
                topic: 'get_url2key',
                url: url
            }, w);
        },
        getPrices: function(sites, confKey, url){
            if (sites[confKey] && sites[confKey][url])
                return sites[confKey][url].price.slice(0);
            return [];
        },
        getRank: function(sites, confKey, url){
            var rank = 4;
            if (sites[confKey] && sites[confKey][url]) {
                rank = sites[confKey][url].rank;
            }
            return rank;
        },
        checkUrl: function(sites, confKey, url){
            return (sites[confKey] && sites[confKey][url]);
        },
        addUrl: function(confKey, url, callback){
            u.sendRequest({
                        topic: "add_url",
                        confKey: confKey,
                        url: url
                    },callback);
        },
        getPageInfo: function(confKey, url, callback){
            var rank = 4;
                u.sendRequest({
                    topic: "get_pageInfo",
                    confKey: confKey,
                    url: url,
                    rank: rank
                }, callback);
        },
        delUrl: function(confKey, url){
            u.sendRequest({
                        topic: "del_url",
                        confKey: confKey,
                        url: url
                    },function(){
            location.reload(true);
            });
        },
        getStarValue: function (starwrapperId) {
                var ui = $("#" + starwrapperId).data("stars");
                // Read options
                var currValue = ui.options.value; // Get current Value

                return currValue || 4;
            },
        setRank: function(rank, starWraper) {
                $(starWraper).stars('select', rank).stars({
                    captionEl: $('#captionEl')
                });
            },
        showPopup: function(url, w){
                u.sendRequest({
                    topic: "show_popup",
                    url: url
                }, w);
        },
        hidePopup: function(){
                u.sendRequest({
                    topic: "hide_popup"
                }, w);
        }
    };
    var b = new a.Notification();
    b.init();

    if(!a.Follow){
        a.Follow = function(){};
    }

    a.Follow.prototype = {
        init: function(){
            this.renderEnabledSearchEngines();
            this.registerEvents()
        },
        registerEvents: function () {
            
        },
        renderEnabledSearchEngines: function(){
            
        }
    };
})(window, exports);