from django.urls import path
from . import views

urlpatterns = [
    path('' , views.game , name="game") ,
    path('updatescore' , views.updatescore , name="updatescore")
]