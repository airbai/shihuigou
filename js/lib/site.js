/**
 * 
 */
var Site = {
    /*
    * @param {object|string} tab/url
    * @param {string}
    * @description callback {object} {price, date}
    * */
    'getPageInfo': function (param, confKey) {
        console.log(6666666666);
        //param: tab/url
        if (param.tab) {
            // 从已经打开的 tab 分析信息
            var tab = param.tab;
            if (!confKey)
                confKey = Site.url2key(null, param.tab.url);
            if (!confKey) {
                return null;
            }
            chrome.tabs.executeScript(tab.id, {
                'file': 'js/lib/jquery-1.7.1.min.js'
            }, function () {
                chrome.tabs.executeScript(tab.id, {
                    file: 'js/lib/jquery.tmpl.min.js'
                },
                    function () {
                        chrome.tabs.executeScript(tab.id, {
                            'code': Site.config[confKey].finderStr //回调是 msgType == 'pageInfo' 的消息
                        }, function () {
                            chrome.tabs.sendRequest(tab.id, { msgType: 'getPageInfo' }, function (response) {
                                if (typeof param.success == 'function') {
                                    response.conf = Site.config[confKey];
                                    response.date = new Date(response.date);
                                    response.url = tab.url;
                                    param.success(response);
                                }
                            });
                        });
                    });
            });
        } else if (param.url) {
            if (!confKey)
                confKey = Site.url2key(null, param.url);
            if (!confKey) {
                return null;
            }

            this.ajax({
                url: param.url,
                success: function (xhr) {
                    var _info = Site.config[confKey]._getPageInfo('str')(xhr.responseText);
                    _info.url = param.url;
                    if (typeof param.success == 'function') {
                        _info.conf = Site.config[confKey];
                        _info.date = new Date(_info.date);
                        param.success(_info);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                }
            });
        }
    },
    /*
    * @param {string|null=}
    * @param {string}
    * */
    'url2key': function (domain, url) {
        var that = this;
        if (arguments.length == 1) {
            url = domain;
            domain = null;
        }
        for (var key in that.config) {
            if (that.config[key].urlReg(url))
                return key;
        }
        return null;
    },
    'ajax': function (param) {
        if (!param || !param.url)
            return false;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                param.success(this);
            }
        };
        xhr.open(param.type || 'GET', param.url, false);
        xhr.send();
    },
    'config': {}, //'360buy.com'
    'storage': {},
    'handle': {
        /*
        * @description 更新存储的数据里与某个 url 相关的数据
        * @param {string} url
        * @param {object} data {price:number, date: number, conf, url}
        * */
        'updateSiteData': function (url, data) {
            exports.work.addPrice(data.conf.key, data);
        }
    }
};

//导入网站配置数据
(function(site){
    if (typeof _SiteModel == 'undefined'){
        _SiteModel = {};
    }    
    site.config = {};
    //360buy
    (function(_key){
        site.storage[_key] = {};
        site.config[_key] = {
            'key': _key,
            'getPageInfo': function(param){
                site.getPageInfo(param, _key);
            },
            '_getPageInfo' : function(type){
                //if (!dom)//字符串全文匹配跳过
                //    dom = document;

                if (type == 'str'){
                    return function(str){
                    
                        var url = document.location.href;
                        var price = str.match(/京东价：￥([0-9.]+)。感/);
                        if (price && price.length == 2){
                            price = price[1];
                        }else{
                            price = -1;
                        }
                        
                                    function getCommentsNum(c)
                                    {
                                        var num = 0;
                                        if(c)
                                        {
                                            var nums = c.match(/\(([0-9.]+)\)/);
                                            if (nums && nums.length == 2){
                                                num = nums[1];
                                            }
                                        }
                                        console.log(num);
                                        return num;
                                    }

                                    var name = $(str).find('#name').text();
                                    var stock = $(str).find('#storeinfo').find('.i-storeinfo').text();
                                    var coupon = $(str).find('#cx').text();
                                    var gift = $(str).find('#i-largess').html();
                                    var reviews = getCommentsNum($('#cnum0').text());
                                    var reviewAsGood = getCommentsNum($(str).find('#cnum1').text());
                                    var reviewAsAvg = getCommentsNum($(str).find('#cnum2').text());
                                    var reviewAsBad = getCommentsNum($(str).find('#cnum3').text());
                                    var buyUrl = $(str).find('#InitCartUrl').attr('href');
                                    var imgUrl = $(str).find('#spec-n1>img').attr('src');
                                    var data = {
                                        'url': url,
                                        'newPrice': price,
                                        'date': new Date(),
                                        'name': name,
                                        'stock': stock,
                                        'coupon': coupon,
                                        gift: gift,
                                        'reviews': {
                                            total:reviews,
                                            good: reviewAsGood,
                                            avg: reviewAsAvg,
                                            bad: reviewAsBad
                                        },
                                        'buyUrl': buyUrl,
                                        imgUrl: imgUrl,
                                        noticeSettings: {
                                            coupon: { enabled: 'checked', param: '' },
                                            cheapest: { enabled: 'checked', param: '' },
                                            reduction: { enabled: '', param: '' },
                                            onSale: { enabled: '', param: '' },
                                            notes: ''
                                        }
                                    };
                                return data;
                    };
                }else if (type == 'tab'){
                    return function(){
                        if (typeof tabContentListener === 'undefined'){
                            tabContentListener = true;
                            chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
                                var url = document.location.href;
                                console.log(7);
                                if (request.msgType == 'getPageInfo'){
                                    //request.data
                                    var p, price;
                                    for (var i = document.scripts?(document.scripts.length - 1):-1; i >= 0;i --){
                                        if (document.scripts[i].innerHTML.indexOf('京东价：￥') > 0){
                                            price = document.scripts[i].innerHTML.match(/京东价：￥([0-9.]+)。感/);
                                            if (price && price.length == 2){
                                                price = price[1];
                                                break;
                                            }
                                        }
                                    }
                                    if (i == -1){
                                        price = -1;
                                    }
                                    console.log('price geted');
                                    function getCommentsNum(c)
                                    {
                                        var num = 0;
                                        if(c)
                                        {
                                            var nums = c.match(/\(([0-9.]+)\)/);
                                            if (nums && nums.length == 2){
                                                num = nums[1];
                                            }
                                        }
                                        console.log(num);
                                        return num;
                                    }
                                    var name = $('#name').text();
                                    console.log(name);
                                    var stock = $('#storeinfo div.i-storeinfo').text();
                                    var coupon = $('#cx').html();
                                    var gift = $('#i-largess').html();
                                    var reviews = getCommentsNum($('#cnum0').text());
                                    var reviewAsGood = getCommentsNum($('#cnum1').text());
                                    var reviewAsAvg = getCommentsNum($('#cnum2').text());
                                    var reviewAsBad = getCommentsNum($('#cnum3').text());

                                    console.log('z');
                                    var buyUrl = $('#InitCartUrl').attr('href');
                                    var imgUrl = $('#spec-n1>img').attr('src');
                                    var data = {
                                        'url': url,
                                        'newPrice': price,
                                        'date': new Date(),
                                        'name': name,
                                        'stock': stock,
                                        'coupon': coupon,
                                        gift: gift,
                                        'reviews': {
                                            total:reviews,
                                            good: reviewAsGood,
                                            avg: reviewAsAvg,
                                            bad: reviewAsBad
                                        },
                                        'buyUrl': buyUrl,
                                        imgUrl: imgUrl,
                                        noticeSettings: {
                                            coupon: { enabled: 'checked', param: '' },
                                            cheapest: { enabled: 'checked', param: '' },
                                            reduction: { enabled: '', param: '' },
                                            onSale: { enabled: '', param: '' },
                                            notes: ''
                                        }
                                    };
                                    console.log('data geted');
                                    console.log(JSON.stringify(data));
                                    sendResponse(data);
                                }
                            });
                        }
                    };
                }
            },
            'urlReg': function(url){
                var r = url.match(/http:\/\/www\.360buy\.com\/product\/([0-9]+)\.html/);
                if (r && r.length == 2){
                    return {
                        key: _key,
                        id: r[1]
                    };
                }
                return null;
            }
            
        };
        
        site.config[_key].finderStr = '(' + site.config[_key]._getPageInfo('tab').toString() + ')()';

    })('360buy.com');
    
})(Site);
