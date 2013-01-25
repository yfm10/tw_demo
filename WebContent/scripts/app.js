

Ext.onReady(function() {
			// NOTE: This is an example showing simple state management. During development,
			// it is generally best to disable state management as dynamically-generated ids
			// can change across page loads, leading to unpredictable results.  The developer
			// should ensure that stable state ids are set for stateful components in real apps.
			Ext.QuickTips.init();

			// The only requirement for this to work is that you must have a hidden field and
			// an iframe available in the page with ids corresponding to Ext.History.fieldId
			// and Ext.History.iframeId.  See history.html for an example.
			Ext.History.init();

			Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

			/**
			 * 
			 */
			Ext.Ajax.on('requestexception', function(con, re, ops, op) {
						var msg = re.responseText;
						if (msg) {
							var msg = re.responseText.trim();
						} else {
							msg = '请求超时。。。';
						}
						var status = re.status;
						if (status == 401) {
							msg = '未经授权!';
						} else if (status == 403) {
							msg = '对不起，您没有权限访问该页面。';
						} else if (status == 404) {
							msg = '对不起，您所访问的页面不存在。<br/>' + '请检查您的访问地址是否正确。';
						} else if (status == 500) {
							msg = '页面发生错误，请与管理员联系！';
						} else if (status == 400) {
							msg = '您请求的地址不存在！';
						}
						BugOver.Msg.error('错误:' + msg);
					});
			/*Ext.Ajax.on('requestcomplete', function(conn, options) {
				var msg = Ext.String.trim(options.responseText);
				if (msg && (msg.indexOf('sessionTimeout') != -1 || msg.indexOf('超时') != -1)) {
					App.showLoginWin();
				}
			}, this);*/

			// 验证是否登录
			if (!BugOver.curUserID || BugOver.curUserID == 'null') {
				new BugOver.LoginWin({
							afterlogin : function() {
								new BugOver.MainView();
								this.close();
							}
						}).show();
			} else {
				new BugOver.MainView();
			}
			
			
		});