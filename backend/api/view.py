from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import Chat, Message
from .serializers import ChatSerializer
import uuid

#  Create a new chat
@api_view(["POST"])
def create_chat(request):
    """
    Creates a new chat entry in the database.
    Returns the chat ID and confirmation.
    """
    try:
        chat_id = str(uuid.uuid4())
        chat = Chat.objects.create(chat_id=chat_id)
        return Response({
            "success": True,
            "chat_id": chat.chat_id,
            "message": "New chat created successfully."
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)


#  Get all chats
@api_view(["GET"])
def get_chats(request):
    """
    Return all chats sorted by pinned and last session time.
    """
    try:
        chats = Chat.objects.all().order_by("-pinned", "-last_session")
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


#  Rename chat
@api_view(["PATCH"])
def rename_chat(request, chat_id):
    """
    Update a chat's title.
    """
    try:
        chat = Chat.objects.get(chat_id=chat_id)
        title = request.data.get("title", "")
        chat.title = title
        chat.last_session = timezone.now()
        chat.save()
        return Response({"success": True, "message": "Chat renamed successfully."})
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


#  Toggle pinned state
@api_view(["POST"])
def toggle_pin(request, chat_id):
    """
    Toggle the pinned state of a chat.
    """
    try:
        chat = Chat.objects.get(chat_id=chat_id)
        chat.pinned = not chat.pinned
        chat.save()
        return Response({"success": True, "pinned": chat.pinned})
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


#  Delete chat
@api_view(["DELETE"])
def delete_chat(request, chat_id):
    """
    Delete a chat and its related messages.
    """
    try:
        chat = Chat.objects.get(chat_id=chat_id)
        chat.delete()
        return Response({"success": True, "message": "Chat deleted successfully."})
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


#  Add Messages
@api_view(["POST"])
def add_message(request, chat_id):
    """
    Add a message to a chat (user or AI).
    Example body: { "role": "user", "content": "Hello!" }
    """
    try:
        chat = Chat.objects.get(chat_id=chat_id)
        role = request.data.get("role")
        content = request.data.get("content", "")

        if role not in ["user", "ai"]:
            return Response({"error": "Invalid role"}, status=400)

        if not content.strip():
            return Response({"error": "Message content is empty"}, status=400)

        Message.objects.create(chat=chat, role=role, content=content)
        chat.last_session = timezone.now()
        chat.save()

        return Response({
            "success": True,
            "message": "Message added successfully.",
            "chat_id": chat.chat_id,
            "role": role,
            "content": content,
        })
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)