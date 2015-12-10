;(function (define, undefined) {
    'use strict';
    define([
            'gettext', 'jquery', 'underscore', 'backbone', 'js/student_profile/views/badge_view',
            'text!templates/student_profile/badge_placeholder.underscore'],
        function (gettext, $, _, Backbone, BadgeView, badgePlaceholder) {
            var BadgeListingView = Backbone.View.extend({
                render: function () {
                    var badgeContainer = $('<div class="badge-set-display">');
                    var row = $('<div class="row">');
                    var make_last_row = true;
                    // Split into two columns.
                    this.collection.each(function (badge, index) {
                        /*jshint -W018 */
                        var make_row = (index && !(index % 2));
                        if (make_row) {
                            badgeContainer.append(row);
                            row = $('<div class="row">');
                            make_last_row = false;
                        } else {
                            make_last_row = true;
                        }
                        row.append(new BadgeView({model: badge}).render().el);
                    }, this);
                    // Placeholder must always be at the end, and may need a new row.
                    var placeholder = _.template(
                        badgePlaceholder,  {find_courses_url: this.options.find_courses_url}
                    );
                    if (make_last_row) {
                        badgeContainer.append(row);
                        row = $('<div class="row">');
                    }
                    row.append(placeholder);
                    badgeContainer.append(row);
                    this.$el.html(badgeContainer);
                    return this;
                }
            });

            return BadgeListingView;
        });
}).call(this, define || RequireJS.define);
