from django.urls import path
from . import views

urlpatterns = [
    path("create-chat/", views.create_chat, name="create_chat"),
    path("get-chats/", views.get_chats, name="get_chats"),
    path("rename-chat/<str:chat_id>/", views.rename_chat, name="rename_chat"),
    path("toggle-pin/<str:chat_id>/", views.toggle_pin, name="toggle_pin"),
    path("delete-chat/<str:chat_id>/", views.delete_chat, name="delete_chat"),
    path("add-message/<str:chat_id>/", views.add_message, name="add_message"),
]
