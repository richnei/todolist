from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Task

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("id", "title", "description", "is_completed", "created_at", "owner")
        read_only_fields = ("id", "created_at", "owner")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "username", "password", "email")
        extra_kwargs = {
            "email": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def validate_username(self, value):
        if not value.strip():
            raise serializers.ValidationError("Username não pode ser vazio.")
        return value
