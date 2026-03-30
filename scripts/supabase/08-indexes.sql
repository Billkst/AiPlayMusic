create index idx_chat_sessions_user_id on chat_sessions(user_id);
create index idx_chat_sessions_anonymous_id on chat_sessions(anonymous_session_id);
create index idx_chat_messages_session_id on chat_messages(chat_session_id);
create index idx_tracks_mood_tags on tracks using gin(mood_tags);
create index idx_tracks_genre_tags on tracks using gin(genre_tags);
create index idx_favorites_user_id on favorites(user_id);
