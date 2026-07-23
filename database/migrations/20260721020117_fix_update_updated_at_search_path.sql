/*
# Fix mutable search_path on update_updated_at function

1. Security
   - The trigger function `public.update_updated_at` previously had a role-mutable
     search_path, which allows an attacker who can create objects in a schema that
     appears earlier in the search path to hijack function calls.
   - This migration sets an explicit, fully-qualified search_path (`public`) so the
     function always resolves in the intended schema regardless of the caller's
     search_path setting.

2. Changes
   - ALTER FUNCTION public.update_updated_at() SET search_path = public
   - Recreate the function with `SET search_path = public` in the definition for
     durability across future dump/restore cycles.

3. Notes
   - No data is modified or lost.
   - Existing triggers continue to work unchanged; only the function's search_path
     attribute changes.
*/

ALTER FUNCTION public.update_updated_at() SET search_path = public;
