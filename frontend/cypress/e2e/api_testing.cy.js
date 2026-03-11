// frontend/cypress/e2e/api_testing.cy.js

const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:8000";

describe("Required 3 flows (1 UI + 2 API)", () => {
  it("UI: user can open login page and see login form", () => {
    cy.visit(`${FRONTEND_URL}/login`);
    cy.contains("Log in to your account").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("button", "Log in").should("be.visible");
  });

  it("API GET: root endpoint returns Hello World and 200", () => {
    cy.request("GET", `${BACKEND_URL}/`).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.equal("Hello World!");
    });
  });

  it("API POST: /auth/signup returns 201 and created username", () => {
    const unique = Date.now();
    const email = `cypress_${unique}@test.com`;
    const password = "Password123!";

    cy.request("POST", `${BACKEND_URL}/auth/signup`, { email, password }).then(
      (response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property("message", "User created");
        expect(response.body).to.have.property("username", `cypress_${unique}`);
      }
    );
  });
});