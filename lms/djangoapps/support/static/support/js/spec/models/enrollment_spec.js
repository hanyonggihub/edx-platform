>define([
    'common/js/spec_helpers/ajax_helpers',
    'support/js/models/enrollment'
], function (AjaxHelpers, EnrollmentModel) {
    'use strict';

    describe('EnrollmentModel', function () {
        var enrollment;

        beforeEach(function () {
            enrollment = new EnrollmentModel({
                created: "2015-12-07T18:17:46.210940Z",
                mode: "audit",
                is_active: true,
                user: "test-user",
                course_end: "2017-01-01T00:00:00Z",
                course_start: "2015-01-01T00:00:00Z",
                course_modes: [
                    {
                        slug: "audit",
                        name: "Audit",
                        min_price: 0,
                        suggested_prices: "",
                        currency: "usd",
                        expiration_datetime: null,
                        description: null,
                        sku: "6ED7EDC"
                    },
                    {
                        slug: "verified",
                        name: "Verified Certificate",
                        min_price: 5,
                        suggested_prices: "",
                        currency: "usd",
                        expiration_datetime: null,
                        description: null,
                        sku: "25A5354"
                    }
                ],
                enrollment_start: null,
                course_id: "course-v1:TestX+T101+2015",
                invite_only: false,
                enrollment_end: null,
                verified_price: 5,
                verified_upgrade_deadline: null,
                verification_deadline: null,
                manual_enrollment: {},
                url: 'support/enrollment/test-user'
            });
        });

        it('can save an enrollment to the server and updates itself on success', function () {
            var requests = AjaxHelpers.requests(this),
                manual_enrollment = {
                    'enrolled_by': 'staff@edx.org',
                    'reason': 'Financial Assistance'
                };
            enrollment.updateEnrollment('verified', 'Financial Assistance');
            AjaxHelpers.expectJsonRequest(requests, 'POST', 'support/enrollment/test-user', {
                course_id: "course-v1:TestX+T101+2015",
                new_mode: 'verified',
                old_mode: 'audit',
                reason: 'Financial Assistance'
            });
            AjaxHelpers.respondWithJson(requests, manual_enrollment);
            expect(enrollment.get('mode')).toEqual('verified');
            expect(enrollment.get('manual_enrollment')).toEqual(manual_enrollment);
        });
    });
});
