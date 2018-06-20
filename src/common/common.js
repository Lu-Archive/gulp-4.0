//amaze-ui 弹窗
function showModel(selector){
    $(selector).modal({closeViaDimmer:false})
}
/**
 * 用于解析url参数
 * @param url
 * @returns {{source: *, protocol, host: string, port: (*|Function|string), query: (*|string), file: *, hash, path: string, relative: *, segments: Array, params}}
 */
function parseUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/'),
        params: function () {
            var ret = {};
            var seg = a.search.replace(/^\?/, '').split('&').filter(function (v, i) {
                if (v !== '' && v.indexOf('=')) {
                    return true;
                }
            });
            seg.forEach(function (element, index) {
                var idx = element.indexOf('=');
                var key = element.substring(0, idx);
                var val = element.substring(idx + 1);
                ret[key] = val;
            });
            return ret;
        }()
    };
}
//将请求返回的数据直接放入dom前字符串转化
function pwdCode(str){
    str+="";
    return str.replace(/'/g,'%27').replace(/\(/g,'%28').replace(/\)/g, "%29").replace(/!/g, "%21").replace(/~/g,'%7E')+"";
}
function add0(m){   //对日期类数据返回两位数字
    return m<10?'0'+m:m
  }
/**
 * 获取当前时间
 * @return string
 * @param ("Y-M-D h:m:s") 或 ("Y-M-D h:m:s",时间戳)
 * YMDhms直接替换对应时间单位，格式可自由替换
 * 没有参数直接返回Y-M-D h:m:s(如2018-01-01 12:21:45)
 * 有参数则直接替换
 */
function showDate(){
    var now     = arguments.length==2 ? new Date(arguments[1]) : new Date();
    var year    = now.getFullYear();
    var month   = add0(now.getMonth()+1);
    var date    = add0(now.getDate());
    var hour    = add0(now.getHours());
    var minute  = add0(now.getMinutes());
    var seconds = add0(now.getSeconds());
    if(!arguments.length){
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+seconds;
    }else if(arguments.length>0){
      if(arguments[0].indexOf("Y")>-1){
        arguments[0]=arguments[0].replace(/Y/g,year)
      }
      if(arguments[0].indexOf("M")>-1){
        arguments[0]=arguments[0].replace(/M/g,month)
      }
      if(arguments[0].indexOf("D")>-1){
        arguments[0]=arguments[0].replace(/D/g,date)
      }
      if(arguments[0].indexOf("h")>-1){
        arguments[0]=arguments[0].replace(/h/g,hour)
      }
      if(arguments[0].indexOf("m")>-1){
        arguments[0]=arguments[0].replace(/m/g,minute)
      }
      if(arguments[0].indexOf("s")>-1){
        arguments[0]=arguments[0].replace(/s/g,seconds)
      }
      return arguments[0];
    }
  }

/**
 * 分页效果
 * @param objPrama
 * pageurl:请求地址；totalpage:总页数；litab:默认显示页数；allnum:总条数；object:加载对象；successFn:加载成功后带回数据
 */
function pagination(objPrama) {
    this.url = objPrama.pageurl;
    this.pageCon = objPrama.totalpage;
    this.liTab = objPrama.liTabNUM;
    this.allnum = objPrama.allnum ? objPrama.allnum : 0 ;
    this.clipInit(objPrama.object);
    this.dataFn=objPrama.dataFn;
    this.successFn = objPrama.successFn;
    this.failFn=objPrama.failFn;
}

pagination.prototype.clipInit = function (obj) {
    var that = this;
    that.pageObj = obj;
    that.medCur = Math.ceil(that.liTab / 2);
    var str = "";
    str += '<div class="count">共 <span>' + this.allnum + '</span> 条</div>';
    str += "<ul>";
    str += "<li class='disbled' pagination-first='true'>首页</li>";
    str += "<li class='disbled' pagination-last><</li>";
    str += "<div id='pageU' class='fl'>";
    if (that.liTab <= that.pageCon) {
        str += "<li class='BORDER before ellipsis'>···</li>";
        for (var i = 1; i <= that.liTab; i++) {
            str += "<li class='BORDER" + "' pagination-choose='" + "clip" + i + "'>" + i + "</li>";
        }
        str += "<li class='BORDER after ellipsis'>···</li>";
    } else {
        for (var i = 1; i <= that.pageCon; i++) {
            str += "<li class='BORDER" + "' pagination-choose='" + "clip" + i + "'>" + i + "</li>";
        }
    }
    str += "<li class='clear'></li>";
    str += "</div>";
    str += "<li class='BORDER' pagination-next>></li>";
    str += "<li class='BORDER' pagination-end>末页</li>";
    str += "<li class='clear'></li>";
    str += "</ul>";
    str += ' <div>第<input type="text"  />页</div><a class="searchPage" href="#">跳转</a>';

    that.pageObj.html(str);
    that.first = that.pageObj.find($("li[pagination-first]"));
    that.last = that.pageObj.find($("li[pagination-last]"));
    that.next = that.pageObj.find($("li[pagination-next]"));
    that.end = that.pageObj.find($("li[pagination-end]"));
    that.before = that.pageObj.find($(".before"));
    that.after = that.pageObj.find($(".after"));
    that.searchBtn = that.pageObj.find($(".searchPage"));

    that.pageObj.find($("li[pagination-choose]")).click(function () {
        that.pageInt($(this).attr("pagination-choose"), that.liTab, that.medCur);
    });
    that.first.click(function () {
        that.FirstPage();
    });
    that.last.click(function () {
        that.LastPage();
    });
    that.next.click(function () {
        that.NextPage();
    });
    that.end.click(function () {
        that.EndPage();
    });
    that.searchBtn.click(function (ev) {
        var ev = ev || event;ev.preventDefault();
        that.SearchPage();
    });
    that.pageInt11('clip1', that.pageCon, that.medCur);
    that.before.css("display", "none");
};
//设置当点击的值小于预设固定值
//单击事件  选择页数
pagination.prototype.clipPage = function (cur, page) {
    var that = this;
    var str = "";
    for (var i = 1; i <= page; i++) {
        var liId = "clip" + i;
        if (cur == i) {
            that.choose(liId).attr("class", "curPage");
        } else {
            that.choose(liId).attr("class", "BORDER");
        }
        that.choose(liId).text(i);
    }
    this.pageControl(cur);
};
//设置的中转站，根据获取的值更改操作
pagination.prototype.pageInt11 = function (obj, page, medCur) {
    var that = this;
    var value = parseInt(that.choose(obj).text());
    if (value < medCur) {
        that.clipPage(value, page);
    } else if (value >= medCur) {
        that.clipPageMax(value, page, medCur);
    }
    if (value >= 4) {
        that.before.css("display", "block");
    } else {
        that.before.css("display", "none");
    }
    if (value < that.pageCon - 2) {
        that.after.css("display", "block");
    } else {
        that.after.css("display", "none");
    }
    if (that.pageCon <= that.liTab) {
        that.after.css("display", "none");
    }
};
pagination.prototype.pageInt = function (obj, page, medCur) {
    var that = this;
    var value = parseInt(that.choose(obj).text());
    if (parseInt(that.curPage().text()) == value) {
        //若当前页面则不做处理
        return false;
    }
    if (that.ajax(value)) {
        if (value < medCur) {
            that.clipPage(value, page);
        } else if (value >= medCur) {
            that.clipPageMax(value, page, medCur);
        }
        if (that.pageCon > that.liTab) {
            if (value >= that.liTab - 1) {
                that.before.css("display", "block");
            } else {
                that.before.css("display", "none");
            }
            if (value < that.pageCon - 2) {
                that.after.css("display", "block");
            } else {
                that.after.css("display", "none");
            }
        } else {
            that.before.css("display", "none");
            that.after.css("display", "none");
        }
        if (that.pageCon == 1) {
            return false;
        }
    }
};
//设置当获取的值大于预设固定值
pagination.prototype.clipPageMax = function (cur, page, medCur) {
    var that = this;
    var str = "";
    var startNum = cur - medCur + 1;
    var maxPage = startNum + parseInt(page) - 1;
    if (maxPage < that.pageCon + 1) {
        for (var i = 1; i <= page; i++) {
            var liId = "clip" + i;
            if (medCur == i) {
                that.choose(liId).attr("class", "curPage");
            } else {
                that.choose(liId).attr("class", "BORDER");
            }
            that.choose("clip" + i).text(startNum);
            startNum++;
        }
    } else {
        var end = new RegExp(/\d+$/);
        var page = parseInt(end.exec(page));
        var curT = cur - that.pageCon + page;
        var maxP = that.pageCon;
        if (page > that.pageCon) {
            for (var i = that.pageCon; i >= 1; i--) {
                var liId = "clip" + i;
                if (i == cur) {
                    that.choose(liId).attr("class", "curPage");
                } else {
                    that.choose(liId).attr("class", "BORDER");
                }
                that.choose(liId).text(maxP);
                maxP--;
            }
        } else {
            for (var i = page; i >= 1; i--) {
                var liId = "clip" + i;
                if (curT == i) {
                    that.choose(liId).attr("class", "curPage");
                } else {
                    that.choose(liId).attr("class", "BORDER");
                }
                that.choose(liId).text(maxP);
                maxP--;
            }
        }
    }
    this.pageControl(cur);
};

//首页，尾页，上一页，下一页 的样式
pagination.prototype.pageControl = function (cur) {
    var that = this;
    if (cur == 1) {
        that.first.attr("class", "disbled");
        that.last.attr("class", "disbled");
        that.next.attr("class", "BORDER");
        that.end.attr("class", "BORDER");
        if (that.pageCon == 1) {
            that.next.attr("class", "disbled");
            that.end.attr("class", "disbled");
        }
    } else if (cur == that.pageCon) {
        that.first.attr("class", "BORDER");
        that.last.attr("class", "BORDER");
        that.next.attr("class", "disbled");
        that.end.attr("class", "disbled");
    } else {
        that.first.attr("class", "BORDER");
        that.last.attr("class", "BORDER");
        that.next.attr("class", "BORDER");
        that.end.attr("class", "BORDER");
    }
};
pagination.prototype.choose = function (choosePage) {
    return this.pageObj.find($("li[pagination-choose='" + choosePage + "']"));
};
pagination.prototype.curPage = function () {
    return this.pageObj.find($(".curPage"));
};
//第一页 显示
pagination.prototype.FirstPage = function () {
    var that = this;
    if (that.first.attr("class").indexOf("disbled") > -1) {
        return false;
    }
    if (that.ajax(1)) {
        var forNum = parseInt(that.liTab);
        this.clipPage(1, forNum);
        that.before.css("display", "none");
        if (that.pageCon > 5) {
            that.after.css("display", "block");
        }
    }
};

//尾页 显示
pagination.prototype.EndPage = function () {
    var that = this;
    if (that.end.attr("class").indexOf("disbled") > -1) {
        return false;
    }
    if (that.ajax(that.pageCon)) {
        var maxV = parseInt(that.pageCon);
        this.clipPageMax(maxV, that.liTab, that.medCur);
        if (that.pageCon <= 5) {
            that.before.css("display", "none");
        } else {
            that.before.css("display", "block");
        }
        that.after.css("display", "none");
    }
};
//上一页 显示
pagination.prototype.LastPage = function () {
    var that = this;
    if (that.last.attr("class").indexOf("disbled") > -1) {
        return false;
    }
    var choice = that.curPage().attr('pagination-choose');
    var obj = that.choose(choice).prev().attr('pagination-choose');
    this.pageInt(obj, that.liTab, that.medCur);
};

//下一页 显示
pagination.prototype.NextPage = function () {
    var that = this;
    if (that.next.attr("class").indexOf("disbled") > -1) {
        return false;
    }
    var choice = that.curPage().attr('pagination-choose');
    var obj = that.choose(choice).next().attr('pagination-choose');
    this.pageInt(obj, that.liTab, that.medCur);
};

pagination.prototype.SearchPage = function () {
    var that = this;
    var searchInput = that.pageObj.find("input");
    if (!$.trim(searchInput.val())) {
        alertInfo("请输入页数");
        return false;
    }
    var r = /^\+?[1-9][0-9]*$/;
    var searchPage = $.trim(searchInput.val());
    if (!r.test(searchPage)) {
        searchInput.focus();
        alertInfo("请输入为整数且大于0的页数");
        searchInput.val("");
        return false;
    }
    if (searchPage > that.pageCon) {
        alertInfo("超过最大页数，请重新输入");
        searchInput.val("");
        return false;
    }
    if (that.pageCon == 1) {
        return false;
    }

    if (that.ajax(searchPage)) {
        //搜索页数
        if (searchPage < that.medCur) {
            that.clipPage(searchPage, that.liTab);
        } else if (searchPage >= that.medCur) {
            that.clipPageMax(searchPage, that.liTab, that.medCur);
        }
        if (that.pageCon > that.liTab) {
            if (searchPage >= that.liTab - 1) {
                that.before.css("display", "block");
            } else {
                that.before.css("display", "none");
            }
            if (searchPage < that.pageCon - 2) {
                that.after.css("display", "block");
            } else {
                that.after.css("display", "none");
            }
        } else {
            that.before.css("display", "none");
            that.after.css("display", "none");
        }
    }
};
pagination.prototype.ajax = function (page) {
    var that = this;
    var result = false;
    var sendData=this.dataFn(page);
    $.ajax({
        url: that.url,
        method: "POST",
        data: sendData,
        dataType: "json",
        success: function success(data) {
            that.successFn(data)
            result = true;
        },
        error: function error() {
            alert("连接失败")
        },
        async: false
    });
    return result;
};