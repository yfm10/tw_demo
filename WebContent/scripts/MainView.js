Ext.ns('BugOver');

/**
 * @namespace BugOver
 * @class BugOver.MainView
 * @extends Ext.Viewport
 * Desktop Main View
 */
BugOver.MainView=Ext.extend(Ext.Viewport,{
      layout : 'border',
	  title : 'BugOver',
	  initComponent:function(){
          BugOver.MainView.superclass.initComponent.call(this);
          var me=this;
          me.centerContent=new Ext.TabPanel({
									region : 'center',
									border : true,
									split : true,
									margins : '1 3 3 0',
									xtype : 'tabpanel',
									activeTab: 0,
									tabMargin:5,
									id:'maintab',
									resizeTabs:true, // turn on tab resizing
       								enableTabScroll:true,
									minTabWidth : 90,
									tabWidth : 130,
									defaults:{autoScroll:true},
									items : [{
						                title: '报警信息',
						                border:false,
						                ref:'issue',
						                id:'issuepanel',
						                xtype:'issuepanel'}
									],listeners: {
							            'tabchange': function(tabPanel, tab){
							                // Ignore tab1 since it is a separate tab panel and we're managing history for it also.
							                // We'll use its handler instead in that case so we don't get duplicate nav events for sub tabs.
							                if(tab.id != 'tab1'){
							                    Ext.History.add(tabPanel.id + ':' + tab.id);
							                }
							            }
							        }
								});
	   me.add({
				//xtype : 'box',
	   	        id:'northhearder',
				region : 'north',
				ref:'appheader',
				collapseMode : 'mini',
				collapsible: false,
				html:['<div id="header">',									     
					  '<h1>工具库房信息管理系统</h1>',
	                  '<div class="header_r" id="header_right" >',
	                  '</div>',
					  '</div>'
				].join(''),
				height : 56
			}, me.createNavigation(),me.centerContent);
	    //alies
        var content=me.centerContent;
        
		me.on('afterrender', function(p) {
					me.createHeadermenus();
					 // Handle this change event in order to restore the UI to the appropriate history state
				    Ext.History.on('change', function(token){
				        if(token){
				            var parts = token.split(':');				            
				            var tabId = parts[1];
				            var tabPanel =me.centerContent.getComponent(tabId);
				            if(tabPanel){
				               me.centerContent.setActiveTab(tabId);
				            }else{
				                
				            }
				        }else{
				            // This is the initial default state.  Necessary if you navigate starting from the
				            // page without any existing history token params and go back to the start state.
				            me.centerContent.setActiveTab(0);
				        }
				    });
					//content.issue.grid.store.load();
				});
	  },
	  /**
	   * create header menu
	   */
	  createHeadermenus:function(){
	  		var me=this;
	      //首页右上角菜单
	        me.headermenus=new Ext.ux.DockItemList({
	           renderTo:'header_right',
	           width:200,
	           hAlign:'right',
	           items:[{
	              text:'个人信息',
	              tip:'个人信息',
	              icon:BugOver.path+"images/dock/system_users.gif",
	              handler:function(b){
	                    me.addOrShowTab('personinfo', {
								title : '个人信息',
								status:'0',
								xtype : 'personpanel',
								closable : true,
								listeners:{
										  afterrender:function(p){
										    //p.grid.store.load();
										  }
										}
							}); 
	              },
	              scope:me
	           },{
	              tip:'报警信息',
	              count:10,
	              icon:BugOver.path+"images/dock/warning.gif",
	              handler:function(b){  
	                  me.addOrShowTab('noticeinfo', {
								title : '报警信息',
								status:'0',								
								xtype : 'noticepanel',
								closable : true,
								listeners:{
										  afterrender:function(p){
										     p.grid.store.load();
										  }
										}
							}); 
	              },
	              scope:me
	           },{
	              text:'退出',
	              tip:'退出',
	              icon:BugOver.path+"images/dock/logout.png",
	              handler:function(b){
	                 Ext.Msg.confirm('退出','确定退出？',function(btn){
				      	if (btn == 'yes') {
				      		  new Ext.LoadMask(Ext.getBody(), {msg:"正在退出..."}).show();
				      		   Ext.Ajax.request({
				      		   	   url:BugOver.path+'/user/logout.do',
				      		       success:function(re,op){	
				      		           Ext.util.Cookies.clear('curUserNo');
				      		           window.location.reload();
				      		       },
				      		       failure:function(re,op){
				      		           BugOver.Msg.error('系统错误，请求失败！');
				      		       }
				      		   });
				             
				      	 }
				      });
	              }
	           }],
	           listeners:{
	              afterrender:function(t){
	                  me.initUpdateTask(t);
	              }
	           }
	        });
	  },
	  initUpdateTask:function(t){     
		/*var task = {
		    run: function(){
		        Ext.Ajax.request({
		        	    disableCaching:false,
	                    url:BugOver.path+'data/unReadNum.do',
	                    success:function(r,o){
	                       var res=Ext.decode(r.responseText);
	                       if(res.success){
	                            t.updateNotice(1,res.total);
	                       }
	                    }
	                  });
	            Ext.Ajax.request({
	                    url:BugOver.path+'data/unReadNoticeNum.do',
	                    success:function(r,o){
	                       var res=Ext.decode(r.responseText);
	                       if(res.success){
	                            t.updateNotice(2,res.total);
	                       }
	                    }
	                  });
		    
		    },
		    interval: 120000 
		};
		Ext.TaskMgr.start(task);*/
	      
	  },
	  /**
	   * create navigation panel
	   * @return {Object}
	   */
	  createNavigation:function(){
	  	    var me =this;
	  		return {
	            title: '导航',
	            id:'westnavigation',
	            region: 'west',
	            //split: true,
	            iconCls:'icon-compass24',
	            //collapsed:true,	         
	            border : true,
	            layout:'accordion',
	            width: 120,
	            collapseMode : 'mini',
	            margins:'1 3 3 3',
	            items:[me.createUsersMenu(),me.createSystemMenu(),
	            		me.createHouseMenu(),me.createToolsMenu(),
	            	    me.createStatisticsMenu()]};
	  },
	  createSystemMenu:function(){
	  	   var me=this;
	       return {
	                xtype:'panel',
	                title:'系统管理',
	                border:false,
	                iconCls:'icon-system24',
	                bodyStyle : 'background-color:#DEECFD;',
	            	listeners:{
	                afterrender:function(p){
	                     me.westmenus=new Ext.ux.DockItemList({
					           renderTo:p.body.id,
					           style:'top:10px;',
					           hAlign:'center',
					           ownerCt:p,
					           orient:'vertical',
					           showText:true,
					           scale:'large',
					           items:[{
					              text:'库房基本信息',
					              icon:BugOver.path+"images/dock/issues.png",
					              handler:function(b){
					                  me.addOrShowTab('houseinfo', {
									                title: '库房基本信息',
									                xtype:'housepanel',
									                closable:true
									            }
					              	   );
					              },
					              scope:me
					           },{
					              text:'工具分类信息',
					              icon:BugOver.path+"images/dock/projects.png",
					              handler:function(b){
					                 // BugOver.Msg.show('提示','该功能未实现'); 
					                   me.addOrShowTab('toolcategories', {
									                title: '工具分类信息',
									                xtype:'toolcategoriespanel',
									                closable:true
									            }
					              	   );
					              },
					              scope:me
					           },{
					              text:'系统权限',
					              icon:BugOver.path+"images/dock/task.png",
					              handler:function(b){
					                   me.addOrShowTab('authsys', {
											title : '系统权限',
											status:'B',
											xtype : 'authsyspanel',
											closable : true,
											listeners:{
													  afterrender:function(p){
													     //p.grid.store.load();
													  }
													}
										}); 
					              },
					              scope:me
					           }]
					        });
	               }
	            }
	            };
	  },
	  createUsersMenu:function(){
	      var me =this;
	      return{
                title: '用户管理',
                iconCls:'icon-people24',
                border:false,
	            bodyStyle : 'background-color:#DEECFD;',
	            listeners:{	           
	            afterrender:function(p){
	                  new Ext.ux.DockItemList({
					           renderTo:p.body.id,
					           style:'top:10px;',
					           ownerCt:p,
					           hAlign:'center',
					           orient:'vertical',
					           showText:true,
					           scale:'large',
					           items:[{
					              text:'角色管理',
					              icon:BugOver.path+"images/dock/user_group.png",
					              handler:function(b){
					                   me.addOrShowTab('rolemanage', {
									                title: '角色管理',
									                xtype:'rolepanel',
									                closable:true
									            }
					              	   );  
					              },
					              scope:me
					           },{
					              text:'成员管理',
					              icon:BugOver.path+"images/dock/people.png",
					              handler:function(b){
					              	   me.addOrShowTab('usermanage', {
									                title: '用户信息管理',
									                xtype:'userpanel',
									                closable:true
									            }
					              	   );       
					              },
					              scope:me
					           }]
					        });
	               }
	            }
            };
	  },
	  createHouseMenu:function(){
	      var me =this;
	      return{
                title: '库房管理',
                iconCls:'icon-home24',
                border:false,
	            bodyStyle : 'background-color:#DEECFD;',
	            listeners:{	           
	            afterrender:function(p){
	                  new Ext.ux.DockItemList({
					           renderTo:p.body.id,
					           style:'top:10px;',
					           ownerCt:p,
					           hAlign:'center',
					           orient:'vertical',
					           showText:true,
					           scale:'large',
					           items:[{
					              text:'库存基本信息',
					              icon:BugOver.path+"images/dock/home.png",
					              handler:function(b){
					                   me.addOrShowTab('storeinfo', {
									                title: '库存基本信息',
									                xtype:'storeinfopanel',
									                closable:true
									            }
					              	   );  
					              },
					              scope:me
					           },{
					              text:'库房平面图',
					              icon:BugOver.path+"images/dock/home_p.png",
					              handler:function(b){
					              	   me.addOrShowTab('storeplaninfo', {
									                title: '库房平面图',
									                xtype:'storeplaninfopanel',
									                closable:true
									            }
					              	   );      
					              },
					              scope:me
					           },{
					              text:'视频监控',
					              icon:BugOver.path+"images/dock/monitor.gif",
					              handler:function(b){
					              	   me.addOrShowTab('videomanage', {
									                title: '库房视频监控',
									                xtype:'videopanel',
									                closable:true
									            }
					              	   );       
					              },
					              scope:me
					           }]
					        });
	               }
	            }
            };
	  },
	  createToolsMenu:function(){
	      var me =this;
	      return{
                title: '工具管理',
                iconCls:'icon-tools24',
                border:false,
	            bodyStyle : 'background-color:#DEECFD;',
	            listeners:{	           
	            afterrender:function(p){
	                  new Ext.ux.DockItemList({
					           renderTo:p.body.id,
					           style:'top:10px;',
					           ownerCt:p,
					           hAlign:'center',
					           orient:'vertical',
					           showText:true,
					           scale:'large',
					           items:[{
					              text:'工具入库',
					              icon:BugOver.path+"images/dock/folder_add.gif",
					              handler:function(b){
					                    me.addOrShowTab('toolimport', {
									                title: '工具入库',
									                xtype:'toolimportpanel',
									                closable:true
									            }
					              	   );  
					              },
					              scope:me
					           },{
					              text:'工具出库',
					              icon:BugOver.path+"images/dock/folder_remove.png",
					              handler:function(b){
					              	   me.addOrShowTab('toolexport', {
									                title: '工具出库',
									                xtype:'toolexportpanel',
									                closable:true
									            }
					              	   );    
					              },
					              scope:me
					           },{
					              text:'工具试验',
					              icon:BugOver.path+"images/dock/folder_verified.png",
					              handler:function(b){
					              	   me.addOrShowTab('usermanage', {
									                title: '工具试验管理',
									                xtype:'userpanel',
									                closable:true
									            }
					              	   );       
					              },
					              scope:me
					           }]
					        });
	               }
	            }
            };
	  },
	  createStatisticsMenu:function(){
	      var me =this;
	      return {
                title: '库房统计',
                iconCls:'icon-stats24',
                border:false,
                //autoScroll:true,
	            bodyStyle : 'background-color:#DEECFD;',
	            listeners:{	           
	            afterrender:function(p){
	                  new Ext.ux.DockItemList({
					           renderTo:p.body.id,
					           style:'top:10px;',
					           ownerCt:p,
					           hAlign:'center',
					           orient:'vertical',
					           showText:true,
					           scale:'large',
					           items:[{
					              text:'库存明细',
					              icon:BugOver.path+"images/dock/table.gif",
					              handler:function(b){
					                   me.addOrShowTab('rolemanage', {
									                title: '库存基本信息查询',
									                xtype:'rolepanel',
									                closable:true
									            }
					              	   );  
					              },
					              scope:me
					           },{
					              text:'出入库明细',
					              icon:BugOver.path+"images/dock/table_information.gif",
					              handler:function(b){
					              	   me.addOrShowTab('usermanage', {
									                title: '工具出库查询',
									                xtype:'userpanel',
									                closable:true
									            }
					              	   );       
					              },
					              scope:me
					           },{
					              text:'工器具试验',
					              icon:BugOver.path+"images/dock/table_star.gif",
					              handler:function(b){
					              	   me.addOrShowTab('usermanage', {
									                title: '工器具试验查询',
									                xtype:'userpanel',
									                closable:true
									            }
					              	   );       
					              },
					              scope:me
					           },{
					              text:'工器具超期使用',
					              icon:BugOver.path+"images/dock/table_error.gif",
					              handler:function(b){
					              	   me.addOrShowTab('usermanage', {
									                title: '工器具试验查询',
									                xtype:'userpanel',
									                closable:true
									            }
					              	   );       
					              },
					              scope:me
					           },{
					              text:'工器具报废',
					              icon:BugOver.path+"images/dock/table_delete.gif",
					              handler:function(b){
					              	   me.addOrShowTab('usermanage', {
									                title: '工器具报废查询',
									                xtype:'userpanel',
									                closable:true
									            }
					              	   );       
					              },
					              scope:me
					           }]
					        });
	               }
	            }
            };
	  },
	  addOrShowTab : function(id, panelConfig) {   
        var me=this,
        	main=me.centerContent,
        	tab = this.getComponent(id);
        if (tab)
        {
            main.setActiveTab(tab);
        }
        else
        {  
        	 panelConfig.id=id;
	         tab=main.add(panelConfig);
	         main.setActiveTab(tab);
        }
        return tab;
      }
});