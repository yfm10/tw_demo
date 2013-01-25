Ext.ns('BugOver.task');

/**
 * @namespace BugOver.task
 * @class BugOver.task.TaskPanel
 * @extends Ext.Panel
 *  通知公告面板
 * @author young 
 * @date 2012-07-16
 */
BugOver.task.TaskPanel = Ext.extend(Ext.Panel, {
	layout : 'border',
	iconCls : 'icon-messages',
	status : 'A',
	initComponent : function() {
		var me = this;
		me.initActions();
		me.createTbar();

		BugOver.task.TaskPanel.superclass.initComponent.call(this);

		me.grid = this.createGrid();
		me.add(this.grid);
		me.grid.store.on('beforeload', function(ds) {
					ds.setBaseParam('status', me.searchCombo.getValue());
					ds.setBaseParam('text', me.searchField.getValue());
				}, me);

		me.gridmenu = new Ext.menu.Menu({
					items : [me.actions[0], me.actions[1], me.actions[2]]
				});

		me.grid.on({
					rowclick : function(grid, index, e) {
					},
					rowcontextmenu : function(grid, row, e) {
						// 树右键菜单
						e.preventDefault();
						me.gridmenu.showAt(e.getPoint());
					},
					rowdblclick : function(grid, row, e) {
						var rec = grid.store.getAt(row);
						me.showDetail(rec);
					},
					scope : me
				});
		me.grid.selModel.on('selectionchange', function(sel) {
					var record = sel.getSelected();
					if (record) {
						me.actions[0].enable();
						me.actions[1].enable();
						me.actions[2].enable();
					} else {
						me.actions[0].disable();
						me.actions[1].disable();
						me.actions[2].disable();
					}
				}, me);
	},
	/**
	 * 创建动作列表
	 * @method
	 */
	initActions : function() {
		var me = this, actions = [{
					text : '完成',
					disabled : true,
					handler : function() {
						me.updateStatus('2');
					},
					iconCls : 'icon-edit',
					scope : me
				}, {
					text : '作废',
					handler : function() {
						me.updateStatus('3');
					},
					disabled : true,
					scope : me,
					iconCls : 'icon-del'
				}, {
					text : '查看',
					disabled : true,
					handler : function() {
						this.showDetail();
					},
					scope : me,
					iconCls : 'icon-search'
				}];

		me.actions = [];
		Ext.each(actions, function(n) {
					me.actions.push(new Ext.Action(n));
				}, me);

	},
	createSearchForm : function() {
		return null;
	},
	createTbar : function() {
		var me = this;
		me.searchCombo = new Ext.form.ComboBox({
					store : new Ext.data.ArrayStore({
								fields : ['value', 'state'],
								data : [['A', '所有'], ['0', '未读'], ['B', '未完成'],
								        ['2', '完成'],['3', '作废']]
							}),
					width : 150,
					displayField : 'state',
					typeAhead : true,
					mode : 'local',
					value : 'A',
					valueField : 'value',
					triggerAction : 'all',
					value : me.status,
					selectOnFocus : true
				});
		me.searchField = new Ext.form.TwinTriggerField({
					validationEvent : true,
					validateOnBlur : false,
					trigger1Class : 'x-form-clear-trigger',
					trigger2Class : 'x-form-search-trigger',
					hideTrigger1 : true,
					width : 200,
					listeners : {
						'specialkey' : function(f, e) {
							if (e.getKey() == e.ENTER) {
								f.onTrigger2Click();
							}
						}
					},
					onTrigger1Click : function(e) {
						if (this.hasSearch) {
							this.el.dom.value = '';
							this.setValue('');
							this.triggers[0].hide();
							this.hasSearch = false;
						}
					},
					onTrigger2Click : function(e) {
						var v = this.getRawValue().trim();
						if (v.length > 1) {
							this.triggers[0].show();
						}
						me.grid.store.load({
									params : {
										status : me.searchCombo.getValue(),
										text : this.getRawValue()
									}
								});
						this.hasSearch = true;

					}
				});
		me.tbar = ['Search', me.searchCombo, ' for', me.searchField, '->',
				me.actions[0], me.actions[1], me.actions[2]];
	},
	/**
	 * delete user record
	 * @param {Record} record
	 */
	updateStatus : function(type,record) {
		var me = this;
		if (!record)
			record = me.grid.selModel.getSelected();
		if (!record) {
			return;
		}
		Ext.Msg.confirm('提示', '确定更新当前任务为'+(type=='2'?'完成？':'作废？'), function(btn) {
			if (btn == 'yes') {
				Ext.Ajax.request({
							url : BugOver.path + '/task/updateMyTask.do',
							params : {
								taskID:record.get('taskID'),
								status : type
							},
							success : function(re, op) {
								if (Ext.decode(re.responseText).success) {
									BugOver.Msg.show('信息', '更新成功！');
									record.set('status',type);
									record.set('modifyTime',new Date());
									record.commit();
								} else {
									AppUtil.Msg.show('信息', '更新成功！', 2, 'error');
								}
							},
							failure : function(re, op) {
								BugOver.Msg.show('信息', '更新失败！', 2, 'error');
							},
							scope : me
						});
			}
		}, me);
	},
	createGrid : function() {
		// create the data store
		var store = new Ext.data.JsonStore({
					url : BugOver.path + '/task/findMyTask.do',
					idProperty : 'taskID',
					autoDestroy : true,
					root : 'root',
					fields : ['taskID', 'name', ' type', 'status',
							'description', 'issueID', 'createUserName', {
								name : 'createTime',
								type : 'date',
								dateFormat : 'Y-m-d\\TH:i:s'
							}, {
								name : 'modifyTime',
								type : 'date',
								dateFormat : 'Y-m-d\\TH:i:s'
							}]
				});

		// manually load local data
		// create the Grid
		var sm = new Ext.grid.CheckboxSelectionModel();
		var grid = new Ext.grid.GridPanel({
			loadMask : {
				msg : '数据加载中...'
			},
			sm : sm,
			store : store,
			region : 'center',
			border : false,
			cm : new Ext.grid.ColumnModel({
				defaults : {
					sortable : true,
					width : 100,
					align : 'center'
				},
				columns : [sm, {
							header : '名称',
							dataIndex : 'name'
						}, {
							header : '描述',
							dataIndex : 'description',
							width : 300
						}, {
							header : '问题描述ID',
							dataIndex : 'issueID'
						},  {
							header : '创建人',
							dataIndex : 'createUserName'
						}, {
							header : '创建时间',
							dataIndex : 'createTime',
							xtype : 'datecolumn',
							format : 'Y-m-d H:i:s'
						}, {
							header : '更新时间',
							dataIndex : 'modifyTime',
							xtype : 'datecolumn',
							format : 'Y-m-d H:i:s'
						}, {
							header : '状态',
							dataIndex : 'status',
							renderer : function(v) {
								//0 未读 1已读，2删除
								if (v == '1') {
									return '<span style="color:green;">已读</span>';
								} else if (v == '0') {
									return '<span style="color:red;">未读</span>';
								} else if (v == '2') {
									return '<span style="color:gray;">完成</span>';
								} else if (v == '3') {
									return '<span style="color:gray;">作废</span>';
								}

							}
						}, {
							xtype : 'actioncolumn',
							items : [{
										iconCls : 'search',
										tooltip : '查看',
										handler : function(grid, rowIndex,
												colIndex) {
											var rec = store.getAt(rowIndex);
											this.showDetail(rec);
										},
										scope : this
									}]
						}]
			}),
			stripeRows : true,
			// config options for stateful behavior
			stateful : true,
			stateId : 'taskgrid',
			bbar : new BugOver.UserPagingToolbar({
						store : store,
						pageSize : 30
					})
		});
		return grid;
	},
	showDetail : function(record) {
		var me = this, content = me.ownerCt;
		if (!record)
			record = me.grid.selModel.getSelected();

		if (!record) {
			BugOver.Msg.show('提示', '请选择一条数据！');
			return;
		}

		var panel = content.add({
			xtype : 'panel',
			tabWidth : 150,
			buttonAlign : 'center',
			iconCls : 'icon-issue',
			closable : true,
			title : 'issue:' + record.get('issueID'),
			tpl : new Ext.XTemplate([
					'<div class="issuedetial">',
					'<div class="taskDate">',
					'<span class="opts" style="float:right;">{[AppUtil.convertIssueStatus(values.status)]}</span>',
					'{values.reporter.name} 创建于: {createTime:date("Y-m-d H:i:s")}  序号{issueID}',
					'</div>','<div class="summary">摘要：{summary}</div>','<div class="content">详细描述：{description}</div>', '</div>']),
			listeners : {
				afterrender : function(p) {
					Ext.Ajax.request({
									url : BugOver.path+ '/issue/load.do',
									params : {
										issueID : record.get('issueID')
									},
									success : function(re, op) {
										var result=Ext.decode(re.responseText);
										if (result.success) {
											p.update(result.data);
										}
									},
									scope : me
								});

					//标志为已读
					if (record.get('status') == '0') {
						Ext.Ajax.request({
									url : BugOver.path+ '/task/updateMyTask.do',
									params : {
										taskID : record.get('taskID'),
										status : '1'
									},
									success : function(re, op) {
										if (Ext.decode(re.responseText).success) {
											record.set('status', '1');
											record.commit();
										}
									},
									scope : me
								});

					}
				}
			}
		});
		content.activate(panel);
	}
});

Ext.reg('taskpanel', BugOver.task.TaskPanel);