-- Project names follow the Instagram account each project posts to (founder, 2026-10-18): LWS Pune first,
-- PYQ Vault second. Names only: the slugs stay, because .post.json / .ad.json manifests and the story
-- planner name projects by slug, and reusing "pyq-vault" for @pyqvault_ would send old manifests to the
-- wrong account.
--   pyq-vault      (@lws.pune: NDA reels + daily quiz stories)  PYQ Vault              → LWS Pune
--   pyqvault-insta (@pyqvault_)                                 PYQ Vault (@pyqvault_) → PYQ Vault
--   lws-coaching   (@lws.pune: ads only)                        LWS Coaching           → LWS Pune ads
-- "LWS Pune ads" isn't folded into "LWS Pune": ad_drafts can't change project (0008 guard), and deleting
-- the project would cascade to its ad drafts.
update public.projects p set name = v.name
from (values ('pyq-vault', 'LWS Pune'), ('pyqvault-insta', 'PYQ Vault'), ('lws-coaching', 'LWS Pune ads')) as v(slug, name),
     public.organizations o
where o.id = p.org_id and o.slug = 'lws-pune' and p.slug = v.slug;
