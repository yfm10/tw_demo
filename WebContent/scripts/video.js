Ext.ns('tw.house');

 /**
  * @namespace BugOver.user
  * @class BugOver.user.UserPanel
  * @extends Ext.Panel
  */
tw.house.VideoPanel=Ext.extend(Ext.Panel,{
	 layout:'border',
	 iconCls:'icon-camera',
     initComponent:function(){
     	  var me=this;
     	  me.initActions();
     	  me.tbar=['->',me.actions[0],me.actions[1],me.actions[2]];

          tw.house.VideoPanel.superclass.initComponent.call(this);

          /**
           * 成员表格
           */
          me.grid=this.createGrid();
          /**
           * 查询表单
           */
          me.form=me.createForm();
          me.add([me.grid,me.form]);
     },
     /**
      * 创建动作列表
      * @method
      */
     initActions:function(){
     	  var me=this;
          this.actions=[{
			    text: '添加',
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
			}];
     },
     createForm:function(){
         return  new Ext.FormPanel({
	        iconCls:'form',
	        region:'east',
	        width:250,
	        labelAlign: 'right',
	        title: '库房详细信息',
	        iconCls:'icon-form',
            defaultType: 'textfield',
            labelWidth: 60,
            hidden:true,
            autoHeight:true,
            margins:'1 2 2 3',
            padding:'5',
            defaults:{
            	anchor:'99%'            
            },
            items: [{
                fieldLabel: 'IP地址',
                name: 'address'
            },{
                fieldLabel: '端口',
                name: 'port'
            },{
			        displayField:'name',
			        typeAhead: true,
			        mode: 'local',
			        xtype:'combo',
			        fieldLabel:'库房',
			        forceSelection: true,
			        triggerAction: 'all',
			        emptyText:'选择库房...',
			        selectOnFocus:true,
			        store:new Ext.data.ArrayStore({
				        fields: ['name'],
				        data : [['工具库房一'],['工具库房二'],['工具库房三']]
				    })
			    }
            ],
            buttons:[{text:'保存'},{text:'关闭',handler:function(){
               this.form.hide();
               this.doLayout();
            },scope:this}]
    });
    },
    /**
     * delete user record
     * @param {Record} record
     */
    delRecord : function(record) {
	},
    showAddWin:function(){
    	var me=this;
    	me.form.show();
    	me.doLayout();
    },
    showEditWin:function(record){
        var me=this;
        if(!record)
        	record=me.grid.selModel.getSelected();
        if(record){   
			win.form.form.loadRecord(record);
        }
    },
    createGrid:function(){
    // create the data store
    var store = new Ext.data.JsonStore({
          //url: BugOver.path+'/role/findAll.do',
          autoDestroy:true,
          root:'root',          
          fields: ['address', 'port','houseName'],
          data:{
		    root: [
		        {address: '192.168.1.120', port:8888,houseName:'工具库房一'},
		        {address: '192.168.1.123', port:2343,houseName:'工具库房二'},
		        {address: '192.168.1.123', port:3434,houseName:'工具库房二'}
		    ]
		}
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
        columns:[sm,new Ext.grid.RowNumberer(),
                 {header : '地址',dataIndex: 'address',width:100},
                 {header : '端口',dataIndex: 'port',width:80},
                 {header : '库房',dataIndex: 'houseName',width:250},
                 {
            xtype: 'actioncolumn',
            width: 80,
            header:'观看视频',
            items: [
                {
                    iconCls   : 'search',
                    tooltip: '观看现场视频',
                    handler: function(grid, rowIndex, colIndex) {
                    	var re=grid.store.getAt(rowIndex);
                        new Ext.Window({
                        	 iconCls:'icon-camera',
                             title:re.get('houseName'),
                             width:510,
                             height:400,
                             html:'<img src="data/housevideo.jpg">'
                        }).show();
                    }
                }
            ]
        }]
        }),
        stripeRows: true,
        stateful: true,
        stateId: 'videogrid',
        bbar:new BugOver.UserPagingToolbar({
	             store:store,
	             pageSize:30})
     });
     return grid;
    }
});
Ext.reg('videopanel',tw.house.VideoPanel);

	
