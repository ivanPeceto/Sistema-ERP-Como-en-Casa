from rest_framework import serializers
from .models import Cobro

class CobroSerializer(serializers.ModelSerializer):
    """!
    @brief Serializador para el modelo Cobro.
    @details
        Este serializer convierte instancias del modelo `Cobro` a formatos serializables 
        (como JSON) y valida los datos entrantes para creación o actualización de cobros.
        
        Campos incluidos:
        - `id`: Identificador único del cobro.
        - `pedido`: Relación con el pedido asociado.
        - `tipo`: Tipo de cobro (efectivo, débito, crédito, mercadopago).
        - `monto`: Monto de la transacción.
        - `fecha`: Fecha del cobro.
        - `banco`: Banco utilizado para el cobro electrónico.
        - `referencia`: Referencia de la transacción.
        - `cuotas`: Número de cuotas para cobros a crédito.
        - `estado`: Estado del cobro (`activo` o `cancelado`). Campo de solo lectura.

    @note
        - `estado` se define como read-only ya que solo puede ser modificado internamente
          mediante la lógica de cancelación de cobros.
        - Este serializer se utiliza tanto para la API de listados, detalles como para la creación y actualización.
    
    @example
        # Serializar un cobro existente
        cobro = Cobro.objects.first()
        serializer = CobroSerializer(cobro)
        print(serializer.data)
        
        # Crear un nuevo cobro a partir de datos JSON
        data = {
            "pedido": 1,
            "tipo": "debito",
            "monto": 100.50,
            "banco": "Banco Ejemplo",
            "referencia": "ABC123",
            "cuotas": 3
        }
        serializer = CobroSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
"""
    class Meta:
        model = Cobro
        fields = ['id', 'pedido', 'tipo', 'monto', 'fecha', 'banco', 'referencia', 'cuotas', 'estado']
        read_only_fields = ['estado']
