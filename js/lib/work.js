/**
 * 
 */

var Work = function(storage){
    this.storage = storage;
    this.fetchInterval = 5 * 60 * 1000;
    this.sites = {
        /*
        '360buy.com':{
            'http://www.360buy.com/pro/33.html': {
                update: 0, //s
                price: [
                    [0, 112.3],[new Date().getTime(), 32.3]
                ]
            }
        }
        */
    };
    this.init(storage.get());
};
/*
* @param {string}
* @param {object} {price:number, date: number|Date, url:string}
* @return {array} [from, to] | [to]
* */
Work.prototype.addPrice = function (confKey, data) {
    console.log(JSON.stringify(data));
    if (!this.sites[confKey])
        this.sites[confKey] = {};
    var info = {
        update: 0,
        name: '',
        price: [],
        stock: '',
        coupon: '',
        gift: '',
        reviews: '',
        buyUrl: '',
        rank: 4,
        noticeSettings: {
            coupon: { enabled: 'checked', param: '' },
            cheapest: { enabled: 'checked', param: '' },
            reduction: { enabled: '', param: '' },
            onSale: { enabled: '', param: '' },
            notes: ''
        }
    };
    if (!this.sites[confKey][data.url]) {
        this.sites[confKey][data.url] = info;
    }

    var _p = this.sites[confKey][data.url].price;
    var detail = [];
    if (_p.length > 0)
        detail.push(_p[_p.length - 1][1] - 0);

    if (_p.length == 0 || (_p.length > 0 && _p[_p.length - 1][1] != data.newPrice)) {
        detail.push(data.newPrice - 0);

        _p.push([
            data.date.getTime ? data.date.getTime() : new Date(data.date).getTime(), (data.newPrice - 0)
        ]);
    }
    _p.splice(0, _p.length - 10);
    this.sites[confKey][data.url].name = data.name;
    this.sites[confKey][data.url].stock = data.stock;
    this.sites[confKey][data.url].coupon = data.coupon;
    this.sites[confKey][data.url].gift = data.gift;
    this.sites[confKey][data.url].reviews = data.reviews;
    this.sites[confKey][data.url].reviewAsGood = data.reviewAsGood;
    this.sites[confKey][data.url].buyUrl = data.buyUrl;
    this.sites[confKey][data.url].imgUrl = data.imgUrl;
    this.sites[confKey][data.url].rank = data.rank;
    this.sites[confKey][data.url].noticeSettings = data.noticeSettings;
    this.save();
    return this.sites[confKey][data.url];
};
Work.prototype.getPrices = function(confKey, url){
    if (this.sites[confKey] && this.sites[confKey][url])
        return this.sites[confKey][url].price.slice(0);
    return [];
};
Work.prototype.getRank = function (confKey, url) {
    var rank = 4;
    if (this.sites[confKey] && this.sites[confKey][url]) {
        rank = this.sites[confKey][url].rank;
    }
    return rank;
};
/*
* @description 检查url是否被关注
* @param {string}
* @param {string}
* */
Work.prototype.checkUrl = function(confKey, url){
    return (this.sites[confKey] && this.sites[confKey][url]);
};
Work.prototype.addUrl = function (confKey, url) {
    if (!url) { return; }
    if (!this.sites[confKey])
        this.sites[confKey] = {};
    if (!this.sites[confKey][url])
        this.sites[confKey][url] = {
            update: 0,
            price: []
        };
    this.save();
};
Work.prototype.delUrl = function(confKey, url){
    if (this.sites[confKey])
        delete this.sites[confKey][url];
    this.save();
};
Work.prototype.save = function(){
    this.storage.set({
        fetchInterval: this.fetchInterval,
        sites: this.sites
    });
};
/*
* @descriptiont 定时轮询所有
* */
Work.prototype.run = function(auto){
    try{
        clearInterval(this._stepTimer);
    }catch(e){}
    
    //var delta = Math.min(3 * 60 * 1000);
    // feed cache control
    var that = this;
    this._stepTimer = setInterval(function(){
        that.step();
    }, this.fetchInterval);
    
    if (auto)
        this.step();
};
Work.prototype.step = function () {
    var that = this;
    var i = 0;
    for (var k in that.sites) {
        for (var f in that.sites[k]) {
            setTimeout((function (confKey, url) {
                return function () {
                    Site.getPageInfo({
                        url: url,
                        success: function (_info) {
                            var url = _info.url;
                            var site = Site.url2key(null, url);

                            var data = that.sites[site][url];
                            data.url = url;
                            data.name = _info.name;
                            data.stock = _info.stock;
                            data.coupon = _info.coupon;
                            data.reviews = _info.reviews;
                            data.buyUrl = _info.buyUrl;
                            data.date = _info.date;
                            data.newPrice = _info.newPrice;
                            data.imgUrl = _info.imgUrl;
                            data.rank = that.sites[site][url].rank ? that.sites[site][url].rank : 4;
                            var info = that.addPrice(confKey, data);

                            var noticeHistory = data.noticeHistory;
                            var d = new Date();
                            var isToday = noticeHistory && noticeHistory.lastDate && (d.toDateString() == new Date(noticeHistory.lastDate).toDateString());
                            if (!noticeHistory || !isToday
                                 || noticeHistory.times < 2) {
                                var note = [];
                                for (var n in info.noticeSettings) {
                                    var notice = info.noticeSettings[n];
                                    var param = notice.param;
                                    if (notice.enabled == 'checked' && that.noticeSettings[n].checkMethod(info, param)) {
                                        var tmpl = $.template(null, that.noticeSettings[n].notification);
                                        note.push($.tmpl(tmpl, { 'param': param }) && $.tmpl(tmpl, { 'param': param }).text ? $.tmpl(tmpl, { 'param': param }).text() : '');
                                        note.push('；');
                                    }
                                }

                                if (note.length && note.length > 0) {
                                    //有更低的价格
                                    that.notice().show('您关注的商品: ' + _info.name, note.join('') + '点击查看',
                                    function () {
                                        var tmpl = $.template(null, 'http://click.union.360buy.com/JdClick/?unionId=5990&t=4&to=${url}');
                                        var unionUrl = $.tmpl(tmpl, { 'url': _info.url }).text();
                                        chrome.tabs.create({ url: unionUrl, selected: true }, function (tab) {
                                        });

                                        that.notice().close();
                                    });

                                    noticeHistory = noticeHistory || {
                                        lastDate: new Date(),
                                        times: 0
                                    };
                                    that.sites[site][url].noticeHistory = {
                                        lastDate: new Date(),
                                        times: isToday ? parseInt(noticeHistory.times) + 1 : 1
                                    };

                                    that.save();
                                }
                            }
                        }
                    });
                };
            })(k, f), i++ * 2000);
        }
    }
};
Work.prototype.notice = (function(){
    var notification = null;
    return function(){
        var work = this;
        return {
            show: function(title, content, click, close){
                var notice = this;
                notification = webkitNotifications.createNotification(
                    './img/logo.png',  // icon url - can be relative
                    title,  // notification title
                    content  // notification body text
                );
                notification.onclose = close || function(){
                    notice.close();
                    return false;
                };
                notification.onclick = click || function(){
                    return false;
                };
                notification.show();
            },
            close: function(){
                if (notification){
                    notification.cancel();
                    notification.onclose = null;
                    notification = null;
                }
                notification = null;
            }
        };
    };
})();
Work.prototype.init = function(_work){
    this.fetchInterval = _work.fetchInterval;
    this.sites = _work.sites;
};
Work.prototype.noticeSettings = {
    coupon: {
        name: '包含赠券/品',
        checkMethod: function (trackItemInfo) {
            var hasCoupon = trackItemInfo && trackItemInfo.coupon && trackItemInfo.coupon.length > 0;
            var hasGift = trackItemInfo && trackItemInfo.gift && trackItemInfo.gift.length > 0;
            return hasCoupon || hasGift;
        },
        notification: '有赠券/品了'
    },
    cheapest: { name: '降价',
        checkMethod: function (trackItemInfo) {
            var result = false;
            for (var i = 0, len = trackItemInfo.price.length; len > 1 && i < len; i++) {
                if (trackItemInfo.price[len - 1][1] > -1 && trackItemInfo.price[len - 1][1] < trackItemInfo.price[0][1]) {
                    result = true;

                    break;
                }
            }
            return result;
        },
        notification: '降价了'
    },
    reduction: { name: '低于{0}元',
        checkMethod: function (trackItemInfo, param) {
            var len = trackItemInfo.price.length;
            if (len < 1) return false;
            return trackItemInfo.price[len - 1][1] > -1 && (trackItemInfo.price[len - 1][1] < param); //-1对应无报价的情况
        },
        notification: '低于${param}元了'
    },
    onSale: { name: '当价格下降超过{0}%',
        checkMethod: function (trackItemInfo, param) {
            var len = trackItemInfo.price.length;
            var result = false;
            if (len >= 2 && trackItemInfo.price[len - 1] > -1 && trackItemInfo.price[len - 2] > -1) {
                reduction = (trackItemInfo.price[len - 1] - trackItemInfo.price[len - 2]) / trackItemInfo.price[len - 2];
                result = parseFloat(reduction) >= parseFloat(param);
            }

            return result;
        },
        notification: '降价${param}%了'
    }
};