from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Categoria
from .serializer import CategoriaSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.generics import ListAPIView

class CategoriaCrearView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        serializer = CategoriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)

class CategoriaEditarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def put(self, request):
        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id del categoría a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            categoria = Categoria.objects.get(id=id)
            categoriaSerializer = CategoriaSerializer(categoria, data=request.data)

            if categoriaSerializer.is_valid():
                categoriaSerializer.save()
                return Response({'detail':'Categoría editada exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(categoriaSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'detail':'Categoría a editar no encontrada'}, status=status.HTTP_404_NOT_FOUND)

class CategoriaEliminarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id del categoría a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            categoria = Categoria.objects.get(id=id)
            categoria.delete()
            return Response({'detail':'Categoría eliminada exitosamente'}, status=status.HTTP_200_OK)
        except:
            return Response({'detail':'Categoría a eliminar no encontrada'}, status=status.HTTP_400_BAD_REQUEST)
        
class CategoriaListarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categoria = Categoria.objects.all()
        serializer = CategoriaSerializer(categoria, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CategoriaBuscarView(ListAPIView):
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        if not id and not nombre:
            return Response({'detail':'Falta proporcionar al menos id ó nombre de la categoría a buscar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if not id:
                categoria = Categoria.objects.filter(nombre=nombre)
                return categoria
            else:
                categoria = Categoria.objects.filter(id=id)
                return categoria
        except:
            return Categoria.objects.none()
