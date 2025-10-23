from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cliente
from .serializer import ClienteSerializer
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperUser
from rest_framework.generics import ListAPIView
from django.db.models import Q

class ClienteCrearView(APIView):
    """!
    @brief Vista para la creación de nuevos clientes.
    @details
        Esta vista, que hereda de APIView, permite crear un nuevo cliente mediante una solicitud POST.
        Requiere que el usuario esté autenticado.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para crear un nuevo cliente.
        @details
            Toma los datos del cliente del cuerpo de la solicitud
            los valida y los guarda utilizando ClienteSerializer.

        @param request: El objeto de la solicitud HTTP que contiene los datos del cliente.
        @return:
                - Si el cliente es creado exitosamente: Respuesta HTTP 200 OK con los
                  datos del cliente serializado.
                - Si la validación falla: Respuesta HTTP 400 BAD REQUEST con los errores
                  del serializador.
        """
        serializer = ClienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClienteEditarView(APIView):
    """!
    @brief Vista para la edición de clientes existentes.
    @details
        Permite actualizar la información de un cliente específico mediante una
        solicitud PUT. El ID del cliente a editar se espera como un parámetro
        en la URL.
        Requiere autenticación y privilegios de superusuario.
    """

    permission_classes = [IsAuthenticated, IsSuperUser]

    def put(self, request):
        """!
        @brief Maneja las solicitudes PUT para editar un cliente existente.
        @details
            Obtiene el 'id' del cliente de los parámetros de la consulta.
            Si no se proporciona el ID, devuelve un error HTTP 400 BAD REQUEST.
            Intenta obtener el cliente de la base de datos usando el id.
            Si el cliente existe, lo actualiza con los datos proporcionados en request.data
            utilizando ClienteSerializer.

        @param request: El objeto de la solicitud HTTP.
        @return:             
            - Si la actualización es exitosa: Devuelve un mensaje de éxito con HTTP 200 OK.
            - Si los datos para la actualización no son válidos: Devuelve errores del serializador
              con HTTP 400 BAD REQUEST.
            - Si el cliente con el ID especificado no se encuentra: Devuelve un mensaje de error
              con HTTP 404 NOT FOUND.
        """

        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id a editar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cliente = Cliente.objects.get(id=id)
            clienteSerializer = ClienteSerializer(cliente, data=request.data)

            if clienteSerializer.is_valid():
                clienteSerializer.save()
                return Response({'detail':'Cliente editado exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response(clienteSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'detail':'Cliente a editar no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class ClienteEliminarView(APIView):
    """!
    @brief Vista para la eliminación de clientes.
    @details
        Permite eliminar un cliente específico mediante una solicitud POST.
        El ID del cliente a eliminar se espera como un parámetro en la URL
        Requiere autenticación y privilegios de superusuario.
    """

    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        """!
        @brief Maneja las solicitudes POST para eliminar un cliente.
        @details
            Obtiene el 'id' del cliente de los parámetros de la consulta.
            Intenta encontrar y eliminar el cliente

        @param request (rest_framework.request.Request): El objeto de la solicitud HTTP.
        @return: 
            - Si no se proporciona el ID, devuelve un error HTTP 400 BAD REQUEST.
            - Si se elimina con éxito: Devuelve un mensaje de éxito con HTTP 200 OK.
            - Si el cliente no se encuentra: Devuelve un mensaje de error con
              HTTP 404 NOT FOUND.
        """
        id = request.query_params.get('id')

        if not id:
            return Response({'detail':'Falta proporcionar el id cliente a eliminar'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cliente = Cliente.objects.get(id=id)
            cliente.delete()
            return Response({'detail':'Cliente eliminado exitosamente'}, status=status.HTTP_200_OK)
        except:
            return Response({'detail':'Cliente a eliminar no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class ClienteListarView(APIView):
    """!
    @brief Vista para listar todos los clientes.
    @details
        Permite obtener una lista de todos los clientes registrados mediante una
        solicitud GET.
        Requiere que el usuario esté autenticado. 
        No requiere privilegios de superusuario.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """!
        @brief Maneja las solicitudes GET para listar todos los clientes.
        @details
            Obtiene todos los objetos Cliente de la base de datos, los serializa
            utilizando ClienteSerializer y los devuelve en una respuesta HTTP 200 OK.
        @param request: El objeto de la solicitud HTTP.
        @return: Respuesta HTTP 200 OK con la lista de clientes serializados.
        """

        clientes = Cliente.objects.all()
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ClienteBuscarView(ListAPIView):
    """!
    @brief Vista para buscar clientes según criterios específicos.
    @details
        Hereda de ListAPIView de DRF, que está optimizada para vistas de lista.
        Permite buscar clientes por 'id', 'nombre' o 'telefono' proporcionados
        como parámetros en la query string de la URL.
        Requiere que el usuario esté autenticado.
        No requiere privilegios de superusuario.

    @property serializer_class: Especifica el serializador a usar.
    @property permission_classes: Define los permisos requeridos.
    """
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """!
        @brief Define el queryset base para la búsqueda de clientes.
        @details
            Este método se sobrescribe para filtrar los clientes según los parámetros
            'id', 'nombre' y 'telefono' proporcionados en la solicitud GET.

            La lógica de filtrado es:
            - Si se proporciona 'id', filtra por 'id'.
            - Si se proporciona 'nombre' y 'telefono', filtra por la combinación de estos.

        @return: Un queryset de objetos Cliente filtrados, o un queryset vacío.
        """

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

class ClienteBuscarCoincidenciasView(ListAPIView):
    """!
    @brief Vista para buscar clientes por coincidencias parciales (fuzzy search) de nombre.
    @details
        Recibe un parámetro de consulta 'nombre' y devuelve los 3 clientes cuyos nombres
        o apellidos contengan ese texto (ignorando mayúsculas/minúsculas).
    """
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """!
        @brief Filtra los clientes basándose en el parámetro de consulta 'nombre'.
        @return QuerySet: Los 3 clientes que mejor coinciden o un queryset vacío.
        """
        queryset = Cliente.objects.all()
        query = self.request.query_params.get('nombre', None) 

        if query:
            queryset = queryset.filter(
                Q(nombre__icontains=query)
            )
            # Devuelve las mejores 3 coincidencias
            return queryset[:3] 
        else:
            return Cliente.objects.none()