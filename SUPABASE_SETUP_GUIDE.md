# Configuration Supabase - Résolution des problèmes

## Statut Actuel
✅ Configuration locale complète  
❌ Connexion à Supabase: **Accès réseau refusé**

## Problème
La base de données Supabase n'est pas accessible depuis votre machine. Cela peut être dû à:

### 1. **Firewall/IP Allowlist de Supabase**
Supabase utilise par défaut une allowlist d'IP. Vous devez autoriser votre IP:

**Étapes:**
1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Project Settings** → **Network**
4. Sous **IPv4**, cliquez sur **Edit** ou **Add new IPv4 address**
5. Entrez votre adresse IP publique (la machine doit être accessible)

**Pour trouver votre IP publique:**
```bash
curl -s https://api.ipify.org
```

### 2. **Vérifier que la base de données est en ligne**
1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Assurez-vous que votre projet est **Running** (vert)
3. Vérifiez que la base de données n'est pas **paused** ou **suspended**

### 3. **Credentials à jour**
Vérifiez que le fichier `.env` contient:
```
DATABASE_URL="postgresql://postgres:%2Fgu%2BfQbtw%2F%2AKE5u@db.oqkgaetfsqthsepsydyb.supabase.co:5432/postgres"
```

## Instructions pour créer les tables

Une fois la connectivité résolue, exécutez:

```bash
# Option 1: Script automatisé
./setup-db.sh

# Option 2: Commandes manuelles
npx prisma db push
npx prisma generate
```

## Tables qui seront créées

Le schéma Prisma créera les tables suivantes:

1. **users** - Utilisateurs (admin, professeur, étudiant, parent)
2. **admins** - Administrateurs du système
3. **school_years** - Années scolaires
4. **classes** - Classes/Sections
5. **teachers** - Professeurs
6. **students** - Étudiants
7. **parents** - Parents
8. **attendance_records** - Enregistrements de présence
9. **grades** - Notes/Grades
10. **payments** - Paiements

## Vérification

Une fois les tables créées, vous pouvez les visualiser:

```bash
# Ouvrir Prisma Studio
npx prisma studio
```

## Support Supabase

- **Documentation:** [https://supabase.com/docs](https://supabase.com/docs)
- **Status Page:** [https://status.supabase.com](https://status.supabase.com)
- **Support:** [https://supabase.com/support](https://supabase.com/support)

---

**Configuration locale:** ✅  
**Status de connexion:** À vérifier après configuration réseau
