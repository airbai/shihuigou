if (typeof exports == 'undefined')
    exports = {};
$(function () {

    (function () {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: "../manifest.json",
            success: function (json) {
                exports.extension = json;
                localStorage["version"] = exports.extension.version;
            }
        });

        exports.storage = new Storage();
        exports.work = new Work(exports.storage);
        exports.work.run();

        exports.site = this.Site;
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            if (changeInfo.status == 'loading') {
                var confKey = Site.url2key(null, tab.url);
                if (confKey) {
                    if (exports.work.checkUrl(confKey, tab.url)) {
                        Site.getPageInfo({
                            tab: tab,
                            success: function (_info) {
                                //更新本url相关的数据信息
                                Site.handle.updateSiteData(tab.url, _info);
                            }
                        });
                        chrome.tabs.getSelected(null, function (tab) {
                            exports.tabid = tabId
                        });
                        console.log(tabId);


                    }
                    chrome.pageAction.show(tabId);
                }
                //设置 
            }

        });
    })();
    (function (a, d, c) {
        var b = d;
        var work = exports.work;
        if (!b) {
            var a = {}
        }
        if (!b.service) {
            b.service = {};
        }
        b.service = {
            add_price: function (f, e, d) {

            },
            add_url: function (f, e, d) {
                exports.work.addUrl(f.confKey, f.url);
                d();
            },
            del_url: function (f, e, d) {
                exports.work.delUrl(f.confKey, f.url);
                d();
            },
            get_url2key: function (f, e, d) {
                var url = f.url;
                var key = exports.site.url2key(null, url);

                d(key);
            },
            get_pageInfo: function (f, e, d) {
                console.log(1111);
                var url = f.url;
                var rank = f.rank;
                var confKey = f.confKey;
                console.log(url);
                exports.site.getPageInfo({
                    url: url,
                    success: function (_info) {
                        //更新本url相关的数据信息
                        _info.rank = rank;
                        console.log(555555);
                        exports.site.handle.updateSiteData(url, _info);
                    }
                }, confKey);
                console.log(11111);
                d();
            },
            get_data: function (f, e, d) {
                d(exports.work.sites);
            },
            get_template: function (f, e, d) {
                b.service.helper.getTemplate(f.page, d)
            },
            get_url: function (f, e, d) {
                b.service.helper.getUrl(f.url, d);
            },
            get_bar: function (f, e, d) {
                var url = chrome.extension.getURL('img/arrow.gif');
                var draftUrl = chrome.extension.getURL('assets/followProduct.htm');
                $.ajax({
                    url: draftUrl,
                    dataType: 'html',
                    success: function (data) {
                        var result = { url: url,
                            tmpl: data
                        };
                        d(result);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR);
                    }
                });
            },
            open_tab: function (f, e, d) {
                b.service.helper.openTab(f, e, d);
            },
            show_popup: function (f, e, d) {
                console.log('tabid' + exports.tabid);
                chrome.pageAction.show(exports.tabid);
            },
            hide_popup: function (f, e, d) {
            }
        };
        b.service.helper = {
            requestHandler: function (h, g, d) {
                var f = h.topic;
                //b.console.debug("request for " + f);
                try {
                    if (f.charAt(0) != "_" && typeof b.service[h.topic] == "function") {
                        b.service[h.topic](h, g, d)
                    } else {
                        //b.console.debug("unknown request " + f)
                    }
                } catch (i) {
                    //b.console.error("REQEUST ERROR:" + i.message + (i.stack ? "\n" + i.stack : ""))
                }
            },
            getTemplate: function (i, j) {
                var draftUrl = chrome.extension.getURL(i);
                $.ajax({
                    url: draftUrl,
                    dataType: 'html',
                    success: function (data) {
                        j(data);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR);
                    }
                });
            },
            getUrl: function (i, j) {
                var url = chrome.extension.getURL(i);
                j(url);
            },
            openTab: function (i, j) {
                var url = chrome.extension.getURL(i.url);
                chrome.tabs.create({ url: url, selected: true });
            }
        };

        chrome.extension.onRequest.addListener(b.service.helper.requestHandler);
    })(window, exports);
});

    
    