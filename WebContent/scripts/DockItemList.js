
Ext.ns('Ext.ux');
/**
 * @namespace Ext.ux
 * @class Ext.ux.DockItemList
 * @extends Ext.util.Observable
 * menu button like web qq
 * @author young
 */
Ext.ux.DockItemList = Ext.extend(Ext.util.Observable, {
    //------------------------------------------------------------
    // config options
    //------------------------------------------------------------
    /**
     * @cfg {Array} items Array of fisheye menu config object items.
     */
    items : [],

	/**
	 * @cfg {Mixed} renderTo The container element.
	 */
	renderTo : document.body,

    /**
     * @cfg {Number} itemWidth The minimum width for each menu item.
     */
    itemWidth : 48,

    /**
     * @cfg {Number} vicinity The vicinity from element that make item interaction.
     */    
    vicinity : 15,

    /**
     * @cfg {String} hAlign Horizontal alignment (left|center|right).
     */
    hAlign : 'left',

    /**
     * @cfg {String} vAlign Vertical alignment (top|bottom).
     */
    vAlign : 'bottom',

	/**
	 * @cfg {Boolean} showText To show menu item title or not.
	 */
	showText : false,
	/**
	 * the button orientation horizontal or vertical
	 * @type String
	 */
	orient:'horizontal',
	/**
	 * button scale large,medium,small
	 * @type String
	 */
	scale:'medium',
	
	style:'',
    //------------------------------------------------------------
    // class constructor
    //------------------------------------------------------------
    /**
     * @constructor
     * @param config
     * @private
     */
    constructor : function(config) {
        Ext.apply(this, config);
        
        this.addEvents({
            'beforerender' : true,
            'afterrender' : true
        });
        Ext.ux.DockItemList.superclass.constructor.call(this);
        // initialize
        this.init();
    },

    //------------------------------------------------------------
    // public/private methods
    //------------------------------------------------------------
    /**
     * @private
     */
    init : function() {
    	var me=this;
		// properties
        me.el = Ext.get(me.renderTo);               
        if (me.scale == 'medium') {
			me.itemWidth = 48;
			me.iconCls = "";
			me.imgCls = "";
			me.noticeCls = "";
		} else if (me.scale == 'large') {
			me.itemWidth = 88;
			me.iconCls = "";
			me.imgCls = "";
			me.noticeCls = "";
		} else {
			me.itemWidth = 36;
			me.iconCls = "";
			me.imgCls = "";
			me.noticeCls = "";
		}
        
        // init markup
        me.initMarkup();

        // init events
        me.initEvents();
    },

    /**
     * @private
     */
    initMarkup : function() {
        // set necessary css class
        this.setClass();

        // for wrap class
        //this.el.addClass(this.wrapCls);         
         
        this.fireEvent('beforerender',this);
        
        // fisheye menu container
        this.containerEl = this.el.createChild({
            tag : 'div', 
            cls : 'ux-dock_container ' + this.vAlignCls,
            style:this.style
        });
        if(this.width){
        	  this.containerEl.setWidth(this.width);
        }
  		if(this.height){
        	  this.containerEl.setHeight(this.height);
        }
        var sId = this.el.getAttribute('id') || Ext.id();
        /**
         * Elements array that created
         * @property {Array}
         */
        this.buttons=[];
        // build dockitemlist items
        Ext.each(this.items, function(item, index) {
        	var tip= (item.tip || item.tooltip||'') ;
            var title = this.showText === true ? (item.text||item.title) : '';
            var arr = [{
            	tag:'div',
            	cls:'dockButton_icon dock_icon_'+this.scale,
            	style:item.style,
            	title:tip,
            	children:{
	                tag : 'img',
	                cls:'dockButton_iconImg',
	                src : item.icon,
	                alt : tip
	            }
            }];
            if(item.count){
                arr.push({
							tag : 'div',
							cls : 'dockButton_notify',
							children : {
								tag : 'span',
								html : item.count,
								cls : 'dockButton_notify_inner'
							}
						});
            } 
            if(title){
               arr.push({
                   tag : 'span',
				   cls : 'dockButton_title',
				   html:title
               });
            }
            
            var b=this.containerEl.createChild({
				tag : 'div',
				id : sId + '-' + index,
				cls : 'dockButton dock_'+this.scale,
				title : tip,
				children : arr
            });
            if(Ext.isFunction(item.handler)){
               b.on('click',function(e){               	   
                   item.handler.call(item.scope|this,item,b,e);
               });
            }
            this.buttons.push(b);
        }, this);
                
        this.menuItems = this.containerEl.select('div.dockButton');
        this.itemCount = this.menuItems.getCount();

		// render UI
		this.onRender();
    },
    
    /**
     * @private
     */
    initEvents : function() {
        // hover or not
        this.menuItems.on('mouseover', this.onItemHover, this);
        this.menuItems.on('mouseout', this.onItemOut, this);
		// for viewport resize event
        if(this.ownerCt){
            this.ownerCt.on('bodyresize',function(){
               if(this.isRendered){
               	  this.onResize();
              }
            }, this);
        }
       
        Ext.EventManager.on(window, 'resize', this.onResize, this);
        
    },

	/**
	 * @private
	 */
	setClass : function() {
		this.hOrient = this.hAlign.toLowerCase();
		this.vOrient = this.vAlign.toLowerCase();
		this.hAlignCls = 'dock-align-' + this.hOrient;
		this.vAlignCls = 'dock-align-' + this.vOrient;
	},

    /**
     * @private
     */
    onItemHover : function(ev, t) {
    	if(Ext.isIE6){
    		var target = Ext.get(t);
    	     target.addClassOnOver('dockButton_over_'+this.scale);
    	}
    	
        /*var target = Ext.get(t);
        target = target.is('img') ? target.up('a') : target;
        var itemText = target.child('span');
        if(itemText) {
            itemText.show();
        }*/
    },

    /**
     * @private
     */
    onItemOut : function(ev, t) {
       /* var target = Ext.get(t);
        target = target.is('img') ? target.up('a') : target;
        var itemText = target.child('span');
        if(itemText) {
            itemText.hide();
        }*/
    },
    /**
     *  @private
     */
    onResize:function(){
        this.pos = this.el.getXY();
		this.setPosContainer(20);
		this.setPosMenuItems();
    },
	/**
	 * @private
	 */
	onRender : function() {
		this.pos = this.el.getXY();
		this.setPosContainer(20);
		this.setPosMenuItems();
		this.isRendered=true;
		this.fireEvent('afterrender',this);
	},
    /**
     * @private
     */
    setPosContainer : function(increment) {
		var iLeft;
		switch(this.hAlign.toLowerCase()) {
			case 'left':
				iLeft = - increment/this.itemCount;
				break;
			case 'right':
				iLeft = (this.el.getWidth() - (this.itemWidth+this.vicinity) * this.itemCount) - increment/2;
				break;
		    case 'center':
				iLeft = (this.el.getWidth() - this.itemWidth)/2;
				break;
			default:
				iLeft = (this.el.getWidth() - (this.itemWidth+this.vicinity) * this.itemCount)/2 - increment/2;
				break;
		}
        var o=(this.orient=='horizontal');
		this.containerEl.setStyle({
			left : iLeft+ 'px'	
		});
		if(o){
			this.containerEl.setStyle({
			    width : (this.itemWidth+this.vicinity) * this.itemCount + increment + 'px'
		    }); 
		}
    },

    /**
     * @private
     */    
    setPosMenuItems : function() {
    	var o=(this.orient=='horizontal');
        this.menuItems.each(function(item, all, index) {
            item.setStyle({
            	top:this.vicinity * (o?0:index) + 'px',
                left : this.vicinity * (o?index:0) + 'px',
                width : this.itemWidth +'px'
            });
            
        }, this);
    },
    /**
     * update button count infomation
     * @param {Number} index
     * @param {Number} count
     */
    updateNotice:function(index,count){
        var n=this.buttons[index].child('div.dockButton_notify');
        if(!n && count>0){
           this.buttons[index].createChild({
							tag : 'div',
							cls : 'dockButton_notify',
							children : {
								tag : 'span',
								html : count,
								cls : 'dockButton_notify_inner'
							}
						});
        }else if(count>0){
        	n.setVisible(true);
            n.child('span.dockButton_notify_inner').update(count);
        }else if(n){
            n.setVisible(false);    
        }
    }
});  // end of Ext.ux.DockItemList