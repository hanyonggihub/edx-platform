define([
        'backbone',
        'jquery',
        'js/financial-assistance/models/financial_assistance_model',
        'js/financial-assistance/views/financial_assistance_form_view'
    ], function (Backbone, $, FinancialAssistanceModel, FinancialAssistanceFormView) {
        
        'use strict';
        /*jslint maxlen: 500 */
        
        describe('Financial Assistance View', function () {
            var view = null,
                context = {
                    fields: [
                        {
                            defaultValue: '',
                            form: 'financial-assistance',
                            instructions: 'select a course',
                            label: 'Course',
                            name: 'course',
                            options: [
                                {'name': 'Verified with Audit', 'value': 'course-v1:HCFA+VA101+2015'},
                                {'name': 'Something Else', 'value': 'course-v1:SomethingX+SE101+215'},
                                {'name': 'Test Course', 'value': 'course-v1:TestX+T101+2015'}
                            ],
                            placeholder: '',
                            required: true,
                            requiredStr: '',
                            type: 'select'
                        }, {
                            defaultValue: '',
                            instructions: 'Specify your annual income in USD.',
                            label: 'Annual Income',
                            name: 'income',
                            placeholder: 'income in USD ($)',
                            required: true,
                            restrictions: {},
                            type: 'text'
                        }, {
                            defaultValue: '',
                            instructions: 'Use between 250 and 500 words or so in your response.',
                            label: 'Tell us about your current financial situation, including any unusual circumstances.',
                            name: 'reason_for_applying',
                            placeholder: '',
                            required: true,
                            restrictions: {
                                min_length: 800,
                                max_length: 2500
                            },
                            type: 'textarea'
                        }, {
                            defaultValue: '',
                            instructions: 'Use between 250 and 500 words or so in your response.',
                            label: 'Tell us about your learning or professional goals. How will a Verified Certificate in this course help you achieve these goals?',
                            name: 'goals',
                            placeholder: '',
                            required: true,
                            restrictions: {
                                min_length: 800,
                                max_length: 2500
                            },
                            type: 'textarea'
                        }, {
                            defaultValue: '',
                            instructions: 'Use between 250 and 500 words or so in your response.',
                            label: 'Tell us about your plans for this course. What steps will you take to help you complete the course work a receive a certificate?',
                            name: 'effort',
                            placeholder: '',
                            required: true,
                            restrictions: {
                                min_length: 800,
                                max_length: 2500
                            },
                            type: 'textarea'
                        }, {
                            defaultValue: '',
                            instructions: 'Annual income and personal information such as email address will not be shared.',
                            label: 'I allow edX to use the information provided in this application for edX marketing purposes.',
                            name: 'mktg-permission',
                            placeholder: '',
                            required: false,
                            restrictions: {},
                            type: 'checkbox'
                        }
                    ],
                    user_details: {
                        country: 'UK',
                        email: 'xsy@edx.org',
                        name: 'xsy',
                        username: 'xsy4ever'
                    },
                    header_text: ['Line one.', 'Line two.'],
                    student_faq_url: '/faqs',
                    dashboard_url: '/dashboard',
                    platform_name: 'edx',
                    submit_url: '/api/financial/v1/assistance'
                },
                completeForm,
                validSubmission,
                successfulSubmission,
                failedSubmission;

            completeForm = function() {
                var options = context.fields[0].options,
                    selectValue = options[options.length - 1].value;

                view.$('#financial-assistance-course').val(selectValue);
                view.$('#financial-assistance-income').val(1312);
                view.$('textarea').html('w'.repeat(801));
            };

            validSubmission = function() {
                completeForm();
                view.$('.js-submit-form').click();
                expect(view.model.save).toHaveBeenCalled();
            };

            successfulSubmission = function() {
                expect(view.$('.js-success-message').length).toEqual(0);
                validSubmission();
                view.model.trigger('sync');
                expect(view.$('.js-success-message').length).toEqual(1);
            };

            failedSubmission = function() {
                expect(view.$('.js-success-message').length).toEqual(0);
                expect(view.$('.submission-error')).toHaveClass('hidden');
                validSubmission();
                view.model.trigger('error', {status: 500});
                expect(view.$('.js-success-message').length).toEqual(0);
                expect(view.$('.submission-error')).not.toHaveClass('hidden');
            };

            beforeEach(function() {
                setFixtures('<div class="financial-assistance-wrapper"></div>');
                
                spyOn(FinancialAssistanceModel.prototype, 'save');

                view = new FinancialAssistanceFormView({
                    el: '.financial-assistance-wrapper',
                    context: context
                });
            });

            afterEach(function() {
                view.undelegateEvents();
                view.remove();
            });

            it('should exist', function() {
                expect(view).toBeDefined();
            });

            it('should load the form based on passed in context', function() {
                var $form = view.$('.financial-assistance-form');

                expect($form.find('select').attr('name')).toEqual(context.fields[0].name);
                expect($form.find('input[type=text]').first().attr('name')).toEqual(context.fields[1].name);
                expect($form.find('textarea').first().attr('name')).toEqual(context.fields[2].name);
                expect($form.find('input[type=checkbox]').attr('name')).toEqual(context.fields[5].name);
            });

            it('should not submit the form if the front end validation fails', function() {
                expect(view.$('.submission-error')).toHaveClass('hidden');
                view.$('.js-submit-form').click();
                expect(view.model.save).not.toHaveBeenCalled();
                expect(view.$('.submission-error')).not.toHaveClass('hidden');
            });

            it('should submit the form data and additional data if validation passes', function() {
                validSubmission();
            });

            it('should submit the form and show a success message if content is valid and API returns success', function() {
                successfulSubmission();
            });

            it('should submit the form and show an error message if content is valid and API returns error', function() {
                failedSubmission();
            });

            it('should allow form resubmission after a front end validation failure', function() {
                view.$('#financial-assistance-income').val(1312);
                expect(view.model.save).not.toHaveBeenCalled();
                validSubmission();
            });

            it('should allow form resubmission after an API error is returned', function() {
                failedSubmission();
                successfulSubmission();
            });
        });
    }
);
