# 📖 Guide Complet des Payloads JSON (Requêtes et Réponses API)
### Système de Gestion Scolaire eSchool (Norme MINESEC Cameroun)

**En-têtes standards requis pour les requêtes authentifiées :**
```http
Content-Type: application/json
Authorization: Bearer <VOTRE_TOKEN_JWT>
```

---

## 1. 🔐 Authentification (`/api/v1/auth`)

### 1.1. Connexion (`POST /api/v1/auth/login`)
**Body envoyé :**
```json
{
  "email": "admin@eschool.com",
  "password": "admin123"
}
```
**Réponse reçue (HTTP 200) :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_admin_1",
      "email": "admin@eschool.com",
      "firstName": "Proviseur",
      "lastName": "Directeur",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 1.2. Inscription d'un utilisateur (`POST /api/v1/auth/register`)
**Body envoyé :**
```json
{
  "email": "nouveau.prof@eschool.cm",
  "password": "MotDePasseFort2026!",
  "firstName": "Alain",
  "lastName": "Fokam",
  "role": "TEACHER"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1730200000",
      "email": "nouveau.prof@eschool.cm",
      "firstName": "Alain",
      "lastName": "Fokam",
      "role": "TEACHER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 1.3. Profil utilisateur connecté (`GET /api/v1/auth/profile`)
**Réponse reçue (HTTP 200) :**
```json
{
  "success": true,
  "data": {
    "id": "usr_admin_1",
    "email": "admin@eschool.com",
    "firstName": "Proviseur",
    "lastName": "Directeur",
    "role": "ADMIN",
    "status": "ACTIVE",
    "phone": "+237 690 00 00 01"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

---

## 2. 🏫 Établissements Scolaires (`/api/v1/schools`)

### 2.1. Créer un établissement (`POST /api/v1/schools`) - *ADMIN*
**Body envoyé :**
```json
{
  "name": "Lycée Bilingue d'Essos",
  "code": "LBE-YDE-004",
  "address": "Essos, Yaoundé",
  "phone": "+237 222 30 00 04",
  "email": "contact@lb-essos.cm",
  "ville": "Yaoundé",
  "region": "Centre",
  "slogan": "Discipline et Travail"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "sch_1730200001",
    "name": "Lycée Bilingue d'Essos",
    "code": "LBE-YDE-004",
    "address": "Essos, Yaoundé",
    "phone": "+237 222 30 00 04",
    "email": "contact@lb-essos.cm",
    "ville": "Yaoundé",
    "region": "Centre",
    "slogan": "Discipline et Travail",
    "timezone": "Africa/Douala",
    "createdAt": "2026-10-29T12:00:00.000Z",
    "updatedAt": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 2.2. Statistiques d'un établissement MINESEC (`GET /api/v1/schools/sch_1/stats`)
**Réponse reçue (HTTP 200) :**
```json
{
  "success": true,
  "data": {
    "schoolId": "sch_1",
    "schoolName": "Lycée Général Leclerc de Yaoundé",
    "totalStudents": 2,
    "activeStudents": 2,
    "totalTeachers": 2,
    "totalClasses": 4,
    "totalRevenue": 70000,
    "currency": "XAF (FCFA)"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

---

## 3. 📚 Classes (`/api/v1/classes`)

### 3.1. Créer une classe (`POST /api/v1/classes`) - *ADMIN*
**Body envoyé :**
```json
{
  "name": "Première A4 Allemand",
  "level": "Première",
  "section": "Littéraire",
  "capacity": 45,
  "schoolYearId": "sy_2025_2026",
  "schoolId": "sch_1",
  "teacherId": "tch_2"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "cls_1730200002",
    "name": "Première A4 Allemand",
    "level": "Première",
    "section": "Littéraire",
    "capacity": 45,
    "status": "ACTIVE",
    "schoolYearId": "sy_2025_2026",
    "schoolId": "sch_1",
    "teacherId": "tch_2",
    "createdAt": "2026-10-29T12:00:00.000Z",
    "updatedAt": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 3.2. Élèves d'une classe (`GET /api/v1/classes/cls_1/students`)
**Réponse reçue (HTTP 200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": "std_1",
      "studentId": "STU001",
      "status": "ACTIVE",
      "classId": "cls_1",
      "user": {
        "id": "usr_student_1",
        "email": "student1@eschool.com",
        "firstName": "Paul",
        "lastName": "Biya Jr",
        "role": "STUDENT",
        "phone": "+237 690 00 00 03"
      }
    }
  ],
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

---

## 4. 📖 Cours & Matières (`/api/v1/subjects`)

### 4.1. Créer une matière avec coefficient MINESEC (`POST /api/v1/subjects`) - *ADMIN*
**Body envoyé :**
```json
{
  "name": "Philosophie",
  "code": "PHIL-TC",
  "credits": 4,
  "classId": "cls_1"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "sbj_1730200003",
    "name": "Philosophie",
    "code": "PHIL-TC",
    "credits": 4,
    "classId": "cls_1",
    "class": {
      "id": "cls_1",
      "name": "Terminale C"
    },
    "createdAt": "2026-10-29T12:00:00.000Z",
    "updatedAt": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

---

## 5. 👨‍🎓 Élèves (`/api/v1/students`)

### 5.1. Inscrire un élève (`POST /api/v1/students`) - *ADMIN*
**Body envoyé :**
```json
{
  "studentId": "STU009",
  "email": "samuel.etoo@eschool.cm",
  "firstName": "Samuel",
  "lastName": "Eto'o Fils",
  "phone": "+237 677 88 99 00",
  "classId": "cls_1",
  "schoolId": "sch_1"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "std_1730200004",
    "studentId": "STU009",
    "enrollmentDate": "2026-10-29T12:00:00.000Z",
    "status": "ACTIVE",
    "classId": "cls_1",
    "schoolId": "sch_1",
    "user": {
      "id": "usr_1730200004",
      "email": "samuel.etoo@eschool.cm",
      "firstName": "Samuel",
      "lastName": "Eto'o Fils",
      "role": "STUDENT",
      "phone": "+237 677 88 99 00"
    },
    "class": {
      "id": "cls_1",
      "name": "Terminale C"
    }
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

---

## 6. 📊 Notes & Bulletins Officiels MINESEC (`/api/v1/grades`)

### 6.1. Enregistrer une note d'évaluation (`POST /api/v1/grades`) - *TEACHER / ADMIN*
**Body envoyé :**
```json
{
  "score": 17.5,
  "maxScore": 20,
  "status": "PUBLISHED",
  "studentId": "std_1",
  "subjectId": "sbj_1",
  "classId": "cls_1"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "grd_1730200005",
    "score": 17.5,
    "maxScore": 20,
    "status": "PUBLISHED",
    "studentId": "std_1",
    "subjectId": "sbj_1",
    "classId": "cls_1",
    "createdAt": "2026-10-29T12:00:00.000Z",
    "updatedAt": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 6.2. Bulletin Officiel Trimestriel MINESEC (`GET /api/v1/grades/report-card/std_1`)
**Réponse reçue (HTTP 200) :**
```json
{
  "success": true,
  "data": {
    "institution": "RÉPUBLIQUE DU CAMEROUN - MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES",
    "system": "eSchool ERP Cameroun (Conforme MINESEC)",
    "period": "Trimestre 1",
    "student": {
      "id": "std_1",
      "matricule": "STU001",
      "fullName": "Paul Biya Jr",
      "email": "student1@eschool.com",
      "phone": "+237 690 00 00 03",
      "class": "Terminale C",
      "level": "Terminale"
    },
    "discipline": {
      "absencesHours": 0,
      "unjustifiedAbsences": 0,
      "latesCount": 0,
      "punishments": 0
    },
    "subjects": [
      {
        "subjectId": "sbj_1",
        "subjectName": "Mathématiques",
        "code": "MATH-TC",
        "coefficient": 6,
        "score": 16.5,
        "maxScore": 20,
        "weightedScore": 99.0,
        "appreciation": "Très Bien"
      },
      {
        "subjectId": "sbj_2",
        "subjectName": "Physique-Chimie",
        "code": "PC-TC",
        "coefficient": 5,
        "score": 15.0,
        "maxScore": 20,
        "weightedScore": 75.0,
        "appreciation": "Bien"
      },
      {
        "subjectId": "sbj_3",
        "subjectName": "Français",
        "code": "FRAN-TC",
        "coefficient": 3,
        "score": 13.5,
        "maxScore": 20,
        "weightedScore": 40.5,
        "appreciation": "Assez Bien"
      }
    ],
    "summary": {
      "totalCoefficients": 14,
      "totalPoints": 214.5,
      "generalAverage": 15.32,
      "outOf": 20,
      "rank": "1er / 35",
      "classAverage": 12.45,
      "councilDecision": "Tableau d Honneur avec Félicitations"
    },
    "generatedAt": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

---

## 7. 💳 Finances & Mobile Money Cameroun (`/api/v1/payments`)

### 7.1. Émettre un avis de paiement (`POST /api/v1/payments`) - *ADMIN*
**Body envoyé :**
```json
{
  "amount": 50000,
  "type": "TUITION",
  "dueDate": "2026-03-01T00:00:00.000Z",
  "studentId": "std_1",
  "description": "Frais de scolarité - 3ème tranche"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "pay_1730200006",
    "amount": 50000,
    "type": "TUITION",
    "status": "PENDING",
    "dueDate": "2026-03-01T00:00:00.000Z",
    "paidDate": null,
    "studentId": "std_1",
    "description": "Frais de scolarité - 3ème tranche",
    "createdAt": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 7.2. Régler par MTN Mobile Money ou Orange Money (`POST /api/v1/payments/:id/momo`)
**Body envoyé :**
```json
{
  "provider": "MTN_MOMO",
  "phoneNumber": "+237 677 12 34 56"
}
```
**Réponse reçue (HTTP 200) :**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Paiement de 35000 FCFA validé avec succès par MTN_MOMO",
    "reference": "MTN_MOMO-918273",
    "payment": {
      "id": "pay_3",
      "amount": 35000,
      "type": "TUITION",
      "status": "PAID",
      "paidDate": "2026-10-29T12:00:00.000Z",
      "studentId": "std_1"
    }
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 7.3. Reçu officiel de versement (`GET /api/v1/payments/pay_1/receipt`)
**Réponse reçue (HTTP 200) :**
```json
{
  "success": true,
  "data": {
    "institution": "RÉPUBLIQUE DU CAMEROUN - MINESEC",
    "title": "REÇU OFFICIEL DE VERSEMENT DE FRAIS SCOLAIRES",
    "receiptNumber": "REC-2026-PAY_1",
    "date": "2025-09-15T00:00:00.000Z",
    "student": {
      "id": "std_1",
      "matricule": "STU001",
      "name": "Paul Biya Jr",
      "class": "Terminale C"
    },
    "details": {
      "type": "TUITION",
      "amount": 45000,
      "currency": "FCFA",
      "status": "PAID",
      "description": "Frais de scolarité - 1ère tranche"
    },
    "transactions": [
      {
        "id": "tx_1",
        "amount": 45000,
        "method": "MTN_MOMO",
        "reference": "MOMO-2025-YDE-001",
        "notes": "Paiement scolarité par MTN Mobile Money validé"
      }
    ],
    "issuedBy": "Intendance / Service Économat",
    "status": "ACQUITTÉ"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

---

## 8. 🗓️ Emploi du Temps (`/api/v1/timetable`)

### 8.1. Ajouter un créneau (`POST /api/v1/timetable`) - *ADMIN*
**Body envoyé :**
```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "07:30",
  "endTime": "09:30",
  "classId": "cls_1",
  "subjectId": "sbj_1",
  "teacherId": "tch_1"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "tt_1730200007",
    "dayOfWeek": "MONDAY",
    "startTime": "07:30",
    "endTime": "09:30",
    "classId": "cls_1",
    "createdAt": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 8.2. Emploi du temps d'une classe (`GET /api/v1/timetable/class/cls_1`)
**Réponse reçue (HTTP 200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": "tt_1",
      "dayOfWeek": "MONDAY",
      "startTime": "07:30",
      "endTime": "09:30",
      "classId": "cls_1"
    },
    {
      "id": "tt_2",
      "dayOfWeek": "MONDAY",
      "startTime": "09:45",
      "endTime": "11:45",
      "classId": "cls_1"
    }
  ],
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

---

## 9. 🛡️ Vie Scolaire & Discipline (`/api/v1/discipline`)

### 9.1. Délivrer un billet de sortie (`POST /api/v1/discipline/tickets`) - *ADMIN / TEACHER*
**Body envoyé :**
```json
{
  "studentId": "std_1",
  "reason": "Malaise / Évacuation infirmerie",
  "authorizedBy": "Surveillant Général"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "ticket_1730200008",
    "studentId": "std_1",
    "studentName": "Paul Biya Jr",
    "className": "Terminale C",
    "reason": "Malaise / Évacuation infirmerie",
    "authorizedBy": "Surveillant Général",
    "status": "AUTORISÉ",
    "createdAt": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```

### 9.2. Enregistrer une sanction disciplinaire (`POST /api/v1/discipline/incidents`) - *ADMIN / TEACHER*
**Body envoyé :**
```json
{
  "studentId": "std_1",
  "description": "Bavardage et perturbation répétée en cours de Mathématiques",
  "sanction": "Consigne / Heures de retenue",
  "details": "2 heures de retenue le samedi matin"
}
```
**Réponse reçue (HTTP 201) :**
```json
{
  "success": true,
  "data": {
    "id": "inc_1730200009",
    "studentId": "std_1",
    "studentName": "Paul Biya Jr",
    "className": "Terminale C",
    "description": "Bavardage et perturbation répétée en cours de Mathématiques",
    "sanction": "Consigne / Heures de retenue",
    "details": "2 heures de retenue le samedi matin",
    "date": "2026-10-29T12:00:00.000Z"
  },
  "timestamp": "2026-10-29T12:00:00.000Z"
}
```
