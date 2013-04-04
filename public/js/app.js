

var contacts = [];
var Contact = Backbone.Model.extend({
	defaults: {
		name: '',
		title: '',
		default_email: '',
		default_phone: '',
		emails: [],
		phones: []
	},
	initialize: function(){
		console.log("creating a new contact");
	}
});

var ContactCollection = Backbone.Collection.extend({
	model: Contact,
	url: "contacts",
	
	 initialize: function() {
		this.CurrentModel=new Contact();
	},

	parse: function(response) {
		this.CurrentModel=new Contact(response.CurrentModel);
		return response.Children
	},
			
	toJSON: function() {
		var obj={};
		obj.CurrentModel=this.CurrentModel.toJSON();
		obj.Children=this.map(function(model){ return model.toJSON(); });
		return obj;
   }
	
});

var TableView = Backbone.View.extend({
	template:_.template($('#contact_list_template').html()),

	initialize: function () {
		this.collection.bind("reset", this.render, this);
	},
	render: function (eventName) {
		this.$el.empty();
		var html=this.template(this.collection.toJSON());

		console.log(html);
		var $table=$(html);
		this.collection.each(function(contact) {
			var contactview=new RowView({ model: contact });
			var $tr=contactview.render().$el;            
			$table.append($tr);
		},this);
		this.$el.append($table);
		
		return this;
	}
});

var RowView = Backbone.View.extend({  
	template: _.template($('#contact_row_template').html()),
	events: {
		"click td.name": "publish"
	},
	render: function (eventName) {
	   var html=this.template(this.model.toJSON());
	   this.setElement($(html));
	   return this;
	},
	publish: function () {
		$("body").append("<p>"+this.model.get("name")+"</p>");
	}
});

	$().ready(function() {
		console.log('help');
		contacts = new ContactCollection();
		console.log("contacts : " + contacts.toJSON());
		var tableView = new TableView({collection: contacts});
		console.log(tableView.render().$el);
		$("#content").append(  );
		contacts.fetch();
});