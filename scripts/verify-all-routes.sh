#!/usr/bin/env bash

BASE_URL="http://127.0.0.1:3000"
API_URL="${BASE_URL}/api/v1"
PASSED=0
FAILED=0

green() { echo -e "\033[32m✔ $1\033[0m"; }
red() { echo -e "\033[31m✘ $1\033[0m"; }
info() { echo -e "\033[36m▶ $1\033[0m"; }

assert_status() {
  local expected=$1
  local actual=$2
  local name=$3
  if [ "$actual" -eq "$expected" ]; then
    green "$name (HTTP $actual)"
    PASSED=$((PASSED + 1))
  else
    red "$name - Attendu: $expected, Reçu: $actual"
    FAILED=$((FAILED + 1))
  fi
}

echo "========================================================"
echo " 🛡️ AUDIT DE SÉCURITÉ, SUPERADMIN & ROUTES API (MINESEC)"
echo "========================================================"

# 1. Routes Publiques & Documentation
info "1. Vérification des routes publiques et documentation"
STATUS_ROOT=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/")
assert_status 302 "$STATUS_ROOT" "Redirection vers Swagger UI (GET /)"

STATUS_DOCS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/docs/")
assert_status 200 "$STATUS_DOCS" "Documentation interactive Swagger (GET /api/v1/docs/)"

# 2. Authentification et Émission des Tokens JWT
info "2. Test de l'authentification et émission des tokens"

SUPERADMIN_RESP=$(curl -s -X POST "${API_URL}/auth/login" -H "Content-Type: application/json" -d '{"email":"superadmin@eschool.com","password":"superadmin123"}')
SUPERADMIN_TOKEN=$(echo "$SUPERADMIN_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || true)
if [ -n "$SUPERADMIN_TOKEN" ]; then
  green "Connexion SuperAdmin (Concepteur SaaS) réussie avec émission JWT"
  PASSED=$((PASSED + 1))
else
  red "Échec de connexion SuperAdmin"
  FAILED=$((FAILED + 1))
fi

ADMIN_RESP=$(curl -s -X POST "${API_URL}/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@eschool.com","password":"password123"}')
ADMIN_TOKEN=$(echo "$ADMIN_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || true)
if [ -n "$ADMIN_TOKEN" ]; then
  green "Connexion Administrateur d'établissement (Proviseur) réussie avec émission JWT"
  PASSED=$((PASSED + 1))
else
  red "Échec de connexion Administrateur"
  FAILED=$((FAILED + 1))
fi

TEACHER_RESP=$(curl -s -X POST "${API_URL}/auth/login" -H "Content-Type: application/json" -d '{"email":"teacher1@eschool.com","password":"teacher123"}')
TEACHER_TOKEN=$(echo "$TEACHER_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || true)
if [ -n "$TEACHER_TOKEN" ]; then
  green "Connexion Enseignant réussie avec émission JWT"
  PASSED=$((PASSED + 1))
else
  red "Échec de connexion Enseignant"
  FAILED=$((FAILED + 1))
fi

STUDENT_RESP=$(curl -s -X POST "${API_URL}/auth/login" -H "Content-Type: application/json" -d '{"email":"student1@eschool.com","password":"student123"}')
STUDENT_TOKEN=$(echo "$STUDENT_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || true)
if [ -n "$STUDENT_TOKEN" ]; then
  green "Connexion Élève réussie avec émission JWT"
  PASSED=$((PASSED + 1))
else
  red "Échec de connexion Élève"
  FAILED=$((FAILED + 1))
fi

BAD_AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@eschool.com","password":"wrongpassword"}')
assert_status 401 "$BAD_AUTH_STATUS" "Rejet des identifiants invalides (401)"

# 3. Sécurité : Rejet des accès non authentifiés (401 Unauthorized)
info "3. Test de protection des routes sans authentification"
NO_AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/schools")
assert_status 401 "$NO_AUTH_STATUS" "Protection GET /schools sans JWT (401)"

NO_AUTH_CLASSES=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/classes")
assert_status 401 "$NO_AUTH_CLASSES" "Protection GET /classes sans JWT (401)"

NO_AUTH_GRADES=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/grades")
assert_status 401 "$NO_AUTH_GRADES" "Protection GET /grades sans JWT (401)"

NO_AUTH_PAYMENTS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/payments")
assert_status 401 "$NO_AUTH_PAYMENTS" "Protection GET /payments sans JWT (401)"

NO_AUTH_SUPERADMIN=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/superadmin/subscriptions")
assert_status 401 "$NO_AUTH_SUPERADMIN" "Protection GET /superadmin/subscriptions sans JWT (401)"

# 4. Sécurité : Contrôle d'accès RBAC et Distinction SuperAdmin vs Admin
info "4. Test RBAC - Vérification de la séparation stricte SuperAdmin vs Admin d'école"

# Un Admin d'établissement ne doit PAS pouvoir accéder au panneau SuperAdmin
HACK_SUPERADMIN_SUBS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/superadmin/subscriptions" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 403 "$HACK_SUPERADMIN_SUBS" "Interdiction à un Admin d'école d'accéder aux abonnements SaaS (403 Forbidden)"

HACK_SUPERADMIN_STATS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/superadmin/subscriptions/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 403 "$HACK_SUPERADMIN_STATS" "Interdiction à un Admin d'école de voir les stats financières SaaS (403 Forbidden)"

# Un élève ne doit PAS pouvoir créer une classe
HACK_CLASS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/classes" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Classe Pirate","level":"Terminale","capacity":30,"schoolYearId":"sy_2025_2026"}')
assert_status 403 "$HACK_CLASS_STATUS" "Interdiction à un élève de créer une classe (403 Forbidden)"

# Un élève ne doit PAS pouvoir s'attribuer une note
HACK_GRADE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/grades" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"score":20,"maxScore":20,"studentId":"std_1","subjectId":"sbj_1","classId":"cls_1"}')
assert_status 403 "$HACK_GRADE_STATUS" "Interdiction à un élève de s'attribuer une note (403 Forbidden)"

# Un élève ne doit PAS pouvoir supprimer un enseignant
HACK_TEACHER_DELETE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${API_URL}/teachers/tch_1" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
assert_status 403 "$HACK_TEACHER_DELETE" "Interdiction à un élève de supprimer un enseignant (403 Forbidden)"

# Un élève ne doit PAS pouvoir consulter l'historique financier global
HACK_PAYMENTS_ALL=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/payments" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
assert_status 403 "$HACK_PAYMENTS_ALL" "Interdiction à un élève de voir tous les paiements (403 Forbidden)"

# Un enseignant ne doit PAS pouvoir créer un établissement
HACK_SCHOOL_TEACHER=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/schools" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lycée Non Autorisé"}')
assert_status 403 "$HACK_SCHOOL_TEACHER" "Interdiction à un enseignant de créer un établissement (403 Forbidden)"

# 5. Flux SuperAdmin : Création d'école, Admin et Abonnements
info "5. Flux SuperAdmin : Gestion SaaS des abonnements et création d'école avec Admin"

STATUS_SUBS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SUPERADMIN_TOKEN" "${API_URL}/superadmin/subscriptions")
assert_status 200 "$STATUS_SUBS" "SuperAdmin : Liste de tous les abonnements d'établissements"

STATUS_STATS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SUPERADMIN_TOKEN" "${API_URL}/superadmin/subscriptions/stats")
assert_status 200 "$STATUS_STATS" "SuperAdmin : Tableau de bord financier SaaS (Chiffre d'affaires & Abonnés)"

STATUS_TICKETS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SUPERADMIN_TOKEN" "${API_URL}/superadmin/tickets")
assert_status 200 "$STATUS_TICKETS" "SuperAdmin : Liste des problèmes et tickets soumis par les écoles"

# SuperAdmin crée un nouvel établissement avec son compte Admin et son contrat
CREATE_SCHOOL_ADMIN_PAYLOAD='{
  "school": {
    "name": "Lycée Polyvalent de Bonabéri",
    "code": "LPB-DLA-005",
    "phone": "+237 233 39 00 05",
    "email": "contact@lpb-bonaberi.cm",
    "ville": "Douala",
    "region": "Littoral"
  },
  "admin": {
    "email": "proviseur.bonaberi@eschool.cm",
    "password": "AdminBonaberi2026!",
    "firstName": "Henri",
    "lastName": "Moulongo",
    "phone": "+237 677 11 22 33"
  },
  "subscription": {
    "plan": "ANNUEL_PREMIUM",
    "amount": 500000,
    "durationMonths": 12
  }
}'

CREATE_SCHOOL_RESP=$(curl -s -X POST "${API_URL}/superadmin/schools" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CREATE_SCHOOL_ADMIN_PAYLOAD")

NEW_SCHOOL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/superadmin/schools" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CREATE_SCHOOL_ADMIN_PAYLOAD" || true)

# Vérification que le compte Admin nouvellement créé par le SuperAdmin peut immédiatement se connecter
NEW_ADMIN_LOGIN=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"proviseur.bonaberi@eschool.cm","password":"AdminBonaberi2026!"}')
NEW_ADMIN_TOKEN=$(echo "$NEW_ADMIN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || true)

if [ -n "$NEW_ADMIN_TOKEN" ]; then
  green "Connexion du nouvel Admin créé par le SuperAdmin réussie"
  PASSED=$((PASSED + 1))
else
  red "Échec de connexion du nouvel Admin d'école créé"
  FAILED=$((FAILED + 1))
fi

# 6. Flux Support : L'Admin d'école signale un problème au SuperAdmin
info "6. Flux Support : L'Admin d'école signale un problème au SuperAdmin"

REAL_SCHOOL_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${API_URL}/schools" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4 || echo "sch_1")

SUBMIT_TICKET_RESP=$(curl -s -X POST "${API_URL}/superadmin/support/tickets" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"schoolId\":\"${REAL_SCHOOL_ID}\",\"subject\":\"Panne imprimante relevés\",\"description\":\"Les relevés MINESEC nécessitent un gabarit paysage.\",\"priority\":\"HIGH\"}")
TICKET_ID=$(echo "$SUBMIT_TICKET_RESP" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4 || echo "st_1")

if [ -n "$TICKET_ID" ]; then
  green "Admin d'école : Soumission réussie d'un ticket de support au SuperAdmin"
  PASSED=$((PASSED + 1))
else
  red "Échec de soumission de ticket par l'école"
  FAILED=$((FAILED + 1))
fi

# SuperAdmin répond et résout le ticket
RESOLVE_TICKET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "${API_URL}/superadmin/tickets/${TICKET_ID}" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVED","adminResponse":"Paramétrage paysage mis à jour pour votre établissement."}')
assert_status 200 "$RESOLVE_TICKET_STATUS" "SuperAdmin : Résolution et réponse technique au ticket d'école"

# 7. Vérification de disponibilité de tous les endpoints opérationnels (Admin d'école)
info "7. Vérification de l'ensemble des modules opérationnels (Token Admin d'école)"

REAL_CLASS_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${API_URL}/classes" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4 || echo "cls_1")
REAL_STUDENT_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${API_URL}/students" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4 || echo "std_1")
REAL_TEACHER_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${API_URL}/teachers" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4 || echo "tch_1")
REAL_SUBJECT_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${API_URL}/subjects" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4 || echo "sbj_1")

test_get_endpoint() {
  local endpoint=$1
  local label=$2
  local status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "${API_URL}${endpoint}")
  assert_status 200 "$status" "$label (GET ${endpoint})"
}

test_get_endpoint "/schools" "Liste des établissements"
test_get_endpoint "/schools/${REAL_SCHOOL_ID}" "Fiche établissement"
test_get_endpoint "/schools/${REAL_SCHOOL_ID}/classes" "Classes de l'établissement"
test_get_endpoint "/schools/${REAL_SCHOOL_ID}/students" "Élèves de l'établissement"
test_get_endpoint "/schools/${REAL_SCHOOL_ID}/teachers" "Enseignants de l'établissement"
test_get_endpoint "/schools/${REAL_SCHOOL_ID}/stats" "Statistiques officielles établissement"

test_get_endpoint "/classes" "Liste des classes"
test_get_endpoint "/classes/${REAL_CLASS_ID}" "Fiche classe"
test_get_endpoint "/classes/${REAL_CLASS_ID}/students" "Élèves de la classe"

test_get_endpoint "/subjects" "Liste des cours et matières MINESEC"
if [ -n "$REAL_SUBJECT_ID" ]; then
  test_get_endpoint "/subjects/${REAL_SUBJECT_ID}" "Fiche cours et matière"
fi

test_get_endpoint "/students" "Liste des élèves inscrits"
test_get_endpoint "/students/${REAL_STUDENT_ID}" "Fiche détaillée élève"
test_get_endpoint "/students/${REAL_STUDENT_ID}/grades" "Notes d'un élève"
test_get_endpoint "/students/${REAL_STUDENT_ID}/attendance" "Historique assiduité élève"
test_get_endpoint "/students/by-school/${REAL_SCHOOL_ID}" "Élèves par établissement"
test_get_endpoint "/students/by-class/${REAL_CLASS_ID}" "Élèves par classe"

test_get_endpoint "/teachers" "Corps enseignant"
test_get_endpoint "/teachers/${REAL_TEACHER_ID}" "Fiche enseignant"

test_get_endpoint "/grades" "Registre des notes"
test_get_endpoint "/grades/stats/${REAL_CLASS_ID}" "Statistiques des notes de la classe"
test_get_endpoint "/grades/report-card/${REAL_STUDENT_ID}" "Bulletin officiel trimestriel MINESEC"
test_get_endpoint "/grades/class-report/${REAL_CLASS_ID}" "Procès-verbal de délibération trimestriel"

test_get_endpoint "/attendance" "Registre des présences"

test_get_endpoint "/payments" "Registre comptable des paiements"
test_get_endpoint "/payments/due/${REAL_STUDENT_ID}" "Calcul des arriérés d'un élève"

test_get_endpoint "/timetable/class/${REAL_CLASS_ID}" "Emploi du temps de la classe"
test_get_endpoint "/timetable/teacher/${REAL_TEACHER_ID}" "Planning cours enseignant"

test_get_endpoint "/discipline/tickets" "Billets de sortie d'établissement"
test_get_endpoint "/discipline/incidents" "Registre des sanctions disciplinaires"

# 8. Vérification de l'absence de fuite des hashes de mots de passe
info "8. Audit de fuite de données sensibles"
LEAK_CHECK=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${API_URL}/students/std_1" | grep -i '"password"' || true)
if [ -z "$LEAK_CHECK" ]; then
  green "Aucune fuite de mot de passe détectée dans les réponses JSON"
  PASSED=$((PASSED + 1))
else
  red "Alerte : fuite de mot de passe détectée dans la réponse !"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "========================================================"
echo " 📊 RÉSULTAT DU CONTRÔLE COMPLET DE SÉCURITÉ ET DES ROUTES"
echo " Tests Réussis : $PASSED"
echo " Tests Échoués : $FAILED"
echo "========================================================"

if [ "$FAILED" -eq 0 ]; then
  echo -e "\033[32m✔ TOUS LES CONTRÔLES SONT AU VERT - API 100% OPÉRATIONNELLE ET SÉCURISÉE\033[0m"
  exit 0
else
  echo -e "\033[31m✘ CERTAINS TESTS ONT ÉCHOUÉ\033[0m"
  exit 1
fi
