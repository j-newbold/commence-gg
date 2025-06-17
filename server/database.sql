create table public.events (
    event_id SERIAL PRIMARY KEY,
    event_name text,
    event_desc text,
    event_start_date DATE,
    event_creator uuid NOT NULL,
    CONSTRAINT fk_event_creator
        FOREIGN KEY (event_creator)
        REFERENCES auth.users(id)
);

create table public.tournaments (
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

    user_id uuid REFERENCES auth.users,
    CONSTRAINT fk_entrant_id
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
);

create table public.t_entrants (
    entrant_id SERIAL PRIMARY KEY,

    placement int,

    tournament_id int,
    CONSTRAINT fk_tournament_id
        FOREIGN KEY (tournament_id)
        REFERENCES events(tournament_id) ON DELETE CASCADE,
        
    user_id uuid REFERENCES auth.users,
    CONSTRAINT fk_entrant_id
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
);

create TYPE bracket_type as ENUM ('double_elim', 'single_elim', 'round_robin');

create table public.b_entrants (
    b_entrant_id SERIAL PRIMARY KEY,

    placement int,

    bracket_id int,
    CONSTRAINT fk_bracket_id
        FOREIGN KEY (bracket_id)
        REFERENCES brackets(bracket_id) ON DELETE CASCADE,

    id uuid REFERENCES auth.users,
    CONSTRAINT fk_b_entrant_id
        FOREIGN KEY (id)
        REFERENCES auth.users(id)
);

create table public.brackets (
    bracket_id SERIAL PRIMARY KEY,
    b_type bracket_type,
    wins_needed_default int,
    tournament_id int,
    CONSTRAINT fk_tournament_id
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(tournament_id) ON DELETE CASCADE
);

create table public.t_standings (
    st_id SERIAL PRIMARY KEY,

    placement int,

    player_id uuid references auth.users,
    CONSTRAINT fk_player_id
        FOREIGN KEY (player_id)
        REFERENCES auth.users(id),

    tournament_id int,
    CONSTRAINT fk_tournament_id
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(tournament_id) ON DELETE CASCADE
)

create table public.matches (
    match_id SERIAL PRIMARY KEY,

    m_row int,
    m_col int,

    wins_needed int,
    wins_p1 int DEFAULT 0,
    wins_p2 int DEFAULT 0,

    p1_id uuid REFERENCES auth.users,
    CONSTRAINT fk_p1_id
        FOREIGN KEY (p1_id)
        REFERENCES auth.users(id),

    p2_id uuid REFERENCES auth.users,
    CONSTRAINT fk_p2_id
        FOREIGN KEY (p2_id)
        REFERENCES auth.users(id),
    
    winner_id uuid REFERENCES auth.users,
    CONSTRAINT fk_winner_id
        FOREIGN KEY (winner_id)
        REFERENCES auth.users(id),

    bracket_id int,
    CONSTRAINT fk_bracket_id
        FOREIGN KEY (bracket_id)
        REFERENCES brackets(bracket_id) ON DELETE CASCADE
);