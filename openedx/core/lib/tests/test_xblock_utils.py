"""
Tests for xblock_utils.py
"""
from __future__ import unicode_literals, absolute_import

import ddt
import uuid

from django.conf import settings
from django.test.client import RequestFactory

from courseware.models import StudentModule  # pylint: disable=import-error
from lms.djangoapps.lms_xblock.runtime import quote_slashes
from opaque_keys.edx.keys import CourseKey
from xblock.fragment import Fragment
from xmodule.modulestore import ModuleStoreEnum
from xmodule.modulestore.tests.django_utils import ModuleStoreTestCase
from xmodule.modulestore.tests.factories import CourseFactory

from openedx.core.lib.xblock_utils import (
    wrap_fragment,
    request_token,
    wrap_xblock,
    replace_jump_to_id_urls,
    replace_course_urls,
    replace_static_urls,
    grade_histogram,
    sanitize_html_id
)

COURSE_KEY = CourseKey.from_string('TestX/TS01/2015')
TEST_DATA_DIR = settings.COMMON_TEST_DATA_ROOT


@ddt.ddt
class TestXblockUtils(ModuleStoreTestCase):
    """Tests for xblock utility functions."""

    def create_fragment(self, content=None):
        """Create a fragment."""
        fragment = Fragment(content)
        fragment.add_css('body {background-color:red;}')
        fragment.add_javascript('alert("Hi!");')
        return fragment

    def test_wrap_fragment(self):
        """Verify that wrap_fragment adds new content."""
        new_content = '<p>New Content<p>'
        fragment = self.create_fragment()
        wrapped_fragment = wrap_fragment(fragment, new_content)
        self.assertEqual('<p>New Content<p>', wrapped_fragment.content)
        self.assertEqual('body {background-color:red;}', wrapped_fragment.resources[0].data)
        self.assertEqual('alert("Hi!");', wrapped_fragment.resources[1].data)

    def test_request_token(self):
        """Verify that a proper token is returned."""
        request_with_token = RequestFactory().get('/')
        request_with_token._xblock_token = '123'  # pylint: disable=protected-access
        token = request_token(request_with_token)
        self.assertEqual(token, '123')

        request_without_token = RequestFactory().get('/')
        token = request_token(request_without_token)
        # Test to see if the token is an uuid1 hex value
        test_uuid = uuid.UUID(token, version=1)
        self.assertEqual(token, test_uuid.hex)

    @ddt.data(ModuleStoreEnum.Type.mongo, ModuleStoreEnum.Type.split)
    def test_wrap_xblock(self, store):  # pylint: disable=unused-argument
        fragment = self.create_fragment(u"<h1>Test!</h1>")
        test_course = CourseFactory.create(
            org='TestX',
            number='TS01',
            run='2015'
        )

        test_wrap_output = wrap_xblock(
            runtime_class='TestRuntime',
            block=test_course,
            view='baseview',
            frag=fragment,
            context=None,
            usage_id_serializer=lambda usage_id: quote_slashes(unicode(usage_id)),
            request_token=uuid.uuid1().get_hex()
        )
        self.assertIsInstance(test_wrap_output, Fragment)
        self.assertIn('xblock-baseview', test_wrap_output.content)
        self.assertIn('data-runtime-class="TestRuntime"', test_wrap_output.content)
        self.assertIn('data-usage-id="i4x:;_;_TestX;_TS01;_course;_2015"', test_wrap_output.content)
        self.assertIn('<h1>Test!</h1>', test_wrap_output.content)
        self.assertEqual(test_wrap_output.resources[0].data, u'body {background-color:red;}')
        self.assertEqual(test_wrap_output.resources[1].data, 'alert("Hi!");')

    @ddt.data(ModuleStoreEnum.Type.mongo, ModuleStoreEnum.Type.split)
    def test_replace_jump_to_id_urls(self, store):  # pylint: disable=unused-argument
        test_replace = replace_jump_to_id_urls(
            course_id=COURSE_KEY,
            jump_to_id_base_url='/base_url/',
            block=CourseFactory.create(),
            view='baseview',
            frag=Fragment('<a href="/jump_to_id/id">'),
            context=None
        )
        self.assertIsInstance(test_replace, Fragment)
        self.assertEqual(test_replace.content, '<a href="/base_url/id">')

    @ddt.data(ModuleStoreEnum.Type.mongo, ModuleStoreEnum.Type.split)
    def test_replace_course_urls(self, store):  # pylint: disable=unused-argument
        test_replace = replace_course_urls(
            course_id=COURSE_KEY,
            block=CourseFactory.create(),
            view='baseview',
            frag=Fragment('<a href="/course/id">'),
            context=None
        )
        self.assertIsInstance(test_replace, Fragment)
        self.assertEqual(test_replace.content, '<a href="/courses/TestX/TS01/2015/id">')

    @ddt.data(ModuleStoreEnum.Type.mongo, ModuleStoreEnum.Type.split)
    def test_replace_static_urls(self, store):  # pylint: disable=unused-argument
        test_replace = replace_static_urls(
            data_dir=None,
            course_id=COURSE_KEY,
            block=CourseFactory.create(),
            view='baseview',
            frag=Fragment('<a href="/static/id">'),
            context=None
        )
        self.assertIsInstance(test_replace, Fragment)
        self.assertEqual(test_replace.content, '<a href="/c4x/TestX/TS01/asset/id">')

    @ddt.data(ModuleStoreEnum.Type.mongo, ModuleStoreEnum.Type.split)
    def test_grade_histogram(self, store):  # pylint: disable=unused-argument
        usage_key = COURSE_KEY.make_usage_key('problem', 'first_problem')
        StudentModule.objects.create(
            student_id=1,
            grade=100,
            module_state_key=usage_key
        )
        StudentModule.objects.create(
            student_id=2,
            grade=50,
            module_state_key=usage_key
        )

        grades = grade_histogram(usage_key)
        self.assertEqual(grades[0], (50.0, 1))
        self.assertEqual(grades[1], (100.0, 1))

    def test_sanitize_html_id(self):
        """Verify that colon and dash are replaced."""
        dirty_string = 'I:have-un:allowed_characters'
        clean_string = sanitize_html_id(dirty_string)

        self.assertEqual(clean_string, 'I_have_un_allowed_characters')
