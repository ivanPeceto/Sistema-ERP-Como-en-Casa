from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cliente
from .serializer import ClienteSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.generics import ListAPIView

class ClienteCrearView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        serializer = ClienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)

class ClienteEditarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def put(self, request):
        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cliente = Cliente.objects.get(id_cliente=id)
            clienteSerializer = ClienteSerializer(cliente, data=request.data)

            if clienteSerializer.is_valid():
                clienteSerializer.save()
                return Response({'detail':'Cliente editado exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(clienteSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'detail':'Cliente a editar no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    #def put(self, request, pk):
    #    cliente = get_object_or_404(Cliente, pk=pk)
    #    serializer = ClienteSerializer(cliente, data=request.data)
    #    if serializer.is_valid():
    #        serializer.save()
    #        return Response(serializer.data, status=status.HTTP_200_OK)
    #    return Response(serializer.errors, status=status.HTTP_404_NOT_FOUND)

class ClienteEliminarView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id cliente a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cliente = Cliente.objects.get(id=id)
            cliente.delete()
            return Response({'detail':'Cliente eliminado exitosamente'}, status=status.HTTP_200_OK)
        except:
            return Response({'detail':'Cliente a eliminar no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        
        #cliente = get_object_or_404(Cliente, pk=pk)
        #cliente.delete()
        #return Response({'mensaje': 'Cliente eliminado correctamente.'}, status=status.HTTP_200_OK)

class ClienteListarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clientes = Cliente.objects.all()
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ClienteBuscarView(ListAPIView):
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        id = self.request.query_params.get('id')
        nombre = self.request.query_params.get('nombre')
        telefono = self.request.query_params.get('telefono')

        if not id and not nombre and not telefono:
            return Response({'detail':'Falta proporcionar al menos id, nombre ó telefono del cliente a buscar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if not id:
                cliente = Cliente.objects.filter(nombre=nombre, telefono=telefono)
                return cliente
            else:
                cliente = Cliente.objects.filter(id=id)
                return cliente
        except:
            return Cliente.objects.none()
        #cliente = get_object_or_404(Cliente, pk=pk)
        #serializer = ClienteSerializer(cliente)
        #return Response(serializer.data, status=status.HTTP_200_OK)
