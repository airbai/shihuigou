/**
 * 
 */
var Storage = function(){
    this.defaultConf = {
        /* default config */
        fetchInterval: 5 * 60 * 1000,
        sites: {}
    };
    this.config = Base.clone(this.defaultConf);
    this._work = {};
    this.init();
};
Storage.prototype.get = function(){
    return this._work;
};
/*
* @description 存储副本数据
* @param {object}
*   fetchInterval {number}
*   sites {object}
* */
Storage.prototype.set = function(work){
    this._work = {
        fetchInterval: work.fetchInterval,
        sites: work.sites
    };
    this.save();
};
Storage.prototype.save = function(){
    localStorage.work = JSON.stringify(this._work);
};
Storage.prototype.init = function(){
    var resetLocalStorage = false;
    var _work = null;
    try{
        _work = JSON.parse(localStorage.work || '');
    }catch(e){
        _work = null;
    }
    if (!_work){
        _work = {};
        resetLocalStorage = true;
    }

    this._work = Base.objExtend(this.defaultConf, _work);

    if (resetLocalStorage)
        this.save();
};