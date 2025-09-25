#/backend/service_pedidos/apps/cobros/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Cobro
from .serializer import CobroSerializer

class CobroCrearView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CobroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CobroListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cobros = Cobro.objects.all()
        serializer = CobroSerializer(cobros, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CobroDetalleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta el parámetro id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cobro = Cobro.objects.get(pk=id)
            serializer = CobroSerializer(cobro)
            return Response(serializer.data)
        except Cobro.DoesNotExist:
            return Response({'detail': 'Cobro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class CobroEditarView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta el parámetro id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cobro = Cobro.objects.get(pk=id)
        except Cobro.DoesNotExist:
            return Response({'detail': 'Cobro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CobroSerializer(cobro, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Cobro actualizado correctamente'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CobroEliminarView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        id = request.query_params.get('id')
        if not id:
            return Response({'detail': 'Falta el parámetro id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cobro = Cobro.objects.get(pk=id)
            cobro.delete()
            return Response({'detail': 'Cobro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        except Cobro.DoesNotExist:
            return Response({'detail': 'Cobro no encontrado'}, status=status.HTTP_404_NOT_FOUND)
