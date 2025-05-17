import random
import string
from datetime import datetime, timedelta
from flask import current_app
from .email_service import EmailService

class TwoFactorAuth:
    @staticmethod
    def generate_code(length=6):
        """
        Genera un código numérico aleatorio para autenticación de dos factores.
        
        Args:
            length: Longitud del código (por defecto 6 dígitos)
        
        Returns:
            str: Código numérico generado
        """
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def send_verification_code(user_email, user_name):
        """
        Genera y envía un código de verificación por correo electrónico.
        
        Args:
            user_email: Correo del usuario
            user_name: Nombre del usuario
        
        Returns:
            tuple: (código generado, tiempo de expiración)
        """
        # Generar código
        code = TwoFactorAuth.generate_code()
        
        # Establecer tiempo de expiración (5 minutos)
        expiry_time = datetime.utcnow() + timedelta(minutes=5)
        
        # Enviar correo con el código
        subject = "CasaMonarca - Código de verificación"
        
        # Plantilla HTML para el correo de verificación
        template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>CasaMonarca - Código de Verificación</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4a6da7; color: white; padding: 10px 20px; text-align: center; }}
                .content {{ padding: 20px; border: 1px solid #ddd; }}
                .code {{ font-size: 24px; font-weight: bold; text-align: center; padding: 10px; margin: 20px 0; background-color: #f5f5f5; letter-spacing: 5px; }}
                .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #777; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>CasaMonarca - Sistema de Firma Digital</h2>
                </div>
                <div class="content">
                    <p>Hola {user_name},</p>
                    <p>Has solicitado iniciar sesión en el sistema de CasaMonarca. Para completar el proceso, utiliza el siguiente código de verificación:</p>
                    <div class="code">{code}</div>
                    <p>Este código expirará en 5 minutos.</p>
                    <p>Si no has solicitado este código, por favor ignora este correo o contacta al administrador del sistema.</p>
                    <p>Saludos,<br>Equipo de CasaMonarca</p>
                </div>
                <div class="footer">
                    <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        EmailService.send_email(
            to=user_email,
            subject=subject,
            template=template,
            user_name=user_name,
            code=code
        )
        
        return code, expiry_time
    
    @staticmethod
    def verify_code(stored_code, user_code, expiry_time):
        """
        Verifica si el código proporcionado es válido y no ha expirado.
        
        Args:
            stored_code: Código almacenado en el sistema
            user_code: Código proporcionado por el usuario
            expiry_time: Tiempo de expiración del código
        
        Returns:
            bool: True si el código es válido y no ha expirado, False en caso contrario
        """
        # Verificar si el código ha expirado
        if datetime.utcnow() > expiry_time:
            return False
        
        # Verificar si el código coincide
        return stored_code == user_code
