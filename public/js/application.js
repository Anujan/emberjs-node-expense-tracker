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
        controller.set("expenses", e);
        return e;
      }
      );
    controller.set("newExpense", App.Expense.create({}));
  }
});

App.ApplicationController = Ember.Controller.extend({
  expenses: Em.A(),
  error: null,
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
          var e = self.get('expenses');
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
        var e = self.get("expenses");
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