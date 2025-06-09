-- Script pour corriger les politiques RLS et permettre l'accès public
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Enable read access for all users" ON notes;
DROP POLICY IF EXISTS "Enable insert access for all users" ON notes;
DROP POLICY IF EXISTS "Enable update access for all users" ON notes;
DROP POLICY IF EXISTS "Enable delete access for all users" ON notes;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert access for all users" ON categories;
DROP POLICY IF EXISTS "Enable update access for all users" ON categories;
DROP POLICY IF EXISTS "Enable delete access for all users" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON attachments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON attachments;
DROP POLICY IF EXISTS "Enable update access for all users" ON attachments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON attachments;

-- 2. Créer de nouvelles politiques permissives pour toutes les opérations

-- Politiques pour la table notes
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Politiques pour la table categories
CREATE POLICY "Allow all operations on categories" ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Politiques pour la table attachments
CREATE POLICY "Allow all operations on attachments" ON attachments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Vérifier que RLS est activé
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 4. Vérification des politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;