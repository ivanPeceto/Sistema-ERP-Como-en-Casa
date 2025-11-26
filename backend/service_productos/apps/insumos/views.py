from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Insumo
from .serializer import InsumoSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import AllowRoles
from rest_framework.generics import ListAPIView

class InsumoCrearView(APIView):
    """!
    @brief Vista para la creación de nuevos insumos.
    """
    permission_classes = [IsAuthenticated, AllowRoles('Cocinero', 'Administrador')]

    def post(self, request):
        serializer = InsumoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InsumoEditarView(APIView):
    """!
    @brief Vista para la edición de insumos existentes.
    """
    permission_classes = [IsAuthenticated, AllowRoles('Cocinero', 'Administrador')]

    def put(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail':'Falta proporcionar el id del insumo a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            insumo = Insumo.objects.get(id=id)
            serializer = InsumoSerializer(insumo, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'detail':'Insumo editado exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Insumo.DoesNotExist:
            return Response({'detail':'Insumo a editar no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class InsumoEliminarView(APIView):
    """!
    @brief Vista para la eliminación de insumos.
    """
    permission_classes = [IsAuthenticated, AllowRoles('Cocinero', 'Administrador')]

    def post(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail':'Falta proporcionar el id del insumo a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            insumo = Insumo.objects.get(id=id)
            insumo.delete()
            return Response({'detail':'Insumo eliminado exitosamente'}, status=status.HTTP_200_OK)
        except Insumo.DoesNotExist:
            return Response({'detail':'Insumo a eliminar no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        
class InsumoListarView(APIView):
    """!
    @brief Vista para listar todos los insumos.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        insumos = Insumo.objects.all()
        serializer = InsumoSerializer(insumos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class InsumoBuscarView(ListAPIView):
    """!
    @brief Vista para buscar insumos según criterios.
    """
    serializer_class = InsumoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')

        if not id and not nombre:
            return Insumo.objects.none()

        queryset = Insumo.objects.all()
        if id:
            queryset = queryset.filter(id=id)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre) 
        
        return queryset