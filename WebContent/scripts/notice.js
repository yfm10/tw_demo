Ext.ns('BugOver.base');

/**
 * @namespace BugOver.base
 * @class BugOver.base.NoticePanel
 * @extends Ext.Panel
 *  通知公告面板
 * @author young 
 * @date 2012-07-13
 */
BugOver.base.NoticePanel=Ext.extend(Ext.Panel,{
	 layout:'border',
	 iconCls:'icon-messages',
	 status:'A',
     initComponent:function(){
     	  var me=this;
     	  me.initActions();
     	  me.createTbar();
     	  
          BugOver.base.NoticePanel.superclass.initComponent.call(this);

          me.grid=this.createGrid();
          me.add(this.grid);
          me.grid.store.on('beforeload',function(ds){
              ds.setBaseParam('status',me.searchCombo.getValue());
              ds.setBaseParam('text',me.searchField.getValue());
          },me);
          
          me.gridmenu = new Ext.menu.Menu({
             items: [me.actions[3],me.actions[0],me.actions[1],me.actions[2]]
		    });
		    
          me.grid.on({
					rowclick: function(grid, index, e) {
					},
					rowcontextmenu : function(grid, row, e) {
						// 树右键菜单
						e.preventDefault();
						me.gridmenu.showAt(e.getPoint());
					},
					rowdblclick : function(grid, row, e) {
                         var rec=grid.store.getAt(row);
                         me.showDetail(rec);
					},
					scope : me
				});
	      me.grid.selModel.on('selectionchange',function(sel){
		  	      var record=sel.getSelected();
                  if(record){                                        
					   me.actions[1].enable();
					   if(record.get('authorID')==BugOver.curUserID){
					       me.actions[1].enable();
					       me.actions[2].enable();
					   }else{
					       me.actions[1].disable();
					       me.actions[2].disable();   
					   }
                       me.actions[3].enable();          
                  }else{
                       me.actions[1].disable();
                       me.actions[2].disable();
                       me.actions[3].disable();                  
                  }
		  },me);
     },
     /**
      * 创建动作列表
      * @method
      */
     initActions:function(){
     	  var me=this,actions=[{
			    text: '新建',
			    handler: function(){
			       me.showForm();
			    },
			    iconCls: 'icon-add',
			    scope:me
			},{
			    text: '修改',
			    disabled:true,
			    handler:  function(){
                    me.showForm('edit');
			    },
			    iconCls: 'icon-edit',
			    scope:me
			},{
			    text: '删除',
			    handler:function(){
			       me.delRecord();
			    },
			    disabled:true,
			    scope:me,
			    iconCls: 'icon-del'
			},{
			    text: '查看',
			    disabled:true,
			    handler: function(){
			    	this.showDetail();
			    },
			    scope:me,
			    iconCls: 'icon-search'
			}];
			
			me.actions=[];
			Ext.each(actions,function(n){
			    me.actions.push(new Ext.Action(n));
			},me);
			
     },
    createSearchForm:function(){
           return null;
    },
    createTbar : function() {
		var me = this;
		me.searchCombo = new Ext.form.ComboBox({
		        store: new Ext.data.ArrayStore({
			        fields: ['value', 'state'],
			        data : [['A','所有'],['0','未读'],['1','已读']]
			    }),
			    width:150,
		        displayField: 'state',
		        typeAhead: true,
		        mode: 'local',
		        value:'A',
		        valueField:'value',
		        triggerAction: 'all',
		        value:me.status,
		        selectOnFocus: true
		    });
		me.searchField=new Ext.form.TwinTriggerField({
					validationEvent : true,
					validateOnBlur : false,
					trigger1Class : 'x-form-clear-trigger',
					trigger2Class : 'x-form-search-trigger',
					hideTrigger1 : true,
					width:200,
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
						var v=this.getRawValue().trim();
						if(v.length>1){
						   this.triggers[0].show();
						}
						me.grid.store.load({params:{
							 status:me.searchCombo.getValue(),
						     text:this.getRawValue()
						}});
						this.hasSearch = true;
        				
					}
				});
		me.tbar=['Search',me.searchCombo,' for',me.searchField,'->',me.actions[3],me.actions[0],me.actions[1],me.actions[2]];
	},
    /**
     * delete user record
     * @param {Record} record
     */
    delRecord : function(record) {
		var me = this;
		if (!record)
			record = me.grid.selModel.getSelected();
		if(!record){
		   return;
		}
		Ext.Msg.confirm('删除', '确定删除当前数据?', function(btn) {
						if (btn == 'yes') {
							Ext.Ajax.request({
										url : BugOver.path + '/base/delNotice.do',
										params : {
											noticeID :record.get('noticeID')
										},
										success : function(re, op) {
											if (Ext.decode(re.responseText).success) {
												BugOver.Msg.show('信息',
														'删除成功！');
												me.grid.store.remove(record);
											} else {
												AppUtil.Msg.show('信息',
														'删除失败！', 2, 'error');
											}
										},
										failure : function(re, op) {
											BugOver.Msg.show('信息', '删除失败！',
													2, 'error');
										},
										scope : me
									});
						}
					}, me);	
	},
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
					title :(type?'修改':'新增')+ '消息公告',
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
								fieldLabel : '标题',
								xtype : 'textfield',
								anchor:'98%',
								allowBlank:false,
								name : 'title'
							}, {
								fieldLabel : '内容',
								name : 'content',
								allowBlank:false,
								anchor : '98% 80%',
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
							}/*, {
								fieldLabel : '发送所有',
								anchor : '90%',
								xtype : 'textarea',
								name:'remark'
							}*/],
					buttons : [/*{
								text : '存草稿',
								handler:function(){
                                    me.saveNotice(form,'draft');
								},
								scope:me
							},*/ {
								text : '发布',
								handler:function(){
                                    me.saveNotice(form,'commit');
								},
								scope:me
							},{
								text : '保存',
								hidden:true,
								handler:function(){
                                    me.saveNotice(form,'save');
								},
								scope:me
							},{
								text : '取消',
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
            	    name:'noticeID'
            	});

                form.form.loadRecord(record);
                var status=record.get('status');
                if(status=='0'){
                	//form.buttons[0].show();
                	form.buttons[0].show();
                }else{
                    form.buttons[1].show();
                    //form.buttons[0].hide();
                    form.buttons[0].hide();
                    form.add({
            	       xtype:'hidden',
            	       name:'status',
            	       value:status
            	   });
                }

            }

    },
    /**
     * save notice to database
     * @param {Button} btn
     * @param {UserWindow} win
     */
    saveNotice : function(form,type) {
    	 var me=this,
    	    content=me.ownerCt,
 			basic = form.form;
 			params={status:type=='draft'?'0':'1' };
            
 			if('save'==type){
               params={};
 			}
			if (basic.isValid()) {
					basic.submit({
								url : BugOver.path+'/base/'+(type=='save'?'updateNotice':'addNotice')+'.do',
								params:params,
								success : function(f, a) {
									BugOver.Msg.show('提示', (type=='save'?'修改':'新增')+'信息成功！');
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
    createGrid:function(){
    // create the data store
    var store = new Ext.data.JsonStore({
          url: BugOver.path+'/base/findNotice.do',
          idProperty: 'noticeID',
          autoDestroy:true,
          root:'root',
          fields: ['noticeID','title', 'content',
          			'status','author','authorID',
                    'noticeStatus',{name:'statusID',mapping:'id'},
                   {name:'createTime', type:'date',dateFormat :'Y-m-d\\TH:i:s'},
                   {name:'modifyTime', type:'date',dateFormat :'Y-m-d\\TH:i:s'},
                   {name:'noticeModifyTime', type:'date',dateFormat :'Y-m-d\\TH:i:s'}]
    });

    // manually load local data
    // create the Grid
      var sm = new Ext.grid.CheckboxSelectionModel();
    var grid = new Ext.grid.GridPanel({
    	loadMask : {
			msg : '数据加载中...'
		},
		sm:sm,
        store: store,
        region:'center',
        border:false,
        cm: new Ext.grid.ColumnModel({
        defaults: { sortable: true, width:100,align:'center'},
        columns:[sm,
                 {header : '主题',dataIndex: 'title',width:300},
                 {header : '发布人',dataIndex: 'author'},
                 {header : '发布时间',dataIndex: 'modifyTime',hidden:true,xtype:'datecolumn',format:'Y-m-d H:i:s'},
                 {header : '状态',dataIndex: 'status',renderer:function(v){
                 	 //0 未读 1已读，2删除
                     if (v == '1') {
			            return '<span style="color:green;">已读</span>';
			         } else if (v == '0') {
			            return '<span style="color:red;">未读</span>';
			         }else if (v == '2') {
			            return '<span style="color:gray;">删除</span>';
			         }

                 }},
               {
                xtype: 'actioncolumn',
                items: [ {
                    iconCls   : 'search',
                    tooltip: '查看',
                    handler: function(grid, rowIndex, colIndex) {
                      var rec = store.getAt(rowIndex);
                        this.showDetail(rec);
                    },
                    scope:this
                }]
            }
        ]}),
        stripeRows: true,
        // config options for stateful behavior
        stateful: true,
        stateId: 'noticegrid',
        bbar:new BugOver.UserPagingToolbar({
	             store:store,
	             pageSize:30})
     });
     return grid;
    },
    showDetail:function(record){
    	  var me=this,
    	    content=me.ownerCt;
    	if(!record)
		   record = me.grid.selModel.getSelected();
		   
        if(!record){
        	BugOver.Msg.show('提示','请选择一条数据！');
           	return;
        }
          
        var panel=content.add({
       		xtype:'panel',
       		tabWidth:150,
       		buttonAlign:'center',
       		iconCls:'icon-message',
       		closable : true,
            title:'notice:'+record.get('noticeID'),
            tpl : new Ext.XTemplate([
					'<div class="noticedetial">',
					     '<h1>{title}</h1>',
					     '<div class="pubDate">',
					       '<span class="opts" style="float:right;">{[values.status == "1" ? "已读" : "未读"]}</span>',
					       '{author} 发布于: {noticeModifyTime:date("Y-m-d H:i:s")}  序号{noticeID}',
					    '</div>',
					     '<div class="content">{content} </div>',
					 '</div>']),
            data:record.data,
            tbar:[],
            listeners:{
                afterrender:function(){
                	//标志为已读
                    if(record.get('status')=='0'){
                        Ext.Ajax.request({
										url : BugOver.path + '/base/markNoticeStatus.do',
										params : {
											noticeUserID :record.get('statusID'),
											status:'1'
										},
										success : function(re, op) {
											if (Ext.decode(re.responseText).success) {
												record.set('status','1');
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

Ext.reg('noticepanel',BugOver.base.NoticePanel);