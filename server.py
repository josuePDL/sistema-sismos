from flask import Flask, render_template, request, jsonify
import smtplib
import pandas as pd

app = Flask(__name__)

@app.route('/')
def alerta():
    return render_template("crear-alerta.html")

@app.route('/enviar-alerta', methods=['POST'])
def enviar_alerta():

    data = request.json
    ubicacion = data['ubicacion']
    magnitud = data['magnitud']
    mensaje_admin = data.get('mensaje', '')

    # ===== DATOS DEL REMITENTE =====
    email_account = "josuedanielpachecodeleon554@gmail.com"
    password_account = "dfhcymnjyuhqxzcd"  # sin espacios

    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login(email_account, password_account)

    # Leer Excel
    email_df = pd.read_excel("Data/Emails.xlsx")

    for i in range(len(email_df)):
        name = email_df['Name'][i]
        email = email_df['Email'][i]

        subject = f"🚨 ALERTA DE SISMO"

        message = f"""
Hola {name},

Se ha registrado un sismo.

📍 Ubicación: {ubicacion}
📊 Magnitud: {magnitud}

{mensaje_admin}

Por favor confirma tu estado en el sistema lo antes posible.

Atentamente,
Sistema de Emergencias
"""

        sent_email = f"""From: Sistema de Emergencias <{email_account}>
To: {name} <{email}>
Subject: {subject}

{message}
"""

        try:
            server.sendmail(email_account, [email], sent_email)
        except Exception as e:
            print(f"Error enviando a {email}: {e}")

    server.close()

    return jsonify({"mensaje": "Correos enviados correctamente"})

if __name__ == '__main__':
    app.run(debug=True)