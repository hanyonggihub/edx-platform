"""
URLs for EdxNotes.
"""
from django.conf.urls import patterns, url

# Additionally, we include login URLs for the browseable API.
urlpatterns = patterns(
    "edxnotes.views",
    url(r"^/$", "edxnotes", name="edxnotes"),
    url(r"^/list/$", "list_notes", name="list_notes"),
    url(r"^/search/$", "search_notes", name="search_notes"),
    url(r"^/token/$", "get_token", name="get_token"),
    url(r"^/visibility/$", "edxnotes_visibility", name="edxnotes_visibility"),
)
