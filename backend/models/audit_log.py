from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid
import json

Base = declarative_base()

class AuditLog(Base):
    """
    Modelo para almacenar registros de auditoría del sistema.
    
    Esta tabla almacena todas las acciones importantes realizadas en el sistema
    para fines de auditoría y seguridad.
    """
    __tablename__ = 'audit_logs'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)
    user_email = Column(String(100), nullable=True)
    user_role = Column(String(20), nullable=True)
    action = Column(String(50), nullable=False, index=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    status = Column(String(20), nullable=False, default='success')  # success, warning, error
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    @classmethod
    def log_action(cls, session, action, user=None, details=None, ip_address=None, 
                  user_agent=None, status='success'):
        """
        Registra una acción en el log de auditoría.
        
        Args:
            session: Sesión de SQLAlchemy
            action: Tipo de acción realizada
            user: Usuario que realizó la acción (objeto User)
            details: Detalles de la acción (string o diccionario)
            ip_address: Dirección IP desde donde se realizó la acción
            user_agent: User-Agent del navegador
            status: Estado de la acción (success, warning, error)
            
        Returns:
            La instancia del log de auditoría creada
        """
        # Convertir detalles a formato JSON si es un diccionario
        if isinstance(details, dict):
            details = json.dumps(details)
        
        # Crear registro de auditoría
        audit_log = cls(
            id=str(uuid.uuid4()),
            user_id=user.id if user else None,
            user_email=user.email if user else None,
            user_role=user.role if user else None,
            action=action,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status
        )
        
        session.add(audit_log)
        session.commit()
        
        return audit_log
    
    @classmethod
    def get_logs(cls, session, filters=None, limit=100, offset=0, order_by='created_at', order='desc'):
        """
        Obtiene registros de auditoría con filtros opcionales.
        
        Args:
            session: Sesión de SQLAlchemy
            filters: Diccionario con filtros a aplicar
            limit: Límite de registros a obtener
            offset: Desplazamiento para paginación
            order_by: Campo por el cual ordenar
            order: Dirección de ordenamiento (asc, desc)
            
        Returns:
            Lista de registros de auditoría y conteo total
        """
        query = session.query(cls)
        
        # Aplicar filtros si se proporcionan
        if filters:
            if 'user_id' in filters:
                query = query.filter(cls.user_id == filters['user_id'])
            
            if 'user_email' in filters:
                query = query.filter(cls.user_email.like(f"%{filters['user_email']}%"))
            
            if 'action' in filters:
                query = query.filter(cls.action == filters['action'])
            
            if 'status' in filters:
                query = query.filter(cls.status == filters['status'])
            
            if 'start_date' in filters and 'end_date' in filters:
                query = query.filter(cls.created_at.between(filters['start_date'], filters['end_date']))
            elif 'start_date' in filters:
                query = query.filter(cls.created_at >= filters['start_date'])
            elif 'end_date' in filters:
                query = query.filter(cls.created_at <= filters['end_date'])
            
            if 'ip_address' in filters:
                query = query.filter(cls.ip_address.like(f"%{filters['ip_address']}%"))
            
            if 'details' in filters:
                query = query.filter(cls.details.like(f"%{filters['details']}%"))
        
        # Obtener conteo total
        total = query.count()
        
        # Aplicar ordenamiento
        if order == 'asc':
            query = query.order_by(getattr(cls, order_by).asc())
        else:
            query = query.order_by(getattr(cls, order_by).desc())
        
        # Aplicar paginación
        query = query.limit(limit).offset(offset)
        
        return query.all(), total
