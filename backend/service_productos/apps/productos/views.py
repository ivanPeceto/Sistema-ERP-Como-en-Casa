from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Producto
from .serializer import ProductoSerializer
from django.shortcuts import get_object_or_404

class ProductoCrearView(APIView):
    def post(self, request):
        serializer = ProductoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)

class ProductoEditarView(APIView):
    def put(self, request, pk):
        producto = get_object_or_404(Producto, pk=pk)
        serializer = ProductoSerializer(producto, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)

class ProductoEliminarView(APIView):
    def post(self, request, pk):
        producto = get_object_or_404(Producto, pk=pk)
        producto.delete()
        return Response({'mensaje': 'Producto eliminado correctamente.'}, status=status.HTTP_200_OK)

class ProductoListarView(APIView):
    def get(self, request):
        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductoBuscarView(APIView):
    def get(self, request, pk):
        producto = get_object_or_404(Producto, pk=pk)
        serializer = ProductoSerializer(producto)
        return Response(serializer.data, status=status.HTTP_200_OK)
