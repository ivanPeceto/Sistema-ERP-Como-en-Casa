from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from utils.permissions import AllowRoles
from rest_framework.generics import ListAPIView
from .models import Rol
from .serializer import RolSerializer


class RolCrearView(APIView):
    """Vista para la creación de nuevos roles."""
    permission_classes = [IsAuthenticated, AllowRoles(roles=['Administrador'])]

    def post(self, request):
        serializer = RolSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RolEditarView(APIView):
    """Vista para la edición de roles existentes."""
    permission_classes = [IsAuthenticated, AllowRoles(roles=['Administrador'])]

    def put(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta proporcionar el id del rol a editar'}, status=status.HTTP_400_BAD_REQUEST)

        rol = get_object_or_404(Rol, id=id)
        serializer = RolSerializer(rol, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Rol editado exitosamente'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RolEliminarView(APIView):
    """Vista para eliminar roles."""
    permission_classes = [IsAuthenticated, AllowRoles(roles=['Administrador'])]

    def delete(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta proporcionar el id del rol a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        rol = get_object_or_404(Rol, id=id)
        rol.delete()
        return Response({'detail': 'Rol eliminado exitosamente'}, status=status.HTTP_200_OK)


class RolListarView(APIView):
    """Vista para listar todos los roles."""
    permission_classes = [IsAuthenticated, AllowRoles(roles=['Administrador'])]

    def get(self, request):
        roles = Rol.objects.all()
        serializer = RolSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RolBuscarView(ListAPIView):
    """Vista para buscar roles por id o nombre."""
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated, AllowRoles(roles=['Administrador'])]

    def get_queryset(self):
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        queryset = Rol.objects.all()

        if id:
            queryset = queryset.filter(id=id)
        elif nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        else:
            queryset = Rol.objects.none()

        return queryset

    def list(self, request, *args, **kwargs):
        id = request.query_params.get('id')
        nombre = request.query_params.get('nombre')

        if not id and not nombre:
            return Response({'detail': 'Debe proporcionar al menos id o nombre'}, status=status.HTTP_400_BAD_REQUEST)

        return super().list(request, *args, **kwargs)
