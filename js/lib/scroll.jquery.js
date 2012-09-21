(function ($) {
    $.fn.scrollLoad = function (options) {

        var defaults = {
            backgroundPageObj: null,
            data: null,
            ScrollAfterHeight: 90,
            onload: function (data, itsMe) {
                alert(data);
            },
            start: function (itsMe) { },
            continueWhile: function () {
                return true;
            },
            getData: function (itsMe) {
                return '';
            }
        };

        for (var eachProperty in defaults) {
            if (options[eachProperty]) {
                defaults[eachProperty] = options[eachProperty];
            }
        }

        return this.each(function () {
            this.scrolling = false;
            this.scrollPrev = this.onscroll ? this.onscroll : null;
            $(this).bind('scroll', function (e) {
                if (this.scrollPrev) {
                    this.scrollPrev();
                }
                if (this.scrolling) return;
                if (document.body.scrollHeight - $(document.body).scrollTop() < $(document.body).height() && $(this).scrollTop() > prevScrollTop) {

                    defaults.start.call(this, this);
                    this.scrolling = true;
                    $this = $(this);

                    var temp = {};
                    var skipNum = prevRowNo;
                    var totalRowCount;
                    if (defaults.backgroundPageObj) {
                        var b = $.Enumerable.From(defaults.backgroundPageObj.exports.work.sites).ForEach(function (s) {
                            var products = s.Value;
                            totalRowCount = $.Enumerable.From(products).Count();
                            $.Enumerable.From(products).Skip(skipNum).Take(defaults.data.pageCount).ForEach(function (p) {
                                if (p && p.Value) {
                                    temp[p.Key] = p.Value;
                                }
                            });
                        });
                        var prevTop = $(this).scrollTop();
                        var results = {
                            '360buy.com': temp,
                            totalRowCount: totalRowCount,
                            prevRowNo: skipNum + defaults.data.pageCount,
                            prevScrollTop: prevTop
                        };
                    }

                    $this[0].scrolling = false;
                    defaults.onload.call($this[0], results, $this[0]);
                    if (!defaults.continueWhile.call($this[0], results)) {
                        //$this.unbind('scroll');
                    }
                }
            });
        });
    }
})(jQuery);
