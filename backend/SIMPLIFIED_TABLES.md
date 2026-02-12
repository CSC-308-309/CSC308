# Simplified Database Overview

## 1. Users

**Purpose**: Authentication and user management

- **username**: Primary key with format validation (3-30 chars, alphanumeric + underscores)
- **password_hash**: Secure bcrypt storage for authentication
- **email**: Unique email address for user identification
- **phone**: Optional contact information
- **created_at/updated_at**: Timestamps for tracking

## 2. Notifications

**Purpose**: User notification system

- **id**: Primary key for each notification
- **username**: Foreign key to users table
- **type**: Notification category (new message, like, match, etc.)
- **title/content**: Notification message details
- **data**: JSONB field for flexible metadata
- **is_read/is_archived**: Status tracking for user interaction
- **created_at/updated_at**: Timestamps

## 3. Messages System

**Three interconnected tables for complete messaging:**

### chats

- **id**: Primary key for each conversation
- **type**: 'dm' (direct message) or 'group'
- **name**: Optional display name (required for groups)
- **avatar_url**: Optional chat image
- **created_by**: Foreign key to users (chat creator)
- **created_at/updated_at**: Timestamps

### chat_participants

- **id**: Primary key
- **chat_id**: Foreign key to chats
- **username**: Foreign key to users
- **joined_at**: When user joined the conversation
- **Unique constraint**: (chat_id, username) prevents duplicates

### messages

- **id**: Primary key for each message
- **chat_id**: Foreign key to chats
- **sender_username**: Foreign key to users
- **text**: Message content
- **client_message_id**: For deduplication
- **created_at/edited_at**: Timestamps (edited_at null until edited)
