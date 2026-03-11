// implemented_features.cy.js v2
const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:8000";

function buildAccount(prefix) {
  const cleanPrefix = String(prefix)
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 8);
  const ts = Date.now().toString().slice(-6);
  const rand = Math.random().toString(36).slice(2, 6);
  const id = `${cleanPrefix}_${ts}_${rand}`;

  return {
    email: `${id}@test.com`,
    password: "Password123!",
    username: id,
  };
}

function signup(account) {
  cy.request({
    method: "POST",
    url: `${BACKEND_URL}/auth/signup`,
    body: {
      email: account.email,
      password: account.password,
    },
    failOnStatusCode: false,
  }).then((response) => {
    expect(
      response.status,
      `signup failed for ${account.email}: ${JSON.stringify(response.body)}`,
    ).to.eq(201);
  });
}

function loginRequest(account, failOnStatusCode = true) {
  return cy.request({
    method: "POST",
    url: `${BACKEND_URL}/auth/login`,
    body: {
      email: account.email,
      password: account.password,
    },
    failOnStatusCode,
  });
}

function loginAndOpenPage(account, path) {
  return loginRequest(account).then((response) => {
    expect(response.status).to.eq(200);
    const body = response.body;
    cy.visit(`${FRONTEND_URL}${path}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", body.token);
        win.localStorage.setItem("user", JSON.stringify(body.user));
      },
    });
  });
}


describe("Feature: Sign In", () => {
  it("Scenario: Successful authentication", () => {
    const account = buildAccount("signin_success");
    signup(account);

    cy.visit(`${FRONTEND_URL}/login`);
    cy.get('[data-cy="login-email"]').clear().type(account.email);
    cy.get('[data-cy="login-password"]').clear().type(account.password);
    cy.intercept("POST", `${BACKEND_URL}/auth/login`).as("loginRequest");
    cy.get('[data-cy="login-submit"]').click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
    cy.window().should((win) => {
      expect(win.localStorage.getItem("token")).to.be.a("string");
      expect(win.localStorage.getItem("user")).to.be.a("string");
    });

    cy.location("pathname", { timeout: 10000 }).should("eq", "/");
  });

  it("Scenario: Authentication fails due to incorrect password", () => {
    const account = buildAccount("signin_wrong_password");
    signup(account);

    cy.visit(`${FRONTEND_URL}/login`);
    cy.get('[data-cy="login-email"]').clear().type(account.email);
    cy.get('[data-cy="login-password"]').clear().type("WrongPassword123!");
    cy.get('[data-cy="login-submit"]').click();

    cy.get('[data-cy="login-error"]')
      .should("be.visible")
      .invoke("text")
      .should("match", /invalid credentials|bad request/i);

    cy.location("pathname").should("eq", "/login");
  });

  it("Scenario Outline: Sign-in credential validation", () => {
    const account = buildAccount("signin_outline");
    signup(account);

    [
      { credential_status: "valid", password: account.password, status: 200 },
      { credential_status: "invalid", password: "not_the_right_password", status: 400 },
    ].forEach((example) => {
      cy.request({
        method: "POST",
        url: `${BACKEND_URL}/auth/login`,
        body: { email: account.email, password: example.password },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status, example.credential_status).to.eq(example.status);
      });
    });
  });
});

describe("Feature: Messaging", () => {
  it("Scenario: Successful message sending", () => {
    const sender = buildAccount("msg_sender");
    const recipient = buildAccount("msg_recipient");
    const chatName = `e2e-chat-${Date.now()}`;
    const messageText = `hello-${Date.now()}`;

    signup(sender);
    signup(recipient);

    cy.request("POST", `${BACKEND_URL}/chats`, {
      name: chatName,
      is_group: true,
      created_by: sender.username,
      participants: [sender.username, recipient.username],
    }).then(({ body: chat }) => {
      loginAndOpenPage(sender, "/messages");

      cy.contains(chatName, { timeout: 10000 }).click();
      cy.intercept("POST", "**/chats/*/messages").as("sendMessage");
      cy.get('[data-cy="chat-message-input"]').type(messageText);
      cy.get('[data-cy="chat-send-button"]').click();
      cy.wait("@sendMessage").its("response.statusCode").should("eq", 201);
      cy.contains(messageText).should("be.visible");

      cy.request("GET", `${BACKEND_URL}/chats/${chat.id}/messages`).then(({ body }) => {
        const messages = Array.isArray(body) ? body : body?.messages || [];
        expect(messages.some((m) => m.content === messageText)).to.eq(true);
      });
    });
  });

  it("Scenario: Viewing received messages", () => {
    const receiver = buildAccount("msg_receiver");
    const sender = buildAccount("msg_sender2");
    const chatName = `unread-chat-${Date.now()}`;
    const unreadText = `unread-${Date.now()}`;

    signup(receiver);
    signup(sender);

    cy.request("POST", `${BACKEND_URL}/chats`, {
      name: chatName,
      is_group: true,
      created_by: receiver.username,
      participants: [receiver.username, sender.username],
    }).then(({ body: chat }) => {
      cy.request("POST", `${BACKEND_URL}/chats/${chat.id}/messages`, {
        sender_username: sender.username,
        content: unreadText,
      });

      loginAndOpenPage(receiver, "/messages");

      cy.intercept("POST", "**/chats/*/read").as("markRead");
      cy.contains(chatName, { timeout: 10000 }).click();
      cy.contains(unreadText, { timeout: 10000 }).should("be.visible");

      cy.wait("@markRead").its("request.body").should("include", {
        username: receiver.username,
      });
    });
  });

  it("Scenario: Attempt to send an empty message", () => {
    const sender = buildAccount("msg_empty_sender");
    const recipient = buildAccount("msg_empty_recipient");
    const chatName = `empty-msg-chat-${Date.now()}`;

    signup(sender);
    signup(recipient);

    cy.request("POST", `${BACKEND_URL}/chats`, {
      name: chatName,
      is_group: true,
      created_by: sender.username,
      participants: [sender.username, recipient.username],
    }).then(() => {
      loginAndOpenPage(sender, "/messages");

      cy.intercept("POST", "**/chats/*/messages").as("sendMessage");
      cy.contains(chatName, { timeout: 10000 }).click();
      cy.get('[data-cy="chat-message-input"]').type("   ");
      cy.get('[data-cy="chat-send-button"]').click();

      cy.get('[data-cy="chat-input-error"]').should("contain", "Message cannot be empty.");
      cy.get("@sendMessage.all").should("have.length", 0);
    });
  });
});

describe("Feature: Change Email", () => {
  it("Scenario: Successfully update email address", () => {
    const account = buildAccount("email_success");
    const nextEmail = `updated_${Date.now()}@test.com`;

    signup(account);
    loginAndOpenPage(account, "/settings");

    cy.get('[data-cy="settings-email-input"]').clear().type(nextEmail);
    cy.get('[data-cy="settings-email-save"]').click();
    cy.get('[data-cy="settings-success"]').should("contain", "Email updated successfully");

    cy.request("POST", `${BACKEND_URL}/auth/login`, {
      email: nextEmail,
      password: account.password,
    }).its("status").should("eq", 200);
  });

  it("Scenario: Email address already in use", () => {
    const owner = buildAccount("email_owner");
    const existing = buildAccount("email_existing");

    signup(owner);
    signup(existing);
    loginAndOpenPage(owner, "/settings");

    cy.get('[data-cy="settings-email-input"]').clear().type(existing.email);
    cy.get('[data-cy="settings-email-save"]').click();
    cy.get('[data-cy="settings-error"]')
      .invoke("text")
      .should("match", /email already in use|bad request/i);
  });

  it("Scenario: Invalid email format", () => {
    const account = buildAccount("email_invalid");

    signup(account);
    loginAndOpenPage(account, "/settings");

    cy.get('[data-cy="settings-email-input"]').clear().type("not-an-email");
    cy.get('[data-cy="settings-email-save"]').click();
    cy.get('[data-cy="settings-error"]').should("contain", "Please enter a valid email address.");
  });
});
