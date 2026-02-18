# Database Schema

## Tables and Relationships

```mermaid
erDiagram
    users {
        VARCHAR(255) username PK
        VARCHAR(255) email UK
        VARCHAR(255) password_hash
        VARCHAR(50) phone
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    profiles {
        VARCHAR(255) username PK, FK
        VARCHAR(255) name
        VARCHAR(255) role
        INTEGER age
        VARCHAR(255) gender
        VARCHAR(255) genre
        INTEGER experience
        VARCHAR(255) main_image
        VARCHAR(255) concert_image
        VARCHAR(255) last_song
        TEXT last_song_desc
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    interactions {
        SERIAL id PK
        VARCHAR(255) username FK
        VARCHAR(255) target_username FK
        VARCHAR(50) interaction_type
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    chats {
        SERIAL id PK
        VARCHAR(20) type
        VARCHAR(255) name
        VARCHAR(255) avatar_url
        VARCHAR(255) created_by FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    chat_participants {
        SERIAL id PK
        INTEGER chat_id FK
        VARCHAR(255) username FK
        TIMESTAMP joined_at
    }

    messages {
        SERIAL id PK
        INTEGER chat_id FK
        VARCHAR(255) sender_username FK
        TEXT text
        VARCHAR(255) client_message_id
        TIMESTAMP created_at
        TIMESTAMP edited_at
    }

    notifications {
        SERIAL id PK
        VARCHAR(255) username FK
        VARCHAR(50) type
        VARCHAR(255) title
        TEXT content
        JSONB data
        BOOLEAN is_read
        BOOLEAN is_archived
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    %% Relationships
    users ||--|| profiles : "1:1"
    users ||--o{ interactions : "1:N (as actor)"
    users ||--o{ interactions : "1:N (as target)"
    users ||--o{ chat_participants : "1:N"
    users ||--o{ messages : "1:N (sender)"
    users ||--o{ notifications : "1:N"
    users ||--o{ chats : "1:N (creator)"

    chats ||--o{ chat_participants : "1:N"
    chats ||--o{ messages : "1:N"

    chat_participants }o--|| users : "N:1"
    chat_participants }o--|| chats : "N:1"

    messages }o--|| chats : "N:1"
    messages }o--|| users : "N:1"

    notifications }o--|| users : "N:1"

    interactions }o--|| users : "N:1 (actor)"
    interactions }o--|| users : "N:1 (target)"
```

## Table Details

### users

- **Purpose**: Authentication and basic user data
- **Primary Key**: username (3-30 chars, alphanumeric + underscores)
- **Constraints**: Unique email, username format validation
- **Fields**: username, email, password_hash, phone, timestamps

### profiles

- **Purpose**: Extended user profile information
- **Primary Key**: username (1:1 with users table)
- **Fields**: name, role, age, gender, genre, experience, images, music preferences

### interactions

- **Purpose**: User-to-user interactions (like, dislike, block)
- **Fields**: interaction_type, actor_username, target_username
- **Types**: 'like', 'dislike', 'block'

### chats

- **Purpose**: Conversation containers
- **Types**: 'dm' (direct message) or 'group'
- **Fields**: name, avatar_url, created_by

### chat_participants

- **Purpose**: Many-to-many relationship between users and chats
- **Fields**: chat_id, username, joined_at
- **Constraints**: Unique (chat_id, username) combination

### messages

- **Purpose**: Individual messages within chats
- **Fields**: text, client_message_id, created_at, edited_at
- **Features**: Edit support, client message ID for deduplication

### notifications

- **Purpose**: User notifications system
- **Fields**: type, title, content, data (JSONB), read/archived status
- **Features**: Flexible data storage, read/unread tracking

## Key Relationships

1. **users ↔ profiles**: 1:1 relationship (every user has one profile)
2. **chats ↔ chat_participants ↔ users**: Many-to-many for chat membership
3. **chats ↔ messages**: One-to-many (chat contains many messages)
4. **users ↔ notifications**: One-to-many (user receives many notifications)
5. **users ↔ interactions**: Two one-to-many relationships (actor and target)

## Constraints and Indexes

- **Username constraints**: 3-30 characters, alphanumeric + underscores only
- **Foreign keys**: All relationships properly constrained
- **Unique constraints**: email (users), (chat_id, username) (chat_participants)
- **Timestamps**: Automatic created_at/updated_at on all tables
- **Cascading deletes**: messages and chat_participants cascade on chat deletion
