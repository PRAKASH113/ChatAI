from django.db import models

class Chat(models.Model):
    chat_id = models.CharField(max_length=64, unique=True)
    title = models.CharField(max_length=255, blank=True)
    pinned = models.BooleanField(default=False)
    last_session = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat {self.chat_id}"


class Message(models.Model):
    chat = models.ForeignKey(Chat, related_name="messages", on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=[("user", "User"), ("ai", "AI")])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role.capitalize()} Message in Chat {self.chat.chat_id}"
