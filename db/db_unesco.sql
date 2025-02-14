-- Création de la base de données
CREATE DATABASE db_unesco;
USE db_unesco;

-- Création de la table avec username et salt
CREATE TABLE t_user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    salt VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données avec username, salt et password
INSERT INTO t_user (username, nom, prenom, email, salt, password) VALUES
('jdupont', 'Dupont', 'Jean', 'jean.dupont@example.com', 'randomSalt123', '$2b$10$zvL2zqA7H5.rMIVD9N8pReH2kGq6WDsQOfKo9BF1m2z5ezG5yF6Eq'), -- Password: Jean123!
('smartin', 'Martin', 'Sophie', 'sophie.martin@example.com', 'saltValue456', '$2b$10$CEogG85XT/hmBg5T1VX5yueLIc/N82FdmsA1Aq5rhMK7Q3seANf7K'), -- Password: Sophie@2024
('lbernard', 'Bernard', 'Lucas', 'lucas.bernard@example.com', 'anotherSalt789', '$2b$10$pDdOgNxsAOFyIJ2Yr6GL/OxWJsF6Aq98FbSYX9vG8DK6gPfEqOGqG'), -- Password: Lucas!789
('elemoine', 'Lemoine', 'Emma', 'emma.lemoine@example.com', 'saltEmma456', '$2b$10$xCGC9Vx8S8gYdf.OakL8vubtxF/9Jm8zFGL5t9z.O0CBf0FVXGuAe'), -- Password: Emma#456
('tgarcia', 'Garcia', 'Thomas', 'thomas.garcia@example.com', 'T0mSalt2024', '$2b$10$U9Z.OqzApt7YZhFX9AS1/uMHIy3fcmJH7yASnXs7JhRbDdqwpDAZG'), -- Password: T0m@Garcia
('crousseau', 'Rousseau', 'Camille', 'camille.rousseau@example.com', 'saltCamille890', '$2b$10$Z5GmZC.mTrOY6EdfxycJNeUmMl7E03XN1pmfoBMiXReJb0KOXGkJ6'), -- Password: Rousseau?890
('lmorel', 'Morel', 'Louis', 'louis.morel@example.com', 'LouisSalt321', '$2b$10$zHHQ73npJFSth/nJ/uOXcOG9s0qghj5gY.VoqGpHLVVrP94m5j/Em'), -- Password: Louis$321
('afischer', 'Fischer', 'Anna', 'anna.fischer@example.com', 'AnnaSaltF5', '$2b$10$NTJs3HfAVJlg.6MWZUpbNeoyZq5Et7A6o3FF1bOqztckrGpiyhYoK'), -- Password: AnnaF!5
('hgirard', 'Girard', 'Hugo', 'hugo.girard@example.com', 'HugoSalt2023', '$2b$10$BdsuYfD5U8xOcoTGELShQumYKJjwq.79TZ1TTQhKtJe1v4tq3yRMu'), -- Password: Hugo*2023
('clefevre', 'Lefevre', 'Clara', 'clara.lefevre@example.com', 'ClaraSalt654', '$2b$10$XYa2CFjF.q/tH8oWUvB4Au1LfVZ/Dxt5sB/NdyG9wsPQV/0YlsRaG'); -- Password: Clara+654
