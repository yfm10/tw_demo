/**
 * @namespace Ext.ux.form
 * @class Ext.ux.form.HtmlEditor.FullScreen
 * @extends Ext.util.Observable
 * @author yang fuming
 * <p>A plugin that creates a menu on the HtmlEditor for fullscreen</p>
 */
Ext.ns('Ext.ux.form.HtmlEditor');
Ext.ux.form.HtmlEditor.FullScreen = Ext.extend(Ext.util.Observable, {
    init: function(cmp){
        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);
    },
    // private
    onRender: function(){
    	var me=this,
        cmp = me.cmp;
        cmp.getToolbar().addItem({
							iconCls : 'icon-word',
							enableToggle :true,
							tooltip : '全屏显示',
							handler: function(t){
					             t.toggle(t.pressed);
					             me.resize(t.pressed);
					        },
							scope : me
						});
    },
    /**
     * 全屏显示
     * @param {Boolean} state
     * @param {Boolean} supressEvent
     */
    resize:function(state){
    	 var me=this;
         if(state){
             me.lastSize=me.cmp.getSize();
             width=me.getMaxWidth(),
             height=me.getMaxHeight();
             me.cmp.setSize(width,height);
                // width=Math.max(el.scrollWidth, el.clientWidth),
                // height=Math.max(el.scrollHeight, el.clientHeight);

         }else{
             me.cmp.setSize(me.lastSize.width,me.lastSize.height);
         }
    },

    getMaxWidth:function(){
      var doc=Ext.getBody(),
          width=doc.getWidth();
      if(doc.isScrollable()){
          width=Math.max(width,doc.getScroll().scrollWidth);
      }
       return width;
    },
    getMaxHeight:function(){
      var doc=Ext.getBody(),
          height=doc.getHeight();
      if(doc.isScrollable()){
          height=Math.max(height,doc.getScroll().scrollHeight)
      }
      return height;
    }
});