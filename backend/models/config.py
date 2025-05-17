from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class SystemConfig(Base):
    """
    Modelo para almacenar la configuración del sistema.
    
    Esta tabla almacena todas las configuraciones del sistema en formato clave-valor,
    agrupadas por categorías para facilitar su gestión.
    """
    __tablename__ = 'system_config'
    
    id = Column(String(36), primary_key=True)
    category = Column(String(50), nullable=False, index=True)
    key = Column(String(100), nullable=False, index=True)
    value = Column(Text, nullable=True)
    value_type = Column(String(20), nullable=False)  # string, integer, boolean, json
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @classmethod
    def get_value(cls, session, category, key, default=None):
        """
        Obtiene el valor de una configuración específica.
        
        Args:
            session: Sesión de SQLAlchemy
            category: Categoría de la configuración
            key: Clave de la configuración
            default: Valor por defecto si no se encuentra la configuración
            
        Returns:
            El valor de la configuración convertido al tipo adecuado
        """
        config = session.query(cls).filter_by(category=category, key=key).first()
        
        if not config:
            return default
        
        # Convertir el valor al tipo adecuado
        if config.value_type == 'integer':
            return int(config.value) if config.value is not None else default
        elif config.value_type == 'boolean':
            return config.value.lower() == 'true' if config.value is not None else default
        elif config.value_type == 'json':
            import json
            try:
                return json.loads(config.value) if config.value is not None else default
            except:
                return default
        else:
            return config.value if config.value is not None else default
    
    @classmethod
    def set_value(cls, session, category, key, value, value_type='string', description=None):
        """
        Establece el valor de una configuración.
        
        Args:
            session: Sesión de SQLAlchemy
            category: Categoría de la configuración
            key: Clave de la configuración
            value: Valor a establecer
            value_type: Tipo del valor (string, integer, boolean, json)
            description: Descripción de la configuración
            
        Returns:
            La instancia de configuración actualizada o creada
        """
        import uuid
        
        # Convertir el valor al formato de cadena para almacenamiento
        if value_type == 'json':
            import json
            value_str = json.dumps(value) if value is not None else None
        elif value_type == 'boolean':
            value_str = str(value).lower() if value is not None else None
        else:
            value_str = str(value) if value is not None else None
        
        # Buscar configuración existente
        config = session.query(cls).filter_by(category=category, key=key).first()
        
        if config:
            # Actualizar configuración existente
            config.value = value_str
            config.value_type = value_type
            if description:
                config.description = description
            config.updated_at = datetime.utcnow()
        else:
            # Crear nueva configuración
            config = cls(
                id=str(uuid.uuid4()),
                category=category,
                key=key,
                value=value_str,
                value_type=value_type,
                description=description
            )
            session.add(config)
        
        session.commit()
        return config
    
    @classmethod
    def get_category(cls, session, category):
        """
        Obtiene todas las configuraciones de una categoría.
        
        Args:
            session: Sesión de SQLAlchemy
            category: Categoría de las configuraciones
            
        Returns:
            Diccionario con las configuraciones de la categoría
        """
        configs = session.query(cls).filter_by(category=category).all()
        
        result = {}
        for config in configs:
            result[config.key] = cls.get_value(session, category, config.key)
        
        return result
