var background = chrome.extension.getBackgroundPage();
var sites = background.exports.work.sites;
var jiathis_config = {
    url: "",
    title: ""
};

var ul, tbody;
function loadWatchlist(jqdiv, newSites, isAppend) {
    if (!isAppend) {
        jqdiv.html('');
        ul = $('<table class="table table-bordered table-striped table-condensed tablesorter">');
        ul.append(getHeader());
        tbody = $('<tbody>');
    }

    for (var k in newSites) {
        for (var f in newSites[k]) {
            tbody.append(
                    getLi(k, f, newSites[k][f], 'trackItemTmpl')
                );
        }
    }

    if (!isAppend) {
        ul.append(tbody);
        jqdiv.append(ul);
    }

    function getHeader() {
        var thead = $('<thead>');
        var tr = $('<tr>');
        tr.append($('<th>').css('width', '100px').html('关注度'));
        tr.append($('<th>').css('width', '81px').html('网站'));
        tr.append($('<th>').html('商品名称').css('width', '92px'));
        tr.append($('<th>').html('关注时间').css('width', '61px'));
        tr.append($('<th>').html('关注价格').css('width', '61px'));
        tr.append($('<th>').html('降价').css('width', '61px'));
        tr.append($('<th>').html('当前价格').css('width', '61px'));
        tr.append($('<th>').html('库存').css('display', 'none'));
        tr.append($('<th>').html('赠券').css('width', '61px'));
        tr.append($('<th>').html('赠品').css('width', '61px'));
        tr.append($('<th>').html('评价').css('display', 'none'));
        tr.append($('<th>'));
        thead.append(tr);
        
        return $('<div>').append(thead).html();
    }
}

function loadWaterfallData(jqdiv, selected, isAppend) {
    if (!isAppend) {
        jqdiv.html('');
    }
    for (var k in selected) {
        for (var f in selected[k]) {
            jqdiv.append(
                    getLi(k, f, selected[k][f], 'trackItemWaterfall')
                );
        }
    }
}

function getLi(confKey, url, urlValues, templateId) {
    var tmpl = $.template(null, 'http://click.union.360buy.com/JdClick/?unionId=5990&t=4&to=${url}');
    var unionUrl = $.tmpl(tmpl, { 'url': url }).text();
    var gift = [];
    $(urlValues.gift).each(function () {
        $(this).find('a:eq(0)').attr('title', $(this).find('a:eq(1)').text())
            .attr('href', $.tmpl(tmpl, { 'url': $(this).find('a:eq(1)').attr('href') }).text());
        gift.push($('<div>').append($(this).find('a:eq(0)')).html());
    });

    var hasTwoMorePrice = urlValues.price && urlValues.price.length > 1;
    var reduct = 0, quatity = 0, percent = '';
    if (hasTwoMorePrice) {
        reduct = urlValues.price[0][1] - urlValues.price[urlValues.price.length - 1][1];
        quatity = reduct > 0 ? reduct : 0;

        percent = quatity != '' ? Math.round((reduct / urlValues.price[urlValues.price.length - 1][1]) * 100) + ' %' : '';
    }
    var trackItem = {
        site: confKey,
        url: url,
        name: urlValues.name.trim(),
        date: urlValues && urlValues.price && urlValues.price[0] ? formatDate(new Date(urlValues.price[0][0]), 'MM/d/yyyy') : '',
        price: urlValues && urlValues.price && urlValues.price[0] && urlValues.price[0][1] > -1 ? urlValues.price[0][1] : '暂无报价',
        reduction: {
            percent: percent,
            quatity: quatity,
            quatityText: quatity > 0 ? ('<span class="trend down" title="降"></span><span>' + quatity + '</span>') : (quatity < 0 ? ('<span class="trend rise" title="涨"></span><span>' + quatity + '</span>') : '<span class="trend fair" title="没变"></span><span></span>')
        },
        curprice: urlValues && urlValues.price.length >= 1 && urlValues.price[urlValues.price.length - 1] && urlValues.price[urlValues.price.length - 1][1] > -1 ? urlValues.price[urlValues.price.length - 1][1] : '暂无报价',
        coupon: $(urlValues.coupon).text().trim().length > 0 ? '有' : '',
        gift: $(urlValues.gift).text().trim().length > 0 ? '有' : '',
        stock: urlValues.stock,
        reviews: {},
        buyUrl: urlValues.buyUrl,
        imgUrl: urlValues.imgUrl,
        unionUrl: unionUrl,
        bought: urlValues.bought == 'checked' ? getBuyTmpl().html() : getNotBuyTmpl().html()
    };
    return $("#" + templateId).tmpl(trackItem);
}

function getBuyTmpl() {
    var tmpl = $('#buyTmpl');
    return tmpl;
}

function getNotBuyTmpl() {
    var tmpl = $('#notbuyTmpl');
    return tmpl;
}

function getWaterfallBlock(confKey, url, urlValues) {
    var tmpl = $.template(null, 'http://click.union.360buy.com/JdClick/?unionId=5990&t=4&to=${url}');
    var unionUrl = $.tmpl(tmpl, { 'url': url }).text();
    var gift = [];
    $(urlValues.gift).each(function () {
        $(this).find('a:eq(0)').attr('title', $(this).find('a:eq(1)').text())
            .attr('href', $.tmpl(tmpl, { 'url': $(this).find('a:eq(1)').attr('href') }).text());
        gift.push($('<div>').append($(this).find('a:eq(0)')).html());
    });

    var hasTwoMorePrice = urlValues.price && urlValues.price.length > 1;
    var reduct = 0, quatity = '', percent = '';
    if (hasTwoMorePrice) {
        reduct = urlValues.price[0][1] - urlValues.price[urlValues.price.length - 1][1];
        quatity = reduct > 0 ? reduct : '';

        percent = quatity != '' ? Math.round((reduct / urlValues.price[urlValues.price.length - 1][1]) * 100) + ' %' : '';
    }
    var trackItem = {
        site: confKey,
        url: url,
        name: urlValues.name,
        date: urlValues && urlValues.price && urlValues.price[0] ? formatDate(new Date(urlValues.price[0][0]), 'MM/d/yyyy') : '',
        price: urlValues && urlValues.price && urlValues.price[0] && urlValues.price[0][1] > -1 ? urlValues.price[0][1] : '暂无报价',
        reduction: {
            percent: percent,
            quatity: quatity
        },
        curprice: urlValues && urlValues.price.length >= 1 && urlValues.price[urlValues.price.length - 1] && urlValues.price[urlValues.price.length - 1][1] > -1 ? urlValues.price[urlValues.price.length - 1][1] : '暂无报价',
        coupon: $(urlValues.coupon).text().trim().length > 0 ? '有' : '',
        gift: $(urlValues.gift).text().trim().length > 0 ? '有' : '',
        stock: urlValues.stock,
        reviews: {},
        buyUrl: urlValues.buyUrl,
        imgUrl: urlValues.imgUrl,
        unionUrl: unionUrl
    };
    return $("#trackItemTmpl").tmpl(trackItem);
}

function needsToShow(noticeType, site, url, details)
{
    var result = false;
    if(noticeType && noticeType.length > 0)
    {
        var types = noticeType.split(',');
        console.log(noticeType);
        $.each(types, function(k, v){
            if ($.trim(v).length > 0
            && details.noticeSettings 
            && details.noticeSettings[v] && $.trim(details.noticeSettings[v].enabled) == 'checked')
            {
                result = true;
                return false;
            }
        });
    }

    return result;
}

function setShare(title, url) {
    jiathis_config.title = title;
    jiathis_config.url = url;
}

function bindEvents() {
    dieListEvents();
    $(':button[c="del"]').click(function () {
        var yes = confirm('将删除与此页面相关的数据');
        var btn = this;
        if (yes) {
            $.when((function () {
                var site = $(getRowTDs(btn)[1]).text().trim();
                var url = $(getRowTDs(btn)[2]).find('a').attr('href').trim();
                background.exports.work.delUrl(site, url);
                $(btn).parentsUntil('tbody').remove();
                //location.reload();
            })()).done(function () {
                displayMessage('删除成功');
            });
        }
    });

    $('*[c=share]').live('mouseover', function () {
        var tds = getRowTDs(this);
        var title = [];
        title.push("我在");
        title.push($(tds[1]).text().trim());
        title.push("发现了一个非常不错的商品：");
        title.push($(tds[2]).text().trim());
        title.push(" 价钱只有 ");
        title.push($(tds[6]).text().trim());
        title.push(" 元。 感觉不错，分享一下");
        //title.push($(tds[2]).find('a').attr('href').trim());

        var url = $(tds[2]).find('a').attr('href');
        var tmpl = $.template(null, 'http://click.union.360buy.com/JdClick/?unionId=5990&t=4&to=${url}');
        var unionUrl = $.tmpl(tmpl, { 'url': url }).text();

        setShare(title.join(''), unionUrl);
    });

    $('div[c=rank]').stars({
        inputType: "select",
        split: 1,
        callback: function (ui, type, value) {
            var sites = background.exports.work.sites;
            var tds = getRowTDs(ui.element);
            var site = $(tds[1]).text().trim();
            var url = $(tds[2]).children('a').attr('href').trim();
            sites[site][url].rank = value;
            background.exports.work.save();

            $('#watchlist>table')
            .trigger("update")
            .trigger("appendCache");
        }
    }).each(function () {
        var sites = background.exports.work.sites;
        var tds = getRowTDs(this);
        var site = $(tds[1]).text().trim();
        var url = $(tds[2]).children('a').attr('href').trim();
        var value = sites[site][url].rank;

        $(this).stars('select', value).stars({
            captionEl: $(this).prev('div').find('span[c=rankvalue]')
        });
    });

    $('form input[type=button]').live('click', function () {
        $.when((function () {
            var form = $(event.target).parentsUntil('form').prev();
            var set = {
                coupon: { enabled: form.find(':checkbox[name=coupon]').attr('checked') ? 'checked' : '', param: '' },
                cheapest: { enabled: form.find(':checkbox[name=cheapest]').attr('checked') ? 'checked' : '', param: '' },
                reduction: { enabled: form.find(':checkbox[name=reduction]').attr('checked') ? 'checked' : '', param: form.find('input[name=reductionTo]').val() },
                onSale: { enabled: form.find(':checkbox[name=onSale]').attr('checked') ? 'checked' : '', param: form.find('input[name=onSalePercent]').val() },
                notes: $(event.target).parentsUntil('form').find('*[name=notes]').val()
            };

            var tds = getRowTDs(event.target);
            var site = $(tds[1]).text().trim();
            var url = $(tds[2]).children('a:eq(0)').attr('href');
            sites[site][url].noticeSettings = set;
            background.exports.work.save();
        })())
        .done(function () {
            displayMessage('保存成功');
        })
        .fail(function () {
            displayMessage('保存失败');
        })
    });
}

function dieListEvents() {
    $(':button[c="del"]').unbind('click');
    $('*[c=share]').die('mouseover');
    $('form input[type=button]').die('click');
}

function bindWaterfallEvents() {
    $('a[c=waterfalldel]').click(function () {
        var yes = confirm('将删除与此页面相关的数据');
        var btn = this;
        if (yes) {
            $.when((function () {
                var site = '360buy.com';//TODO
                var url = $(btn).parent().prev().prev().attr('href').trim();
                background.exports.work.delUrl(site, url);
                $(btn).parentsUntil('#waterfall').remove();
                location.reload();
            })()).done(function () {
                displayMessage('删除成功');
            });
        }
    });

    $('span.yon>a').live('click', function () {

        var btn = this;
        $.when((function () {
            var site = '360buy.com'; //TODO
            var url = $(btn).parent().prev().attr('href');
            var bought = $(btn).text().indexOf('已购') > -1;
            sites[site][url].bought = !bought ? 'checked' : '';
            background.exports.work.save();
        })()).done(function () {
            var bought = $(btn).text().indexOf('已购') > -1;
            $(btn).text(bought ? $(getNotBuyTmpl().text()).text() : $(getBuyTmpl().text()).text());
            displayMessage('保存成功');
        });
    });
}

function dieWaterfallEvents() {
    $('span.yon>a').die('click');
}

function setNotice(isAppend) {
    $('a[c=setNotice]').each(function (k, v) {
        if ($(this).attr('added') == 'added') {
            return;
        }
        var tds = getRowTDs(this);
        var site = $(tds[1]).text().trim();
        var url = $(tds[2]).children('a').attr('href').trim();

        var sites = background.exports.work.sites;
        var noticeSettings = sites[site][url].noticeSettings;
        if (!noticeSettings) {
            noticeSettings = {
                coupon: { enabled: '', param: '' },
                cheapest: { enabled: '', param: '' },
                reduction: { enabled: '', param: '' },
                onSale: { enbled: '', param: '' }
            };
        }

        var html = $('#noticeSettingTmpl').tmpl(noticeSettings);

        if ($(this).next().find(':checkbox').length == 0) {
            $(this).after(html);
        }

        $('div[c="notice"]>:button:eq(1)').on('click', function () {
            $('div[c="notice"]').parent().hide();
        });
        $(this).attr('added', 'added');
        //});
    });
}

function getRowTDs(td) {
    return $(td).parentsUntil('table').children('td');
}

function displayMessage(msg) {
    $('<div class="messageInfo">' + msg + '</div>').appendTo('#msgInfoWrap').fadeIn('slow').animate({ opacity: 1.0 }, 3000).fadeOut('slow', function () {
        $(this).remove();
    });
}

function loadList(selected, isAppend) {
    var div = $('#listView');
    loadWatchlist(div, selected, isAppend);
    bindEvents();
    setNotice(isAppend);
}

function loadWaterfallList(selected, isAppend) {
    dieWaterfallEvents();
    var div = $('#waterfall');
    $.when((function () {
        loadWaterfallData(div, selected, isAppend);
    })()).done(function () {
        bindWaterfallEvents();
    });
}

var prevRowNo = 12;
var listPrevRowNo = 12;
var picPrevRowNo = 12;
var prevScrollTop = 0;
var displayed;
function scollPagination() {
    $(window).scrollLoad({

        backgroundPageObj: background,
        data: {
            prevRowNo: prevRowNo,
            pageCount: 12
        },
        getData: function () {
            //you can post some data along with ajax request
        },

        start: function () {
            if ($(this).scrollTop() > prevScrollTop) {
                $('<div class="loading"><img src="img/loading.gif" style="height:16px" />正在加载，请稍候...</div>').appendTo($('.product'));
            }
        },

        ScrollAfterHeight: 95, 		//this is the height in percentage

        onload: function (data) {
            prevRowNo = data.prevRowNo;
            prevScrollTop = data.prevScrollTop;
            listPrevRowNo = prevRowNo;
            picPrevRowNo = prevRowNo;
            for (var k in data) {
                for (var f in data[k]) {
                    displayed[k][f] = data[k][f]
                }
            }
            if ($('#listView').css('display') != 'none') {
                loadList(data, true);
            }
            else {
                loadWaterfallList(data, true);
            };

            var millisecondsToWait = 200;
            setTimeout(function () {
                $('.loading').remove();
            }, millisecondsToWait);
        },

        continueWhile: function (resp) {
            if ($('#listView').css('display') != 'none') {
                if ($('#listView').children('tbody').children('tr').length == resp.totalRowCount) {
                    return false;
                }
            }
            else {
                if ($('#waterfall').children('li').length == resp.totalRowCount) {
                    return false;
                }
            }
            return true;
        }
    });
}

$(function () {
    displayed = getShowResult(true);
    loadWaterfallList(displayed);
    scollPagination();

    $('#btnPic').click(function () {
        $('#picView').show();
        var results = getShowResult(false);
        loadWaterfallList(results);
        $('#listView').hide();

        prevRowNo = picPrevRowNo;
    });

    $('#btnList').click(function () {
        $('#picView').hide();
        var results = getShowResult(false);
        loadList(results);
        $('#listView').show();
        prevRowNo = listPrevRowNo;
    });

    $('div.p-top2').find(':checkbox').click(function () {
        var results = getShowResult(false);

        if ($('#listView').css('display') != 'none') {
            loadList(results);
        }
        else {
            loadWaterfallList(results);
        };
    });

    function getShowResult(isInit) {
        var selected = {};
        var i = 0;
        var source = isInit ? sites : displayed;
        var take = $.Enumerable.From(source).ForEach(function (v) {
            console.log(i++);
            var products = v.Value;
            if (isInit) {
                $.Enumerable.From(products).Take(12).ForEach(function (p) {
                    if (p && p.Value) {
                        var show = shouldShow(p.Value);
                        if (show === true) {
                            selected[p.Key] = p.Value;
                        }
                    }
                });
            }
            else {
                $.Enumerable.From(products).ForEach(function (p) {
                    if (p && p.Value) {
                        var show = shouldShow(p.Value);
                        if (show === true) {
                            selected[p.Key] = p.Value;
                        }
                    }
                });
            }
        });
        var results = {
            '360buy.com': selected
        };

        return results;
    }

    function shouldShow(productInfo) {

        var notChecked = true;
        $('div.p-top2').find(':checkbox').each(function (x) {
            if ($(this).attr('checked')) {
                notChecked = false
                return false;
            }

        });

        if (notChecked) {
            return true;
        }

        if ($('#ckbAll').attr('checked')) {
            return true;
        }

        if ($('#ckbReduction').attr('checked') && productInfo && isReduction(productInfo.price)) {
            return true;
        }

        var should = false;
        $('div.p-top2').find('#ckbCoupon, #ckbGift').each(function (x) {
            if ($(this).attr('checked') && productInfo && productInfo[$(this).val()]) {
                should = true;
            }
        });

        return should;
    }

    function isReduction(prices) {
        return prices && prices.length > 1 && prices[prices.length - 1][1] < prices[prices.length - 2][1];
    }
});

function setCheck(obj) {
    obj.parentNode.className = $(obj).attr('checked') ? "checked" : "";
}  