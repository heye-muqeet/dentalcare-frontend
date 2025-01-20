import React from "react";
import { useNavigate } from "react-router-dom";

const RegistrationScreen = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/signin"); // Redirect to the SignIn screen
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "row",
      height: "100vh",
      backgroundColor: "#f9fafb",
    },
    leftSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      backgroundColor: "#ffffff",
    },
    formContainer: {
      width: "100%",
      maxWidth: "400px",
    },
    logoContainer: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "2rem",
    },
    logoText: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      color: "#1f2937",
    },
    formTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "0.25rem",
      textAlign: "center",
      color: "#111827",
    },
    formSubtitle: {
      fontSize: "1rem",
      color: "#6b7280",
      marginBottom: "1rem",
      textAlign: "center",
    },
    label: {
      display: "block",
      marginBottom: "0.25rem",
      color: "#374151",
      fontSize: "0.875rem",
    },
    inputField: {
      width: "100%",
      padding: "0.75rem",
      marginBottom: "1rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      color: "#111827",
    },
    passwordHint: {
      fontSize: "0.75rem",
      color: "#6b7280",
      marginTop: "-0.5rem",
      marginBottom: "1rem",
    },
    button: {
      width: "100%",
      padding: "0.75rem",
      backgroundColor: "#1f2937",
      color: "#ffffff",
      fontWeight: "bold",
      border: "none",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      cursor: "pointer",
    },
    orDivider: {
      display: "flex",
      alignItems: "center",
      margin: "1rem 0",
    },
    line: {
      flex: 1,
      height: "1px",
      backgroundColor: "#d1d5db",
    },
    orText: {
      margin: "0 1rem",
      color: "#6b7280",
      fontSize: "0.875rem",
    },
    socialButton: {
      width: "100%",
      padding: "0.75rem",
      backgroundColor: "#ffffff",
      color: "#111827",
      fontWeight: "bold",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      marginBottom: "0.5rem",
      cursor: "pointer",
    },
    loginText: {
      fontSize: "0.875rem",
      color: "#6b7280",
      textAlign: "center",
      marginTop: "1rem",
    },
    loginLink: {
      color: "#1d4ed8",
      fontWeight: "bold",
      cursor: "pointer",
      textDecoration: "none",
    },
    rightSection: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f3f4f6",
    },
    placeholderCard: {
      width: "75%",
      height: "75%",
      backgroundColor: "#e5e7eb",
      borderRadius: "1rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      fontSize: "2rem",
      color: "#9ca3af",
    },
  };

  return (
    <div style={styles.container}>
      {/* Left Section */}
      <div style={styles.leftSection}>
        {/* MI Dental Logo */}
        <div style={styles.logoContainer}>
          <span style={styles.logoText}>MI Dental</span>
        </div>

        {/* Form */}
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Create an account</h2>
          <p style={styles.formSubtitle}>Start your 30-day free trial.</p>

          <label style={styles.label}>Name*</label>
          <input type="text" placeholder="Enter your name" style={styles.inputField} />

          <label style={styles.label}>Email*</label>
          <input type="email" placeholder="Enter your email" style={styles.inputField} />

          <label style={styles.label}>Password*</label>
          <input
            type="password"
            placeholder="Create a password"
            style={styles.inputField}
          />
          <p style={styles.passwordHint}>Must be at least 8 characters.</p>

          <button style={styles.button}>Get started</button>

          {/* OR Divider */}
          <div style={styles.orDivider}>
            <div style={styles.line}></div>
            <span style={styles.orText}>OR</span>
            <div style={styles.line}></div>
          </div>

          {/* Social Sign-In Buttons */}
          <button style={styles.socialButton}>Sign in with Google</button>
          <button style={styles.socialButton}>Sign in with Facebook</button>
          <button style={styles.socialButton}>Sign in with Apple</button>

          {/* Login Link */}
          <p style={styles.loginText}>
            Already have an account?{" "}
            <span onClick={handleLoginRedirect} style={styles.loginLink}>
              Log in
            </span>
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        <div style={styles.placeholderCard}>
          <p style={styles.placeholderText}>Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;
