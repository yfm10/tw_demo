ToolGrid=Ext.extend(Ext.grid.GridPanel,{
	loadMask : {
		msg : '数据加载中...'
	},
	region:'center',
	stripeRows : true,
	columnLines : true,
	border:false,
	rowExpanded : false,
	split: true,
	constructor : function(_cfg) {
		this.sm = new Ext.grid.RowSelectionModel({singleSelect : true});
		Ext.apply(this, _cfg);
		this.cm = this.createCM();
		this.ds=new Ext.data.JsonStore({
			    // store configs
			    autoDestroy: true,
			    url: 'get-images.php',
			    storeId: 'myStore',
			    // reader configs
			    root: 'images',
			    idProperty: 'name',
			    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date'}]
			});
		ToolGrid.superclass.constructor.call(this, {
			bbar : new BugOver.UserPagingToolbar({
	             store:this.ds,
	             pageSize:30})
		});
	},
	createCM:function(){
		var columns= [
			new Ext.grid.RowNumberer(), {
				header : '编号',
				width:180,
				dataIndex : 'disrNo',
				renderer:showDI_SRInfoWin
			}, {
				header : '主流程图',
				width:100,
				renderer : showDISRProcessImage
			}, {
				header : '主流程状态',
				width:150,
				dataIndex : 'processStatus'
			}, {
				header : '架次号',
				width:60,
				dataIndex : 'shipNo'
			}, {
				header : '工位号',
				width:60,
				dataIndex : 'workplaceNo'
			},  {
				header : 'AO编号',
				width:180,
				dataIndex : 'itemNo'
			},{
				header : '工序编号',
				width:80,
				dataIndex : 'operationNo'
			}, {
				header : '发起人',
				width:100,
				dataIndex : 'creatUserName'
			}, {
				header : '填写日期',
				width:80,
				dataIndex : 'creatTime',
				renderer : Ext.util.Format.dateRenderer('Y-m-d')
			}, {
				header : '缺陷数量',
				width:80,
				dataIndex : 'allDefectCount'
			}, {
				header : '质保检验',
				width:188,
				dataIndex : 'qcUserName'
			}, {
				header : '授权质保',
				width:100,
				dataIndex : 'qaUserName'
			}];
		return new Ext.grid.ColumnModel({
			columns :columns,
			defaults : {
				sortable : true,
				align : 'center'
			}
		});
	}
});