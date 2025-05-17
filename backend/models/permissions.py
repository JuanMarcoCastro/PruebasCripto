import psycopg2
from config import DATABASE_URL
import logging
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# Este modelo se inicializará con la instancia de db en app.py
db = None

class Permission(db.Model):
    __tablename__ = 'permissions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    code = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RolePermission(db.Model):
    __tablename__ = 'role_permissions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role = db.Column(db.String(20), nullable=False)  # admin, sub_admin, management, employer, public
    permission_id = db.Column(db.String(36), db.ForeignKey('permissions.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    permission = db.relationship('Permission', backref=db.backref('role_permissions', lazy=True))

# Definición de permisos predeterminados
DEFAULT_PERMISSIONS = [
    {
        "name": "Ver documentos",
        "description": "Permite acceder a los documentos del sistema",
        "code": "view_documents"
    },
    {
        "name": "Subir documentos",
        "description": "Permite añadir nuevos documentos",
        "code": "upload_documents"
    },
    {
        "name": "Firmar documentos",
        "description": "Permite firmar digitalmente los documentos",
        "code": "sign_documents"
    },
    {
        "name": "Gestionar usuarios",
        "description": "Permite administrar las cuentas de usuario",
        "code": "manage_users"
    },
    {
        "name": "Configurar sistema",
        "description": "Permite modificar la configuración general",
        "code": "configure_system"
    },
    {
        "name": "Ver reportes",
        "description": "Permite acceder a los informes y estadísticas",
        "code": "view_reports"
    },
    {
        "name": "Gestionar permisos",
        "description": "Permite modificar los permisos de los roles",
        "code": "manage_permissions"
    },
    {
        "name": "Ver auditoría",
        "description": "Permite acceder al registro de actividades",
        "code": "view_audit"
    }
]

# Definición de permisos por rol predeterminados
DEFAULT_ROLE_PERMISSIONS = {
    "admin": ["view_documents", "upload_documents", "sign_documents", "manage_users", 
              "configure_system", "view_reports", "manage_permissions", "view_audit"],
    "sub_admin": ["view_documents", "upload_documents", "sign_documents", "manage_users", 
                 "configure_system", "view_reports", "view_audit"],
    "management": ["view_documents", "upload_documents", "sign_documents", "view_reports"],
    "employer": ["view_documents", "upload_documents", "sign_documents"],
    "public": ["view_documents"]
}

def init_db(database):
    global db
    db = database

def initialize_permissions():
    """
    Inicializa los permisos en la base de datos si no existen.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Crear tabla de permisos si no existe
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS permissions (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            code VARCHAR(50) UNIQUE NOT NULL
        )
        """)
        
        # Crear tabla de permisos por rol si no existe
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS role_permissions (
            id SERIAL PRIMARY KEY,
            role VARCHAR(50) NOT NULL,
            permission_id INTEGER REFERENCES permissions(id),
            UNIQUE(role, permission_id)
        )
        """)
        
        # Insertar permisos predeterminados si no existen
        for permission in DEFAULT_PERMISSIONS:
            cursor.execute("""
            INSERT INTO permissions (name, description, code)
            VALUES (%s, %s, %s)
            ON CONFLICT (code) DO NOTHING
            """, (permission["name"], permission["description"], permission["code"]))
        
        # Obtener todos los permisos para mapear códigos a IDs
        cursor.execute("SELECT id, code FROM permissions")
        permission_map = {code: id for id, code in cursor.fetchall()}
        
        # Insertar permisos por rol predeterminados
        for role, permission_codes in DEFAULT_ROLE_PERMISSIONS.items():
            for code in permission_codes:
                if code in permission_map:
                    cursor.execute("""
                    INSERT INTO role_permissions (role, permission_id)
                    VALUES (%s, %s)
                    ON CONFLICT (role, permission_id) DO NOTHING
                    """, (role, permission_map[code]))
        
        conn.commit()
        logger.info("Permisos inicializados correctamente")
    except Exception as e:
        logger.error(f"Error al inicializar permisos: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_all_permissions():
    """
    Obtiene todos los permisos disponibles en el sistema.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, name, description, code FROM permissions")
        permissions = [
            {"id": str(id), "name": name, "description": desc, "code": code}
            for id, name, desc, code in cursor.fetchall()
        ]
        
        return permissions
    except Exception as e:
        logger.error(f"Error al obtener permisos: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_permissions_by_role(role):
    """
    Obtiene los permisos asignados a un rol específico.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT p.id, p.name, p.description, p.code
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role = %s
        """, (role,))
        
        permissions = [
            {"id": str(id), "name": name, "description": desc, "code": code}
            for id, name, desc, code in cursor.fetchall()
        ]
        
        return permissions
    except Exception as e:
        logger.error(f"Error al obtener permisos para el rol {role}: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_permissions_by_roles():
    """
    Obtiene los permisos asignados a todos los roles.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT rp.role, p.id, p.name, p.description, p.code
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        """)
        
        results = cursor.fetchall()
        
        # Organizar por rol
        role_permissions = {}
        for role, id, name, desc, code in results:
            if role not in role_permissions:
                role_permissions[role] = []
            
            role_permissions[role].append({
                "id": str(id),
                "name": name,
                "description": desc,
                "code": code
            })
        
        return role_permissions
    except Exception as e:
        logger.error(f"Error al obtener permisos por roles: {e}")
        return {}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def update_role_permissions(role, permission_ids):
    """
    Actualiza los permisos asignados a un rol específico.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Eliminar permisos actuales del rol
        cursor.execute("DELETE FROM role_permissions WHERE role = %s", (role,))
        
        # Insertar nuevos permisos
        for permission_id in permission_ids:
            cursor.execute("""
            INSERT INTO role_permissions (role, permission_id)
            VALUES (%s, %s)
            """, (role, permission_id))
        
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error al actualizar permisos para el rol {role}: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def has_permission(user_role, permission_code):
    """
    Verifica si un rol tiene un permiso específico.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT COUNT(*)
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role = %s AND p.code = %s
        """, (user_role, permission_code))
        
        count = cursor.fetchone()[0]
        return count > 0
    except Exception as e:
        logger.error(f"Error al verificar permiso {permission_code} para el rol {user_role}: {e}")
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def initialize_default_permissions(db_session):
    """Inicializa los permisos predeterminados del sistema"""
    default_permissions = [
        {
            'name': 'Ver documentos',
            'description': 'Permite ver documentos en el sistema',
            'code': 'view_documents'
        },
        {
            'name': 'Subir documentos',
            'description': 'Permite subir nuevos documentos al sistema',
            'code': 'upload_documents'
        },
        {
            'name': 'Firmar documentos',
            'description': 'Permite firmar documentos digitalmente',
            'code': 'sign_documents'
        },
        {
            'name': 'Gestionar usuarios',
            'description': 'Permite crear, editar y eliminar usuarios',
            'code': 'manage_users'
        },
        {
            'name': 'Configurar sistema',
            'description': 'Permite modificar la configuración del sistema',
            'code': 'configure_system'
        },
        {
            'name': 'Ver reportes',
            'description': 'Permite acceder a los reportes del sistema',
            'code': 'view_reports'
        },
        {
            'name': 'Gestionar permisos',
            'description': 'Permite modificar los permisos de los roles',
            'code': 'manage_permissions'
        },
        {
            'name': 'Ver auditoría',
            'description': 'Permite acceder al registro de auditoría',
            'code': 'view_audit'
        }
    ]
    
    # Crear permisos si no existen
    for perm in default_permissions:
        if not Permission.query.filter_by(code=perm['code']).first():
            permission = Permission(
                name=perm['name'],
                description=perm['description'],
                code=perm['code']
            )
            db_session.add(permission)
    
    db_session.commit()
    
    # Asignar permisos predeterminados a roles
    # Admin: todos los permisos
    admin_permissions = Permission.query.all()
    for perm in admin_permissions:
        if not RolePermission.query.filter_by(role='admin', permission_id=perm.id).first():
            role_perm = RolePermission(role='admin', permission_id=perm.id)
            db_session.add(role_perm)
    
    # Sub-admin: todos excepto gestionar permisos
    sub_admin_permissions = Permission.query.filter(Permission.code != 'manage_permissions').all()
    for perm in sub_admin_permissions:
        if not RolePermission.query.filter_by(role='sub_admin', permission_id=perm.id).first():
            role_perm = RolePermission(role='sub_admin', permission_id=perm.id)
            db_session.add(role_perm)
    
    # Management: ver, subir, firmar documentos, ver reportes
    management_permission_codes = ['view_documents', 'upload_documents', 'sign_documents', 'view_reports']
    management_permissions = Permission.query.filter(Permission.code.in_(management_permission_codes)).all()
    for perm in management_permissions:
        if not RolePermission.query.filter_by(role='management', permission_id=perm.id).first():
            role_perm = RolePermission(role='management', permission_id=perm.id)
            db_session.add(role_perm)
    
    # Employer: ver, subir, firmar documentos
    employer_permission_codes = ['view_documents', 'upload_documents', 'sign_documents']
    employer_permissions = Permission.query.filter(Permission.code.in_(employer_permission_codes)).all()
    for perm in employer_permissions:
        if not RolePermission.query.filter_by(role='employer', permission_id=perm.id).first():
            role_perm = RolePermission(role='employer', permission_id=perm.id)
            db_session.add(role_perm)
    
    # Public: solo ver documentos
    public_permission_codes = ['view_documents']
    public_permissions = Permission.query.filter(Permission.code.in_(public_permission_codes)).all()
    for perm in public_permissions:
        if not RolePermission.query.filter_by(role='public', permission_id=perm.id).first():
            role_perm = RolePermission(role='public', permission_id=perm.id)
            db_session.add(role_perm)
    
    db_session.commit()
