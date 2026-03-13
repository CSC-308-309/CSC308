# Acceptance Criteria — Gherkin Specs
# Matches automated tests in: api_testing.cy.js and implemented_features.cy.js

# ──────────────────────────────────────────────
# API TESTS
# ──────────────────────────────────────────────

Feature: API Health Check

  Scenario: GET root endpoint returns success
    Given the backend server is running
    When a GET request is sent to /
    Then the response status is 200
    And the response body is "Hello World!"


Feature: User Registration API

  Scenario: POST /auth/signup creates a new user
    Given a unique email and password are provided
    When a POST request is sent to /auth/signup with the email and password
    Then the response status is 201
    And the response body contains message "User created"
    And the response body contains a username derived from the email prefix


# ──────────────────────────────────────────────
# END-TO-END TESTS
# ──────────────────────────────────────────────

Feature: Sign In

  Scenario: Successful authentication
    Given a user has registered with a valid email and password
    When the user navigates to the login page and submits correct credentials
    Then the POST /auth/login endpoint returns a 200 response with a JWT token
    And the token and user data are stored in localStorage
    And the user is redirected to the home page


Feature: Messaging

  Scenario: Successful message sending
    Given two registered users exist and share a chat
    And the sender is logged in and on the messages page
    When the sender types a message and clicks the send button
    Then the POST /chats/{id}/messages endpoint returns 201
    And the message appears in the chat UI
    And a GET /chats/{id}/messages request confirms the message was persisted
