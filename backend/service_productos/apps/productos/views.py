from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Producto
from .serializer import ProductoSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.generics import ListAPIView

class ProductoCrearView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        serializer = ProductoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)

class ProductoEditarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def put(self, request):
        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id del producto a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            producto = Producto.objects.get(id=id)
            productoSerializer = ProductoSerializer(producto, data=request.data)

            if productoSerializer.is_valid():
                productoSerializer.save()
                return Response({'detail':'Producto editado exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(productoSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'detail':'Producto a editar no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class ProductoEliminarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id del producto a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            producto = Producto.objects.get(id=id)
            producto.delete()
            return Response({'detail':'Producto eliminado exitosamente'}, status=status.HTTP_200_OK)
        except:
            return Response({'detail':'Producto a eliminar no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        
class ProductoListarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductoBuscarView(ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        if not id and not nombre:
            return Response({'detail':'Falta proporcionar al menos id ó nombre del producto a buscar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if not id:
                producto = Producto.objects.filter(nombre=nombre, disponible=True)
                return producto
            else:
                producto = Producto.objects.filter(id=id)
                return producto
        except:
            return Producto.objects.none()
