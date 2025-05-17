from flask import Blueprint, request, jsonify
from models.audit_log import AuditLog
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
import jwt
import os
from datetime import datetime

# Crear blueprint para rutas de auditoría
audit_bp = Blueprint('audit', __name__, url_prefix='/api/audit')

# Referencia a la base de datos (se inicializará en la aplicación principal)
db = None

# Función para inicializar el blueprint con la instancia de la base de datos
def init_blueprint(database):
    global db
    db = database

# Función para verificar el token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, os.environ.get('SECRET_KEY', 'casamonarca_secret_key'), algorithms=["HS256"])
            from models.user import User
            current_user = User.query.filter_by(id=data['user_id']).first()
            
            # Verificar si el usuario tiene permisos para ver logs de auditoría
            if current_user.role not in ['admin', 'sub_admin']:
                return jsonify({'message': 'Unauthorized access!'}), 403
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Ruta para obtener logs de auditoría
@audit_bp.route('/', methods=['GET'])
@token_required
def get_audit_logs(current_user):
    """
    Obtiene logs de auditoría con filtros opcionales.
    
    Query params:
        limit: Límite de registros a obtener (default: 100)
        offset: Desplazamiento para paginación (default: 0)
        order_by: Campo por el cual ordenar (default: created_at)
        order: Dirección de ordenamiento (asc, desc) (default: desc)
        user_id: Filtrar por ID de usuario
        user_email: Filtrar por correo de usuario
        action: Filtrar por tipo de acción
        status: Filtrar por estado
        start_date: Filtrar por fecha de inicio (formato: YYYY-MM-DD)
        end_date: Filtrar por fecha de fin (formato: YYYY-MM-DD)
        ip_address: Filtrar por dirección IP
        details: Filtrar por detalles
        
    Returns:
        JSON con los logs de auditoría y metadatos de paginación
    """
    # Obtener parámetros de consulta
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)
    order_by = request.args.get('order_by', 'created_at')
    order = request.args.get('order', 'desc')
    
    # Validar parámetros
    if limit > 1000:
        limit = 1000  # Limitar a 1000 registros máximo
    
    if order_by not in ['created_at', 'action', 'user_email', 'status']:
        order_by = 'created_at'  # Valor por defecto
    
    if order not in ['asc', 'desc']:
        order = 'desc'  # Valor por defecto
    
    # Construir filtros
    filters = {}
    
    if 'user_id' in request.args:
        filters['user_id'] = request.args.get('user_id')
    
    if 'user_email' in request.args:
        filters['user_email'] = request.args.get('user_email')
    
    if 'action' in request.args:
        filters['action'] = request.args.get('action')
    
    if 'status' in request.args:
        filters['status'] = request.args.get('status')
    
    if 'start_date' in request.args:
        try:
            start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d')
            filters['start_date'] = start_date
        except:
            pass
    
    if 'end_date' in request.args:
        try:
            end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d')
            # Ajustar al final del día
            end_date = end_date.replace(hour=23, minute=59, second=59)
            filters['end_date'] = end_date
        except:
            pass
    
    if 'ip_address' in request.args:
        filters['ip_address'] = request.args.get('ip_address')
    
    if 'details' in request.args:
        filters['details'] = request.args.get('details')
    
    # Obtener logs
    logs, total = AuditLog.get_logs(db.session, filters, limit, offset, order_by, order)
    
    # Formatear resultados
    result = []
    for log in logs:
        result.append({
            'id': log.id,
            'user_id': log.user_id,
            'user_email': log.user_email,
            'user_role': log.user_role,
            'action': log.action,
            'details': log.details,
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
            'status': log.status,
            'created_at': log.created_at.isoformat()
        })
    
    return jsonify({
        'logs': result,
        'total': total,
        'limit': limit,
        'offset': offset,
        'has_more': total > (offset + limit)
    })

# Ruta para obtener un log de auditoría específico
@audit_bp.route('/<log_id>', methods=['GET'])
@token_required
def get_audit_log(current_user, log_id):
    """
    Obtiene un log de auditoría específico.
    
    Args:
        log_id: ID del log de auditoría
        
    Returns:
        JSON con el log de auditoría
    """
    log = db.session.query(AuditLog).filter_by(id=log_id).first()
    
    if not log:
        return jsonify({'message': 'Audit log not found'}), 404
    
    return jsonify({
        'id': log.id,
        'user_id': log.user_id,
        'user_email': log.user_email,
        'user_role': log.user_role,
        'action': log.action,
        'details': log.details,
        'ip_address': log.ip_address,
        'user_agent': log.user_agent,
        'status': log.status,
        'created_at': log.created_at.isoformat()
    })

# Ruta para obtener estadísticas de auditoría
@audit_bp.route('/stats', methods=['GET'])
@token_required
def get_audit_stats(current_user):
    """
    Obtiene estadísticas de los logs de auditoría.
    
    Returns:
        JSON con estadísticas de auditoría
    """
    # Estadísticas por acción
    action_stats = db.session.query(
        AuditLog.action, 
        db.func.count(AuditLog.id)
    ).group_by(AuditLog.action).all()
    
    # Estadísticas por estado
    status_stats = db.session.query(
        AuditLog.status, 
        db.func.count(AuditLog.id)
    ).group_by(AuditLog.status).all()
    
    # Estadísticas por usuario (top 10)
    user_stats = db.session.query(
        AuditLog.user_email, 
        db.func.count(AuditLog.id)
    ).filter(AuditLog.user_email != None).group_by(AuditLog.user_email).order_by(
        db.func.count(AuditLog.id).desc()
    ).limit(10).all()
    
    # Estadísticas por día (últimos 30 días)
    from sqlalchemy import func, cast, Date
    date_stats = db.session.query(
        cast(AuditLog.created_at, Date).label('date'), 
        db.func.count(AuditLog.id)
    ).filter(
        AuditLog.created_at >= db.func.date_sub(db.func.now(), 30)
    ).group_by('date').order_by('date').all()
    
    return jsonify({
        'action_stats': {action: count for action, count in action_stats},
        'status_stats': {status: count for status, count in status_stats},
        'user_stats': {email: count for email, count in user_stats},
        'date_stats': {str(date): count for date, count in date_stats}
    })

# Ruta para exportar logs de auditoría
@audit_bp.route('/export', methods=['GET'])
@token_required
def export_audit_logs(current_user):
    """
    Exporta logs de auditoría a CSV.
    
    Query params:
        Los mismos que para get_audit_logs
        
    Returns:
        Archivo CSV con los logs de auditoría
    """
    from flask import Response
    import csv
    import io
    
    # Obtener parámetros de consulta (igual que en get_audit_logs)
    # ...
    
    # Construir filtros (igual que en get_audit_logs)
    filters = {}
    # ...
    
    # Obtener todos los logs que coincidan con los filtros (sin límite)
    logs, _ = AuditLog.get_logs(db.session, filters, limit=10000, offset=0)
    
    # Crear archivo CSV en memoria
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Escribir encabezados
    writer.writerow([
        'ID', 'Usuario', 'Correo', 'Rol', 'Acción', 'Detalles', 
        'Dirección IP', 'User-Agent', 'Estado', 'Fecha y Hora'
    ])
    
    # Escribir datos
    for log in logs:
        writer.writerow([
            log.id,
            log.user_id,
            log.user_email,
            log.user_role,
            log.action,
            log.details,
            log.ip_address,
            log.user_agent,
            log.status,
            log.created_at.isoformat()
        ])
    
    # Preparar respuesta
    output.seek(0)
    return Response(
        output,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=audit_logs.csv'}
    )
