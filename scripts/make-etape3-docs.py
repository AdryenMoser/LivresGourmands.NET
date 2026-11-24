"""Produit le diagramme ER et le rapport Word demandés par le compte rendu."""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

ENTITIES = [
    ("users", ["PK id", "nom, prenom", "email UK", "password_hash (bcrypt)", "role, actif"], (36, 70)),
    ("categories", ["PK id", "nom UK", "description"], (360, 86)),
    ("ouvrages", ["PK id", "titre, auteur, isbn UK", "prix, stock, popularite", "FK categorie_id"], (680, 64)),
    ("paniers", ["PK id", "FK client_id", "actif, updated_at"], (36, 340)),
    ("panier_items", ["PK id", "FK panier_id", "FK ouvrage_id", "quantite, prix_unitaire"], (330, 328)),
    ("avis", ["PK id", "FK client_id", "FK ouvrage_id", "UK (client, ouvrage)", "note 1..5"], (660, 340)),
    ("commentaires", ["PK id", "FK client_id", "FK ouvrage_id", "statut, contenu", "FK valide_par"], (980, 328)),
    ("listes_cadeaux", ["PK id", "nom", "FK proprietaire_id", "code_partage UK"], (36, 590)),
    ("liste_items", ["PK id", "FK liste_id", "FK ouvrage_id", "qté souhaitée / achetée"], (330, 578)),
    ("commandes", ["PK id", "FK client_id 0..1", "FK liste_id 0..1", "total, statut, livraison"], (660, 570)),
    ("commande_items", ["PK id", "FK commande_id", "FK ouvrage_id", "FK liste_item_id 0..1"], (980, 578)),
    ("payments", ["PK id", "FK commande_id", "référence prestataire UK", "statut, amount"], (1280, 586)),
]


def font(size, bold=False):
    return ImageFont.truetype(FONT_B if bold else FONT, size)


def box_size(title, fields):
    width = 230
    height = 28 + 18 * len(fields) + 10
    return width, height


def draw_diagram(path: Path):
    image = Image.new("RGB", (1560, 900), "#fffaf3")
    draw = ImageDraw.Draw(image)
    draw.text((36, 18), "Livres Gourmands — diagramme entité-association", font=font(20, True), fill="#241c16")
    boxes = {}
    for name, fields, (x, y) in ENTITIES:
        width, height = box_size(name, fields)
        boxes[name] = (x, y, width, height)
        draw.rounded_rectangle((x, y, x + width, y + height), radius=8, fill="#fffdf8", outline="#241c16", width=2)
        draw.rectangle((x, y, x + width, y + 26), fill="#9d341f")
        draw.text((x + 8, y + 4), name, font=font(13, True), fill="#fffaf3")
        for index, field in enumerate(fields):
            draw.text((x + 8, y + 32 + index * 18), field, font=font(12), fill="#241c16")

    def center(name):
        x, y, width, height = boxes[name]
        return x + width / 2, y + height / 2

    def side(name, toward, which):
        x, y, width, height = boxes[name]
        tx, ty = center(toward)
        cx, cy = center(name)
        horizontal = abs(tx - cx) > abs(ty - cy)
        if horizontal:
            point = (x + width, cy) if tx > cx else (x, cy)
            shift = (-28, -16) if tx > cx else (8, -16)
        else:
            point = (cx, y + height) if ty > cy else (cx, y)
            shift = (8, 4) if ty > cy else (8, -18)
        if which == "end":
            shift = (shift[0], shift[1] + (16 if not horizontal and ty < cy else 0))
        return point, shift

    links = [
        ("categories", "ouvrages", "1", "*"),
        ("users", "paniers", "1", "*"),
        ("paniers", "panier_items", "1", "1..*"),
        ("ouvrages", "avis", "1", "*"),
        ("listes_cadeaux", "liste_items", "1", "1..*"),
        ("commandes", "commande_items", "1", "1..*"),
        ("commande_items", "payments", "*", "1"),
    ]
    for left, right, card_l, card_r in links:
        start, shift_l = side(left, right, "start")
        end, shift_r = side(right, left, "end")
        draw.line((start, end), fill="#a68456", width=2)
        draw.text((start[0] + shift_l[0], start[1] + shift_l[1]), card_l, font=font(12, True), fill="#7c2414")
        draw.text((end[0] + shift_r[0], end[1] + shift_r[1]), card_r, font=font(12, True), fill="#7c2414")

    legend = [
        "Cardinalités non dessinées, pour garder le schéma lisible :",
        "users 1 — * avis, commentaires, commandes, listes_cadeaux   ·   ouvrages 1 — * panier_items, liste_items, commande_items",
        "listes_cadeaux 0..1 — * commandes   ·   commentaires.validé_par → users",
        "PK clé primaire · FK clé étrangère · UK unicité. payments ne garde qu’une référence prestataire, aucune donnée de carte (RG6).",
    ]
    y = 820
    for line in legend:
        draw.text((36, y), line, font=font(13), fill="#5e534a")
        y += 18
    image.save(path, "PNG")


def add_table(document, headers, rows):
    table = document.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    for index, header in enumerate(headers):
        cell = table.rows[0].cells[index]
        cell.text = header
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.bold = True
                run.font.size = Pt(9)
    for row in rows:
        cells = table.add_row().cells
        for index, value in enumerate(row):
            cells[index].text = value
            for paragraph in cells[index].paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(9)
    document.add_paragraph()


def build_report(image_path: Path, doc_path: Path):
    document = Document()
    style = document.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)
    title = document.add_heading("Livres Gourmands — rapport et dictionnaire de données", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    meta = document.add_paragraph(
        "Programmation Web avancée [420-WA6-AG] · Automne 2026 · Kahina Tamazouzt\n"
        "Binôme : Wallace do Nascimento Coura · Adryen Moser"
    )
    meta.runs[0].font.color.rgb = RGBColor(0x5E, 0x53, 0x4A)

    document.add_heading("1. Ce que ce document complète", level=1)
    document.add_paragraph(
        "Le compte rendu de l’étape 02 demandait trois pièces absentes du rendu lu par l’enseignante : "
        "un diagramme entité-association, un rapport au format Word, et un dictionnaire de données. "
        "Il signalait aussi l’absence des verbes PUT et DELETE dans la collection examinée, et l’absence "
        "visible de bcrypt. L’API les possède déjà ; ce document et la collection Postman les rendent explicites. "
        "Le comportement de l’application ne change pas."
    )

    document.add_heading("2. bcrypt", level=1)
    document.add_paragraph(
        "Les mots de passe ne sont jamais enregistrés en clair. À l’inscription, src/services/authService.js "
        "appelle bcrypt.hash(motDePasse, 10) et n’insère que password_hash. La connexion utilise bcrypt.compare. "
        "Un changement de mot de passe (PUT /api/users/:id) passe par le même hash dans src/services/userService.js. "
        "Les comptes de démonstration de sql/seed.sql contiennent déjà des empreintes bcrypt de coût 10. "
        "Le paquet npm est bcrypt (et non un substitut)."
    )

    document.add_heading("3. PUT et DELETE", level=1)
    document.add_paragraph(
        "Ces verbes sont déclarés dans src/routes/api.js et repris dans "
        "postman/livres-gourmands.postman_collection.json, dossier « PUT et DELETE »."
    )
    add_table(
        document,
        ["Verbe", "Chemin", "Rôle"],
        [
            ["PUT", "/api/users/:id", "propriétaire ou administrateur"],
            ["PUT", "/api/categories/:id", "éditeur, gestionnaire, administrateur"],
            ["DELETE", "/api/categories/:id", "même rôle, refus si des ouvrages y sont liés"],
            ["PUT", "/api/ouvrages/:id", "éditeur, gestionnaire, administrateur"],
            ["DELETE", "/api/ouvrages/:id", "même rôle, refus si l’ouvrage est déjà commandé"],
            ["PUT", "/api/panier/items/:id", "client"],
            ["DELETE", "/api/panier/items/:id", "client"],
            ["DELETE", "/api/panier", "client, vide le panier"],
            ["PUT", "/api/commandes/:id/status", "gestionnaire, administrateur"],
            ["PUT", "/api/commentaires/:id/valider", "éditeur, administrateur"],
            ["DELETE", "/api/listes/:id/items/:itemId", "client propriétaire, si rien n’a encore été offert"],
        ],
    )

    document.add_heading("4. Diagramme entité-association", level=1)
    document.add_paragraph(
        "Le fichier docs/diagramme-er.png reprend les tables de sql/schema.sql, leurs clés et les cardinalités. "
        "client_id est facultatif sur commandes pour l’ami qui achète une liste sans compte. "
        "Une commande est réglée par un ou plusieurs paiements ; seul le dernier paiement réussi décrémente le stock."
    )
    document.add_picture(str(image_path), width=Inches(6.6))
    document.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER

    document.add_heading("5. Dictionnaire de données", level=1)
    document.add_paragraph(
        "Moteur InnoDB, utf8mb4. Les montants sont des DECIMAL(10,2). Les dates sont des DATETIME, sauf date_avis (DATE)."
    )

    dictionaries = [
        ("users", [
            ["id", "INT", "PK, auto-incrément"],
            ["nom, prenom", "VARCHAR(100)", "NOT NULL"],
            ["email", "VARCHAR(255)", "UNIQUE, NOT NULL"],
            ["password_hash", "VARCHAR(255)", "NOT NULL, bcrypt coût 10"],
            ["role", "ENUM", "client, editeur, gestionnaire, administrateur"],
            ["actif", "BOOLEAN", "défaut vrai ; faux = compte suspendu (RG5)"],
            ["created_at, updated_at", "DATETIME", "NOT NULL"],
        ]),
        ("categories", [
            ["id", "INT", "PK"],
            ["nom", "VARCHAR(120)", "UNIQUE, NOT NULL"],
            ["description", "TEXT", "nullable"],
        ]),
        ("ouvrages", [
            ["id", "INT", "PK"],
            ["titre, auteur", "VARCHAR(255)", "NOT NULL"],
            ["isbn", "VARCHAR(20)", "UNIQUE, NOT NULL"],
            ["description", "TEXT", "nullable"],
            ["prix", "DECIMAL(10,2)", "CHECK >= 0"],
            ["stock", "INT", "CHECK >= 0 ; le catalogue public exige stock > 0 (RG1)"],
            ["popularite", "INT", "CHECK >= 0, filtrable"],
            ["categorie_id", "INT", "FK → categories.id"],
        ]),
        ("paniers et panier_items", [
            ["paniers.id", "INT", "PK"],
            ["client_id", "INT", "FK → users.id"],
            ["actif", "BOOLEAN", "un seul panier actif par client"],
            ["updated_at", "DATETIME", "expiration après 72 h sans activité (RG2)"],
            ["panier_items.quantite", "INT", "CHECK > 0"],
            ["prix_unitaire", "DECIMAL(10,2)", "prix au moment de l’ajout"],
            ["unicité", "—", "(panier_id, ouvrage_id)"],
        ]),
        ("listes_cadeaux et liste_items", [
            ["nom", "VARCHAR(200)", "NOT NULL"],
            ["proprietaire_id", "INT", "FK → users.id"],
            ["code_partage", "VARCHAR(32)", "UNIQUE"],
            ["quantite_souhaitee", "INT", "CHECK > 0"],
            ["quantite_achetee", "INT", "CHECK >= 0"],
        ]),
        ("commandes et commande_items", [
            ["client_id", "INT", "FK, NULL si l’acheteur n’a pas de compte"],
            ["liste_cadeaux_id", "INT", "FK, NULL si la commande vient du panier"],
            ["acheteur_nom, acheteur_email", "VARCHAR", "NOT NULL"],
            ["total", "DECIMAL(10,2)", "somme des lignes"],
            ["statut", "ENUM", "en_attente_paiement, payee, en_preparation, expediee, livree, annulee"],
            ["adresse_livraison", "TEXT", "NOT NULL"],
            ["mode_livraison", "ENUM", "standard, express, relais"],
            ["mode_paiement", "ENUM", "carte_simulee, paypal_simule"],
            ["liste_item_id", "INT", "FK nullable sur la ligne"],
        ]),
        ("avis", [
            ["client_id, ouvrage_id", "INT", "FK, UNIQUE ensemble (un avis par achat)"],
            ["note", "INT", "CHECK entre 1 et 5"],
            ["date_avis", "DATE", "NOT NULL"],
        ]),
        ("commentaires", [
            ["contenu", "TEXT", "NOT NULL"],
            ["statut", "ENUM", "en_attente, valide, rejete — défaut en_attente (RG4)"],
            ["date_soumission, date_validation", "DATETIME", "validation nullable"],
            ["valide_par", "INT", "FK → users.id, nullable"],
        ]),
        ("payments", [
            ["commande_id", "INT", "FK → commandes.id"],
            ["provider", "VARCHAR(40)", "simulation_carte ou simulation_paypal"],
            ["provider_payment_id", "VARCHAR(80)", "UNIQUE, seule référence prestataire (RG6)"],
            ["statut", "ENUM", "initie, reussi, echoue, annule"],
            ["amount", "DECIMAL(10,2)", "CHECK >= 0"],
        ]),
    ]
    for name, rows in dictionaries:
        document.add_heading(name, level=2)
        add_table(document, ["Colonne", "Type", "Contraintes"], rows)

    document.add_heading("6. Rappels de règles déjà en place", level=1)
    document.add_paragraph(
        "RG1 filtre le catalogue public sur stock > 0. RG2 vide un panier inactif. "
        "RG3 n’accepte un avis qu’après une commande payée de cet ouvrage. "
        "RG4 laisse le commentaire invisible tant qu’un éditeur ne l’a pas validé. "
        "RG5 empêche la connexion d’un compte suspendu. "
        "RG6 refuse tout champ bancaire et ne stocke qu’une référence de prestataire. "
        "Le stock baisse dans une transaction seulement quand le paiement simulé réussit."
    )
    document.add_heading("7. Limites", level=1)
    document.add_paragraph(
        "Le paiement ne contacte ni Stripe ni PayPal. L’expiration des paniers est un script "
        "(npm run db:expire-paniers) plus un contrôle à la lecture, pas un cron système. "
        "RG3 est vérifiée dans l’API ; la base empêche seulement le doublon d’avis."
    )
    document.save(doc_path)


if __name__ == "__main__":
    DOCS.mkdir(exist_ok=True)
    image = DOCS / "diagramme-er.png"
    draw_diagram(image)
    build_report(image, DOCS / "rapport.docx")
    print(f"Écrits : {image} et {DOCS / 'rapport.docx'}")
