# Database Tables Overview

## 1. users

**Purpose**: Authentication and basic user account data

- Stores login credentials (username, email, password hash)
- Contains phone number and timestamps
- Primary key: username (3-30 chars, alphanumeric + underscores)

## 2. profiles

**Purpose**: Extended user profile information for dating features

- Personal details: name, age, gender, role
- Music preferences: genre, experience level, last song
- Media: main image, concert image
- 1:1 relationship with users table

## 3. interactions

**Purpose**: User-to-user social interactions

- Tracks likes, dislikes, and blocks between users
- Fields: actor_username, target_username, interaction_type
- Supports the core matching/blocking functionality

## 4. chats

**Purpose**: Conversation containers for messaging system

- Types: 'dm' (direct message) or 'group' chats
- Contains metadata: name, avatar_url, created_by
- Supports both private and group conversations

## 5. chat_participants

**Purpose**: Many-to-many relationship between users and chats

- Links users to chat conversations
- Tracks when users joined chats
- Ensures proper access control to conversations

## 6. messages

**Purpose**: Individual messages within chat conversations

- Stores message content, sender, and timestamps
- Supports editing (edited_at field)
- Includes client_message_id for deduplication

## 7. notifications

**Purpose**: User notification system

- Types: new messages, likes, matches, etc.
- Features read/unread status and archiving
- Flexible JSONB data field for custom notification content
