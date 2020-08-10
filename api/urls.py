from django.urls import path,include
import re
from django.conf.urls import url
from . import views

app_name = 'api'


urlpatterns = [
    path('',    views.IndexView.as_view(), name='Index'),
    path('index2',    views.Index2View.as_view(), name='Index2'),
]