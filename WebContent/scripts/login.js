Ext.ns('BugOver');
/**
 * @namespace BugOver
 * @class BugOver.LoginWin
 * @extends Ext.Window
 */
BugOver.LoginWin = Ext.extend(Ext.Window, {
	title : '登入',
	closable : false,
	width : 270,
	height : 180,
	resizable:false,
	modal : true,
	layout : 'fit',
	initComponent : function() {
		BugOver.LoginWin.superclass.initComponent.call(this);
		var me=this;
		me.actions = [new Ext.Action({
							text : '提交',
							type : 'submit',
							handler : me.login,
							scope : me
						}), new Ext.Action({
							text : '清除',
							handler : function() {
								me.form.form.reset();
							},// 重置表单
							scope : me
						})];
		me.form = me.createForm();
		me.add(me.form);
	},
	login : function() {
		var me=this;
		    form=this.form.form;
		if (form.isValid()) {
			me.actions[0].disable();// 防止重复提交
			var date = new Date();
		    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
			Ext.util.Cookies.set('curUserNo',form.findField('value').getValue(),date);
			form.submit({
				url : BugOver.path+'/user/login.do',
				waitTitle : '正在提交',
				waitMsg:'正在登入验证，请稍等。。。',
				success : function(f, a) {
					var result = a.result,
                        user=result.data;
                    BugOver.curUserID=user.userID;
                    BugOver.curUserName=user.name;
                    BugOver.curUserNo=user.userNo;

					me.afterlogin();
				},
				failure : function(f, a) {
					BugOver.Msg.error(a.result.message);
					// 提交失败，将提交按钮重新设为可操作
					me.actions[0].enable();
				},
				scope : me
			});
		}
	},
	/**
	 * create user login form
	 * @method
	 */
	createForm:function(){
		var me =this;
		var form=new  Ext.FormPanel({
					labelAlign : 'right',
					labelWidth : 50,
					baseCls : 'x-plain',
					border : false,
					bodyStyle:"padding:30px 5px 5px 0;",
					buttonAlign : 'center',
					buttons : [me.actions[0], me.actions[1]],
					defaultType : 'textfield',
					items : [{
								fieldLabel : '编号',
								name : 'value',
								style : 'font-size:13px;',
								anchor : '99%',
								allowBlank : false,
								value:Ext.util.Cookies.get('curUserNo'),
								blankText : '请输入工号',
								listeners : {
									'specialkey' : function(field, e) {
										if (e.getKey() == Ext.EventObject.ENTER) {
											Ext.getCmp('password').focus();
										}
									}
								},
								stateEvents:['keypress'],
								stateful:true,
								stateId:'loginfield'
							}, {
								fieldLabel : '密码',
								name : 'password',
								style : 'font-size:13px;',
								inputType : 'password',
								anchor : '99%',
								id : 'password',
								emptyText : '12345',
								allowBlank : true,
								blankText : '请输入密码',
								listeners : {
									'specialkey' : function(field, e) {
										if (e.getKey() == Ext.EventObject.ENTER) {
											this.login();
										}

									},
									scope : this
								}
							}]
				});
			return form;
	},
	afterlogin : function() {
		// 返回事件
		this.close();

	}
});
