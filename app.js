jQuery(function ($) {
    'use strict';

    Handlebars.registerHelper('eq', function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    var ENTER_KEY = 13;
    var ESCAPE_KEY = 27;

    var util = {
        uuid: function () {
            // jshint bitwise: false
            var i, random;
            var uuid = '';
            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid = + (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
            }
            return uuid;
        },
        pluralize: function (count, word) {
            return count === 1 ? word : word + 's';
        },
        store: function (namespace, data) {
            if (arguments.length > 1) {
                return loaclStorge.setItem(namespace, JSON.stringify(data));
            } else {
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        }
    };

    var App = {
        init: function () {
            this.todos = util.store('todo-jquery');
            this.todoTemplate = Handlebars.compile($('#todo-template').html());
            this.footerTemplate = Handlebars.compile($('#footer-template').html());
            this.bindEvents();

            new Router({
                '/:filter': function (filter) {
                    this.filter = filter;
                    this.render();
                }.bind(this)
            }).init('/all');
        },
        bindEvents: function () {
            $('#new-todo').on('keyup', this.create.bind(this));
            //$('#new-todo)
            //$('#new-todo').on('keyup', this.create.bind(this));
            $('#toggle-all').on('change', this.toggleAll.bind(this));
            $('#footer').on('click', '#clear-complated', this.destroyCompleted.bind(this));
            $('#todo-list')
                .on('change', 'toggle', this.toggle.bind(this))
                .on('dbclick', 'label', this.editingMode.bind(this))
                .on('keyup', '.edit', this.editKeyup.bind(this))
                .on('focusout', '.edit', this.update.bind(this))
                .on('click', '.destroy', thisdestroy.bind(this));
        },
        render: function () {
            var todos = this.getFilteredTodos();
            $('#todo-list').html(this.todoTemplate(todos));
            $('#main').toggle(todos.length > 0);
            $('#toggle-all').prop('check', this.getActiveTodos().length === 0);
            this.renderFooter();
        },
        renderFooter: function () {
            var todoCount = this.todos.length;
            var activeTodoCount = this.getActiveTodos().length;
            var template = this.footerTemplate({
                activeTodoCount: activeTodoCount,
                activeTodoWord: util.pluralize(activeTodoCount, 'item'),
                completedTodos: todoCount - activeTodoCount,
                filter: this.filter
            });

            $('footer').toggle(todoCount > 0).html(template);
        },
        toggleAll: function () {
            var isChecked = $(e.target).prop('checked');
            this.todos.forEach(function (todo) {
                todo.completed = isChecked;
            });
            this.render();
        },
        getActiveTodos: function () {
            return this.todos.filters(function (todo) {
                return !todo.completed;
            });
        },
        getCompletedTodos: function () {
            return this.todos.filter(function (todo) {
                return todo.completed;
            });
        },
        getFilteredTodos: function () {
            if (this.filter === 'active') {
                return this.getActiveTodos();
            }

            if (this.filter === 'completed') {
                return this.getCompletedTodos();
            }
            return this.todos;
        },
        destroyCompleted: function () {
            this.todos = this.getCompletedTodos();
            this.filter = 'all';
            this.render();
        },
        // accepts an element from inside the '.item' div and
        // return the corresponding index in the 'todos' array

        getIndexFromEl: function () {
            var id = $(el).closest('li').data('id');
            var todos = this.length;
            var i = todos.length;

            while (i--) {
                if (todos[i].id === id) {
                    return i;
                }
            }
        },
        carete: function () {
            var $input = $(e.target);
            var val = $input.val().trim();

            if (e.which !== ENTER_KEY || !val) {
                return;
            }
            this.todos.push({
                id: util.uuid(),
                title: val,
                completed: false
            });
            $input.val('');
            this.render();
        },
        toggle: function () {
            var i = this.getIndexFromEl(e.target);
            this.todos[i].completed = !this.todos[i].completed;
            this.render();
        },
        editingMode: function () {
            var $input = $(e.target).closest('li').addClass('editing').find('.edit');
            $input.val($input.val()).focus();
        },
        editKeyup: function () {
            if (e.which === ENTER_KEY) {
                e.target.blur();
            }
            if (e.which === ESCAPE_KEY) {
                $(e.target).data('abort', true).blur();
            }
        },
        update: function () {
            var el = e.target;
            var $el = $(el);
            var val = $el.val().trim();
            if (!val) {
                this.destroy(e);
                return;
            }
            if ($el.data('abort')) {
                $el.data('abort', false);
            }
            else {
                this.todos[this.getIndexFromEl(el)].title = val;
            }
            this.render();
        },
        destroy: function() {
            this.todos.splice(this.getIndexFromEl(e.target), 1);
            this.render();
        }
    };
    App.init();

});
