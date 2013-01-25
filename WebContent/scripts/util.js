//自定义Vtype验证----验证密码是否一致
Ext.apply(Ext.form.VTypes, {
			//验证方法
	        //val指这里的文本框值，field指这个文本框组件
			password : function(val, field) {
				if (field.password.password_id) {
					//password是自定义的配置参数，一般用来保存另外的组件的id值
					//取得user_password的那个id的值
					var pwd = Ext.get(field.password.password_id);
					return (val == pwd.getValue());//验证
				}
				return true;
			},
			//验证提示错误提示信息(注意：方法名+Text)
			passwordText : "两次密码输入不一致!"
		});

/**
 * @namespace Ext.data
 * @class Ext.data.JsonReader
 * 修改jsonstore 返回root 为null时默认为数组为空
 * */
Ext.override(Ext.data.JsonReader,{
/**
     * Create a data block containing Ext.data.Records from a JSON object.
     * @param {Object} o An object which contains an Array of row objects in the property specified
     * in the config as 'root, and optionally a property, specified in the config as 'totalProperty'
     * which contains the total size of the dataset.
     * @return {Object} data A data block which is used by an Ext.data.Store object as
     * a cache of Ext.data.Records.
     */
    readRecords : function(o){

         /**
         * After any data loads, the raw JSON data is available for further custom processing.  If no data is
         * loaded or there is a load exception this property will be undefined.
         * @type Object
         */
        this.jsonData = o;
        if(o.metaData){
            this.onMetaChange(o.metaData);
        }
        var s = this.meta, Record = this.recordType,
            f = Record.prototype.fields, fi = f.items, fl = f.length, v;

        var root = this.getRoot(o);
        if(root==null){
           root=[];
        }
        var  c = root.length, totalRecords = c, success = true;
        if(s.totalProperty){
            v = parseInt(this.getTotal(o), 10);
            if(!isNaN(v)){
                totalRecords = v;
            }
        }
        if(s.successProperty){
            v = this.getSuccess(o);
            if(v === false || v === 'false'){
                success = false;
            }
        }

        // TODO return Ext.data.Response instance instead.  @see #readResponse
        return {
            success : success,
            records : this.extractData(root, true), // <-- true to return [Ext.data.Record]
            totalRecords : totalRecords
        };
    }
});

Ext.ns('BugOver');
/**
 * @namespace AppUtil
 * @class AppUtil.Msg
 * @singleton
 * 自定义消息自动消失提示框
 * title, 标题
 * format消息
 * time显示时间
 * iconCls图标 info，warning，success,error,happy,loading
 * @author Yang Fuming
 * */
BugOver.Msg = function() {
	var msgCt;
	/**
	 * 创建提示框
	 * @private
	 * @method {createBox}
	 */
	function createBox(t, s, iconCls) {
		if (!iconCls) {
			iconCls = 'msg-info';
		} else {
			iconCls = 'msg-' + iconCls;
		}
		return [
				'<div class="msg">',
				'<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
				'<div class="x-box-ml"><div class="x-box-mr"><div class=" msg-image '
						+ iconCls + '"></div><div class="x-box-mc"><h3>',
				t,
				'</h3>',
				s,
				'</div></div></div>',
				'<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
				'</div>'].join('');
	}

	return {
		/**
		 * 显示自动消失提示框
		 * @method
		 * @param {String} title
		 * @param {String} format
		 * @param {Number} time
		 * @param {String} iconCls
		 */
		show : function(title, format, time, iconCls) {
			if (!msgCt) {
				msgCt = Ext.DomHelper.insertFirst(document.body, {
							id : 'msg-div'
						}, true);
			}
			msgCt.alignTo(document, 't-t');
			//if(!format){
			//   format=title;//默认显示
			//   title='提示';
			//}
			var s = String.format.apply(String, Array.prototype.slice.call(
							arguments, 1));
			var m = Ext.DomHelper.append(msgCt, {
						html : createBox(title, s, iconCls)
					}, true);
			m.slideIn('t').pause(Ext.isDefined(time) ? time : 1).ghost("t", {
						remove : true
					});
		},
		/**
		 * 显示错误提示框
		 * @param {String} msg
		 * @param {String} title
		 */
		error : function(msg, title) {
			Ext.Msg.show({
						title : title ? title : '错误',
						msg : msg,
						icon : Ext.Msg.ERROR,
						buttons : Ext.Msg.OK
					});
		},
		/**
		 * 显示提示框
		 * @param {String} msg
		 * @param {String} title
		 */
		info : function(msg, title) {
			Ext.Msg.show({
						title : title ? title : '提示',
						msg : msg,
						icon : Ext.Msg.INFO,
						buttons : Ext.Msg.OK
					});
		},
		/**
		 * 显示警告提示框
		 * @param {String} msg
		 * @param {String} title
		 */
		warn : function(msg, title) {
			Ext.Msg.show({
						title : title ? title : '警告',
						msg : msg,
						icon : Ext.Msg.WARNING,
						buttons : Ext.Msg.OK
					});
		}
	};

}();

BugOver.UserPagingToolbar = Ext.extend(Ext.PagingToolbar, {
	pageSize : 20,// 默认记录数
	store : null,// 绑定的数据源
	displayMsg : '第 {0} - {1} 条  共 {2} 条',
	displayInfo : true,
	emptyMsg : "没有记录",
	initComponent:function(){
        BugOver.UserPagingToolbar.superclass.initComponent.call(this);
        var me=this;
        me.pageSizeField = new Ext.form.NumberField( {
			width : 45,
			submitValue : false,
			align : 'center',
			allowNegative : false,
			allowDecimals : false,
			value : this.pageSize,
			listeners : {
				'specialkey' : function(field, e) {
					if (e.getKey() == Ext.EventObject.ENTER) {
						field.ownerCt.pageSize = field.getValue();
						me.store.load( {
							params : {
								limit : field.getValue()
							}
						});

					}
				},
				'change' : function(field, newValue, oldValue) {
					 field.ownerCt.pageSize = newValue;
					 me.store.setBaseParam('limit', newValue);
				},
				scope : me
			}
		});

        me.add(['-', '每页显示：', me.pageSizeField,'条记录']);

		me.store.on('beforeload', function(ds, on) {
			ds.setBaseParam('start', 0);
			ds.setBaseParam('limit', me.getPageSize());
		}, me);
		me.store.on('remove', function(ds,record,index) {
			//ds.totalLength= (ds.totalLength==0?0:ds.totalLength-1);
			me.updateInfo();
		}, me);

	},
	getPageSize : function() {
		return this.pageSize;
	},
	getStore : function() {
		return this.store;
	}
});

Ext.ns('AppUtil');
AppUtil.convertIssueStatus=function(v){
  if (v == '0') {
		return '未提交';
	} else if (v == '1') {
		return '待确认';
	} else if (v == '2') {
		return '驳回';
	} else if (v == '3') {
		return '待修复';
	} else if (v == '4') {
		return '修复待确认';
	} else if (v == '5') {
		return '已确认修复';
	} else if (v == '6') {
		return '关闭';
	}
	return v;
}