;(function (define, undefined) {
    'use strict';
    define([
            'gettext', 'jquery', 'underscore', 'backbone', 'js/student_profile/views/badge_view',
            'text!templates/student_profile/badge_placeholder.underscore'],
        function (gettext, $, _, Backbone, BadgeView, badgePlaceholder) {
            var BadgeListingView = Backbone.View.extend({
                render: function () {
                    var self = this;
                    var badgeContainer = $('<div class="badge-set-display">');
                    var badgeList = $('<div class="badge-list">');
                    this.collection.each(function (badge) {
                        badgeList.append(new BadgeView({model: badge}).render().el);
                    }, this);
                    badgeList.append(
                        _.template(badgePlaceholder,  {'find_courses_url': self.options.find_courses_url})
                    );
                    badgeContainer.append(badgeList);
                    this.$el.html(badgeContainer);
                    return this;
                }
            });

            return BadgeListingView;
        });
}).call(this, define || RequireJS.define);
