window.App = Ember.Application.create({
  rootElement: '#ember-app'
});
App.Expense = Ember.Object.extend({
});

App.DateField = Ember.TextField.extend({
  type: 'date',
  date: function(key, date) {
    if (date) {
      this.set('value', date.toISOString().substring(0, 10));
    } else {
      value = this.get('value');
      if (value) {
        date = new Date(value);
      } else {
        date = null;
      }
    }
    return date;
  }.property('value')
});

App.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller) {
    var expenses = $.getJSON("/expenses").then(
      function(response) {
        var e = Em.A();
        response.forEach(function(child) {
          e.pushObject(App.Expense.create(child));
        });
        controller.set("content", e);
        return e;
      }
      );
    controller.set("newExpense", App.Expense.create({}));
  }
});

App.ApplicationController = Ember.ArrayController.extend({
  content: Em.A(), //Expenses array
  error: null,
  totalExpenses: function() {
    var total = 0;
    var expenses = this.get("content");
    console.log(expenses);
    expenses.forEach(function(expense) {
      total += parseInt(expense.get("amount"));
    });
    return total;
  }.property('content'),
  actions: {
    addExpense: function() {
      var expense = this.get("newExpense");
      var post_data = {
        title: expense.get("title"),
        amount: expense.get("amount"),
        date: expense.get("date")
      };
      this.set("error", null);
      var validationErrors = true;
      var d = new Date(post_data.date);
      if (Object.prototype.toString.call(d) !== "[object Date]" || isNaN(d.getTime())) {
        this.set("error", "The date you provided is invalid.");
      } else if (isNaN(post_data.amount)) {
        this.set("error", "The amount you provided is not numeric.");
      } else if (!post_data.title || post_data.title.length > 150 || post_data.title.length < 3) {
        this.set("error", "The title must be between 3 and 150 characters long.");
      } else {
        validationErrors = false;
      }
      if (!validationErrors) {
        self = this;
        $.post("/expense", post_data)
        .done(function(response) {
          var e = self.get('content');
          e.pushObject(App.Expense.create(response));
          self.set('newExpense', App.Expense.create({}));
        })
        .fail(function(response){
          self.set('error', response.error);
        });
      }
    },
    deleteExpense: function(expense) {
      self = this;
      $.ajax({
        url: '/expense/' + expense.get("_id"),
        type: 'DELETE'
      })
      .done(function(response) {
        var e = self.get("content");
        e.removeObject(expense);
      })
      .fail(function(response) {
        self.set('error', response.error);
      });
    }
  }
});

Ember.Handlebars.helper('currency', function(value, options) {
  if(!value) return ""
    return "$" + value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
});

Ember.Handlebars.helper('format-date', function(value, options) {
  var d;
  if (!value)
    d = new Date();
  else
    d = new Date(value);
  return moment(d).format('MMMM Do YYYY');
});

App.DatePicker = Ember.TextField.extend({
  classNames: ['datepicker'],
  didInsertElement: function() {
    return this.$().datepicker({todayBtn: true,
todayHighlight: true});
  },
  textToDateTransform: (function(key, value) {
    if (arguments.length === 2) {
      return this.set('date', new Date(value));
    } else if (!value && this.get('date')) {
      return moment(this.get('date')).format('MM/DD/YYYY');
    } else {
      return value;
    }
  }).property(),
  size: 8,
  valueBinding: "textToDateTransform"
});