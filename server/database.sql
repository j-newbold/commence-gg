create table public.events(
    event_id SERIAL PRIMARY KEY,
    event_name text,
    event_desc text,
    event_start_date DATE,
    event_creator uuid,
    CONSTRAINT fk_event_creator
        FOREIGN KEY (event_creator)
        REFERENCES auth.users(id)
);

create table public.tournament(
    tournament_id SERIAL PRIMARY KEY,
    event_id int,
    CONSTRAINT fk_event_id
        FOREIGN KEY (event_id)
        REFERENCES events(event_id) ON DELETE CASCADE
);

create table public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    tag TEXT,
    primary key (id)
);

alter table public.profiles enable row level security;

create table public.e_entrants (
    entrant_id SERIAL PRIMARY KEY,
    event_id int,
    CONSTRAINT fk_event_id
        FOREIGN KEY (event_id)
        REFERENCES events(event_id) ON DELETE CASCADE,

    id uuid REFERENCES auth.users,
    CONSTRAINT fk_entrant_id
        FOREIGN KEY (event_id)
        REFERENCES auth.users(id)
);

create table public.t_entrants (
    entrant_id SERIAL PRIMARY KEY,
    tournament_id int,
    CONSTRAINT fk_tournament_id
        FOREIGN KEY (tournament_id)
        REFERENCES events(tournament_id) ON DELETE CASCADE,
        
    id uuid REFERENCES auth.users,
    CONSTRAINT fk_entrant_id
        FOREIGN KEY (event_id)
        REFERENCES auth.users(id)
);