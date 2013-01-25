Ext.ns('BugOver.user');

 /**
  * @namespace BugOver.user
  * @class BugOver.user.UserPanel
  * @extends Ext.Panel
  */
BugOver.user.PersonPanel=Ext.extend(Ext.Panel,{
	 layout:'border',
	 iconCls:'icon-group',
     initComponent:function(){
     	  var me=this;
     	  me.initActions();
     	  me.tbar=['<b>当前个人出库工具</b>','->',me.actions[0]];

         BugOver.user.PersonPanel.superclass.initComponent.call(this);

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
			    text: '修改密码',
			    handler: function(){
			       me.showEditWin();
			    },
			    iconCls: 'icon-edit',
			    scope:me
			}];
     },
    createSearchForm:function(){
           return null;
    },
    /**
     * delete user record
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
										url : BugOver.path + '/user/delUsers.do',
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
    createGrid:function(){
    // create the data store
    var store = new Ext.data.JsonStore({
          //url: BugOver.path+'/role/findAll.do',
          idProperty: 'roleID',
          autoDestroy:true,
          root:'root',          
          fields: ['remarks', 'name','roleID'],
          data:{
		    root: [
		        {name: '系统管理员', roleID:1},
		        {name: '库房管理员', roleID:2,remarks:'管理库房物料'},
		        {name: '普通用户', roleID:3}
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
		iconCls:'icon-grid',		
        store: store,
        region:'center',
        border:false,
        cm: new Ext.grid.ColumnModel({
        defaults: { sortable: true, width:100,align:'center'},
        columns:[sm,new Ext.grid.RowNumberer(),
                 {header : '名称',dataIndex: 'name'},
                 {header : '备注',dataIndex: 'remarks',width:250}]
        }),
        stripeRows: true,
        stateful: true,
        stateId: 'rolegrid'
     });
     return grid;
    }
});
Ext.reg('personpanel',BugOver.user.PersonPanel);
