var lastReadTimeArray = [0,0];
var tabUnread = [0,0,0];
var listStyle = ['2px solid #0069F4', '2px solid #00d12d', '2px solid #E2D700'];
var mouseChoose = 0;
var background = chrome.extension.getBackgroundPage();
function setOpen(){
	if ($("#open_background").attr('checked'))
		localStorage["open_background"] = "true";
	else
		localStorage["open_background"] = "false";
	$("#guaosousuo input[type='text']").focus();	
}
function gotourl(uevent, gurl,gtitle){
	/*analytcis*/
    gurl = gurl + '';
	chrome.tabs.getSelected(null,function(thisTab){
		if ($("#open_background").attr('checked'))
			chrome.tabs.create({index:thisTab.index,url:gurl,selected :false});	
		else
			chrome.tabs.create({index:thisTab.index,url:gurl,selected :true});	 
	});
    
    if (uevent != 'noevent'){
        var domain = "unknow";
        if (gurl.toLowerCase().indexOf('http://') == 0){
            domain = gurl.substring(7);
            domain = 'http://'+domain.substring(0,domain.indexOf('/'));
        }else if (gurl.toLowerCase().indexOf('https://') == 0){
            domain = gurl.substring(8);
            domain = 'https://'+domain.substring(0,domain.indexOf('/'));
        }

        if (domain == 'unknow')
            background.ga_push(uevent,domain,gurl,1);
        else
            background.ga_push(uevent,domain,gtitle,1);
    }
}

var changeTabView = (function(){
    var __i = 0;
    return {
        set: function(index){
            index = parseInt(index);
            if (isNaN(index))
                return;
            $("#menu span").eq(index).show();
            $("#menu span").eq(index).css('border', listStyle[index]);
            $("#contents").css('border', listStyle[index]).scrollTop(0);;
            $(".guaofeedcontents").hide();
            $(".guaofeedcontents").eq(index).show();
            switch(index){
                case 0:
                case 1:$("#guaolink").html('<a href="http://www.guao.hk" target="_blank">访问 谷奥-探寻谷歌的奥秘</a>');break;
                case 2:$("#guaolink").html('<a href="http://android.guao.hk" target="_blank">访问 谷安-谷奥Android专题站</a>');break;
            }
            __i = index;
        },
        getIndex: function(){
            return __i ;
        }
    };
})();
function getItemDom(item){
    var publish = new Date(item.itemDate);
    var url = '';
    if (item.shorterLink)
        url = item.shorterLink;
    else if (item.itemGuid)
        url = item.itemGuid;
    else
        url = item.itemLink;

    return $('<li>').append(
            $('<h3>').addClass('feedtitle').attr('title',item.itemTitle).text(item.itemTitle)
        ).append(
            $('<span>').addClass('publishedtime').text('发布于:'+ publish.getFullYear() +'年'+ (publish.getMonth()+1) +'月'+ publish.getDate()+'日'+ publish.getHours()+'时'+ publish.getMinutes() +'分')
        ).data('item',item);
};
function refreshCache(items){
    $('#imgCache').empty();
    for (var i = 0;i < items.length; i++)
        $('#imgCache').append($('<div>').html(items[i].itemContent));
}
unReadList = {
	data:[],
	
	add: function(item){
		
	},
	
	load: function(){
	}
}
pageItemList = {
	unread_list : [],
	unread_add: function(data){
		var html_str;
		var g;//for...
		//search if data exist;
		var i = 0,l,r,c;
		for (i = 0;i < this.unread_list.length;i++){
			if (data.itemDate == this.unread_list[i].itemDate && data.itemLink == this.unread_list[i].itemLink)
				return 0;
		}
        
        this.unread_list.push(data);
        return 1;
	},
	
	unread_display: function(){
		//update popup list
        this.unread_list.sort(function(a, b){
            return new Date(b.itemDate) - new Date(a.itemDate);
        });
		var unread_content = $('.guaofeedcontents').eq(0).empty();
		for(var g = 0; g < this.unread_list.length; g++){
            try{
                //this.unread_add(this.unread_list[g]);
                unread_content.append(getItemDom(this.unread_list[g]));
             }catch(e){}
			tabUnread[0] = 1;
		}
        /*setTimeout(function(){
            refreshCache(this.unread_list);
        }, 1000);*/
		$('#menu span').eq(0).show();
	},
	
	load: function(rss,data){
		//add information to the list
		var content , g, new_unread_message = 0, last_read_time = 0;
        data = data || {};
		switch(rss){
            case 'guao':
                content = $('.guaofeedcontents')[1];
                last_read_time = lastReadTimeArray[0];
                break;
            case 'guan':
                content = $('.guaofeedcontents')[2];
                last_read_time = lastReadTimeArray[1];
                break;
            default:
                content = null;
		}
		if (!content){
			return ;
		}
		
		if(data.entries && data.entries.length > 0){
			
			var len = data.entries.length > 20 ? 20 : data.entries.length;
             $(content).empty();
             for(g = 0; g < len; g++){
                 try{
                    var dom = getItemDom(data.entries[g]);
                    if(new Date(data.entries[g].itemDate).getTime() > last_read_time){
                        $(dom).find('h3').css('font-weight', 'bold');
                        
                        this.unread_add(data.entries[g]);
                        new_unread_message = 1;
                    }else if (g > 9){
                        break;
                    }
                    $(content).append(dom);
                 }catch(e){}
			}

            
			if (rss == 'guao'){
				//order
				tabUnread[1] = 1;
				localStorage['lastReadTimeArray_0'] =  (new Date(data.entries[0].itemDate)).getTime();
			}else if (rss == 'guan'){
				tabUnread[2] = 1;
				localStorage['lastReadTimeArray_1'] =  (new Date(data.entries[0].itemDate)).getTime();
			}
		}else{
			switch(data.status){
				case 'new':
				case 'loading':$(content).html('<li style="font-size:12px;border-bottom:none;">正在载入数据...</li>');break;
				case 'failed':
				case 'ok':
                default :
                    $(content).html('<li style="font-size:12px;border-bottom:none;">暂时没有数据,可能是网络问题没能载入。</li>');break;
			}
		}
		
		if (new_unread_message >= 1)
			this.unread_display();
			
		if (mouseChoose == 0){
			if (tabUnread[0])
				changeTabView.set(0);
			else if (tabUnread[1])
					changeTabView.set(1);
			else if (tabUnread[2])
					changeTabView.set(2);
			else if (localStorage['guao_feed_0'] == "true")
				changeTabView.set(1);
		}
		chrome.extension.sendRequest({"hope": "clearCount"},function(){chrome.extension.sendRequest({"hope": "clearBadgeText"});});

	}
	
}
function _load(){

	//loaclStorage recover
	if(localStorage['guao_feed_0'] != "true" && localStorage['guao_feed_1'] != "true") {
		localStorage['guao_feed_0'] = "true";
		localStorage['guao_feed_1'] = "true";
	}

	if (localStorage["open_background"] == "false") {
		$('#open_background').removeAttr('checked');
	}
	else{
        localStorage["open_background"] = "true";
        $('#open_background').attr('checked',true);
    }

	$("#menu span").each(function(i){
		$(this).hover(function(){
			mouseChoose = 1;
			changeTabView.set(i);
		});

	});
	//get gu ao feed
	if (localStorage['guao_feed_0'] == "true"){
        changeTabView.set(1);
		if (typeof(localStorage["lastReadTimeArray_0"]) == "undefined" ||  (!(new Date(parseInt(localStorage["lastReadTimeArray_0"])) >= 0)))
			localStorage["lastReadTimeArray_0"] = 0;
        
		lastReadTimeArray[0] = (new Date(parseInt(localStorage["lastReadTimeArray_0"]))).getTime();
		pageItemList.load('guao',background.guao[0]);
	}
	if (localStorage['guao_feed_1'] == "true"){
        changeTabView.set(2);
		if (typeof(localStorage["lastReadTimeArray_1"]) == "undefined" ||  (!(new Date(parseInt(localStorage["lastReadTimeArray_1"])) >= 0)))
			localStorage["lastReadTimeArray_1"] = 0;
        
		lastReadTimeArray[1] = (new Date(parseInt(localStorage["lastReadTimeArray_1"]))).getTime();
		pageItemList.load('guan',background.guao[1]);
        
	}
	//console.log("Waiting");
	$("#guaosousuo input[type='text']").focus();
	$("#guaosousuo").submit(function(){
		background.ga_push("[Search]","site:guao.hk",$("#guaosousuo input[type='text']").val(),1);
		gotourl('noevent', "http://www.google.com.hk/search?hl=zh-CN&safe=off&esrch=FT1&newwindow=1&q=" + $("#guaosousuo input[type='text']").val() +"+site:guao.hk");
		return false;
	});

	$("#guaolink").click(function(){
		background.ga_push("[OuterLink]","谷奥",$("#guaolink").children("a").attr('href'),1);
	});

    $('.guaofeedcontents li').live('mouseover', function(e){
        var item = $(this).data('item');
        if (e.offsetX <= 5 || !item){
            return;
        }
        if (!($('html').width() > 760))
            $('html').css('width', 762);
        $('#fullContent').empty().show().append(
            $("<div>").addClass('title').text(item.itemTitle).data({'link':item.itemGuid, 'title':item.itemTitle}).click(function(){
                gotourl('[OpenArticle]', $(this).data('link'), $(this).data('title'));
            })
        ).append(
            $("<div>").addClass('content').css('height', $('#fullContent').outerHeight() - $('#fullContent .title').outerHeight() - 24)
            .html(item.itemContent)
            .one('mouseover', function(){
                background.ga_push("[OverArticle]",changeTabView.getIndex(),$('#fullContent .title').text(),1);
            })
        );
        $('#fullContent .content').find('img,embed').each(function(){
                if ($(this).width() > $('#fullContent .content').width() - 40){
                    var w = $(this).width();
                    var h = $(this).height();
                    $(this).css( 'width', $('#fullContent .content').width() - 40)
                        .css( 'height', $('#fullContent .content').width() / w * h);
                }
            });
        $('#fullContent .content').find('a').each(function(){
                $(this).click(function(e){
                    try{
                        gotourl('[ClickInArticle]', $(this)[0].href, $('#fullContent .title').text() + ' > ' + $(this).text());
                        return false;
                    }catch(e){
                        background.ga_push("[Error]","LinkClick", $(this).html(),1);
                    }
                });
            });
    });
    $('#loading').hide().attr('id','_loading');
    $('#guaobody').show();
    $('.guaofeedcontents').eq(changeTabView.getIndex()).find('li:first').trigger('mouseover');
    background.ga_push("[PageLoad]",location.pathname,location.pathname,1);
    
}
$(function(){
    setTimeout(_load, 800);
    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            if (request.fromBackground) {
                switch (request.fromBackground.type){
                case 0:
                    pageItemList.load('guao',request.fromBackground.feed);
                    break;
                case 1:
                    pageItemList.load('guan',request.fromBackground.feed);
                    break;
                }

            }
    });
});
