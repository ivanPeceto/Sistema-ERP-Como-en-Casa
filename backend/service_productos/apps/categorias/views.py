from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .models import Categoria
from .serializer import CategoriaSerializer
from utils.permissions import AllowRoles


class CategoriaCrearView(APIView):
    permission_classes = [IsAuthenticated, AllowRoles('Administrador')]

    def post(self, request):
        serializer = CategoriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoriaEditarView(APIView):
    permission_classes = [IsAuthenticated, AllowRoles('Administrador')]

    def put(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta proporcionar el id del categoría a editar'},
                            status=status.HTTP_400_BAD_REQUEST)

        categoria = get_object_or_404(Categoria, id=id)
        serializer = CategoriaSerializer(categoria, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Categoría editada exitosamente'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoriaEliminarView(APIView):
    permission_classes = [IsAuthenticated, AllowRoles('Administrador')]

    def post(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta proporcionar el id del categoría a eliminar'},
                            status=status.HTTP_400_BAD_REQUEST)

        categoria = Categoria.objects.filter(id=id).first()
        if not categoria:
            return Response({'detail': 'Categoría a eliminar no encontrada'}, status=status.HTTP_400_BAD_REQUEST)

        categoria.delete()
        return Response({'detail': 'Categoría eliminada exitosamente'}, status=status.HTTP_200_OK)


class CategoriaListarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categorias = Categoria.objects.all()
        serializer = CategoriaSerializer(categorias, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoriaBuscarView(ListAPIView):
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        if not id and not nombre:
            raise ValidationError({'detail': 'Falta proporcionar al menos id ó nombre de la categoría a buscar'})

        if id:
            return Categoria.objects.filter(id=id)
        return Categoria.objects.filter(nombre=nombre)
