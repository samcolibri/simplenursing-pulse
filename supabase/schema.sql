-- Simple Nursing Social Intelligence Dashboard
-- Paste this entire file into Supabase SQL Editor and run

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('instagram','facebook','pinterest','youtube','tiktok')),
  handle text NOT NULL,
  display_name text, avatar_url text,
  is_owned boolean NOT NULL DEFAULT false,
  is_competitor boolean NOT NULL DEFAULT false,
  competitor_tier text CHECK (competitor_tier IN ('direct','indirect','influencer')),
  followers bigint DEFAULT 0, following bigint DEFAULT 0,
  post_count bigint DEFAULT 0, verified boolean DEFAULT false,
  bio text, hearts bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now(), created_at timestamptz DEFAULT now(),
  UNIQUE(platform, handle)
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  platform_post_id text NOT NULL, posted_at timestamptz NOT NULL,
  content_type text, caption text, media_url text, thumbnail_url text,
  hashtags text[] DEFAULT '{}', mentioned_sounds text[] DEFAULT '{}',
  ai_topic text, ai_format text, ai_summary text, permalink text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, platform_post_id)
);

CREATE TABLE IF NOT EXISTS post_metrics (
  id bigserial PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  captured_at timestamptz DEFAULT now(),
  views bigint, likes bigint, comments bigint, shares bigint,
  saves bigint, reach bigint, impressions bigint,
  engagement_rate numeric(6,4), follower_count_at_capture bigint
);
CREATE INDEX IF NOT EXISTS idx_post_metrics ON post_metrics(post_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS monthly_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL, month text NOT NULL,
  accounts_reached bigint, total_views bigint,
  likes bigint, comments bigint, shares bigint, saves bigint,
  new_follows bigint, sessions bigint, free_trials bigint,
  revenue_ga4 numeric(10,2), revenue_shopify numeric(10,2),
  ftcr numeric(6,4), follower_pct_views numeric(4,3), non_follower_pct_views numeric(4,3),
  engaged_audience bigint, post_count integer, broadcast_members text,
  fb_visits bigint, content_interactions bigint, fb_group_members text,
  profile_views bigint, returning_views_pct numeric(4,3),
  avg_skip_rate numeric(4,3), avg_share_rate numeric(4,3),
  avg_like_rate numeric(4,3), avg_save_rate numeric(4,3),
  created_at timestamptz DEFAULT now(), UNIQUE(platform, month)
);

CREATE TABLE IF NOT EXISTS trending_hashtags (
  id bigserial PRIMARY KEY, hashtag text NOT NULL, platform text NOT NULL,
  captured_at timestamptz DEFAULT now(),
  post_count bigint, view_count bigint, velocity_24h numeric(8,2), used_by_sn boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz DEFAULT now(),
  type text, priority text, title text NOT NULL, body text NOT NULL, platform text,
  evidence_post_ids uuid[] DEFAULT '{}', dismissed boolean DEFAULT false, actioned boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS sync_log (
  id bigserial PRIMARY KEY, synced_at timestamptz DEFAULT now(),
  source text NOT NULL, items_synced integer DEFAULT 0,
  status text DEFAULT 'success', error_message text, duration_ms integer
);

-- Seed data
INSERT INTO accounts (platform,handle,display_name,is_owned,followers,verified) VALUES
  ('instagram','simplenursing.com_','Nurse Mike from Simple Nursing',true,862531,true),
  ('facebook','simplenursing','Simple Nursing',true,580000,false),
  ('tiktok','simplenursing','Simple Nursing',true,1050000,false)
ON CONFLICT (platform,handle) DO NOTHING;

INSERT INTO accounts (platform,handle,display_name,is_competitor,competitor_tier,followers,verified) VALUES
  ('instagram','registerednursern_com','Nurse Sarah',true,'direct',948436,true),
  ('instagram','kristine_nurseinthemaking','Nurse In The Making',true,'direct',720000,false),
  ('instagram','yournursingeducator','Barbara | BSN, RN',true,'direct',509812,true),
  ('tiktok','registerednursern.com','Nurse Sarah',true,'direct',1300000,false),
  ('tiktok','archernursing','Archer Review',true,'direct',450000,false),
  ('facebook','RegisteredNurseRNs','RegisteredNurseRN',true,'direct',680000,false),
  ('facebook','anurseinthemaking','A Nurse In The Making',true,'direct',350000,false)
ON CONFLICT (platform,handle) DO NOTHING;

INSERT INTO monthly_metrics (platform,month,accounts_reached,total_views,likes,comments,shares,saves,new_follows,sessions,free_trials,revenue_ga4,revenue_shopify,follower_pct_views,non_follower_pct_views,broadcast_members) VALUES
  ('instagram','2026-01',2753754,6083475,65257,1397,18733,18117,4623,1798,210,813.95,509.95,0.442,0.556,'9.1k'),
  ('instagram','2026-02',2080664,5621747,80721,758,31278,10587,5816,1646,188,352.00,45.00,0.449,0.551,'9.1k'),
  ('instagram','2026-03',1626707,3603150,26641,352,4886,6757,12954,869,106,1197.55,489.96,0.574,0.426,'9.2k'),
  ('instagram','2026-04',1664455,4239995,38118,298,5254,11624,12511,1214,150,980.97,233.99,0.384,0.616,'9.2k')
ON CONFLICT (platform,month) DO NOTHING;

INSERT INTO monthly_metrics (platform,month,total_views,accounts_reached,fb_visits,content_interactions,new_follows,free_trials,sessions,revenue_ga4,revenue_shopify,follower_pct_views,non_follower_pct_views,fb_group_members) VALUES
  ('facebook','2026-01',12816129,4052049,43911,66020,16371,142,3789,720.49,349.93,0.134,0.837,'39.4k'),
  ('facebook','2026-02',7760649,2632548,24789,33740,7810,84,2511,451.99,139.99,0.148,0.820,'39.8k'),
  ('facebook','2026-03',12580793,4892622,13623,14733,3789,47,2552,88.99,0.00,0.053,0.940,'39.9k'),
  ('facebook','2026-04',7074880,1940977,19109,19918,4090,55,1689,0.00,179.99,0.158,0.842,'40.1k')
ON CONFLICT (platform,month) DO NOTHING;

INSERT INTO monthly_metrics (platform,month,total_views,accounts_reached,profile_views,engaged_audience,likes,comments,shares,saves,new_follows,post_count,sessions,free_trials,revenue_ga4,revenue_shopify,follower_pct_views,non_follower_pct_views,returning_views_pct,broadcast_members) VALUES
  ('tiktok','2026-01',16057347,15364361,60884,231399,142213,2186,16368,10988,14263,53,1775,199,1620.85,1409.84,0.57,0.43,0.92,'5.8k'),
  ('tiktok','2026-02',17222661,16028127,101574,585200,214278,2868,26545,5234,24814,40,3024,464,1242.42,661.36,0.58,0.42,0.89,'7.2k'),
  ('tiktok','2026-03',12398586,11863501,63000,276796,107071,218,12682,4586,13120,48,1396,82,1064.52,359.96,0.59,0.41,0.87,'7.9k'),
  ('tiktok','2026-04',12296014,11791676,86918,278521,178819,1369,3639,11764,15323,48,2644,52,280.80,179.99,0.60,0.40,0.91,'8.8k')
ON CONFLICT (platform,month) DO NOTHING;

INSERT INTO trending_hashtags (hashtag,platform,post_count,velocity_24h,used_by_sn) VALUES
  ('nursingstudent','tiktok',4200000,3.2,true),('nursetok','tiktok',2800000,5.8,true),
  ('nclex','tiktok',1900000,2.1,true),('nursingschool','instagram',8500000,1.4,true),
  ('shiftlife','tiktok',920000,7.3,false),('medtok','tiktok',3100000,4.5,false),
  ('studentnurse','instagram',2400000,2.9,true),('futurenurse','tiktok',1200000,6.1,false),
  ('nursememes','instagram',1800000,1.2,false),('scrublife','tiktok',760000,8.4,false);

INSERT INTO ai_recommendations (type,priority,title,body,platform) VALUES
  ('competitor_alert','high','RegisteredNurseRN just hit 1.4M views on ECG Rhythms','TikTok from @registerednursern.com: 1.4M views, 53K likes, 8154 shares on ECG content. Post SimpleNursing ECG breakdown this week.','tiktok'),
  ('post_idea','high','Post Lab Values Cheat Sheet — high save signal','Save rates on competitor lab value posts are 3-4x platform average. Expected 10K+ saves.','tiktok'),
  ('format_shift','med','TikTok FTCR dropped 75% Feb to Apr — test CTA','FTCR fell from 15.3% to 2.0%. Pin a comment with free trial link on next 5 videos.','tiktok'),
  ('timing','med','Feb was best TikTok month: 464 trials, 585K engaged. Replicate.','40 posts in Feb vs 48 in Apr. Fewer posts, better results. Quality over quantity.','tiktok'),
  ('hashtag','med','#scrublife velocity 8.4% — not used in 14 days','Surging hashtag. Lifestyle nursing video could cross-promote to new audience segment.','tiktok'),
  ('post_idea','low','Instagram follows surged to 12.9K in March — find the driver','Follows jumped from 5.8K to 12.9K. Identify which post caused it and replicate.','instagram');
