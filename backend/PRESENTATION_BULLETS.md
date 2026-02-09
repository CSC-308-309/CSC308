# Database Architecture Presentation

## Music Dating App Database Schema

### Core User System
- **Authentication Layer**: Secure user accounts with bcrypt password hashing
- **Dual Table Design**: Separated authentication (users) from profile data (profiles) 
- **Username Validation**: Enforced format (3-30 chars, alphanumeric + underscores)

### Social Features
- **User Interactions**: Like/dislike/block system with actor/target relationships
- **Rich Profiles**: Music preferences, experience level, images, and personal details
- **Real-time Messaging**: Full chat system with DMs and group conversations

### Communication System
- **Chat Architecture**: Flexible chat types (direct messages vs group chats)
- **Message Management**: Edit/delete support with client-side deduplication
- **Participant Management**: Dynamic chat membership with permission controls

### Notification Engine
- **Smart Notifications**: Type-based categorization with JSON metadata
- **User Controls**: Read/unread status, archiving, and bulk operations
- **Scalable Design**: Efficient querying with pagination support

### Data Integrity
- **Referential Integrity**: Proper foreign key constraints across all relationships
- **Cascading Operations**: Automatic cleanup of dependent data
- **Performance Optimized**: Strategic indexing for common query patterns

### Security & Validation
- **Input Validation**: Username format enforcement at database and application level
- **Access Controls**: User permission verification in all data operations
- **Secure Design**: Password hashing, unique constraints, and data isolation
