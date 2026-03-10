// Keep test output clean by silencing expected error logs from failure-path tests.
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});
