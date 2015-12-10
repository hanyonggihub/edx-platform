;(function (define, undefined) {
    'use strict';
    define([
            'gettext', 'jquery', 'underscore', 'backbone'],
        function (gettext, $, _, Backbone) {

            var ModeToggleView = Backbone.View.extend({
                events : {
                    'click .toggle-button': 'updateToggle'
                },
                hideSections: function () {
                    var sections = _.map(
                        this.$el.find('.toggle-button'),
                        function (button) {return $($(button).data().section)[0];}
                    );
                    $(sections).hide();
                },
                updateToggle: function(event) {
                    var target = $(event.target);
                    this.options.activeSection = target.data().section;
                    this.setToggle();
                },
                setToggle: function() {
                    var target = this.$el.find('[data-section="' + this.options.activeSection + '"]');
                    console.log(this.$el.attr('id'));
                    this.$el.find('*').removeClass('is-active');
                    console.log(this.$el.attr('id'));
                    target.addClass('is-active');
                    this.hideSections();
                    $(this.options.activeSection).show();
                },
                render: function () {
                    if (!this.$el.html()) {
                        this.$el.html(_.template(this.options.template, {}));
                    }
                    this.setToggle();
                    this.delegateEvents();
                    return this;
                }
            });

            return ModeToggleView;
        });
}).call(this, define || RequireJS.define);
