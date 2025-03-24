import json
import mysql.connector

# Connexion à la base de données MySQL
conn = mysql.connector.connect(
    host="localhost",  # Remplace par l'hôte Docker si nécessaire
    port=6035,         # Vérifie que le port est correct
    user="root",       # Remplace par ton utilisateur MySQL
    password="root",   # Remplace par ton mot de passe MySQL
    database="db_unesco"  # Remplace par le nom de ta base de données
)
cursor = conn.cursor()

# Charger les données JSON
with open('sites.json', 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)

# Insérer les données dans la table MySQL
for item in data:
    states = item.get('states', [])
    if not isinstance(states, list):  # Vérification que c'est bien une liste
        states = []
    states_str = "-" + "-".join(states) if states else None  # Ajout du "-" avant et entre chaque pays

    sql = """
        INSERT INTO t_sites (site_id, categorie, nom, description, lon, lat, region, states)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        categorie = VALUES(categorie),
        nom = VALUES(nom),
        description = VALUES(description),
        lon = VALUES(lon),
        lat = VALUES(lat),
        region = VALUES(region),
        states = VALUES(states)
    """
    
    values = (
        item.get('id_number', None),
        item.get('category', None),
        item.get('site', None),
        item.get('short_description', None),
        item.get('coordinates', {}).get('lon', None),
        item.get('coordinates', {}).get('lat', None),
        item.get('region', None),
        states_str
    )

    cursor.execute(sql, values)

# Valider les changements et fermer la connexion
conn.commit()
cursor.close()
conn.close()

print(" Données insérées avec succès !")
