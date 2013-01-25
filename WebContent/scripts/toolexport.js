Ext.ns('BugOver.toolexport');

 /**
  * @namespace BugOver.toolexport
  * @class BugOver.toolexport.ToolexportPanel
  * @extends Ext.Panel
  */
BugOver.toolexport.ToolexportPanel=Ext.extend(Ext.Panel,{
	 layout:'border',
	 iconCls:'icon-tools24',
     initComponent:function(){
     	  var me=this;
     	  me.initActions();
     	  me.tbar=[{xtype:'textfield'},me.actions[3],'->',me.actions[0],me.actions[1],me.actions[2]];

          BugOver.toolexport.ToolexportPanel.superclass.initComponent.call(this);

          /**
           * 成员表格
           */
          me.grid=this.createGrid();
          /**
           * 查询表单
           */
          me.searchForm=me.createSearchForm();
          me.add(this.grid);
     },
     /**
      * 创建动作列表
      * @method
      */
     initActions:function(){
     	  var me=this;
          this.actions=[{
			    text: '新建',
			    handler: me.showAddWin,
			    iconCls: 'icon-add',
			    scope:me
			},{
			    text: '修改',
			    handler: function(){
			       me.showEditWin();
			    },
			    iconCls: 'icon-edit',
			    scope:me
			},{
			    text: '删除',
			    handler:function(){
			       me.delRecord();
			    },
			    scope:me,
			    iconCls: 'icon-del'
			},{
			    text: '查询',
			    handler: function(){
			    	me.grid.store.load();
			    },
			    scope:this,
			    iconCls: 'icon-search'
			},{
			    text: '高级查询',
			    handler: function(){
			    },
			    iconCls: 'icon-search'
			}];
     },
    createSearchForm:function(){
           return null;
    },
    /**
     * delete toolexport record
     * @param {Record} record
     */
    delRecord : function(record) {
		var me = this, records = [];
		if (!record)
			records = me.grid.selModel.getSelections();
		else {
			records = [record];
		}
		var length = records.length, ids = [];
		if (length > 0) {
			for (var i = 0; i < length; i++) {
				ids.push(records[i].get('userID'));
			}
			Ext.Msg.confirm('删除用户', '确定删除当前选择用户?', function(btn) {
						if (btn == 'yes') {
							Ext.Ajax.request({
										url : BugOver.path + '/toolexport/delToolexports.do',
										params : {
											userIDs : ids
										},
										success : function(re, op) {
											if (Ext.decode(re.responseText).success) {
												BugOver.Msg.show('信息',
														'删除用户成功！');
												me.grid.store.remove(records);
											} else {
												AppUtil.Msg.show('信息',
														'删除用户失败！', 2, 'error');
											}
										},
										failure : function(re, op) {
											BugOver.Msg.show('信息', '删除用户失败！',
													2, 'error');
										},
										scope : me
									});
						}
					}, me);
		}
	},
    showAddWin:function(){
    	var me=this;
    	var win = new BugOver.toolexport.ToolexportWindow({
    		                type:'add',
    		                title:'添加用户',
							buttons : [{
										text : '确定',
										handler : function(btn) {
											me.saveToolexport(btn, win,'add');
										},
										scope : this
									}, {
										text : '取消',
										handler : function(btn) {
											win.close();
										},
										scope : this
									}],
							listeners : {
								afterrender : function(cm) {
									Ext.EventManager.on(cm.getEl(), {
										keyup : function(e) {
											if (Ext.EventObject.ENTER == e.getKey()) {
												me.saveToolexport(win.buttons[0], win,'add');
											}
										},
										scope : me
									}, me);
								},
								scope : me
							}
						}).show();

    },
    /**
     * save toolexport to database
     * @param {Button} btn
     * @param {ToolexportWindow} win
     */
    saveToolexport : function(btn, win,type) {
				var form = win.form.form;
				if (form.isValid()) {
					btn.disable();
					form.submit({
								url : BugOver.path+'/toolexport/'+type+'.do',
								success : function(f, a) {
									BugOver.Msg.show('提示', (type=='add'?'新增':'修改')+'用户成功！');
									win.close();
									this.grid.store.reload();
								},
								failure : function(f, a) {
									BugOver.Msg.error(a.result.message);
									btn.enable();
								},
								scope : this,
								waitMsg : '正在提交数据，稍后...'
							});
				} else {
					BugOver.Msg.show('信息', '请填写完再提交!', 2, 'warning');
				}
	},
    showEditWin:function(record){
        var me=this;
        if(!record)
        	record=me.grid.selModel.getSelected();
        if(record){
            var win = new BugOver.toolexport.ToolexportWindow({
    		                type:'edit',
    		                title:'修改用户',
							buttons : [{
										text : '确定',
										handler : function(btn) {
											me.saveToolexport(btn, win,'update');
										},
										scope : this
									}, {
										text : '取消',
										handler : function(btn) {
											win.close();
										},
										scope : this
									}]
						}).show();
			win.form.form.loadRecord(record);
        }


    },
    createGrid:function(){
    // create the data store
    var store = new Ext.data.JsonStore({
          //url: BugOver.path+'/storeinfo/findAll.do',
          idProperty: 'userID',
          autoDestroy:true,
          root:'root',
          data:{root:[{id:'1',toolName:'坚梯',quantity:1,unit:'XXX',spec:'',ic:'test',expiredate:'2013-1-25',returndate:'2014-1-1',status:'良好',houseid:'库房1',toexpiredate:'110'},
          			  {id:'2',toolName:'2323',quantity:2,unit:'324234',spec:'111',ic:'2323'}]},
          fields: ['id', 'toolNo', 'toolName', 'spec', 'aclevel', 
		  'quantity','status','nextTestdate','ic','houseid','caseNo','remark']
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
        columns:[sm,{header : '编号',dataIndex: 'id'},
                    {header : '工具编号',dataIndex: 'toolNo'},
					{header : '工具名称',dataIndex: 'toolName'},
					{header : '规格',dataIndex: 'spec'},
					{header : '电压等级',dataIndex: 'aclevel'},
					{header : '数量',dataIndex: 'quantity'},
					{header : '目前状态',dataIndex: 'status'},
					{header : '下次试验日期',dataIndex: 'nextTestdate'},
					{header : '标识码',dataIndex: 'ic'},
					{header : '库房名称',dataIndex: 'houseid'},
					{header : '柜子编号',dataIndex: 'caseNo'},
					{header : '备注',dataIndex: 'remark'}
        ]}),
        stripeRows: true,
        // config options for stateful behavior
        stateful: true,
        stateId: 'usergrid'
     });
     return grid;
    }
});
Ext.reg('toolexportpanel',BugOver.toolexport.ToolexportPanel);

/**
 * @namespace BugOver.toolexport
 * @class BugOver.toolexport.ToolexportWindow
 * @extends Ext.Window
 * add and edit toolexport window
 */
BugOver.toolexport.ToolexportWindow = Ext.extend(Ext.Window, {
			width : 400,
			height : 300,
			layout : 'fit',
			type:'add',
			buttonAlign:'center',
			initComponent : function() {
				BugOver.toolexport.ToolexportWindow.superclass.initComponent.call(this);
				var me = this;
				/**
				 * toolexport form
				 */
				me.form = me.createForm();
				me.add(me.form);
				if(me.type=='edit'){
				   me.form.add([{name : 'userID',xtype : 'hidden'},
				                {name : 'password',xtype : 'hidden'}]);
				}else{
				   me.form.add( [{
										name : 'password',
										id : 'house_password1',
										fieldLabel : '密码',
										value:12345,
										inputType : 'password'
									}, {
										name : 'vtype_user_password',
										inputType : 'password',
										value:12345,
										fieldLabel : '确认密码',
										password : {
											password_id : 'house_password1'
										},
										vtype : 'password'
									}]);
				}
			},
			/**
			 * create toolexport formpanel
			 *
			 * @method
			 */
			createForm : function() {
				return new Ext.FormPanel({
							padding : '5px 5px 3px',
							autoHeight : true,
							baseCls : 'x-plain',
							labelWidth : 70,
							labelAlign : 'right',
							defaultType : 'textfield',
							defaults : {
								allowBlank : false,
								anchor : '100%'
							},
							items : [{
										fieldLabel : '编号',
										name : 'userNo',
										maxLength : 32
									}, {
										fieldLabel : '姓名',
										name : 'name',
										maxLength : 32
									}, {
										fieldLabel : '电子邮件',
										vtype : 'email',
										allowBlank : true,
										name : 'email'
									}, {
										fieldLabel : '电话',
										xtype : 'numberfield',
										maxLength:11,
										allowBlank : true,
										name : 'telephone'
									}, {
										xtype : 'checkbox',
										anchor : '95%',
										checked : true,
										inputValue : 'Y',
										name : 'isValid',
										fieldLabel : '是否有效'
									}]
						});
			}
		});
/**
 * @namespace BugOver.toolexport
 * @class BugOver.toolexport.SelectToolexportWin
 * @extends Ext.Window
 */
BugOver.toolexport.SelectToolexportWin=Ext.extend(Ext.Window,{
   width:400,
   height:400,
   layout:'fit',
   buttonAlign:'center',
   initComponent:function(){
       BugOver.toolexport.SelectToolexportWin.superclass.initComponent.call(this);
       this.grid = this.createGrid();
       this.add(this.grid);
       this.on('show',function(w){w.grid.store.load();});
   },
   createGrid:function(){
	    // create the data store
	    var store = new Ext.data.JsonStore({
	          url: BugOver.path+'/toolexport/findAll.do',
	          idProperty: 'userID',
	          root:'root',
	          fields: ['userNo', 'name','userID',
	                   'password','email',
	                   'telephone','roles',
	                   'isValid']
	    });

	    var sm = new Ext.grid.CheckboxSelectionModel();
	    // create the Grid
	    var grid = new Ext.grid.GridPanel({
	    	loadMask : {
				msg : '数据加载中...'
			},
	        store: store,
	        region:'center',
	        border:false,
	        sm:sm,
	        cm: new Ext.grid.ColumnModel({
	        defaults: { sortable: true, width:100,align:'center'},
	        columns:[sm,new Ext.grid.RowNumberer(),{header : '编号',dataIndex: 'userNo'},
	                 {header : '名称',dataIndex: 'name'}]
             }),
	        stripeRows: true,
	        stateful: true,
	        stateId: 'seletedusergrid'
	     });
	     return grid;
   },
   hasSelection:function(){
      return this.grid.selModel.hasSelection();
   },
   getSelectedToolexportIDs:function(){
          var records=this.grid.selModel.getSelections(),
              length=records.length,
              ids=[];
          if(length>0){
               Ext.each(records,function(r){
                  ids.push(r.get('userID'));
               });
          }
          return ids;
   }
});