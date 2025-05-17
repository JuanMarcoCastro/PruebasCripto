import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from flask import current_app

class EmailService:
    @staticmethod
    def send_email(to, subject, template, **kwargs):
        """
        Envía un correo electrónico utilizando la configuración de la aplicación.
        
        Args:
            to: Destinatario del correo
            subject: Asunto del correo
            template: Plantilla HTML del correo
            **kwargs: Variables para la plantilla
        
        Returns:
            bool: True si el correo se envió correctamente, False en caso contrario
        """
        try:
            # Configuración del servidor SMTP
            mail_server = current_app.config['MAIL_SERVER']
            mail_port = current_app.config['MAIL_PORT']
            mail_username = current_app.config['MAIL_USERNAME']
            mail_password = current_app.config['MAIL_PASSWORD']
            mail_sender = current_app.config['MAIL_DEFAULT_SENDER']
            
            # Crear mensaje
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = mail_sender
            msg['To'] = to
            
            # Renderizar plantilla con variables
            html = template.format(**kwargs)
            
            # Adjuntar contenido HTML
            part = MIMEText(html, 'html')
            msg.attach(part)
            
            # Conectar al servidor SMTP y enviar correo
            with smtplib.SMTP(mail_server, mail_port) as server:
                server.starttls()
                server.login(mail_username, mail_password)
                server.sendmail(mail_sender, to, msg.as_string())
            
            return True
        except Exception as e:
            print(f"Error al enviar correo: {str(e)}")
            return False
    
    @staticmethod
    def send_notification_email(user_email, user_name, notification_title, notification_message):
        """
        Envía un correo de notificación a un usuario.
        
        Args:
            user_email: Correo del usuario
            user_name: Nombre del usuario
            notification_title: Título de la notificación
            notification_message: Mensaje de la notificación
        
        Returns:
            bool: True si el correo se envió correctamente, False en caso contrario
        """
        subject = f"CasaMonarca - {notification_title}"
        
        # Plantilla HTML para notificaciones
        template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>CasaMonarca - Notificación</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4a6da7; color: white; padding: 10px 20px; text-align: center; }}
                .content {{ padding: 20px; border: 1px solid #ddd; }}
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
                    <p>Tienes una nueva notificación en el sistema de CasaMonarca:</p>
                    <h3>{notification_title}</h3>
                    <p>{notification_message}</p>
                    <p>Por favor, inicia sesión en el sistema para ver más detalles.</p>
                    <p>Saludos,<br>Equipo de CasaMonarca</p>
                </div>
                <div class="footer">
                    <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return EmailService.send_email(
            to=user_email,
            subject=subject,
            template=template,
            user_name=user_name,
            notification_title=notification_title,
            notification_message=notification_message
        )
    
    @staticmethod
    def send_document_signature_request(user_email, user_name, document_name, requester_name):
        """
        Envía un correo solicitando la firma de un documento.
        
        Args:
            user_email: Correo del usuario que debe firmar
            user_name: Nombre del usuario que debe firmar
            document_name: Nombre del documento
            requester_name: Nombre de quien solicita la firma
        
        Returns:
            bool: True si el correo se envió correctamente, False en caso contrario
        """
        subject = f"CasaMonarca - Solicitud de firma para documento: {document_name}"
        
        # Plantilla HTML para solicitud de firma
        template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>CasaMonarca - Solicitud de Firma</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4a6da7; color: white; padding: 10px 20px; text-align: center; }}
                .content {{ padding: 20px; border: 1px solid #ddd; }}
                .button {{ display: inline-block; background-color: #4a6da7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }}
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
                    <p>{requester_name} ha solicitado tu firma para el documento:</p>
                    <h3>{document_name}</h3>
                    <p>Por favor, inicia sesión en el sistema para revisar y firmar el documento.</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="#" class="button">Ir al Sistema</a>
                    </p>
                    <p>Saludos,<br>Equipo de CasaMonarca</p>
                </div>
                <div class="footer">
                    <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return EmailService.send_email(
            to=user_email,
            subject=subject,
            template=template,
            user_name=user_name,
            document_name=document_name,
            requester_name=requester_name
        )
