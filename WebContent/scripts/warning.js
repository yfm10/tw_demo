Ext.ns('BugOver.domain');

/**
 * @namespace BugOver.domain
 * @class BugOver.domain.Issue
 */
BugOver.domain.Issue=new Ext.data.Record.create( ['issueID', 'type',
	                   'component','version',
	                   'summary','description',
	                   'status','priority',
	                   'remark','reporter',
	                   'modifyUser','verifyUser',
	                   'fixUser','identifyUser',
	                   'assigneeName',
	                   {name:'createTime', type:'date',dateFormat :'Y-m-d\\TH:i:s'},
	                   {name:'modifyTime', type:'date',dateFormat :'Y-m-d\\TH:i:s'},
	                   {name:'verifyTime', type:'date',dateFormat :'Y-m-d\\TH:i:s'},
	                   {name:'identifyTime', type:'date',dateFormat :'Y-m-d\\TH:i:s'},
	                   {name:'fixTime', type:'date',dateFormat :'Y-m-d\\TH:i:s'}]);
	                   

Ext.ns('BugOver.issue');

/**
 * @namespace BugOver.issue
 * @class BugOver.issue.IssuePanel
 * @extends Ext.Panel
 * 问题列表面板
 */
BugOver.issue.IssuePanel=Ext.extend(Ext.Panel,{
	 layout:'border',
	 iconCls:'icon-warning',
     initComponent:function(){
     	  var me=this;
     	  me.initActions();
          me.menu = new Ext.menu.Menu({
             items: [me.actions[11],me.actions[5],me.actions[6],me.actions[7],me.actions[8],me.actions[9],me.actions[10],'-',
                me.actions[0],me.actions[1],me.actions[2],me.actions[12]]
		    });
     	  me.tbar=me.createTbar();

          BugOver.issue.IssuePanel.superclass.initComponent.call(this);

          /**
           * 问题列表表格
           */
          me.grid=this.createGrid();
          /**
           * 查询表单
           */
          me.searchForm=me.createSearchForm();
          me.add(this.grid);

          /* 单击表格事件 */
	      me.grid.on({
					rowclick: function(grid, index, e) {
					},
					rowcontextmenu : function(grid, row, e) {
						// 树右键菜单
						e.preventDefault();
						me.menu.showAt(e.getPoint());
					},
					rowdblclick : function(grid, row, e) {
                         var rec=grid.store.getAt(row);
                         me.showIssue(rec);
					},
					scope : me
				});
		  me.grid.selModel.on('selectionchange',function(sel){
		  	   var records=sel.getSelections(),
		  	       length=records.length,
		  	       status=[];
                  if(length>0){                     
                       for(var i=0;i<length;i++){
                       		status.push(records[i].get('status'));
                       }
                       
					   me.actions[1].enable();
                       me.actions[2].enable();
                       me.actions[5].enable();
                       me.actions[6].enable();
                       me.actions[7].enable();
                       me.actions[8].enable();
                       me.actions[9].enable();
                       me.actions[10].enable();
                       me.actions[11].enable();
                       me.actions[12].enable();
                       me.actions[13].enable();
                  }else{
                       me.actions[1].disable();
                       me.actions[2].disable();
                       me.actions[5].disable();
                       me.actions[6].disable();
                       me.actions[7].disable();
                       me.actions[8].disable();
                       me.actions[9].disable();
                       me.actions[10].disable();
                       me.actions[11].disable();
                       me.actions[12].disable();
                       me.actions[13].enable();
                  }
		  },me);
		  me.grid.store.on('beforeload',function(ds,ops){
                 ds.setBaseParam('userID',BugOver.curUserID);
                 ds.setBaseParam('status',me.searchCombo.getValue());
                 ds.setBaseParam('justMe',me.searchCheck.getValue());
                 ds.setBaseParam('text',me.searchField.getValue());
		  },me);
     },
     createTbar:function(){
         var me=this;
		 me.searchCombo = new Ext.form.ComboBox({
		        store: new Ext.data.ArrayStore({
			        fields: ['value', 'state'],
			        data : [['A','所有'],['B','All Open'],['0','待提交'],['1','待确认 '],
			                ['2','驳回'],['3','待修复 '],['4','修复待确认 '],
			                ['5','已确认修复 '],['6','关闭']]
			    }),
			    width:150,
		        displayField: 'state',
		        typeAhead: true,
		        mode: 'local',
		        value:'B',
		        valueField:'value',
		        triggerAction: 'all',
		        selectOnFocus: true
		    });
		  me.searchField = new Ext.form.TextField({
					name : 'searchText',
					width : 200,
					listeners : {
						specialkey : function(field, e) {
							if (e.getKey() == Ext.EventObject.ENTER) {
								me.grid.store.load();
							}

						},
						scope : me
					}
				});
		  me.searchCheck=new Ext.form.Checkbox({checked:true,label:'与我相关'});
          return ['与我相关',me.searchCheck,'<b>Search</b>',me.searchCombo,'<b>for</b>',me.searchField,me.actions[3],'-',
                  me.actions[4],'->',{
            text: '操作',
            iconCls: 'icon-edit',
            menu: {
                xtype: 'menu',
                plain: true,
                items:[me.actions[11],me.actions[5],me.actions[6],me.actions[7],me.actions[8],me.actions[9],me.actions[10]]}
          },me.actions[0],me.actions[1],me.actions[2],me.actions[12],me.actions[13]];
     },
     /**
      * 创建动作列表
      * @method
      */
    initActions:function(){
    	  var me=this;
          me.actions=[new Ext.Action({
			    text: '新建',//0
			    handler:  function(){
                    me.showForm();
			    },
			    iconCls: 'icon-add',
			    scope:me
			}),new Ext.Action({
			    text: '修改',//1
			    handler: function(){
                    me.showForm('edit');
			    },
			    disabled:true,
			    iconCls: 'icon-edit',
			    scope:this
			}),new Ext.Action({
			    text: '删除',//2
			    disabled:true,
			    handler: me.delIssue,
			    scope:this,
			    iconCls: 'icon-del'
			}),new Ext.Action({
			    text: '查询',//3
			    handler: function(){
			        this.grid.store.reload();
			    },
			    scope:this,
			    iconCls: 'icon-search'
			}),new Ext.Action({
			    text: '高级查询',//4
			    disabled:true,
			    hidden:true,
			    handler: function(){
			    },
			    iconCls: 'icon-searchmore'
			}),new Ext.Action({
			    text: '提交',//5
			    disabled:true,
			    handler: function(){
			    	me.changeStatus('1');
			    },
			    iconCls: 'icon-commit'
			}),new Ext.Action({
			    text: '确认',//6
			     disabled:true,
			    handler: function(){
			    	me.changeStatus('3');
			    },
			    iconCls: 'icon-mail_receive'
			}),new Ext.Action({
			    text: '驳回',//7
			    disabled:true,
			    handler: function(){
			    	me.changeStatus('2');
			    },
			    iconCls: 'icon-reject'
			}),new Ext.Action({
			    text: '已修复',//8
			    disabled:true,
			    handler: function(){
			    	me.changeStatus('4');
			    },
			    iconCls: 'icon-ok'
			}),new Ext.Action({
			    text: '确认修复',//9
			    disabled:true,
			    handler: function(){
			    	me.changeStatus('5');
			    },
			    iconCls: 'icon-accept'
			}),new Ext.Action({
			    text: '关闭',//10
			    disabled:true,
			    handler: function(){
			    	me.changeStatus('6');
			    },
			    iconCls: 'icon-cross'
			}),new Ext.Action({
			    text: '指定责任人',//11
			    disabled:true,
			    handler: me.assignUser,
			    scope:me,
			    iconCls: 'icon-man_brown'
			}),new Ext.Action({
			    text: '执行历史',//12
			    disabled:true,
			    handler: function(){
			       me.showHistory();
			    },
			    scope:me,
			    iconCls: 'icon-url_history'
			}),new Ext.Action({
			    text: '导出word',//13
			    disabled:true,
			    handler: function(){
			       me.exportWord();
			    },
			    scope:me,
			    iconCls: 'icon-word'
			})];
     },
     /**
      * change issue status
      * @param {char} type
      */
     changeStatus:function(type,record,panel){
     	 var me=this,
             records = me.grid.selModel.getSelections();     
          if(record){
             records=[record];
          }
         var length=records.length;
         if(length>0){
              var issueIDs=[],
                validstatus=[],
                statusName='待提交';
                if(type=='1'){
                   validstatus.push('0','2','6','5','4');
                   statusName='待提交,驳回,关闭,待确认修复,确认已修复';
                }else if(type=='2'||type=='3'){
                    validstatus.push('1');
                    statusName='待确认';
                }else if(type=='4'){
 					validstatus.push('3');
                    statusName='确认';
                }else if(type=='5'){
 					validstatus.push('4');
                    statusName='待确认修复';
                }else if(type=='6'){
 					validstatus.push('0','1','2','3','4','5','6');
                }

              for(var i=0;i<length;i++){
				 var rec = records[i],
				     status=rec.get('status');

				 if(validstatus.indexOf(status)!=-1){
                     issueIDs.push(rec.get('issueID'));
				 }else{
				    BugOver.Msg.info('issue'+rec.get('issueID')+'不处于'+statusName+'状态,请取消选择！');
				    return;
				 }
              }
            if(issueIDs.length>0){
            	  Ext.Msg.prompt('提示', '确定更新状态？', function(btn, text) {
					if (btn == 'ok') {
						Ext.Ajax.request({
							url : BugOver.path + '/issue/updateStatus.do',
							params : {
								issueIDs : issueIDs,
								status : type,
								remark:text
							},
							success : function(re, op) {
								if (Ext.decode(re.responseText).success) {
									BugOver.Msg.show('信息', '更新成功！');
									me.grid.store.reload();
									//更新面板状态
									if(record && panel){
									   record.set('status',type);
									   record.data.statusName=AppUtil.convertIssueStatus(type);
									   if(type=='4'){
									       record.data.fixUser={name:BugOver.curUserName,fixTime:new Date().format('Y-m-d\\TH:i:s')};
									   }
									   if(type=='5'){
									      record.data.verifyUser={name:BugOver.curUserName,verifyTime:new Date().format('Y-m-d\\TH:i:s')};
									   }
									   panel.update(record.data);
									}
									
								} else {
									BugOver.Msg.show('信息', '更新失败！', 2, 'error');
								}
							},
							failure : function(re, op) {
								BugOver.Msg.show('信息', '更新失败！', 2, 'error');
							},
							scope : me
						});

					}

				}, this, true);

            }
         }else{
              BugOver.Msg.show('提示','请选择数据！');
         }

     },
     /**
		 * assignUser
		 */
     assignUser : function() {
		var me = this, records = me.grid.selModel.getSelections(), length = records.length;
		if (length > 0) {
			var issueIDs=[];
			Ext.each(records,function(r){
			     issueIDs.push(r.get('issueID'));
			});
			var win = new BugOver.user.SelectUserWin({
						title : '指定修复责任人',
						buttons : [{
									text : '确定',
									handler : function(btn) {
                                        if(win.hasSelection()){
                                           Ext.Ajax.request({
												url : BugOver.path+'/task/assignIssueUser.do',
												params : {
													userIDs:win.getSelectedUserIDs(),
													issueIDs : issueIDs
												},
												success : function(re, op) {
													if (Ext.decode(re.responseText).success) {
														BugOver.Msg.show('信息',	'更新成功！');
                                                        me.grid.store.reload();
                                                        win.close();
													} else {
														BugOver.Msg.show('信息','更新失败！', 2,'error');
													}
												},
												failure : function(re, op) {
													BugOver.Msg.show('信息',
															'更新失败！', 2,
															'error');
												},
												scope : me
											});
                                        }else{
                                        	BugOver.Msg.show('提示', '选择一行数据！');
                                        }
									},
									scope : me
								}, {
									text : '取消',
									handler : function(btn) {
										win.close();
									}
								}]
					}).show();

		} else {
			BugOver.Msg.show('提示', '选择一行数据！');
		}

     },
    /**
	 * create issue formpanel ,and add to tabpanel
	 *
	 * @method
	 */
    showForm:function(type,record){
    	var me=this,
    	    content=me.ownerCt;
    	if(type){
    		if(!record)
    		   record = me.grid.selModel.getSelected();
            if(!record){
            	BugOver.Msg.show('提示', '选择一行数据成功！');
				return;
            }
    	}

        var  form= content.add({
					title :(type?'修改':'新增')+ 'issue',
					xtype : 'form',
					iconCls:type?'icon-edit':'icon-add',
					closable : true,
					border : false,
					buttonAlign : 'center',
					baseCls : 'x-plain',
					padding:'5px 5px 5px',
					bodyStyle : 'background-color:#DEECFD;',
					labelAlign : 'right',
					items : [{
						layout : 'column',
						baseCls : 'x-plain',
						defaults:{
							baseCls : 'x-plain',
						    layout : 'form'
						},
						items : [{
									columnWidth : .30,
									items : [{
									    typeAhead: true,
									    triggerAction: 'all',
									    lazyRender:true,
									    mode: 'local',
									    anchor:'100%',
									    fieldLabel : '问题类型',
										xtype : 'combo',
										hiddenName : 'type',
									    store: new Ext.data.ArrayStore({
									        fields: [
									            'value',
									            'displayText'
									        ],
									        data: [['1', '缺陷'], ['2', '新功能']]
									    }),
									    value:'1',
									    valueField: 'value',
									    displayField: 'displayText'
									}]
								},{
									columnWidth : .30,
									items : [{
									    typeAhead: true,
									    triggerAction: 'all',
									    lazyRender:true,
									    anchor:'100%',
									    mode: 'local',
									    fieldLabel : '优先级',
										hiddenName : 'priority',
										xtype : 'combo',
									    store: new Ext.data.ArrayStore({
									        fields: [
									            'value',
									            'displayText'
									        ],
									        data: [['1', '中'], ['0', '高'], ['2', '低']]
									    }),
									    value:'1',
									    valueField: 'value',
									    displayField: 'displayText'
									}]
								}]
					    },{
								fieldLabel : '模块',
								xtype : 'textfield',
								anchor:'90%',
								name : 'component'
							}, {
								fieldLabel : '摘要',
								xtype : 'textfield',
								anchor:'90%',
								name : 'summary'
							}, {
								fieldLabel : '描述',
								name : 'description',
								anchor : '90% 90%',
								xtype : 'kindeditor',
								options : {
									cssPath : BugOver.kindeditorPath
											+ '/plugins/code/prettify.css',
									uploadJson : BugOver.path
											+ '/file/upload.do',
									fileManagerJson : BugOver.path
											+ '/file/listFile.do',
									// uploadJson : path+'/FileServlet',
									disableItems : ['baidumap'],
									allowFileManager : true
								}
							}, {
								fieldLabel : '备注',
								anchor : '90%',
								xtype : 'textarea',
								name:'remark'
							}],
					buttons : [{
								text : '存草稿',
								scale:'medium',
								handler:function(){
                                    me.saveIssue(form,'draft');
								},
								scope:me
							}, {
								text : '提交',
								scale:'medium',
								handler:function(){
                                    me.saveIssue(form,'commit');
								},
								scope:me
							},{
								text : '保存',
								hidden:true,
								scale:'medium',
								handler:function(){
                                    me.saveIssue(form,'save');
								},
								scope:me
							},{
								text : '取消',
								scale:'medium',
								handler:function(){
                                    content.remove(form);
                                    Ext.destroy(form);
								}
							}]
				});
			 content.activate(form);
            if(type){
            	form.add({
            	    xtype:'hidden',
            	    name:'issueID'
            	});

                form.form.loadRecord(record);
                var status=record.get('status');
                if(status=='0'){
                	form.buttons[0].show();
                	form.buttons[1].show();
                }else{
                    form.buttons[2].show();
                    form.buttons[0].hide();
                    form.buttons[1].hide();
                    form.add({
            	       xtype:'hidden',
            	       name:'status',
            	       value:status
            	   });
                }

            }
    },
    saveIssue:function(form,type){
            var me=this,
    	    content=me.ownerCt,
 			basic = form.form,
 			params={status:type=='draft'?'0':'1' };
 			if('save'==type){
               params={};
 			}
			if (basic.isValid()) {
					basic.submit({
						        params:params,
								url : BugOver.path+'/issue/add.do',
								success : function(f, a) {
									BugOver.Msg.show('提示', '保存成功！');
									me.grid.store.reload();
									me.grid.view.refresh();
									content.remove(form);
                                    Ext.destroy(form);
								},
								failure : function(f, a) {
									BugOver.Msg.error(a.result.message);
								},
								scope : this,
								waitMsg : '正在提交数据，稍后...'
							});
				} else {
					BugOver.Msg.show('信息', '请填写完再提交!', 2, 'warning');
				}   
    },
    /**
     * delete issue record only status='1'
     *@method
     * */
    delIssue:function(){
    	var me=this,
         records = me.grid.selModel.getSelections(),
         length=records.length;
         if(length>0){
         	  var issueIDs=[];
              for(var i=0;i<length;i++){
				 var rec = records[i],
				     status=rec.get('status');
				 if(status == '0'){
                     issueIDs.push(rec.get('issueID'));
				 }else{
				    BugOver.Msg.info('issue'+rec.get('issueID')+'已提交不能删除,请关闭或取消选择！');
				    return;
				 }
              }
              if(issueIDs.length>0){
                   Ext.Msg.confirm('删除', '确定删除当前选择?', function(btn) {
								if (btn == 'yes') {
									Ext.Ajax.request({
												url : BugOver.path+'/issue/del.do',
												params : {
													issueIDs : issueIDs
												},
												success : function(re, op) {
													if (Ext.decode(re.responseText).success) {
														BugOver.Msg.show('信息',	'删除成功！');
														me.grid.store.remove(records);
													} else {
														BugOver.Msg.show('信息','删除失败！', 2,'error');
													}
												},
												failure : function(re, op) {
													BugOver.Msg.show('信息',
															'删除失败！', 2,
															'error');
												},
												scope : me
											});
								}
							}, me);
              }
         }else{
             BugOver.Msg.show('提示','请选择草稿状态的记录删除！');
         }
    },
    createSearchForm:function(){
           return null;
    },
    createGrid:function(){
	    // create the data store
	    var store = new Ext.data.GroupingStore({
	    	  autoDestroy:true,
	          url: BugOver.path+'/issue/findByCondition.do',
	          groupField:'status',
	          reader:new Ext.data.JsonReader({
	            idProperty: 'issueID',	           
	            root:'root',
	            fields:BugOver.domain.Issue
	          })
	    });
	    // create the Grid
	    var sm = new Ext.grid.CheckboxSelectionModel();
	    var expander = new Ext.ux.grid.RowExpander({
	    	enableCaching : false,
	        tpl : new Ext.Template(
	            '<p><b>描述: </b>{description:ellipsis(600)}</p><br>',
	            '<p><b>备注: </b>{remark:ellipsis(200)}</p>'
	        )
	    });
	    var grid = new Ext.grid.GridPanel({
	    	loadMask : {
				msg : '数据加载中...'
			},
	        store: store,
	        region:'center',
	        border:false,
	        sm:sm,
	        view: new Ext.grid.GroupingView({
            	groupTextTpl: '{text} {[AppUtil.convertIssueStatus(status)]} ({[values.rs.length]} 条)'
       		}),
	        cm: new Ext.grid.ColumnModel({
	        defaults: { sortable: true, width: 60,align:'center'},
	        columns:[expander,sm,new Ext.grid.RowNumberer(),{header : '编号',dataIndex: 'issueID'},
	                 {header : '类型',dataIndex: 'type',
	                     renderer:function(v){
	                         if(v=='1'){
	                             return '缺陷';
	                         }else{
	                             return '新功能';
	                         }
	                 }},
	                 {header : '优先级',dataIndex: 'priority',
	                    renderer:function(v){
	                         if(v=='0'){
	                             return '<span style="color:red;">高</span>';
	                         }else if(v=='1'){
	                             return '中';
	                         }else{
	                            return '低';
	                         }
	                 }},
	                 {header : '模块',dataIndex: 'component',width:100},
	                  {header : '摘要',dataIndex: 'summary',id:'summary'},
	                 {header : '状态',dataIndex: 'status',renderer:function(v){
                          return AppUtil.convertIssueStatus(v);
	                     }
	                  },
	                  {
	                  header:'责任人',dataIndex:'assigneeName',width:100
	                  },
	                 {header : '报告人',dataIndex: 'reporter',renderer:function(v){
	                      if(v){
	                         return v.name;
	                      }
	                      return '';
	                 }},
	                 {header : '报告时间',dataIndex: 'createTime', width:100, hidden:true,xtype:'datecolumn',format:'Y-m-d H:i:s'},
	                 {header : '修复人',dataIndex: 'fixUser',renderer:function(v){
	                      if(v){
	                         return v.name;
	                      }
	                      return '';
	                 }},
	                 {header : '修复时间',dataIndex: 'fixTime', width:100, hidden:true,xtype:'datecolumn',format:'Y-m-d H:i:s'},
	                 {header : '修复验证',dataIndex: 'verifyUser', renderer:function(v){
	                      if(v){
	                         return v.name;
	                      }
	                      return '';
	                 }},
	                 {header : '验证时间',dataIndex: 'verifyTime', width:100, xtype:'datecolumn',format:'Y-m-d H:i:s'},

	               {
	                xtype: 'actioncolumn',
	                width: 100,
	                header:'操作',
	                items: [{
	                    iconCls : 'search',
	                    tooltip: '查看',
	                    handler: function(grid, rowIndex, colIndex) {
	                        var rec = store.getAt(rowIndex);
	                        this.showIssue(rec);
	                    },
	                    scope:this
	                }, {
	                    iconCls   : 'edit',
	                    tooltip: '修改',
	                    handler: function(grid, rowIndex, colIndex) {
	                        var rec = store.getAt(rowIndex);
	                        this.showForm('edit',rec);
	                    },
	                    scope:this
	                }, {
	                    iconCls   : 'history',
	                    tooltip: '历史',
	                    handler: function(grid, rowIndex, colIndex) {
	                        var rec = store.getAt(rowIndex);
	                        this.showHistory(rec);
	                    },
	                    scope:this
	                }]
	            }
	        ]}),
	        stripeRows: true,
	        autoExpandColumn: 'summary',
	        stateful: true,
	        stateId: 'issuegrid',
	        plugins:expander,
	        bbar:new BugOver.UserPagingToolbar({
	             store:store,
	             pageSize:30,
	             items:[{
			            text:'分组',
			            enableToggle:true,
			            pressed:true,
			            iconCls: 'icon-clear-group',
			            handler:function(btn){
			            	if(!btn.pressed){
			                    store.clearGrouping();
			            	}else{
			            	   store.groupBy('status');
			            	}
			            }
			        }]
	        })
	     });
	     return grid;
    },
    showIssue:function(record){
        var me=this,
    	    content=me.ownerCt;

	    if(!record)
		   record = me.grid.selModel.getSelected();
        if(!record){
        	BugOver.Msg.show('提示', '选择一行数据成功！');
			return;
        }
       record.data.statusName=AppUtil.convertIssueStatus(record.data.status);
       var panel=content.add({
       		xtype:'panel',
       		tabWidth:150,
       		buttonAlign:'center',
       		iconCls:'icon-view_detail',
       		closable : true,
            title:'issue:'+record.get('issueID'),
            tpl:new Ext.XTemplate([
				    '<div class="issue-detial">',
				     '<table class="issue-detial-table"  border="1" cellpadding="0" cellspacing="0" width="98%" align="center">',
				     '<tr>',
			             '<th width="80">序号</th><th width="80">类别</th> <th width="80">当前状态</th><th width="80">报告人</th><th width="100">报告时间</th>',
                         '<th width="80">修复人</th> <th width="90">修复时间</th><th width="100">验证人</th><th width="100">验证时间</th>',
		             '</tr>',
                     '<tr>',
                          '<td>{issueID}</td> <td>{[values.type == "1" ? "缺陷" : "新功能"]}</td><td><I>{statusName}</I></td>',
                          '<td>{values.reporter.name}</td> <td>{createTime:date("Y-m-d")}</td>',
           				  '<td>{[values.fixUser? values.fixUser.name:""]}</td> <td>{fixTime:date("Y-m-d")}</td> ',
           				  '<td>{[values.verifyUser? values.verifyUser.name:""]}</td><td>{verifyTime:date("Y-m-d")}</td>',
                     '</tr>',
                     '<tr>',
                        '<th colspan="2" width="100">模块</th><th colspan="7">简要说明</th>',	
                     '</tr>',
                     '<tr>',
       					 '<td colspan="2" >{component}</td><td colspan="7">{summary}</td> ',           	
					'</tr>',
                     '<tr>',
		   				'<td height="auto" colspan="9"> {description}</td>',
		             '</tr>',
		             '<tr>',
		                   '<td colspan="9" height="auto" > 备注: {remark}  </td>',
		             '</tr>',
				     '</table>',
				    '</div>'
				]),
            data:record.data,
            tbar : {
				defaults : {
					 scale: 'medium'
				},
				items : ['->',{
							text : '提交',
							iconCls:'icon-commit',
							handler : function(btn) {
								me.changeStatus('1', record,panel);
							},
							scope : me
						}, '-', {
							text : '驳回',
							iconCls:'icon-reject',
							handler : function(btn) {
								me.changeStatus('2', record,panel);
							},
							scope : me
						},'-', {
							text : '确认',
							iconCls:'icon-mail_receive',
							handler : function(btn) {
								me.changeStatus('3', record,panel);
							},
							scope : me
						},'-', {
							text : '已修复',
							iconCls:'icon-ok',
							handler : function(btn) {
								me.changeStatus('4', record,panel);
							},
							scope : me
						},'-', {
							text : '确认修复',
							iconCls:'icon-accept',
							handler : function(btn) {
								me.changeStatus('5', record,panel);
							},
							scope : me
						}, '-',{
							text : '关闭',
							iconCls:'icon-cross',
							handler : function(btn) {
								me.changeStatus('6', record,panel);
							},
							scope : me
						},'-', {
							text : '历史',
							iconCls:'icon-url_history',
							handler : function(btn) {
								me.showHistory(record);
							},
							scope : me
						}]
			}
       });

       content.activate(panel);

    },
    /**
     * show issue execution history
     * @param {Record} record
     */
    showHistory:function(record){
    	if(!record){
    		record=this.grid.selModel.getSelected();
    	}
    	
        var store = new Ext.data.JsonStore({
        	autoDestroy:true,
        	baseParams:{
        	   issueID:record.get('issueID')
        	},
	        url: BugOver.path+'/issue/history.do',
	        root:'',
	        sortInfo: {
			    field: 'executionID',
			    direction: 'DESC' 
			},
	        fields: [{name:'executionID',type:'int'},'status','remark','userName','description',
	                 {name: 'executeTime', type: 'date', dateFormat: 'Y-m-d\\TH:i:s'}
	        ]
	    });
        new Ext.Window({
           width:700,
           border:false,
           maximizable:true,
           height:400,
           layout:'fit',
           items:[{
              xtype:'grid',
              store:store,
              ref:'grid',
              cm:new Ext.grid.ColumnModel({
              	defaults:{
              		 width    : 75,
              	     sortable : true
              	},
                columns:[ new Ext.grid.RowNumberer(),
                	{ header   : '时间', dataIndex: 'executeTime',xtype:'datecolumn',format:'Y-m-s H:i:s',width:120},
                	{ header   : '用户', dataIndex: 'userName'},
                	{ header   : '描述', dataIndex: 'description',width:300},
                	{ header   : '备注', dataIndex: 'remark',width:150}
                	]
              })
           }],
           listeners:{
               show:function(win){
                   store.load();
               }
           }
        }).show();
    },
    exportWord:function(record){
        if(!record){
    		record=this.grid.selModel.getSelected();
    	}
    	Ext.Ajax.request({
    	     url: BugOver.path+'/issue/word.do', 
    	     params:{issueID:record.get('issueID')},
    	     success:function(re,op){
    	     	var result = Ext.decode(re.responseText);
    	     	if(result.success){
    	     		window.open(result.data,"_blank");
    	     	}else{
    	     	    BugOver.Msg.error(result.message);
    	     	}
    	     	
    	     },
    	     failure:function(re,op){
    	     
    	     }
    	});
    }
});
Ext.reg('issuepanel',BugOver.issue.IssuePanel);