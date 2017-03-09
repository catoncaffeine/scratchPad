var ScratchPad = {
	instances: [],
	init: function(wrapper, config) {
		var instance = ScratchPad.buildInstance(wrapper, config);
		ScratchPad.buildMenu(instance);
		ScratchPad.buildPad(instance);
		ScratchPad.instances[instance.id]= instance;
		ScratchPad.renderScratchPad(instance);
		ScratchPad.convertToFabric(instance);
		ScratchPad.bindEventsToMouseDown(instance);
		return instance;
	},
	getDefaultMenu: function() {
		//        return ScratchPad.menuMode.default.slice();
		return [ScratchPad.menuItem.selector,ScratchPad.menuItem.drawing,ScratchPad.menuItem.eraser, ScratchPad.menuItem.delete];
	},
	getDefaultDimension: function() {
		return {width: 500, height: 500};
	},
	buildInstance: function(wrapper, config) {
		var identifier = new Date().getTime();
		var instance = {id: "sp_" + identifier};
		instance.domElement = $(wrapper)[0];

		if(config === undefined || config.menu === undefined) {
			instance.menu = ScratchPad.getDefaultMenu();
		} else {
			instance.menu = config.menu;
		}

		if(config === undefined || config.dimension === undefined) {
			instance.dimension = ScratchPad.getDefaultDimension();
		} else {
			instance.dimension = config.dimension;
		}

		if(config !== undefined || config.menus !== undefined){
			instance.menus = config.menus;
		}
		instance.wrapper = $("<div class='sp-wrapper panel panel-default' data-sp-id='"+instance.id+"' style='width:"+instance.dimension.width+";height:"+instance.dimension.height+"'></div>");
		return instance;
	},

	buildMenu: function(instance) {
		$(instance.wrapper).append("<div class='sp-menu panel-heading'></div>");
		var $menu = $(instance.wrapper).find(".sp-menu");
//		$menu.append("<i class='sp fa fa-th-large' data-toggle='tooltip' title='Scratchpad'></i>");
		if(instance.menu.indexOf(ScratchPad.menuItem.selector) !== -1 ) {
			$menu.append("<i class='sp-selector fa fa-arrows-alt hover' data-toggle='tooltip' title='Select'></i>");
		}  
		if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !== -1 ) {
			$menu.append("<i class='sp-drawing fa fa-pencil active hover' data-toggle='tooltip' title='Pencil'></i>");
		}        

		if(instance.menu.indexOf(ScratchPad.menuItem.eraser) !== -1){
			$menu.append("<i class='sp-eraser fa fa-eraser hover disabled' data-toggle='tooltip' title='Eraser'></i>")    
		}

		if(instance.menu){
			$menu.append("<i class='vertical-divider'></i>");
		}

		if(instance.menus){
			instance.menus.forEach(function(menu){
				var type = menu.type;
				var title = menu.title;
				if(type && type ==='dropdown'){
					$menu.append("<div class='btn-group'><a class='btn dropdown-toggle' title='"+title+"' data-toggle='dropdown' href='#'>"
								+"<i class='shapes-icon'></i></a>"
								+"<ul class='min-dropdown-width dropdown-menu'></ul></div>");
					for (var menuItems in menu){
						var menuItem = menu[menuItems];
							
							if(typeof menuItem === 'object'){
								$(instance.wrapper).find('ul.dropdown-menu').append("<li></li>");
								var lastLi = $(instance.wrapper).find('ul.dropdown-menu li:last-child');
								for(var menuElements in menuItem){
									var menuElement = menuItem[menuElements];
									$(lastLi).append('<div class="shape-menu" data-action="'+menuElement.class+'"> <i class="icon-size '+menuElement.class+'" data-toggle="tooltip" " title="'+menuElement.title+'"></i></div>');
								}
								$(instance.wrapper).find('ul.dropdown-menu').append('<li class="divider"></li>');
							}
//						}
					}
				}else{
					for(var menuElements in menu ){
						var menuElement = menu[menuElements];
						$menu.append("<i class='"+menuElement.class+"' data-toggle='tooltip' title='"+menuElement.title+"'></i>");
					}
					$menu.append("<i class='vertical-divider'></i>");
				}
			});
			$menu.find('i.sp-undo').addClass('disabled');
			$menu.find('i.sp-redo').addClass('disabled');
		}


	},

	buildPad: function(instance){
		var width = instance.dimension.width, height = instance.dimension.height;
		$(instance.wrapper).find(".sp-menu").after(""
												   + "<div class='sp-canvas-wrapper panel-body'>"
												   +    "<canvas class='sp-canvas' id='"+instance.id+"' width='"+width+"' height='"+height+"'></canvas>"
												   + "</div>");
	},

	convertToFabric: function(instance) {
		var headerHeight = +($(instance.wrapper).find('.sp-menu').css('height').slice(0,-2));
		var height = instance.dimension.height - headerHeight;
		$(instance.wrapper).find('#'+instance.id).attr('height',height);
		instance.canvas = new fabric.Canvas(instance.id, {isDrawingMode: true});
		instance.canvas.freeDrawingBrush = new fabric.PencilBrush(instance.canvas);
		instance.canvas.freeDrawingBrush.width = 2;
	},

	renderScratchPad: function(instance){
		$(instance.wrapper).appendTo($(instance.domElement));

		ScratchPad.bindEvents(instance);
	},

	menuItem: {
		selector: "selector",
		eraser: "eraser",
		drawing: "drawing",
		delete: "delete"
	},
	menuChucks: {
		basic: {	
			undo: {
				class:'sp-undo fa fa-undo hover',
				title:'Undo'
			},
			redo:{
				class: 'sp-redo fa fa-repeat hover',
				title:'Redo'
			},
			delete :{ 
				class:'sp-trash fa fa-trash hover',
				title:'Delete'
			}
	   	},
		text:{
			text:{
				class:'sp-text fa fa-font hover',
				title:'Add Text'
			}
		},
		shapes: {
			menu1:{
				line:{
					class: 'sp-line',
					title:'Line'
				},
				ray: {
					class: 'sp-ray',
					title: 'Ray'
				},
				doubleray: {
					class: 'sp-double-ray',
					title: 'Double Headed Ray'
				},
				circle: {
					class: 'sp-circle',
					title: 'Circle'
				}
			},
			menu2:{
				eq_triangle :{
					class:'sp-eq-triangle',
					title: 'Equilateral Triangle'
				},
				right_triangle: {
					class:'sp-right-triangle',
					title:'Right Angled Triangle'
				},
				scelene_triangle: {
					class: 'sp-scelene',
					title: 'Scelene Triangle'
				}
			},
			menu3:{
				rectangle:{
					class:'sp-rectangle',
					title: 'Rectangle'
				},
				parallelogram:{
					class: 'sp-parallelogram',
					title: 'Parallelogram'
				},
				trapezoid_1: {
					class: 'sp-eq-trapezoid',
					title: 'Equilateral Trapezoid'
				},
				trapezoid_2: {
					class:'sp-trapezoid',
					title: 'Trapezoid'
				}
				
			},
			menu4: {
				pentagon: {
					class: 'sp-pentagon',
					title: 'Pentagon'
				},
				hexagon: {
					class: 'sp-hexagon',
					title: 'Hexagon'
				},
				octagon: {
					class: 'sp-octagon',
					title: 'Octagon'
				},
				decagon: {
					class: 'sp-decagon',
					title: 'Decagon'
				}
			},
			type:'dropdown',
			title: 'Shapes'
		}
	},
	menuMode: {
		default: ["delete", "undo","redo"]
	},

	toggleActiveMenu: function(instance, clickedElement){
		if($(clickedElement).hasClass('active')){
			$(clickedElement).toggleClass('active');
		}else{
			$(instance.wrapper).find(".active").removeClass('active');
			$(clickedElement).addClass('active');
		}

	},
	exportCanvas : function(id){
		return ScratchPad.instances[id]? ScratchPad.instances[id].canvas.toDataURL():"";
	},
	destroyAll:  function(){
		Object.keys(ScratchPad.instances).forEach(function(ele){ 
			var instance = ScratchPad.instances[ele]; 
			ScratchPad.destroyInstance(instance);
		}); 
		ScratchPad=null
	},
	destroyInstance: function(instance){
		if(instance !== undefined && ScratchPad.instances[instance.id]){
			instance.canvas.dispose();

			$(instance.domElement).empty();
			delete ScratchPad.instances[instance.id];
		}
	},
	destroyInstanceById: function(id){
		if(ScratchPad.instances[id]){
			ScratchPad.destroyInstance(ScratchPad.instances[id]);
		}
	},
	bindEvents: function(instance) {
		if(instance.menu.indexOf(ScratchPad.menuItem.delete)!==-1){
			
			$(instance.wrapper).on('click','.sp-trash',function(){
//				MenuEvents.DeleteEvent.init(instance, this);
				var current = this;
				instance.canvas.isDrawingMode = false;
				ScratchPad.toggleActiveMenu(instance, current);
				ScratchPad.bindDeletionHandler(instance.canvas);
				if($(current).hasClass('sp-trash') && $(current).hasClass('active')){
					
					instance.currentTool = 'Delete'
				}else{

					instance.currentTool = '';
				}
			});
		}

		if(instance.menu.indexOf(ScratchPad.menuItem.eraser) !== -1){
			$(instance.wrapper).on('click', '.sp-eraser', function(){
				return;
				var current = this;
				ScratchPad.toggleActiveMenu (instance,current);
				instance.canvas.isDrawingMode = $(current).hasClass('active');
				instance.canvas.freeDrawingBrush.color = '#FFFFFF';
				instance.currentTool = '';
//
//				                instance.canvas.on("path:created", function(e){
//				                   if($(current).hasClass('sp-eraser') && $(current).hasClass('active')){
//				                       e.path.selectable = false;
//									   console.log(e);
//									   var group;
//				                       instance.canvas.forEachObject(function(obj){
//										   console.log(obj)
//										   if(e.path && e.path.intersectsWithObject(obj) && e.path != obj){
//											   
//											   if(!group){
//												   group = new fabric.Group();
//											   }
//											   if(group){
//												   group.add(obj.clone());
//												   group.add(e.path.clone());
//											   }
//				                           		instance.canvas.remove(obj);
//											   instance.canvas.remove(e.path);	
//											   
//				                           }
//				                       });
//									   
//									   if(group){
//										   canvas.setActiveGroup(group);
//										   instance.canvas.add(group);
//									   }
//				                   } 
//				                });
			});  
		}

		if(instance.menu.indexOf(ScratchPad.menuItem.selector) !==-1){
			$(instance.wrapper).on('click', '.sp-selector', function(){
				instance.currentTool = ''
				instance.canvas.isDrawingMode = false;
				$(instance.wrapper).find(".active").removeClass('active');
			});

		}
		if(instance.menu.indexOf(ScratchPad.menuItem.drawing) !==-1){
			$(instance.wrapper).on('click', '.sp-drawing', function(){
				instance.currentTool = ''
				ScratchPad.toggleActiveMenu(instance, this);
				instance.canvas.isDrawingMode = $(this).hasClass('active'); 
				instance.canvas.freeDrawingBrush.color = '#000000'
			});

		}
		$(instance.wrapper).off('click','.sp-text').on('click','.sp-text', function(){
			var current = this;

			instance.canvas.isDrawingMode = false;
			ScratchPad.toggleActiveMenu(instance, current);
			
			if($(current).hasClass('active')){
				instance.currentTool='Text';
			}else{
				instance.currentTool='';
			}
		});
		$(instance.wrapper).on('click', 'i.sp-undo', function(){
			
			var current = this;
			if($(current).hasClass('disabled')){
				return;
			}
			if(instance.undo){
				var obj = instance.undo.pop();
				instance.canvas.remove(obj);
				if(!instance.redo){
					instance.redo = [];
				}
				instance.redo.push(obj);
				$(instance.wrapper).find('i.sp-redo').removeClass('disabled');
			}
			if(instance.undo.length === 0){
				$(current).addClass('disabled');
			}
			
		});
		$(instance.wrapper).on('click','i.sp-redo', function(){
			
			var current = this;
			if($(current).hasClass('disabled')){
				return;
			}
			if(instance.redo){
				var obj = instance.redo.pop();
				instance.canvas.add(obj);
			}
			if(instance.redo.length ===0){
				$(current).addClass('disabled');
			}
		});
		$(instance.wrapper).find('.shape-menu').on('click', function(){
			ScratchPad.handleClickEvent(instance, this);
		});
	},
	handleClickEvent: function(instance, element){
		instance.canvas.isDrawingMode = false;
		ScratchPad.toggleActiveMenu(instance, element);
		if($(element).hasClass('active')){
			
			instance.currentTool=$(element).data('action');
		}else{
			instance.currentTool='';
		}
	},
	bindTextPlaceHandler: function(instance, event){
		if(event.target){
			return;
		}
		var pointer = instance.canvas.getPointer(event.e);
		ScratchPad.addToCanvas(instance, new fabric.Textbox('Click to add text',{
			fontSize: 20, 
			left:pointer.x,
			top:pointer.y,
			width:150})
		);
		
	},
	bindDeletionHandler: function(canvas,event){
		var activeGroup = canvas.getActiveGroup();
		var activeObject = canvas.getActiveObject();
		if(activeGroup){
			var objects = activeGroup.getObjects();
			canvas.discardActiveGroup(); 
			objects.forEach(function(object){
				canvas.remove(object);
			})
		}else if(activeObject){
			
			/*
			 * I-Text objects bubble the mousedown event.
			 * Since it is being deleted, canvas object from iText is removed
			 * and mouse event fails with error. So removing the event from textbox
			*/
			if(activeObject.type === 'textbox'){
				activeObject.off('mousedown');
			}
			canvas.remove(activeObject);
			
		}
		
	},
	bindTriangleHandler: function(instance ,event){
		if(event.target){
			return;
		}
		
		var pointer = instance.canvas.getPointer(event.e);
		var _left = pointer.x;
		var _top = pointer.y;
		var triangle = new fabric.Triangle({height:100, width:100});
		if(instance.currentTool ==='sp-right-triangle'){	
			triangle = new fabric.Polygon([{x:0,y:0}, {x:0, y:100},{x:100, y:100}]);
		}else if(instance.currentTool === 'sp-scelene' ){
			triangle = new fabric.Polygon([
				{x:100,y:100},{x:200,y:35},{x:160,y:100}
			])
		}
		triangle.set({left:_left,top:_top})
		ScratchPad.addToCanvas(instance, triangle);
	},
	bindLineTools: function(instance, event){
		if(event.target){
			return;
		}
		var pointer = instance.canvas.getPointer(event.e)
		var _x = pointer.x;
		var _y = pointer.y;
		var tool = new fabric.Line([_x,_y,_x+100,_y],{left:_x, top:_y,stroke:'black'});
		if(instance.currentTool === 'sp-ray'){
			tool = ScratchPadTools.buildRay({length:100, width:4,startX:_x, startY:_y });
		}else if(instance.currentTool === 'sp-double-ray'){
			tool = ScratchPadTools.buildRay({length:100, width:4,startX:_x+15, startY:_y, doubleHeaded:true });
		}
		ScratchPad.addToCanvas(instance,tool);
	},
	bindShapeTools: function(instance, event){
		
		if(event.target){
			return;
		}
		var type = instance.currentTool;
		var obj;
		var pointer = instance.canvas.getPointer(event.e);
		if(type==='sp-circle'){
			obj = new fabric.Circle({radius:50, fill:'black'});
		}else if(type==='sp-parallelogram'){
			obj = new fabric.Rect({width:100, height:50, fill:'black',skewX:320});
		} else if(type==='sp-rectangle'){
			obj = new fabric.Rect({width:100, height:100, fill:'black'});
		}else if(type==='sp-eq-trapezoid'){
			obj = new fabric.Polygon([{x:30, y:150}, {x:120, y:150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
		}else if(type==='sp-trapezoid'){
			obj = new fabric.Polygon([{x:60,y:150}, {x:150, y: 150}, {x:150, y: 225}, {x:0, y:225}],{fill:'black'});
		}else if(type === 'sp-hexagon'){
			obj = ScratchPadTools.createPolygon({sides:6,centerX:pointer.x,centerY:pointer.y,size: 60});
		}else if(type === 'sp-pentagon'){
			obj = ScratchPadTools.createPolygon({sides:5,centerX:pointer.x,centerY:pointer.y,size: 60});
		}else if(type === 'sp-octagon'){
			obj = ScratchPadTools.createPolygon({sides:8,centerX:pointer.x,centerY:pointer.y,size: 60});
		}else if(type === 'sp-decagon'){
			obj = ScratchPadTools.createPolygon({sides:10,centerX:pointer.x,centerY:pointer.y,size: 60});
		}
		if(obj){
			obj.set({left:pointer.x,top:pointer.y})
			ScratchPad.addToCanvas(instance, obj);
		}
	},
	addToCanvas: function(instance, object){
		instance.canvas.add(object);
		ScratchPad.pushToUndoBuffer(instance,object);
	},
	pushToUndoBuffer: function(instance,object){
		$(instance.wrapper).find('i.sp-undo').removeClass('disabled');
		if(!instance.undo){
			instance.undo = [];
		}
		instance.undo.push(object);
	},
	bindEventsToMouseDown(instance){
		instance.canvas.on('mouse:down', function(e){
			
			if(instance.currentTool){
				if(instance.currentTool === 'Text'){
					ScratchPad.bindTextPlaceHandler(instance,e);
					ScratchPad.toggleActiveMenu(instance, $('.sp-text'));
					instance.currentTool = '';
				}
				if(instance.currentTool === 'Delete'){
					ScratchPad.bindDeletionHandler(this,e);
				}
				if(instance.currentTool === 'sp-eq-triangle'){
					ScratchPad.bindTriangleHandler(instance,e);
				}
				if(instance.currentTool === 'sp-right-triangle'){
					ScratchPad.bindTriangleHandler(instance,e);
				}
				if(instance.currentTool === 'sp-scelene'){
					ScratchPad.bindTriangleHandler(instance,e);
				}
				if(instance.currentTool === 'sp-line'){
					ScratchPad.bindLineTools(instance,e);
				}
				if(instance.currentTool === 'sp-ray'){
					ScratchPad.bindLineTools(instance,e);
				}
				if(instance.currentTool === 'sp-double-ray'){
					ScratchPad.bindLineTools(instance,e);
				}
				if(instance.currentTool === 'sp-circle'){
					ScratchPad.bindShapeTools(instance,e);
				}
				if(instance.currentTool === 'sp-rectangle'){
					ScratchPad.bindShapeTools(instance,e);
				}
				if(instance.currentTool === 'sp-parallelogram'){
					ScratchPad.bindShapeTools(instance,e);
				}
				if(instance.currentTool === 'sp-eq-trapezoid'){
					ScratchPad.bindShapeTools(instance,e);
				}
				if(instance.currentTool === 'sp-trapezoid'){
					ScratchPad.bindShapeTools(instance,e);
				}
				if(instance.currentTool === 'sp-decagon'){
					ScratchPad.bindShapeTools(instance,e);
				}
				if(instance.currentTool === 'sp-octagon'){
					ScratchPad.bindShapeTools(instance,e);
				}
				if(instance.currentTool === 'sp-pentagon'){
					ScratchPad.bindShapeTools(instance,e);
				}
				if(instance.currentTool === 'sp-hexagon'){
					ScratchPad.bindShapeTools(instance,e);
				}
				
			}
		})
	}


}