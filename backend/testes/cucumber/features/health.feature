Feature: Health check
  The API exposes a health endpoint for monitoring.

  Scenario: GET /health returns OK
    When I send a GET request to "/health"
    Then the response status should be 200
    And the response body should contain "status"

  @critical
  Scenario: POST /auth/login with invalid credentials returns 401
    Given the request body is:
      """
      {"email": "nonexistent@example.com", "password": "wrongpassword"}
      """
    When I send a POST request to "/auth/login"
    Then the response status should be 401