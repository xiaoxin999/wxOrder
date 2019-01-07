
    let eventUtil = {

        /**
         * @description 事件管理列表
         * @var eventList
         * @type {Object}
         * @memberof router.fn
         */
        eventList: {},

        /**
         * @description 移除所有事件
         * @function removeAllEvent
         * @memberof router.fn
         */
        removeAllEvent: function() {
            this.eventList = {}
        },
        /**
         * @description添加事件
         * @function addEvent
         * @param {String} key 事件名称
         * @param {String} onlytag 唯一标记
         * @param {Function} action 方法，接收一个参数
         * @memberof router.fn
         */
        addEvent: function(key, onlytag, action) {
            var obj = this.eventList[key];
            if (obj) {
                obj[onlytag] = action;
            } else {
                obj = this.eventList[key] = {};
                obj[onlytag] = action;
            }
        },

        /**
         * @description 检查是否存在事件侦听
         * @function hasEvent
         * @param {String} key 事件名称
         * @param {String} onlytag 唯一标记
         * @memberof router.fn
         * @returns [Boolean]
         */
        hasEvent: function(key, onlytag) {
            var obj = this.eventList[key];
            if (obj && $.isFunction(obj[onlytag])) {
                return true;
            }
            return false;
        },

        /**
         * @description 移除事件
         * @function removeEvent
         * @param {String} key 事件名称
         * @param {String} onlytag 唯一标记
         * @memberof router.fn
         */
        removeEvent: function(key, onlytag) {
            if (key === undefined) return;
            if (onlytag === undefined) {
                this.eventList[key] = null;
                delete this.eventList[key];
            } else {
                if (this.eventList[key] === undefined) this.eventList[key] = {};
                this.eventList[key][onlytag] = null;
                delete this.eventList[key][onlytag];
            }
        },
        /**
         * @description 发布事件
         * @function dispatchEvent
         * @param {String} key 事件名称
         * @param {Object=} params 附带的数据
         * @memberof router.fn
         */
        dispatchEvent: function(key, params) {
            if (key === undefined) return;
            var obj = this.eventList[key];
            if (obj) {
                for (key in obj) {
                    var action = obj[key];
                    if (action) {
                        if (params !== undefined) action(params);
                        else action();
                    }
                }
            }
        }

    }
export default eventUtil;