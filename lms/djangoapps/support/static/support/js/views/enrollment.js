;(function (define) {
    'use strict';

    define([
        'backbone',
        'underscore',
        'moment',
        'support/js/views/enrollment_modal',
        'support/js/collections/enrollment',
        'text!support/templates/enrollment.underscore'
    ], function (Backbone, _, moment, EnrollmentModal, EnrollmentCollection, enrollmentTemplate) {
        return Backbone.View.extend({
            // TODO: what goes here?
            ENROLLMENT_CHANGE_REASONS: [
                'Financial Assistance',
                'Teaching Assistant',
                'Learner is mad'
            ],

            events: {
                'submit .enrollment-form': 'search',
                'click .change-enrollment-btn': 'changeEnrollment'
            },

            initialize: function (options) {
                var user = options.user;
                this.initialUser = user;
                this.enrollmentSupportUrl = options.enrollmentSupportUrl;
                this.enrollments = new EnrollmentCollection([], {
                    user: user,
                    baseUrl: options.enrollmentsUrl
                });
                this.enrollments.on('change', _.bind(this.render, this));
            },

            render: function () {
                var user = this.enrollments.user;
                this.$el.html(_.template(enrollmentTemplate, {
                    user: user,
                    enrollments: this.enrollments,
                    formatDate: function (date) {
                        if (date) {
                            return moment(date).format('MM/DD/YYYY (H:MM UTC)');
                        }
                        return 'N/A';
                    }
                }));

                if (!$.fn.dataTable.isDataTable('#enrollment-table')) {
                    this.$('#enrollment-table').DataTable();
                }

                this.checkInitialSearch();
                return this;
            },

            /*
             * Check if the URL has provided an initial search, and
             * perform that search if so.
             */
            checkInitialSearch: function () {
                if (this.initialUser) {
                    delete this.initialUser;
                    this.$('.enrollment-form').submit();
                }
            },

            /*
             * Return the user's search string.
             */
            getSearchString: function () {
                return this.$('#enrollment-query-input').val();
            },

            /*
             * Perform the search. Renders the view on success.
             */
            search: function (event) {
                event.preventDefault();
                var username = this.getSearchString(),
                    self = this;
                this.enrollments.user = username;
                this.enrollments.fetch({
                    success: function () {
                        self.render();
                    }
                });

                // Allow linking to this page directly
                window.history.pushState(
                    {username: username},
                    window.document.title,
                    this.enrollmentSupportUrl + '?user=' + username
                );
            },

            /*
             * TODO write this
             */
            changeEnrollment: function (event) {
                event.preventDefault();
                var button = $(event.currentTarget),
                    course_id = button.data('course_id'),
                    modes = button.data('modes').split(','),
                    enrollment = this.enrollments.findWhere({course_id: course_id});
                new EnrollmentModal({
                    el: this.$('.enrollment-modal-wrapper'),
                    enrollment: enrollment,
                    modes: modes,
                    reasons: this.ENROLLMENT_CHANGE_REASONS
                }).show();
            }
        });
    });
}).call(this, define || RequireJS.define);
