import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from psycopg2 import sql
from psycopg2.extras import RealDictCursor

from backend.db import get_db_connection

logger = logging.getLogger(__name__)

class SignatureFlow:
    """Gestiona los flujos de firma para documentos que requieren múltiples aprobaciones."""
    
    @staticmethod
    def create_flow(document_id: str, required_signatures: List[Dict[str, Any]]) -> bool:
        """
        Crea un nuevo flujo de firmas para un documento.
        
        Args:
            document_id: ID del documento
            required_signatures: Lista de firmas requeridas con formato:
                [
                    {"role": "operativo", "count": 2, "order": 1},
                    {"role": "coordinador", "count": 1, "order": 2},
                    ...
                ]
        
        Returns:
            True si se creó correctamente, False en caso contrario
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Primero, eliminar cualquier flujo existente para este documento
            cursor.execute(
                "DELETE FROM signature_flows WHERE document_id = %s",
                (document_id,)
            )
            
            # Insertar el nuevo flujo
            for req in required_signatures:
                cursor.execute(
                    """
                    INSERT INTO signature_flows 
                    (document_id, role, required_count, current_count, flow_order, created_at)
                    VALUES (%s, %s, %s, 0, %s, %s)
                    """,
                    (
                        document_id, 
                        req["role"], 
                        req["count"], 
                        req["order"],
                        datetime.now()
                    )
                )
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Error al crear flujo de firmas: {str(e)}")
            return False
    
    @staticmethod
    def get_document_flow(document_id: str) -> List[Dict[str, Any]]:
        """
        Obtiene el flujo de firmas para un documento.
        
        Args:
            document_id: ID del documento
            
        Returns:
            Lista de etapas del flujo con su estado actual
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                """
                SELECT sf.*, 
                       CASE 
                           WHEN sf.current_count >= sf.required_count THEN true 
                           ELSE false 
                       END AS completed,
                       (SELECT json_agg(json_build_object(
                           'user_id', ss.user_id,
                           'user_name', u.name,
                           'signed_at', ss.signed_at
                       ))
                        FROM signature_status ss
                        JOIN users u ON ss.user_id = u.id
                        WHERE ss.document_id = sf.document_id AND ss.role = sf.role) AS signatures
                FROM signature_flows sf
                WHERE sf.document_id = %s
                ORDER BY sf.flow_order
                """,
                (document_id,)
            )
            
            result = cursor.fetchall()
            cursor.close()
            conn.close()
            
            # Convertir a lista de diccionarios
            return [dict(row) for row in result]
            
        except Exception as e:
            logger.error(f"Error al obtener flujo de firmas: {str(e)}")
            return []
    
    @staticmethod
    def record_signature(document_id: str, user_id: str, user_role: str) -> Dict[str, Any]:
        """
        Registra una firma en el flujo y actualiza el estado.
        
        Args:
            document_id: ID del documento
            user_id: ID del usuario que firma
            user_role: Rol del usuario que firma
            
        Returns:
            Diccionario con el resultado de la operación
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Verificar si el usuario ya ha firmado este documento
            cursor.execute(
                """
                SELECT * FROM signature_status 
                WHERE document_id = %s AND user_id = %s
                """,
                (document_id, user_id)
            )
            
            if cursor.fetchone():
                return {
                    "success": False,
                    "message": "El usuario ya ha firmado este documento"
                }
            
            # Verificar el estado actual del flujo
            cursor.execute(
                """
                SELECT * FROM signature_flows
                WHERE document_id = %s
                ORDER BY flow_order
                """,
                (document_id,)
            )
            
            flow_stages = cursor.fetchall()
            if not flow_stages:
                return {
                    "success": False,
                    "message": "No existe un flujo de firmas para este documento"
                }
            
            # Determinar la etapa actual (la primera que no está completa)
            current_stage = None
            for stage in flow_stages:
                if stage["current_count"] < stage["required_count"]:
                    current_stage = stage
                    break
            
            if not current_stage:
                return {
                    "success": False,
                    "message": "El flujo de firmas ya está completo"
                }
            
            # Verificar si el rol del usuario corresponde a la etapa actual
            if current_stage["role"] != user_role:
                return {
                    "success": False,
                    "message": f"En este momento se requieren firmas del rol: {current_stage['role']}"
                }
            
            # Registrar la firma
            cursor.execute(
                """
                INSERT INTO signature_status
                (document_id, user_id, role, signed_at)
                VALUES (%s, %s, %s, %s)
                """,
                (document_id, user_id, user_role, datetime.now())
            )
            
            # Actualizar el contador de firmas en la etapa actual
            cursor.execute(
                """
                UPDATE signature_flows
                SET current_count = current_count + 1
                WHERE document_id = %s AND role = %s
                """,
                (document_id, user_role)
            )
            
            # Verificar si se completó la etapa actual
            cursor.execute(
                """
                SELECT * FROM signature_flows
                WHERE document_id = %s AND role = %s
                """,
                (document_id, user_role)
            )
            
            updated_stage = cursor.fetchone()
            stage_completed = updated_stage["current_count"] >= updated_stage["required_count"]
            
            # Si se completó la etapa, verificar si hay siguientes etapas
            next_stage = None
            if stage_completed:
                cursor.execute(
                    """
                    SELECT * FROM signature_flows
                    WHERE document_id = %s AND flow_order > %s
                    ORDER BY flow_order
                    LIMIT 1
                    """,
                    (document_id, updated_stage["flow_order"])
                )
                next_stage = cursor.fetchone()
            
            # Verificar si se completó todo el flujo
            flow_completed = stage_completed and not next_stage
            
            # Si se completó todo el flujo, actualizar el estado del documento
            if flow_completed:
                cursor.execute(
                    """
                    UPDATE documents
                    SET status = 'signed', updated_at = %s
                    WHERE id = %s
                    """,
                    (datetime.now(), document_id)
                )
            
            conn.commit()
            
            # Obtener el flujo actualizado
            updated_flow = SignatureFlow.get_document_flow(document_id)
            
            cursor.close()
            conn.close()
            
            return {
                "success": True,
                "message": "Firma registrada correctamente",
                "stage_completed": stage_completed,
                "flow_completed": flow_completed,
                "next_stage": dict(next_stage) if next_stage else None,
                "updated_flow": updated_flow
            }
            
        except Exception as e:
            logger.error(f"Error al registrar firma: {str(e)}")
            return {
                "success": False,
                "message": f"Error al registrar firma: {str(e)}"
            }
    
    @staticmethod
    def get_pending_signatures(user_id: str, user_role: str) -> List[Dict[str, Any]]:
        """
        Obtiene los documentos pendientes de firma para un usuario según su rol.
        
        Args:
            user_id: ID del usuario
            user_role: Rol del usuario
            
        Returns:
            Lista de documentos pendientes de firma
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                """
                SELECT d.id, d.name, d.created_at, d.created_by, u.name as creator_name,
                       sf.required_count, sf.current_count,
                       (sf.required_count - sf.current_count) as remaining_signatures
                FROM documents d
                JOIN signature_flows sf ON d.id = sf.document_id
                JOIN users u ON d.created_by = u.id
                WHERE sf.role = %s
                AND sf.current_count < sf.required_count
                AND d.status = 'pending'
                AND NOT EXISTS (
                    SELECT 1 FROM signature_status ss
                    WHERE ss.document_id = d.id AND ss.user_id = %s
                )
                AND (
                    -- Es la primera etapa del flujo
                    sf.flow_order = (
                        SELECT MIN(flow_order) FROM signature_flows
                        WHERE document_id = d.id
                    )
                    OR
                    -- O todas las etapas anteriores están completas
                    NOT EXISTS (
                        SELECT 1 FROM signature_flows sf2
                        WHERE sf2.document_id = d.id
                        AND sf2.flow_order < sf.flow_order
                        AND sf2.current_count < sf2.required_count
                    )
                )
                ORDER BY d.created_at DESC
                """,
                (user_role, user_id)
            )
            
            result = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return [dict(row) for row in result]
            
        except Exception as e:
            logger.error(f"Error al obtener documentos pendientes: {str(e)}")
            return []
